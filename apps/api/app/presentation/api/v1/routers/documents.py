from fastapi import APIRouter

router = APIRouter()

@router.post("/upload")
async def upload_document():
    return {"message": "upload document — WIP"}

@router.get("/")
async def list_documents():
    return {"message": "list documents — WIP"}

@router.get("/{doc_id}")
async def get_document(doc_id: str):
    return {"message": f"get document {doc_id} — WIP"}

@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    return {"message": f"delete document {doc_id} — WIP"}
