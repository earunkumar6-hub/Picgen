from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.image import Image
from app.models.prompt import Prompt
from app.schemas.image import ImageGenerateRequest, ImageOut, ProviderStatus
from app.services.providers.base import ProviderError
from app.services.providers.registry import get_provider, list_providers
from app.services.storage import save_image

router = APIRouter(prefix="/api/images", tags=["images"])


def _to_out(image: Image) -> ImageOut:
    return ImageOut(
        id=image.id,
        prompt_id=image.prompt_id,
        provider=image.provider,
        file_name=image.file_name,
        format=image.format,
        created_at=image.created_at,
        url=f"/storage/{image.file_name}",
    )


@router.get("/providers", response_model=list[ProviderStatus])
def providers() -> list[ProviderStatus]:
    return [
        ProviderStatus(provider=p.name, label=p.label, available=p.is_available())
        for p in list_providers()
    ]


@router.post("/generate", response_model=list[ImageOut])
def generate(req: ImageGenerateRequest, db: Session = Depends(get_db)) -> list[ImageOut]:
    prompt = db.get(Prompt, req.prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    text = prompt.enhanced_prompt if (req.use_enhanced and prompt.enhanced_prompt) else prompt.raw_prompt

    try:
        provider = get_provider(req.provider)
    except KeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not provider.is_available():
        raise HTTPException(status_code=422, detail=f"{provider.label} is not configured.")

    try:
        images_bytes = provider.generate(text, req.variations, prompt.aspect_ratio, req.format)
    except ProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    results: list[Image] = []
    for data in images_bytes:
        file_name = save_image(data, req.format)
        image = Image(prompt_id=prompt.id, provider=provider.name, file_name=file_name, format=req.format)
        db.add(image)
        results.append(image)
    db.commit()
    for image in results:
        db.refresh(image)

    return [_to_out(image) for image in results]


@router.get("", response_model=list[ImageOut])
def list_images(prompt_id: str | None = None, limit: int = 50, db: Session = Depends(get_db)) -> list[ImageOut]:
    query = db.query(Image)
    if prompt_id:
        query = query.filter(Image.prompt_id == prompt_id)
    images = query.order_by(Image.created_at.desc()).limit(limit).all()
    return [_to_out(image) for image in images]
