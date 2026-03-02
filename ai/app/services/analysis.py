from ..models.schemas import AnalyzeRequest, AnalyzeResponse, ClauseResult

import os
import math
import json
import urllib.request
from pdfminer.high_level import extract_text
from openai import AsyncOpenAI
from ..prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

# We lazily instantiate the OpenAI/Gemini client to avoid import-time failures.
_client = None

def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "Environment variable GEMINI_API_KEY or OPENAI_API_KEY must be set"
            )
        _client = AsyncOpenAI(api_key=api_key)
    return _client

MAX_CHARS = 80000  # ~20k tokens; adjust if needed

def _fetch_text_from_cloudinary(cloudinary_key: str) -> str:
    """Download PDF from Cloudinary and extract text."""
    url = f"https://res.cloudinary.com/dclfbychs/raw/upload/{cloudinary_key}"
    try:
        with urllib.request.urlopen(url) as response:
            content = response.read()
        from io import BytesIO
        return extract_text(BytesIO(content))
    except Exception as exc:
        raise RuntimeError(f"Failed to fetch or parse PDF from Cloudinary ({url}): {exc}")

def _chunk_text(text: str, max_chars: int = MAX_CHARS) -> str:
    if len(text) <= max_chars:
        return text
    front = math.floor(max_chars * 0.70)
    back = math.floor(max_chars * 0.15)
    return text[:front] + "\n[...middle sections truncated...]\n" + text[-back:]

async def analyze_contract(request: AnalyzeRequest) -> AnalyzeResponse:
    """Call the AI model with a well-engineered prompt and return structured result."""

    if request.contract_text:
        raw_text = request.contract_text
    elif request.s3_key:
        raw_text = _fetch_text_from_cloudinary(request.s3_key)
    else:
        raise ValueError("Either contract_text or s3_key must be provided")

    safe_text = _chunk_text(raw_text)
    page_count = max(1, len(safe_text) // 3000)
    user_prompt = USER_PROMPT_TEMPLATE.format(
        contract_title=request.contract_title or request.contract_id,
        vendor_name=request.vendor_name or "(unknown)",
        contract_value=request.contract_value or "Not specified",
        page_count=page_count,
        full_contract_text=safe_text,
    )

    try:
        client = _get_client()
        resp = await client.chat.completions.create(
            model=os.getenv("MODEL", "gpt-4o"), 
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.1,
            max_tokens=int(os.getenv("MAX_TOKENS", 4000)),
            response_format={"type": "json_object"},
            timeout=90,
        )

        content = resp.choices[0].message.content
        
        import sys
        print(f"[DEBUG] Raw model response (first 200 chars): {repr(content[:200])}", file=sys.stderr)
        
        if isinstance(content, str):
            data = json.loads(content)
        else:
            data = content

        clauses = [
            ClauseResult(
                clause_type=c.get("clause_type"),
                extracted_text=c.get("extracted_text"),
                risk_level=c.get("risk_level"),
                explanation=c.get("explanation"),
                negotiation_recommendation=c.get("negotiation_recommendation"),
            )
            for c in data.get("clauses", [])
        ]

        dims = data.get("dimension_scores", {})
        return AnalyzeResponse(
            overall_risk_score=data.get("overall_risk_score", 0),
            executive_summary=data.get("executive_summary"),
            red_flags=data.get("red_flags", []),
            liability_score=dims.get("liability"),
            renewal_risk_score=dims.get("renewal_risk"),
            ip_ownership_score=dims.get("ip_ownership"),
            termination_score=dims.get("termination"),
            payment_exposure_score=dims.get("payment_exposure"),
            clauses=clauses,
        )

    except json.JSONDecodeError as err:
        import sys
        print(f"JSON Decode Error: {err}", file=sys.stderr)
        raise ValueError(f"Model returned invalid JSON: {err.msg} at line {err.lineno}")
    except Exception as exc:
        import sys
        print(f"Unexpected error during analysis: {type(exc).__name__}: {exc}", file=sys.stderr)
        raise