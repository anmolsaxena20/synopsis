# ContractScan AI — AI Microservice

**Owner: AI Lead**  
FastAPI service running on port 8001. Handles GPT-4o integration, prompt engineering, and PDF parsing.

---

## Your Files

| File | What It Does |
|------|-------------|
| `main.py` | FastAPI app. Routes: `POST /analyze`, `GET /health` |
| `prompts.py` | System prompt + user prompt builder. Edit this to tune GPT-4o. |
| `pdf_extractor.py` | PDF-to-text extraction + optional `/extract` endpoint |
| `seed_data.py` | 5 pre-analyzed demo contracts for the hackathon demo |
| `test_local.py` | Test script — run after starting the service |
| `requirements.txt` | Python dependencies |
| `Dockerfile` | For Render.com deployment |

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
# Edit .env and add your OPENAI_API_KEY

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
5. Add environment variable: `OPENAI_API_KEY=sk-proj-...`
6. Deploy — Render gives you a public HTTPS URL

Tell Dev 1 the URL so they can set `AI_SERVICE_URL` in the Node backend `.env`.
