from pydantic import BaseModel
from typing import List, Optional


class AnalyzeRequest(BaseModel):
    contract_id: str
    s3_key: str


class ClauseResult(BaseModel):
    clause_type: str
    extracted_text: str
    risk_level: str
    explanation: str
    negotiation_recommendation: str


class AnalyzeResponse(BaseModel):
    overall_risk_score: int
    executive_summary: Optional[str]
    red_flags: List[str]
    clauses: List[ClauseResult]
