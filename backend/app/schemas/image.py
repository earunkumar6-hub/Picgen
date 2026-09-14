from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ProviderName = Literal["openai", "flux", "ideogram", "imagen"]


class ImageGenerateRequest(BaseModel):
    prompt_id: str
    provider: ProviderName
    use_enhanced: bool = True
    variations: int = Field(default=1, ge=1, le=4)
    format: Literal["png", "jpg"] = "png"


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    prompt_id: str
    provider: str
    file_name: str
    format: str
    created_at: datetime
    url: str


class ProviderStatus(BaseModel):
    provider: ProviderName
    label: str
    available: bool
