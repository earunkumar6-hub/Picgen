import base64
import os

import httpx
from google.auth.transport.requests import Request
from google.oauth2 import service_account

from app.core.config import get_settings
from app.services.providers.base import ImageProvider, ProviderError

# Imagen models on Vertex AI were retired on 2026-06-30; Gemini image models replace them.
_SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]


class ImagenProvider(ImageProvider):
    name = "imagen"
    label = "Google Gemini Image (Vertex AI)"

    def is_available(self) -> bool:
        settings = get_settings()
        return bool(settings.google_cloud_project and settings.google_application_credentials)

    def _access_token(self, settings) -> str:
        if not settings.google_application_credentials or not os.path.exists(
            settings.google_application_credentials
        ):
            raise ProviderError("GOOGLE_APPLICATION_CREDENTIALS does not point to a valid file.")
        credentials = service_account.Credentials.from_service_account_file(
            settings.google_application_credentials, scopes=_SCOPES
        )
        credentials.refresh(Request())
        return credentials.token

    def _url(self, settings, model: str) -> str:
        location = settings.google_cloud_location
        host = "aiplatform.googleapis.com" if location == "global" else f"{location}-aiplatform.googleapis.com"
        return (
            f"https://{host}/v1/projects/{settings.google_cloud_project}/locations/{location}/"
            f"publishers/google/models/{model}:generateContent"
        )

    def generate(self, prompt: str, n: int, aspect_ratio: str, fmt: str) -> list[bytes]:
        settings = get_settings()
        if not self.is_available():
            raise ProviderError("Google Vertex AI is not configured (project/credentials missing).")

        token = self._access_token(settings)
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        body = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"],
                "imageConfig": {"aspectRatio": aspect_ratio},
            },
        }

        models_to_try = [settings.google_image_model, settings.google_image_model_fallback]
        errors: list[str] = []
        with httpx.Client(timeout=90) as client:
            for model in models_to_try:
                # Gemini returns one image per call, so request each variation separately.
                images: list[bytes] = []
                failed = False
                for _ in range(n):
                    resp = client.post(self._url(settings, model), headers=headers, json=body)
                    if resp.status_code >= 400:
                        errors.append(f"{model} ({resp.status_code}): {resp.text}")
                        failed = True
                        break
                    images.extend(self._extract_images(resp.json()))
                if failed:
                    continue
                if images:
                    return images
                errors.append(f"{model}: response contained no image data")

        raise ProviderError("Gemini image generation failed: " + " | ".join(errors))

    @staticmethod
    def _extract_images(payload: dict) -> list[bytes]:
        images: list[bytes] = []
        for candidate in payload.get("candidates", []):
            for part in candidate.get("content", {}).get("parts", []):
                data = part.get("inlineData", {}).get("data")
                if data:
                    images.append(base64.b64decode(data))
        return images
