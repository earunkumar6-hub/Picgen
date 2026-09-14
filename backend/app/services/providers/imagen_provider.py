import base64
import os

import httpx
from google.auth.transport.requests import Request
from google.oauth2 import service_account

from app.core.config import get_settings
from app.services.providers.base import ImageProvider, ProviderError

_MODEL_ID = "imagegeneration@006"
_SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]


class ImagenProvider(ImageProvider):
    name = "imagen"
    label = "Google Imagen (Vertex AI)"

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

    def generate(self, prompt: str, n: int, aspect_ratio: str, fmt: str) -> list[bytes]:
        settings = get_settings()
        if not self.is_available():
            raise ProviderError("Google Imagen is not configured (project/credentials missing).")

        token = self._access_token(settings)
        url = (
            f"https://{settings.google_cloud_location}-aiplatform.googleapis.com/v1/"
            f"projects/{settings.google_cloud_project}/locations/{settings.google_cloud_location}/"
            f"publishers/google/models/{_MODEL_ID}:predict"
        )
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        body = {
            "instances": [{"prompt": prompt}],
            "parameters": {"sampleCount": n, "aspectRatio": aspect_ratio},
        }

        with httpx.Client(timeout=60) as client:
            resp = client.post(url, headers=headers, json=body)
        if resp.status_code >= 400:
            raise ProviderError(f"Imagen request failed ({resp.status_code}): {resp.text}")

        predictions = resp.json().get("predictions", [])
        images = [
            base64.b64decode(p["bytesBase64Encoded"])
            for p in predictions
            if p.get("bytesBase64Encoded")
        ]
        if not images:
            raise ProviderError("Imagen returned no image data.")
        return images
