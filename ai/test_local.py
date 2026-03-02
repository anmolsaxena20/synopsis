"""
ContractScan AI — Local Test Script
AI Lead uses this to verify the service works before integrating with Node.

USAGE:
  # 1. Start the service in another terminal:
  #    uvicorn main:app --reload --port 8001

  # 2. Run this script:
  #    python test_local.py

  # 3. All tests should print PASS.
"""

import httpx
import json
import sys

BASE_URL = "http://localhost:8001"

# Minimal real-looking contract for testing
SAMPLE_CONTRACT = """
MASTER SERVICE AGREEMENT

This Master Service Agreement ("Agreement") is entered into as of January 1, 2025,
by and between Acme Software Inc. ("Vendor") and TechCorp LLC ("Customer").

1. SERVICES
Vendor agrees to provide the SaaS platform described in Exhibit A.

2. TERM AND RENEWAL
This Agreement shall commence on the Effective Date and continue for one (1) year.
This Agreement shall automatically renew for successive one-year terms unless either party
provides written notice of non-renewal at least thirty (30) days prior to the end of the
then-current term. Customer acknowledges that failure to provide timely notice will result
in automatic commitment for an additional term at the then-current pricing.

3. PAYMENT TERMS
Customer shall pay all invoices within fifteen (15) days of receipt. Late payments shall
accrue interest at the rate of two percent (2%) per month from the due date.

4. LIMITATION OF LIABILITY
IN NO EVENT SHALL VENDOR'S AGGREGATE LIABILITY EXCEED THE FEES PAID BY CUSTOMER
IN THE ONE (1) MONTH IMMEDIATELY PRECEDING THE CLAIM. VENDOR SHALL NOT BE LIABLE
FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.

5. INTELLECTUAL PROPERTY
All work product, platform improvements, and derivative works created using Customer data
shall remain the exclusive intellectual property of Vendor. Customer receives a limited,
non-exclusive license to use the platform during the Term.

6. TERMINATION FOR CONVENIENCE
Either party may terminate this Agreement for convenience upon thirty (30) days written notice.
Customer shall not receive a refund of any prepaid fees upon termination.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Delaware.

8. INDEMNIFICATION
Customer agrees to indemnify and hold harmless Vendor from any third-party claims arising
from Customer's use of the Services.
"""


def test_health():
    print("TEST: /health endpoint... ", end="")
    r = httpx.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data["status"] == "ok", f"Expected status=ok, got {data}"
    print("PASS")


def test_analyze_basic():
    print("TEST: /analyze with sample contract... ", end="")
    payload = {
        "contract_title": "Test MSA",
        "vendor_name": "Acme Software Inc.",
        "contract_text": SAMPLE_CONTRACT,
        "contract_value": "$36,000/year",
    }
    r = httpx.post(f"{BASE_URL}/analyze", json=payload, timeout=120)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    data = r.json()
    assert data["success"] is True
    analysis = data["analysis"]

    # Check required fields
    for field in ["overall_risk_score", "executive_summary", "dimension_scores", "red_flags", "clauses"]:
        assert field in analysis, f"Missing field: {field}"

    # Check score range
    score = analysis["overall_risk_score"]
    assert 0 <= score <= 100, f"Risk score {score} out of range"

    # Check dimension scores
    ds = analysis["dimension_scores"]
    for key in ["liability", "renewal_risk", "ip_ownership", "termination", "payment_exposure"]:
        assert key in ds, f"Missing dimension: {key}"
        assert 0 <= ds[key] <= 100, f"Dimension {key}={ds[key]} out of range"

    # Check at least one clause was found
    assert len(analysis["clauses"]) > 0, "No clauses extracted"

    # Validate each clause
    valid_levels = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
    for clause in analysis["clauses"]:
        assert clause["risk_level"] in valid_levels, f"Invalid risk_level: {clause['risk_level']}"
        assert 0 <= clause["risk_score"] <= 100, f"Clause score out of range: {clause['risk_score']}"
        assert len(clause.get("extracted_text", "")) > 0, "Empty extracted_text"
        assert len(clause.get("negotiation_recommendation", "")) > 0, "Empty negotiation_recommendation"

    print(f"PASS (score={score}, {len(analysis['clauses'])} clauses, {data['tokens_used']} tokens)")
    return analysis


def test_empty_contract():
    print("TEST: /analyze with empty contract text... ", end="")
    payload = {
        "contract_title": "Empty Test",
        "vendor_name": "Nobody",
        "contract_text": "   ",
    }
    r = httpx.post(f"{BASE_URL}/analyze", json=payload, timeout=30)
    assert r.status_code == 400, f"Expected 400 for empty text, got {r.status_code}"
    print("PASS")


def test_missing_fields():
    print("TEST: /analyze with missing required fields... ", end="")
    r = httpx.post(f"{BASE_URL}/analyze", json={"contract_title": "No text"}, timeout=10)
    assert r.status_code == 422, f"Expected 422 for missing fields, got {r.status_code}"
    print("PASS")


if __name__ == "__main__":
    print(f"Running ContractScan AI service tests against {BASE_URL}\n")
    try:
        test_health()
        analysis = test_analyze_basic()
        test_empty_contract()
        test_missing_fields()
        print("\n✅ All tests passed.")
        print("\nSample analysis summary:")
        print(f"  Overall Risk Score:  {analysis['overall_risk_score']}")
        print(f"  Executive Summary:   {analysis['executive_summary'][:100]}...")
        print(f"  Red Flags:           {len(analysis['red_flags'])}")
        print(f"  Clauses Found:       {len(analysis['clauses'])}")
        clause_types = [c['clause_type'] for c in analysis['clauses']]
        print(f"  Clause Types:        {', '.join(clause_types)}")
    except httpx.ConnectError:
        print("\n❌ Cannot connect to service. Is it running?")
        print("   Start with: uvicorn main:app --reload --port 8001")
        sys.exit(1)
    except AssertionError as e:
        print(f"\n❌ FAIL: {e}")
        sys.exit(1)
