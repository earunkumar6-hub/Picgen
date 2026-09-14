import uuid

from app.core.config import get_settings


def save_image(data: bytes, fmt: str) -> str:
    """Persist image bytes to local disk and return the generated file name."""
    settings = get_settings()
    file_name = f"{uuid.uuid4()}.{fmt}"
    path = settings.storage_path / file_name
    path.write_bytes(data)
    return file_name
