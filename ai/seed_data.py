"""
ContractScan AI — Seed Data Generator
AI Lead owns this file.

Generates 5 pre-analyzed demo contracts for the hackathon demo.
These are inserted into the DB via the Node backend's seed script.
Using hardcoded AI responses means zero GPT-4o latency during judging.

HOW TO USE:
  python seed_data.py
  → Prints JSON to stdout → paste into backend/prisma/seed.ts

OR call get_seed_contracts() programmatically.
"""

import json

SEED_CONTRACTS = [
    {
        "title": "SaaS Vendor Master Service Agreement",
        "vendorName": "CloudPlatform Inc.",
        "contractValue": "$48,000/year",
        "fileName": "cloudplatform-msa.pdf",
        "status": "COMPLETE",
        "analysis": {
            "overall_risk_score": 74,
            "executive_summary": (
                "This SaaS agreement contains two significant risks that require immediate attention: "
                "an uncapped auto-renewal clause with no notice period and a liability cap limited to "
                "a single month's fees. The buyer should negotiate a 60-day cancellation window and "
                "increase the liability cap to 12 months of fees before signing."
            ),
            "dimension_scores": {
                "liability": 82,
                "renewal_risk": 78,
                "ip_ownership": 55,
                "termination": 65,
                "payment_exposure": 40,
            },
            "red_flags": [
                "Auto-renewal fires with no notice window — company auto-commits $48,000/year without warning.",
                "Liability cap limited to 1 month of fees (~$4,000), far below realistic business disruption.",
                "Vendor can modify pricing with only 15 days notice — no price lock guarantee.",
            ],
            "clauses": [
                {
                    "clause_type": "Auto-Renewal",
                    "extracted_text": "...this Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least thirty (30) days prior to the end of the then-current term...",
                    "risk_level": "CRITICAL",
                    "risk_score": 85,
                    "explanation": "30 days is insufficient notice for budget approval cycles at most companies. Missing this deadline locks in $48,000 for another year with no recourse.",
                    "negotiation_recommendation": "Revise to: 'at least sixty (60) days prior notice' and add: 'Vendor shall provide written renewal reminder no later than ninety (90) days before term end.'"
                },
                {
                    "clause_type": "Liability Cap",
                    "extracted_text": "...in no event shall vendor's aggregate liability exceed the fees paid by customer in the one (1) month immediately preceding the claim...",
                    "risk_level": "HIGH",
                    "risk_score": 78,
                    "explanation": "One month of fees (~$4,000) is negligible protection against data loss or prolonged service outages. This cap is far below industry standard.",
                    "negotiation_recommendation": "Counter with: 'Vendor's aggregate liability shall not exceed the total fees paid in the twelve (12) months preceding the claim, and this cap shall apply mutually to both parties.'"
                },
                {
                    "clause_type": "IP Ownership",
                    "extracted_text": "...all data processed through the platform and any derivative analytics or insights generated therefrom shall remain the exclusive property of the Vendor...",
                    "risk_level": "HIGH",
                    "risk_score": 72,
                    "explanation": "Vendor is claiming ownership of analytics derived from your data, which could include proprietary business insights. This is non-standard and potentially damaging.",
                    "negotiation_recommendation": "Add: 'All Customer Data and any analytics or derivatives generated from Customer Data remain the sole property of Customer. Vendor receives a limited license to process Customer Data solely to deliver the Services.'"
                },
                {
                    "clause_type": "Termination for Convenience",
                    "extracted_text": "...Customer may terminate this Agreement for convenience upon ninety (90) days written notice, with no refund of prepaid fees...",
                    "risk_level": "MEDIUM",
                    "risk_score": 55,
                    "explanation": "90-day notice for convenience termination is on the high end. The no-refund clause on prepaid fees creates financial exposure if you need to exit early.",
                    "negotiation_recommendation": "Negotiate to 30-day notice and add: 'Vendor shall refund a pro-rata portion of any prepaid fees covering the period after effective termination date.'"
                },
                {
                    "clause_type": "Data Privacy",
                    "extracted_text": "...Vendor may use anonymized and aggregated Customer Data to improve the platform and for internal benchmarking and research purposes...",
                    "risk_level": "MEDIUM",
                    "risk_score": 48,
                    "explanation": "While anonymized data usage is common, 'benchmarking' is vague and could mean sharing competitive insights with other customers. Scope should be tightened.",
                    "negotiation_recommendation": "Revise to: 'Vendor may use anonymized, non-identifiable data solely for improving the specific Services provided to Customer. No data may be used for competitive benchmarking or disclosed to third parties.'"
                },
            ],
        },
    },
    {
        "title": "Non-Disclosure Agreement",
        "vendorName": "DataBridge Solutions",
        "contractValue": "N/A",
        "fileName": "databridge-nda.pdf",
        "status": "COMPLETE",
        "analysis": {
            "overall_risk_score": 28,
            "executive_summary": (
                "This is a relatively balanced mutual NDA with standard market terms. "
                "The 3-year confidentiality period and carve-outs for publicly available information "
                "are both reasonable. No significant risks identified — this agreement can proceed "
                "with minor clarification on the definition of 'Confidential Information'."
            ),
            "dimension_scores": {
                "liability": 30,
                "renewal_risk": 10,
                "ip_ownership": 35,
                "termination": 20,
                "payment_exposure": 5,
            },
            "red_flags": [
                "Definition of Confidential Information is broad — could include publicly known industry knowledge.",
            ],
            "clauses": [
                {
                    "clause_type": "Confidentiality",
                    "extracted_text": "...each party agrees to hold all Confidential Information in strict confidence and not to disclose such information to any third party without prior written consent for a period of three (3) years...",
                    "risk_level": "LOW",
                    "risk_score": 20,
                    "explanation": "3-year term and mutual obligations are standard for an NDA. No asymmetric obligations detected.",
                    "negotiation_recommendation": "Add standard carve-out: 'Excluding information that is or becomes publicly known through no breach of this Agreement, was independently developed, or was lawfully received from a third party.'"
                },
                {
                    "clause_type": "IP Ownership",
                    "extracted_text": "...nothing in this Agreement grants either party any rights to the other's intellectual property, patents, trademarks, or trade secrets...",
                    "risk_level": "LOW",
                    "risk_score": 15,
                    "explanation": "Clean IP non-grant language — no IP rights transfer. This is the correct boilerplate for an NDA.",
                    "negotiation_recommendation": "No changes needed. This clause appropriately protects both parties."
                },
            ],
        },
    },
    {
        "title": "Consulting Services Agreement",
        "vendorName": "Apex Strategy Group",
        "contractValue": "$120,000",
        "fileName": "apex-consulting-msa.pdf",
        "status": "COMPLETE",
        "analysis": {
            "overall_risk_score": 61,
            "executive_summary": (
                "This consulting agreement has two clauses requiring negotiation: unlimited indemnification "
                "exposure and a broad IP assignment that could transfer ownership of internal tools built "
                "during the engagement. The payment terms (net-15 with late fees) are aggressive. "
                "Legal review is advisable before signing given the $120,000 contract value."
            ),
            "dimension_scores": {
                "liability": 65,
                "renewal_risk": 20,
                "ip_ownership": 78,
                "termination": 45,
                "payment_exposure": 60,
            },
            "red_flags": [
                "IP assignment clause is broad enough to capture internal tools and processes built during engagement.",
                "Indemnification is one-sided — customer indemnifies consultant with no reciprocal obligation.",
                "Net-15 payment terms with 2%/month late fees are above market standard.",
            ],
            "clauses": [
                {
                    "clause_type": "IP Ownership",
                    "extracted_text": "...all work product, deliverables, and any materials created or developed by Consultant in connection with the Services shall be deemed works-for-hire and shall be the exclusive property of Client...",
                    "risk_level": "HIGH",
                    "risk_score": 75,
                    "explanation": "While client IP ownership of deliverables is standard, the broad 'materials created in connection with' language could capture consultant's pre-existing tools or methodologies used on your project.",
                    "negotiation_recommendation": "Add: 'Notwithstanding the foregoing, Consultant retains ownership of all pre-existing tools, methodologies, and frameworks (Pre-Existing IP). Consultant grants Client a perpetual, non-exclusive license to use Pre-Existing IP embedded in deliverables.'"
                },
                {
                    "clause_type": "Indemnification",
                    "extracted_text": "...Client shall indemnify, defend, and hold harmless Consultant from any claims arising out of or related to Client's use of the deliverables or any breach of this Agreement by Client...",
                    "risk_level": "HIGH",
                    "risk_score": 68,
                    "explanation": "One-sided indemnification puts all risk on the client. Consultant should share liability for errors or negligence in their own work product.",
                    "negotiation_recommendation": "Add mutual indemnification: 'Consultant shall indemnify Client against claims arising from Consultant's gross negligence, willful misconduct, or material breach of this Agreement.'"
                },
                {
                    "clause_type": "Payment Terms",
                    "extracted_text": "...invoices are due and payable within fifteen (15) days. Unpaid balances shall accrue interest at 2% per month (24% APR) from the due date...",
                    "risk_level": "MEDIUM",
                    "risk_score": 55,
                    "explanation": "Net-15 is aggressive; net-30 is standard. 24% APR on late payments is punitive and creates cash flow pressure.",
                    "negotiation_recommendation": "Negotiate to net-30 payment terms and reduce late fee to 1.5% per month (18% APR), or a flat $50/invoice late fee, whichever is lower."
                },
            ],
        },
    },
    {
        "title": "Data Processing Agreement",
        "vendorName": "AnalyticsPro Ltd.",
        "contractValue": "$24,000/year",
        "fileName": "analyticspro-dpa.pdf",
        "status": "COMPLETE",
        "analysis": {
            "overall_risk_score": 42,
            "executive_summary": (
                "This DPA is mostly GDPR-compliant but contains a sub-processor notification clause "
                "that allows changes with only 10 days notice — insufficient for legal review. "
                "Data retention terms are also vague. Overall, this is medium-risk and should be "
                "reviewed by your privacy counsel before handling EU customer data."
            ),
            "dimension_scores": {
                "liability": 40,
                "renewal_risk": 25,
                "ip_ownership": 20,
                "termination": 35,
                "payment_exposure": 30,
            },
            "red_flags": [
                "Sub-processor change notification is only 10 days — too short for legal review.",
                "Data retention schedule not specified — vendor can retain data indefinitely post-termination.",
            ],
            "clauses": [
                {
                    "clause_type": "Data Privacy",
                    "extracted_text": "...Processor may engage new Sub-processors by providing Controller with written notice at least ten (10) days prior to the new Sub-processor's engagement...",
                    "risk_level": "MEDIUM",
                    "risk_score": 55,
                    "explanation": "10-day notice for new sub-processors is below the 30-day standard. This doesn't allow adequate time for due diligence on data recipients.",
                    "negotiation_recommendation": "Revise to 30-day advance notice with an explicit right to object: 'Controller may object to new Sub-processors within 20 days of notice. If objection is raised, parties shall work in good faith to resolve the issue.'"
                },
                {
                    "clause_type": "Confidentiality",
                    "extracted_text": "...following termination of this Agreement, Processor shall, at Controller's election, delete or return all Personal Data within sixty (60) days...",
                    "risk_level": "LOW",
                    "risk_score": 25,
                    "explanation": "60-day deletion window post-termination is acceptable. The 'at Controller's election' language correctly places the decision with the data controller.",
                    "negotiation_recommendation": "Add certification requirement: 'Processor shall provide written certification of deletion within 5 business days of completing the process.'"
                },
            ],
        },
    },
    {
        "title": "SaaS Reseller & Distribution Agreement",
        "vendorName": "ChannelForce Partners",
        "contractValue": "$200,000",
        "fileName": "channelforce-reseller.pdf",
        "status": "COMPLETE",
        "analysis": {
            "overall_risk_score": 88,
            "executive_summary": (
                "This reseller agreement contains critical risks including an exclusivity clause that "
                "prevents you from working with other distributors, an aggressive clawback provision "
                "on commissions, and an uncapped liability exposure for partner misconduct. "
                "Do not sign without significant redlines — legal review is strongly recommended."
            ),
            "dimension_scores": {
                "liability": 90,
                "renewal_risk": 70,
                "ip_ownership": 60,
                "termination": 85,
                "payment_exposure": 80,
            },
            "red_flags": [
                "Exclusivity clause prohibits working with any competing reseller — locks you into one channel.",
                "Commission clawback applies for 24 months post-termination — significant financial exposure.",
                "Vendor can terminate for convenience with only 15 days notice, destroying pipeline value.",
            ],
            "clauses": [
                {
                    "clause_type": "Exclusivity",
                    "extracted_text": "...Partner agrees to exclusively represent and resell Vendor's products within the Territory and shall not, during the Term, market, sell, or distribute any Competing Products...",
                    "risk_level": "CRITICAL",
                    "risk_score": 92,
                    "explanation": "Exclusive representation eliminates your ability to diversify revenue. If vendor's product underperforms, you have no alternative product to offer customers.",
                    "negotiation_recommendation": "Remove exclusivity entirely or limit to: 'Partner shall designate Vendor as a preferred partner and use commercially reasonable efforts to promote Vendor's products, but this Agreement shall not prevent Partner from representing non-competing products.'"
                },
                {
                    "clause_type": "Payment Terms",
                    "extracted_text": "...In the event this Agreement is terminated for any reason, Vendor may clawback any commissions paid in the preceding twenty-four (24) months for customers who cancel within twelve (12) months post-termination...",
                    "risk_level": "CRITICAL",
                    "risk_score": 90,
                    "explanation": "24-month clawback creates massive retroactive financial exposure. This is punitive and non-standard — most reseller agreements have 0–6 month clawback windows.",
                    "negotiation_recommendation": "Revise to: 'Commission clawback applies only to customers who cancel within sixty (60) days of partner's termination, and only for commissions paid in the thirty (30) days preceding termination.'"
                },
                {
                    "clause_type": "Termination for Convenience",
                    "extracted_text": "...Vendor may terminate this Agreement for convenience upon fifteen (15) days written notice to Partner. Upon termination, all Partner licenses and access rights shall immediately cease...",
                    "risk_level": "CRITICAL",
                    "risk_score": 88,
                    "explanation": "15-day termination with immediate access cutoff destroys in-flight sales and leaves customers without support. This heavily favors vendor.",
                    "negotiation_recommendation": "Counter with: '90-day written notice for convenience termination. Partner retains access rights for 90 days post-notice to fulfill existing customer commitments and transition accounts.'"
                },
            ],
        },
    },
]


def get_seed_contracts():
    """Return seed contracts as Python dicts."""
    return SEED_CONTRACTS


if __name__ == "__main__":
    print(json.dumps(SEED_CONTRACTS, indent=2))
