from app.services.providers.base import ImageProvider
from app.services.providers.flux_provider import FluxProProvider
from app.services.providers.ideogram_provider import IdeogramProvider
from app.services.providers.imagen_provider import ImagenProvider
from app.services.providers.openai_provider import OpenAIImageProvider

_PROVIDERS: dict[str, ImageProvider] = {
    p.name: p
    for p in (OpenAIImageProvider(), FluxProProvider(), IdeogramProvider(), ImagenProvider())
}


def get_provider(name: str) -> ImageProvider:
    provider = _PROVIDERS.get(name)
    if provider is None:
        raise KeyError(f"Unknown provider: {name}")
    return provider


def list_providers() -> list[ImageProvider]:
    return list(_PROVIDERS.values())
