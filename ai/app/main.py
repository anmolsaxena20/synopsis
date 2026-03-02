import os
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv

from .models.schemas import AnalyzeRequest, AnalyzeResponse
from .services.analysis import analyze_contract

load_dotenv()

# the AI service itself does not need OpenAI; analysis.py handles the client.
AI_SERVICE_URL = os.environ.get("AI_SERVICE_URL", "http://localhost:8000")

app = FastAPI(title="AI Contract Analyzer")


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    try:
        return await analyze_contract(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/health")
def health():
    return {"status": "ok"}
