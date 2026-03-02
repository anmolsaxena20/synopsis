# AI Service (Python)

This is a standalone microservice responsible for analyzing contracts.
The **backend** service (`backend/src/services/ai.service.js`) posts contract
identifiers and S3 location data here. The AI service then performs risk
analysis and returns structured results which are persisted back into the
Prisma-managed database.

## Expectations & API

The backend `ai.service.js` makes a request like this:

```js
await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, {
  contract_id: contractId,
  s3_key: s3Key,
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
   Copy `.env` and provide your OpenAI API key if using the OpenAI integration:

   ```env
   AI_PORT=8000
   OPENAI_API_KEY=sk-...
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
   curl -X POST http://localhost:8000/analyze -H "Content-Type: application/json" \
        -d '{"contract_id":"abc","s3_key":"foo.pdf"}'
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
 │   └─ analysis.py    # business logic (currently a stub)
 └─ prompts/           # prompt templates & helpers for LLM interactions
```

This separation makes it easy to extend each area independently and keeps
endpoint code thin.

## Extending

- Add real analysis routines inside `app/services/analysis.py` or split them
  further into additional service modules.
- Move prompt text into `app/prompts` as your prompts become more complex.
- Keep Pydantic models in `app/models/schemas.py` so they can be shared
  between services and tests.

---

By keeping the AI service in Python you can leverage rich ML/AI libraries and
maintain a clear boundary with the main Node backend. The backend just needs
the `AI_SERVICE_URL` env variable pointing to this service (e.g.,
`http://localhost:8000`).
