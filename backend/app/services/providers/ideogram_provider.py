import httpx

from app.core.config import get_settings
from app.services.providers.base import ImageProvider, ProviderError

_IDEOGRAM_API = "https://api.ideogram.ai/generate"

_ASPECT_MAP = {
    "1:1": "ASPECT_1_1",
    "16:9": "ASPECT_16_9",
    "9:16": "ASPECT_9_16",
    "4:5": "ASPECT_4_5",
}


class IdeogramProvider(ImageProvider):
    name = "ideogram"
    label = "Ideogram"

    def is_available(self) -> bool:
        return bool(get_settings().ideogram_api_key)

    def generate(self, prompt: str, n: int, aspect_ratio: str, fmt: str) -> list[bytes]:
        settings = get_settings()
        if not settings.ideogram_api_key:
            raise ProviderError("IDEOGRAM_API_KEY is not configured.")

        headers = {
            "Api-Key": settings.ideogram_api_key,
            "Content-Type": "application/json",
        }
        body = {
            "image_request": {
                "prompt": prompt,
                "aspect_ratio": _ASPECT_MAP.get(aspect_ratio, "ASPECT_1_1"),
                "num_images": n,
            }
        }

        images: list[bytes] = []
        with httpx.Client(timeout=60) as client:
            resp = client.post(_IDEOGRAM_API, headers=headers, json=body)
            if resp.status_code >= 400:
                raise ProviderError(f"Ideogram request failed ({resp.status_code}): {resp.text}")
            data = resp.json().get("data", [])
            for item in data:
                url = item.get("url")
                if not url:
                    continue
                img_resp = client.get(url)
                img_resp.raise_for_status()
                images.append(img_resp.content)

        if not images:
            raise ProviderError("Ideogram returned no image data.")
        return images
