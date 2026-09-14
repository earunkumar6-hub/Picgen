from pydantic import BaseModel


class TemplateOut(BaseModel):
    key: str
    name: str
    style: str
    intent: str
    layout: str
    typography: str
    spacing: str
    aspect_ratio: str
    subject_hint: str
