from pydantic import BaseModel
from typing import List, Optional


class AnalyzeRequest(BaseModel):
    contract_id: str
    contract_text: str | None = None
    s3_key: str | None = None
    vendor_name: str | None = None
    contract_title: str | None = None
    contract_value: str | None = None


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
    liability_score: Optional[int] = None
    renewal_risk_score: Optional[int] = None
    ip_ownership_score: Optional[int] = None
    termination_score: Optional[int] = None
    payment_exposure_score: Optional[int] = None
    clauses: List[ClauseResult]
