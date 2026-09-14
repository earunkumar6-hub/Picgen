import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.prompt import Prompt
from app.schemas.prompt import PromptBuildRequest, PromptOut
from app.services.prompt_enhancer import PromptEnhancementError, enhance_prompt
from app.services.sip_builder import build_sip_prompt

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


@router.post("", response_model=PromptOut)
def create_prompt(req: PromptBuildRequest, db: Session = Depends(get_db)) -> Prompt:
    raw_prompt = build_sip_prompt(req)
    prompt = Prompt(
        style=req.style,
        intent=req.intent,
        subject=req.subject,
        layout=req.parameters.layout,
        typography=req.parameters.typography,
        colors=req.parameters.colors,
        spacing=req.parameters.spacing,
        aspect_ratio=req.parameters.aspect_ratio,
        anti_slop_rules=req.anti_slop_rules,
        template_key=req.template_key,
        raw_prompt=raw_prompt,
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.get("", response_model=list[PromptOut])
def list_prompts(limit: int = 50, db: Session = Depends(get_db)) -> list[Prompt]:
    return db.query(Prompt).order_by(Prompt.created_at.desc()).limit(limit).all()


@router.get("/{prompt_id}", response_model=PromptOut)
def get_prompt(prompt_id: str, db: Session = Depends(get_db)) -> Prompt:
    prompt = db.get(Prompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt


@router.post("/{prompt_id}/enhance", response_model=PromptOut)
def enhance(prompt_id: str, db: Session = Depends(get_db)) -> Prompt:
    prompt = db.get(Prompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    try:
        prompt.enhanced_prompt = enhance_prompt(prompt.raw_prompt)
    except PromptEnhancementError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    db.commit()
    db.refresh(prompt)
    return prompt


@router.get("/{prompt_id}/export")
def export_prompt(prompt_id: str, fmt: str = "json", db: Session = Depends(get_db)) -> PlainTextResponse:
    prompt = db.get(Prompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    text = prompt.enhanced_prompt or prompt.raw_prompt

    if fmt == "txt":
        content, media_type, filename = text, "text/plain", f"prompt-{prompt.id}.txt"
    elif fmt == "md":
        content = (
            f"# SIP Prompt — {prompt.style} / {prompt.intent}\n\n"
            f"{text}\n\n"
            f"## Parameters\n"
            f"- Layout: {prompt.layout}\n"
            f"- Typography: {prompt.typography}\n"
            f"- Colors: {prompt.colors}\n"
            f"- Spacing: {prompt.spacing}\n"
            f"- Aspect ratio: {prompt.aspect_ratio}\n\n"
            f"## Anti-Slop Rules\n"
            + "\n".join(f"- {r}" for r in prompt.anti_slop_rules)
        )
        media_type, filename = "text/markdown", f"prompt-{prompt.id}.md"
    else:
        payload = PromptOut.model_validate(prompt).model_dump(mode="json")
        content = json.dumps(payload, indent=2)
        media_type, filename = "application/json", f"prompt-{prompt.id}.json"

    return PlainTextResponse(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
