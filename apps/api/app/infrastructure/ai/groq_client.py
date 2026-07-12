"""Cliente Groq API para análise de formulários e geração de checklist."""
from __future__ import annotations
import json
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

PARTIES_SYSTEM_PROMPT = """Você é um especialista em formulários bancários e imobiliários brasileiros.
Retorne APENAS JSON válido, sem markdown, sem explicações."""

PARTIES_USER_PROMPT = """Analise o texto abaixo e identifique TODAS as partes envolvidas na operação.

Retorne APENAS um JSON válido com esta estrutura exata:
{{
  "buyers": [{{"index": 1, "type": "person|company", "name_field": "campo onde aparece o nome"}}],
  "sellers": [{{"index": 1, "type": "person|company", "name_field": "..."}}],
  "witnesses": [],
  "procurators": [],
  "spouses": []
}}

Sinônimos reconhecidos:
- COMPRADOR = ADQUIRENTE = PROPONENTE = CESSÁRIO
- VENDEDOR = PROMITENTE VENDEDOR = CEDENTE = OUTORGANTE

Texto do formulário:
{form_text}"""

CHECKLIST_SYSTEM_PROMPT = """Você é um especialista em documentação imobiliária e bancária brasileira.
Retorne APENAS JSON válido, sem markdown, sem explicações."""

CHECKLIST_USER_PROMPT = """Dado o JSON de partes abaixo, gere a checklist completa de documentos necessários.

Regras:
- Pessoa física: RG ou CNH (frente e verso), CPF, comprovante de residência (máx 90 dias), certidão de estado civil
- Se casado: certidão de casamento + documentos do cônjuge
- Pessoa jurídica: Contrato Social + todas alterações, Cartão CNPJ, Certidão Simplificada da Junta Comercial
- Para representante legal de PJ: procuração ou ata de eleição + documentos pessoais
- Procurador: procuração com firma reconhecida + documentos pessoais

Retorne APENAS um JSON válido:
{{
  "checklist": [
    {{
      "party_type": "buyer",
      "party_index": 1,
      "party_name": "campo_nome",
      "documents": [
        {{"name": "RG ou CNH", "required": true, "notes": "frente e verso"}}
      ]
    }}
  ]
}}

Partes detectadas:
{parties_json}"""


async def ask_groq(prompt: str, system: str = "") -> str:
    """Chama a API do Groq e retorna o texto da resposta."""
    if not settings.groq_api_key:
        raise ValueError("GROQ_API_KEY não configurada")

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    async with httpx.AsyncClient(timeout=settings.groq_timeout_seconds) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.groq_model,
                "messages": messages,
                "max_tokens": settings.groq_max_tokens,
                "temperature": 0.1,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


def _parse_json_safe(text: str) -> dict:
    """Tenta parsear JSON, removendo markdown se necessário."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return json.loads(text)


async def analyze_form_parties(form_text: str) -> dict:
    """Identifica partes em formulários brasileiros via LLM."""
    prompt = PARTIES_USER_PROMPT.format(form_text=form_text[:4000])
    raw = await ask_groq(prompt, system=PARTIES_SYSTEM_PROMPT)
    try:
        return _parse_json_safe(raw)
    except (json.JSONDecodeError, KeyError) as e:
        logger.warning(f"Falha ao parsear JSON do Groq (parties): {e}")
        raise ValueError(f"Resposta inválida do LLM: {raw[:200]}")


async def generate_checklist(parties: dict) -> dict:
    """Gera checklist de documentos a partir das partes detectadas."""
    prompt = CHECKLIST_USER_PROMPT.format(parties_json=json.dumps(parties, ensure_ascii=False))
    raw = await ask_groq(prompt, system=CHECKLIST_SYSTEM_PROMPT)
    try:
        return _parse_json_safe(raw)
    except (json.JSONDecodeError, KeyError) as e:
        logger.warning(f"Falha ao parsear JSON do Groq (checklist): {e}")
        raise ValueError(f"Resposta inválida do LLM: {raw[:200]}")
