import base64

from openai import OpenAI

from app.core.config import get_settings
from app.services.providers.base import ImageProvider, ProviderError

_SIZE_BY_ASPECT = {
    "1:1": "1024x1024",
    "16:9": "1536x1024",
    "9:16": "1024x1536",
    "4:5": "1024x1536",
}


class OpenAIImageProvider(ImageProvider):
    name = "openai"
    label = "OpenAI Images (gpt-image-2.5-flare)"

    def is_available(self) -> bool:
        return bool(get_settings().openai_api_key)

    def generate(self, prompt: str, n: int, aspect_ratio: str, fmt: str) -> list[bytes]:
        settings = get_settings()
        if not settings.openai_api_key:
            raise ProviderError("OPENAI_API_KEY is not configured.")

        client = OpenAI(api_key=settings.openai_api_key)
        size = _SIZE_BY_ASPECT.get(aspect_ratio, "1024x1024")

        try:
            result = client.images.generate(
                model=settings.openai_image_model,
                prompt=prompt,
                size=size,
                n=n,
            )
        except Exception as exc:  # noqa: BLE001 - surfaced to API caller
            raise ProviderError(f"OpenAI image generation failed: {exc}") from exc

        images: list[bytes] = []
        for item in result.data:
            if not item.b64_json:
                continue
            images.append(base64.b64decode(item.b64_json))
        if not images:
            raise ProviderError("OpenAI returned no image data.")
        return images
