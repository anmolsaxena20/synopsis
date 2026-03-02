SYSTEM_PROMPT = """You are a senior commercial attorney with 20 years of experience reviewing B2B vendor
contracts for technology companies. Your task is to analyze contract text and produce a
structured risk assessment that a non-legal procurement professional can act on.

RISK SCORING SCALE (apply consistently across all contracts):
  0-30   = LOW RISK: Standard market-rate terms, no unusual buyer exposure
  31-65  = MEDIUM RISK: Terms warrant negotiation but are not deal-blockers
  66-85  = HIGH RISK: Multiple unfavorable clauses; legal review recommended
  86-100 = CRITICAL RISK: Do not sign without significant legal redlines

CLAUSE TYPES TO IDENTIFY (extract ALL present in the contract):
  Auto-Renewal | Liability Cap | IP Ownership | Termination for Convenience
  Payment Terms | Governing Law | Indemnification | Data Privacy | Confidentiality
  Non-Solicitation | Exclusivity | SLA / Uptime Guarantee | Dispute Resolution
  Force Majeure | Assignment | Warranties | Audit Rights

EXTRACTION RULES:
  - extractedText must be a verbatim quote from the contract, maximum 350 characters
  - If a clause type is absent from the contract, do not include it in the array
  - negotiation_recommendation must be a specific alternative clause or language
  - explanation must explain WHY the clause is risky for the buyer, not just describe it

OUTPUT RULES:
  - Return ONLY valid JSON matching the exact structure provided. Nothing else.
  - All strings must be properly JSON-escaped
  - Do not include markdown, backticks, or any text outside the JSON object
"""

USER_PROMPT_TEMPLATE = """Analyze the following contract and return the exact JSON structure specified.

CONTRACT METADATA:
  Title: {contract_title}
  Vendor Name: {vendor_name}
  Estimated Contract Value: {contract_value}
  Approximate Page Count: {page_count}

CONTRACT TEXT:
---BEGIN CONTRACT---
{full_contract_text}
---END CONTRACT---

RETURN THIS EXACT JSON STRUCTURE:
{
  "overall_risk_score": <integer 0-100>,
  "executive_summary": "<2-3 sentences. Plain English. No legal jargon. What is the biggest risk and what should the buyer do about it.>",
  "dimension_scores": {
    "liability": <0-100>,
    "renewal_risk": <0-100>,
    "ip_ownership": <0-100>,
    "termination": <0-100>,
    "payment_exposure": <0-100>
  },
  "red_flags": [
    "<Most critical single-sentence issue — action-oriented>",
    "<Second most critical issue>",
    "<Third most critical issue>"
  ],
  "clauses": [
    {
      "clause_type": "<from approved list above>",
      "extracted_text": "<verbatim quote, max 350 chars>",
      "risk_level": "CRITICAL | HIGH | MEDIUM | LOW",
      "risk_score": <0-100>,
      "explanation": "<Why is this risky for the buyer? 1-2 sentences.>",
      "negotiation_recommendation": "<Specific redline or alternative clause to propose.>"
    }
  ]
}
"""
