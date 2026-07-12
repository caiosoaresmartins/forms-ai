from fastapi import APIRouter

router = APIRouter()

@router.post("/upload")
async def upload_form():
    return {"message": "upload form — WIP"}

@router.get("/")
async def list_forms():
    return {"message": "list forms — WIP"}

@router.get("/{form_id}")
async def get_form(form_id: str):
    return {"message": f"get form {form_id} — WIP"}

@router.post("/{form_id}/analyze")
async def analyze_form(form_id: str):
    return {"message": f"analyze form {form_id} — WIP"}

@router.get("/{form_id}/checklist")
async def get_checklist(form_id: str):
    return {"message": f"checklist {form_id} — WIP"}
