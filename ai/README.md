# ContractScan AI — AI Microservice

<<<<<<< Updated upstream
**Owner: AI Lead**  
FastAPI service running on port 8001. Handles GPT-4o integration, prompt engineering, and PDF parsing.
=======
This is a standalone microservice responsible for analyzing contracts.
The **backend** service (`backend/src/services/ai.service.js`) posts contract
identifiers and Cloudinary keys here. The AI service then performs risk
analysis and returns structured results which are persisted back into the
Prisma-managed database.

## Expectations & API

The backend `ai.service.js` makes a request like this:

```js
await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, {
  contract_id: contractId,
  s3_key: cloudinaryKey, // Cloudinary upload key
});
```

A successful response must be JSON matching the following shape:

```json
{
  "overall_risk_score": 0,
  "executive_summary": "...",
  "red_flags": ["..."],
  "clauses": [
    {
      "clause_type": "...",
      "extracted_text": "...",
      "risk_level": "...",
      "explanation": "...",
      "negotiation_recommendation": "..."
    }
  ]
}
```

Any failure should return a 5xx HTTP error; the backend handles this by
updating the contract `status` to `ERROR` and storing the message.

## Getting Started

1. **Install dependencies**

   ```bash
   cd ai
   python -m venv venv    # optional but recommended
   source venv/Scripts/activate   # windows; use `source venv/bin/activate` on Unix
   pip install -r requirements.txt
   ```

2. **Configuration**
   Copy `.env` from `env.example` and provide your OpenAI/Gemini API key. The
   service now lazily creates the model client, so it can start without a key
   (handy for building or running unrelated tests). **However**, the first
   call to `/analyze` will raise an error if neither `GEMINI_API_KEY` nor
   `OPENAI_API_KEY` is set, so make sure to export one of them before sending
   real requests.

   ```env
   AI_PORT=8000
   # Either of the following is fine:
   OPENAI_API_KEY=sk-...
   # GEMINI_API_KEY=sk-...           # optional alternative name
   ```

3. **Run the service**

   ```bash
   uvicorn app.main:app --reload --port ${AI_PORT:-8000}
   # or, since the package exports `app` in `app/__init__.py`:
   uvicorn app:app --reload --port ${AI_PORT:-8000}
   ```

   (both commands refer to the FastAPI instance defined in `app/main.py`)

   or `npm run dev` after adding a small `package.json`/`nodemon` entry if you
   prefer JS tooling.

4. **Test the endpoint**

   ```bash
   # pass raw text directly
   curl -X POST http://localhost:8000/analyze -H "Content-Type: application/json" \
        -d '{"contract_id":"abc","contract_text":"Agreement text..."}'

   # or supply a Cloudinary key - the service will fetch/parse the PDF itself
   curl -X POST http://localhost:8000/analyze -H "Content-Type: application/json" \
        -d '{"contract_id":"xyz","s3_key":"v1234/example_pdf.pdf"}'  # Cloudinary key
   ```

   Response should match the shape above.

## Project Layout

The code is now organized into conventional responsibility zones:

```
ai/app/
 ├─ __init__.py        # exposes the FastAPI `app` object
 ├─ main.py            # entrypoint; defines routes and loads configuration
 ├─ models/
 │   └─ schemas.py     # Pydantic request/response models
 ├─ services/
 │   └─ analysis.py    # business logic — calls Gemini model with blueprint prompt
 └─ prompts/           # prompt templates & helpers for LLM interactions
```

The AI microservice was built to align with the _ContractScan AI_ hackathon
blueprint. It uses the Gemini (formerly ‘gpt-4o’) model via the OpenAI Python
SDK; set your API key in `.env` using either `OPENAI_API_KEY` or the original
`GEMINI_API_KEY`. Additional model configuration (`MODEL`, `MAX_TOKENS`) can
also be set here.
By default the `/analyze` endpoint now accepts either raw contract text or a
Cloudinary key. When given an `s3_key` (which is actually a Cloudinary upload
key), the service will fetch the PDF from
`https://res.cloudinary.com/dclfbychs/raw/upload/{s3_key}` and extract text via
`pdfminer.six` before feeding the text into the model. This allows the Node
backend to pass Cloudinary keys directly while the AI service handles PDF
parsing.

**No environment variables are required** for Cloudinary integration — the URL
is hardcoded. If `contract_text` is supplied in the request, the Cloudinary
fetch is skipped.
This separation makes it easy to extend each area independently and keeps
endpoint code thin.

## Extending

- Add real analysis routines inside `app/services/analysis.py` or split them
  further into additional service modules.
- Move prompt text into `app/prompts` as your prompts become more complex.
- Keep Pydantic models in `app/models/schemas.py` so they can be shared
  between services and tests.
  > > > > > > > Stashed changes

---

## Your Files

| File               | What It Does                                                   |
| ------------------ | -------------------------------------------------------------- |
| `main.py`          | FastAPI app. Routes: `POST /analyze`, `GET /health`            |
| `prompts.py`       | System prompt + user prompt builder. Edit this to tune GPT-4o. |
| `pdf_extractor.py` | PDF-to-text extraction + optional `/extract` endpoint          |
| `seed_data.py`     | 5 pre-analyzed demo contracts for the hackathon demo           |
| `test_local.py`    | Test script — run after starting the service                   |
| `requirements.txt` | Python dependencies                                            |
| `Dockerfile`       | For Render.com deployment                                      |

---

## Setup

```bash
cd ai-service

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment
cp .env.example .env
# Edit `.env` and add your API key (OPENAI_API_KEY or GEMINI_API_KEY)

# 4. Start the service
uvicorn main:app --reload --port 8001
```

The service is now running at `http://localhost:8001`

---

## Testing Your Service

```bash
# Terminal 1: keep the service running
uvicorn main:app --reload --port 8001

# Terminal 2: run tests
python test_local.py
```

Expected output:

```
TEST: /health endpoint... PASS
TEST: /analyze with sample contract... PASS (score=72, 5 clauses, 2847 tokens)
TEST: /analyze with empty contract text... PASS
TEST: /analyze with missing required fields... PASS

✅ All tests passed.
```

---

## Testing with curl (manual)

```bash
# Health check
curl http://localhost:8001/health

# Analyze a contract (paste text inline)
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "contract_title": "Test NDA",
    "vendor_name": "Acme Corp",
    "contract_text": "This NDA auto-renews every year with no notice...",
    "contract_value": "N/A"
  }'
```

---

## Testing with Swagger UI (browser)

FastAPI auto-generates interactive docs:

1. Start service: `uvicorn main:app --reload --port 8001`
2. Open: `http://localhost:8001/docs`
3. Click `POST /analyze` → "Try it out" → fill in fields → "Execute"

---

## How the Node Backend Calls You

The Node backend (`backend/src/lib/ai-client.ts`) sends:

```json
POST http://localhost:8001/analyze
{
  "contract_title": "SaaS MSA",
  "vendor_name": "Acme Inc.",
  "contract_text": "<full extracted text>",
  "contract_value": "$48,000/year"
}
```

You return:

```json
{
  "success": true,
  "analysis": {
    "overall_risk_score": 74,
    "executive_summary": "...",
    "dimension_scores": { ... },
    "red_flags": ["...", "...", "..."],
    "clauses": [{ ... }]
  },
  "tokens_used": 2847
}
```

---

## Seed Data for Demo

Your `seed_data.py` has 5 pre-analyzed contracts. Share this JSON with Dev 1 so they can insert it via the Prisma seed script. Run:

```bash
python seed_data.py > seed_output.json
```

Send `seed_output.json` to Dev 1 (backend lead).

---

## Tuning the Prompt

All prompt text lives in `prompts.py`. To iterate:

1. Edit `SYSTEM_PROMPT` or `build_user_prompt()` in `prompts.py`
2. The service auto-reloads (if using `--reload` flag)
3. Re-run `test_local.py` to validate output

**Key things to tune:**

- Risk scoring thresholds (0-30 / 31-65 / 66-85 / 86-100)
- Which clause types to extract
- Explanation verbosity
- Negotiation recommendation specificity

---

## Deploy to Render.com

1. Push this folder to GitHub (inside the monorepo)
2. Go to render.com → New → Web Service
3. Connect GitHub repo
4. Settings:
   - Root directory: `ai-service`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `OPENAI_API_KEY=sk-proj-...` (or
   `GEMINI_API_KEY` – both are accepted)
6. Deploy — Render gives you a public HTTPS URL

Tell Dev 1 the URL so they can set `AI_SERVICE_URL` in the Node backend `.env`.
