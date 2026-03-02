from ..models.schemas import AnalyzeRequest, AnalyzeResponse, ClauseResult


async def analyze_contract(request: AnalyzeRequest) -> AnalyzeResponse:
    # stub implementation; replace with real model logic
    # this function lives in services/ to keep business logic separate from
    # framework/endpoint code.

    # example static response matching the expected schema
    return AnalyzeResponse(
        overall_risk_score=42,
        executive_summary="This contract shows moderate risk due to ...",
        red_flags=["Termination clause ambiguous", "Unusual indemnity"],
        clauses=[
            ClauseResult(
                clause_type="termination",
                extracted_text="The agreement may be terminated ...",
                risk_level="medium",
                explanation="The termination period is unspecific",
                negotiation_recommendation="Clarify the notice period",
            )
        ],
    )
