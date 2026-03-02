"""
ContractScan AI — FastAPI Microservice
AI Lead owns this file completely.
Runs on port 8001 independently of the Node backend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, os, math, logging
from openai import AsyncOpenAI
from dotenv import load_dotenv
from prompts import SYSTEM_PROMPT, build_user_prompt

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("contractscan-ai")

app = FastAPI(title="ContractScan AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MAX_CHARS = 80_000  # ~20k tokens; GPT-4o context window is 128k


# ── Request / Response Models ────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    contract_title: str
    vendor_name: str
    contract_text: str
    contract_value: str = "Not specified"


class AnalyzeResponse(BaseModel):
    success: bool
    analysis: dict
    tokens_used: int


# ── Helpers ──────────────────────────────────────────────────────────────────

def chunk_text(text: str, max_chars: int) -> str:
    """
    Smart truncation: keep first 70% (intro + key clauses) and
    last 15% (signatures + boilerplate often contains auto-renewal).
    Middle sections are usually repetitive definitions.
    """
    if len(text) <= max_chars:
        return text
    front = math.floor(max_chars * 0.70)
    back  = math.floor(max_chars * 0.15)
    logger.warning(f"Contract too long ({len(text)} chars). Chunking to {front + back} chars.")
    return text[:front] + "\n[...middle sections truncated for length...]\n" + text[-back:]


def validate_analysis(analysis: dict) -> dict:
    """
    Ensure required fields exist and types are correct.
    Adds safe defaults if GPT-4o omits optional fields.
    """
    required = ["overall_risk_score", "executive_summary", "dimension_scores", "red_flags", "clauses"]
    for field in required:
        if field not in analysis:
            raise ValueError(f"AI response missing required field: '{field}'")

    # Clamp score to valid range
    analysis["overall_risk_score"] = max(0, min(100, int(analysis["overall_risk_score"])))

    # Ensure red_flags is a list with at least one entry
    if not isinstance(analysis["red_flags"], list) or len(analysis["red_flags"]) == 0:
        analysis["red_flags"] = ["No critical flags identified — review manually."]

    # Clamp all dimension scores
    ds = analysis.get("dimension_scores", {})
    for key in ["liability", "renewal_risk", "ip_ownership", "termination", "payment_exposure"]:
        ds[key] = max(0, min(100, int(ds.get(key, 50))))
    analysis["dimension_scores"] = ds

    # Validate each clause
    valid_risk_levels = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
    for clause in analysis.get("clauses", []):
        if clause.get("risk_level") not in valid_risk_levels:
            clause["risk_level"] = "MEDIUM"
        clause["risk_score"] = max(0, min(100, int(clause.get("risk_score", 50))))

    return analysis


# ── Routes ───────────────────────────────────────────────────────────────────

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_contract(req: AnalyzeRequest):
    """
    Main endpoint called by the Node backend after PDF extraction.
    Returns structured JSON with risk scores and clause breakdown.
    """
    if not req.contract_text.strip():
        raise HTTPException(status_code=400, detail="contract_text cannot be empty.")

    safe_text  = chunk_text(req.contract_text, MAX_CHARS)
    page_count = max(1, len(req.contract_text) // 3000)  # rough estimate

    user_prompt = build_user_prompt(
        contract_title=req.contract_title,
        vendor_name=req.vendor_name,
        contract_value=req.contract_value,
        page_count=page_count,
        contract_text=safe_text,
    )

    logger.info(f"Analyzing '{req.contract_title}' ({len(safe_text)} chars, ~{page_count} pages)")

    try:
        response = await client.chat.completions.create(
            model=os.getenv("MODEL", "gpt-4o"),
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=int(os.getenv("MAX_TOKENS", 4000)),
            timeout=90,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_prompt},
            ],
        )

        raw_content  = response.choices[0].message.content
        tokens_used  = response.usage.total_tokens

        logger.info(f"GPT-4o responded. Tokens used: {tokens_used}")

        analysis = json.loads(raw_content)
        analysis = validate_analysis(analysis)

        return {"success": True, "analysis": analysis, "tokens_used": tokens_used}

    except json.JSONDecodeError as e:
        logger.error(f"AI returned invalid JSON: {e}")
        # Retry once with a stricter reminder
        try:
            logger.info("Retrying with JSON reminder...")
            retry_prompt = user_prompt + "\n\nCRITICAL: Your last response was not valid JSON. Return ONLY the JSON object — no text before or after."
            response = await client.chat.completions.create(
                model=os.getenv("MODEL", "gpt-4o"),
                response_format={"type": "json_object"},
                temperature=0.0,
                max_tokens=int(os.getenv("MAX_TOKENS", 4000)),
                timeout=90,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": retry_prompt},
                ],
            )
            analysis = json.loads(response.choices[0].message.content)
            analysis = validate_analysis(analysis)
            return {"success": True, "analysis": analysis, "tokens_used": response.usage.total_tokens}
        except Exception as retry_err:
            raise HTTPException(status_code=422, detail=f"AI returned invalid JSON after retry: {retry_err}")

    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"AI response validation failed: {e}")

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    """Lightweight health check used by Node backend and Render.com."""
    return {
        "status": "ok",
        "model": os.getenv("MODEL", "gpt-4o"),
        "max_tokens": int(os.getenv("MAX_TOKENS", 4000)),
    }
