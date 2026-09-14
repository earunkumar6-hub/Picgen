import time

import httpx

from app.core.config import get_settings
from app.services.providers.base import ImageProvider, ProviderError

_REPLICATE_API = "https://api.replicate.com/v1"
_POLL_INTERVAL_S = 1.5
_POLL_TIMEOUT_S = 90


class FluxProProvider(ImageProvider):
    name = "flux"
    label = "FLUX Pro (Replicate)"

    def is_available(self) -> bool:
        return bool(get_settings().replicate_api_token)

    def generate(self, prompt: str, n: int, aspect_ratio: str, fmt: str) -> list[bytes]:
        settings = get_settings()
        if not settings.replicate_api_token:
            raise ProviderError("REPLICATE_API_TOKEN is not configured.")

        headers = {
            "Authorization": f"Bearer {settings.replicate_api_token}",
            "Content-Type": "application/json",
            "Prefer": "wait=25",
        }
        images: list[bytes] = []
        with httpx.Client(timeout=60) as client:
            for _ in range(n):
                output_urls = self._create_and_await_prediction(client, headers, prompt, aspect_ratio, fmt)
                for url in output_urls:
                    resp = client.get(url)
                    resp.raise_for_status()
                    images.append(resp.content)

        if not images:
            raise ProviderError("FLUX Pro returned no image data.")
        return images

    def _create_and_await_prediction(
        self, client: httpx.Client, headers: dict, prompt: str, aspect_ratio: str, fmt: str
    ) -> list[str]:
        settings = get_settings()
        body = {
            "input": {
                "prompt": prompt,
                "aspect_ratio": aspect_ratio,
                "output_format": fmt,
            }
        }
        create_url = f"{_REPLICATE_API}/models/{settings.flux_model_version}/predictions"
        resp = client.post(create_url, headers=headers, json=body)
        if resp.status_code >= 400:
            raise ProviderError(f"FLUX Pro request failed ({resp.status_code}): {resp.text}")
        prediction = resp.json()

        status = prediction.get("status")
        elapsed = 0.0
        while status not in ("succeeded", "failed", "canceled") and elapsed < _POLL_TIMEOUT_S:
            time.sleep(_POLL_INTERVAL_S)
            elapsed += _POLL_INTERVAL_S
            poll_resp = client.get(prediction["urls"]["get"], headers=headers)
            poll_resp.raise_for_status()
            prediction = poll_resp.json()
            status = prediction.get("status")

        if status != "succeeded":
            raise ProviderError(f"FLUX Pro prediction did not succeed (status={status}).")

        output = prediction.get("output")
        if isinstance(output, str):
            return [output]
        if isinstance(output, list):
            return output
        raise ProviderError("FLUX Pro returned an unexpected output format.")
