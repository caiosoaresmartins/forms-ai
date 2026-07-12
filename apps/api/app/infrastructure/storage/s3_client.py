import os
import boto3
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

class S3Storage:
    def __init__(self):
        # Em modo local (MinIO), usamos a URL e desativamos SSL
        # Em prod (AWS S3), essas variáveis não são preenchidas (ou usam o padrão AWS)
        self.endpoint_url = os.getenv("S3_ENDPOINT_URL")
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "forms-ai-bucket")
        self.access_key = os.getenv("S3_ACCESS_KEY_ID", "minioadmin")
        self.secret_key = os.getenv("S3_SECRET_ACCESS_KEY", "minioadmin")
        self.region = os.getenv("S3_REGION_NAME", "us-east-1")

        self.s3_client = boto3.client(
            "s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region,
        )

        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                # Criar bucket se não existir (especialmente útil com MinIO)
                if self.region == "us-east-1":
                    self.s3_client.create_bucket(Bucket=self.bucket_name)
                else:
                    self.s3_client.create_bucket(
                        Bucket=self.bucket_name,
                        CreateBucketConfiguration={'LocationConstraint': self.region}
                    )
                logger.info(f"Bucket {self.bucket_name} criado.")
            else:
                logger.error(f"Erro ao verificar bucket {self.bucket_name}: {e}")

    def upload_file_bytes(self, file_content: bytes, object_name: str, content_type: str = "application/pdf") -> str:
        """
        Faz upload de bytes diretamente para o S3 e retorna a URL ou Path do objeto.
        """
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_name,
                Body=file_content,
                ContentType=content_type
            )
            return object_name
        except ClientError as e:
            logger.error(f"Erro no upload para S3: {e}")
            raise

    def get_presigned_url(self, object_name: str, expiration: int = 3600) -> str:
        """Gera uma URL temporária para acesso (presigned URL)."""
        try:
            response = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_name},
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            logger.error(f"Erro ao gerar presigned url: {e}")
            return ""

    def download_file_bytes(self, object_name: str) -> bytes:
        """
        Baixa o objeto do S3 em formato de bytes.
        """
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=object_name)
            return response['Body'].read()
        except ClientError as e:
            logger.error(f"Erro ao baixar do S3: {e}")
            raise

    def upload_json(self, data: dict, object_name: str) -> str:
        """Salva um JSON direto no S3."""
        import json
        return self.upload_file_bytes(
            file_content=json.dumps(data, ensure_ascii=False).encode('utf-8'),
            object_name=object_name,
            content_type="application/json"
        )

    def download_json(self, object_name: str) -> dict:
        """Lê um JSON direto do S3."""
        import json
        content = self.download_file_bytes(object_name)
        return json.loads(content.decode('utf-8'))

    def exists(self, object_name: str) -> bool:
        """Verifica se um objeto existe no S3."""
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=object_name)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            raise
