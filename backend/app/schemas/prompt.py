from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PromptParameters(BaseModel):
    layout: str
    typography: str
    colors: str
    spacing: str
    aspect_ratio: str


class PromptBuildRequest(BaseModel):
    style: str
    intent: str
    subject: str = Field(min_length=1, max_length=2000)
    parameters: PromptParameters
    anti_slop_rules: list[str] = Field(default_factory=list)
    template_key: str | None = None


class PromptEnhanceRequest(BaseModel):
    prompt_id: str


class PromptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    style: str
    intent: str
    subject: str
    layout: str
    typography: str
    colors: str
    spacing: str
    aspect_ratio: str
    anti_slop_rules: list[str]
    template_key: str | None
    raw_prompt: str
    enhanced_prompt: str | None
    created_at: datetime
