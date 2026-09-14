from openai import APIStatusError, OpenAI

from app.core.config import get_settings

SYSTEM_PROMPT = (
    "You are a prompt engineer for AI image generation. You will be given a structured "
    "prompt built from a Style-Intent-Parameters (SIP) framework, including explicit "
    "constraints. Rewrite it into a single vivid, production-ready image prompt. "
    "Preserve every constraint and structural element exactly (style, intent, layout, "
    "typography, colors, spacing, aspect ratio, and all listed constraints) — do not drop "
    "or contradict any of them. Do not add commentary, headings, or quotation marks. "
    "Return only the final prompt text."
)


class PromptEnhancementError(RuntimeError):
    pass


def enhance_prompt(raw_prompt: str) -> str:
    settings = get_settings()
    if not settings.openai_api_key:
        raise PromptEnhancementError("OPENAI_API_KEY is not configured.")

    client = OpenAI(api_key=settings.openai_api_key)
    models_to_try = [settings.openai_text_model, settings.openai_text_model_fallback]

    last_error: Exception | None = None
    for model in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": raw_prompt},
                ],
                temperature=0.7,
            )
            content = response.choices[0].message.content
            if content:
                return content.strip()
        except APIStatusError as exc:
            last_error = exc
            continue

    raise PromptEnhancementError(f"All models failed: {last_error}")
