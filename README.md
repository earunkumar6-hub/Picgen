# SIP AI Design Studio

**The Anti-Slop Image Generator**

A prompt builder and image generation studio built around the **Style, Intent, Parameters
(SIP)** framework. Build structured prompts, optionally enhance them with GPT, then generate
images with OpenAI Images, FLUX Pro, Ideogram, or Google Gemini Image (Vertex AI).

This is the **local MVP**: SQLite database, images stored on local disk, no authentication
(single-user). Postgres/MinIO/JWT can be layered on later.

## Project layout

```
backend/    FastAPI + SQLAlchemy + SQLite, image provider adapters
frontend/   React + TypeScript + Vite + Tailwind
```

## Backend setup

```bash
cd backend
python -m venv venv
./venv/Scripts/pip install -r requirements.txt   # Windows
# source venv/bin/activate && pip install -r requirements.txt   # macOS/Linux

copy .env.example .env   # Windows: copy, macOS/Linux: cp
# edit .env and paste in whichever API keys you have

./venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```

Backend runs at http://127.0.0.1:8000. `GET /api/health` for a liveness check,
`GET /api/images/providers` to see which image providers are active based on your `.env`.

### Provider keys (all optional — ungiven ones just show as "not configured" in the UI)

| Provider | Env var(s) | Notes |
|---|---|---|
| OpenAI (prompts + images) | `OPENAI_API_KEY` | Also powers GPT-5 prompt enhancement |
| FLUX Pro | `REPLICATE_API_TOKEN` | Via Replicate |
| Ideogram | `IDEOGRAM_API_KEY` | |
| Google Gemini Image (Vertex AI) | `GOOGLE_CLOUD_PROJECT`, `GOOGLE_APPLICATION_CREDENTIALS` | Needs a Vertex AI service-account JSON key |

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173 and proxies `/api` and `/storage` to the backend
(see `vite.config.ts`), so run both servers together during development.

## Flow

1. **Templates** — optionally start from a pre-built SIP configuration.
2. **Prompt Builder** — pick Style + Intent, describe the subject, tune layout/typography/
   colors/spacing/aspect ratio, choose anti-slop constraints, then Generate Prompt.
3. Optionally **AI Enhance** the prompt (requires `OPENAI_API_KEY`).
4. **Image Studio** — pick a configured provider, variation count, and format, then generate.
5. Download images or export the prompt as JSON/TXT/Markdown.

## Not built (out of MVP scope)

Auth, Postgres, MinIO, team workspaces, brand kits, multi-language prompts, and the other
future features from the original product spec — add them when needed.
