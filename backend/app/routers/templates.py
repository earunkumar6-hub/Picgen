from fastapi import APIRouter, HTTPException

from app.schemas.template import TemplateOut
from app.services.templates_data import TEMPLATES, get_template

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[TemplateOut])
def list_templates() -> list[TemplateOut]:
    return TEMPLATES


@router.get("/{key}", response_model=TemplateOut)
def get_one(key: str) -> TemplateOut:
    template = get_template(key)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template
