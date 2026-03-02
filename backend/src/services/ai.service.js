const axios  = require('axios')
const prisma = require('../lib/prisma')

function normalizeRiskLevel(value) {
  const raw = String(value || '').trim().toUpperCase()
  if (raw.includes('CRIT')) return 'CRITICAL'
  if (raw.includes('HIGH')) return 'HIGH'
  if (raw.includes('MED')) return 'MEDIUM'
  if (raw.includes('LOW')) return 'LOW'
  return 'LOW'
}

async function analyzeContract(contractId, s3Key) {
  try {
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/analyze`,
      {
        contract_id: contractId,
        s3_key:  s3Key,
      },
      { timeout: 120000 }
    )

    const {
      overall_risk_score,
      executive_summary,
      red_flags,
      clauses,
    } = response.data

    const safeClauses = Array.isArray(clauses) ? clauses : []

    await prisma.$transaction([
      prisma.contract.update({
        where: { id: contractId },
        data: {
          overallRiskScore: overall_risk_score,
          executiveSummary: executive_summary,
          redFlags:  Array.isArray(red_flags) ? red_flags : [],
          status:   'DONE',
          processedAt: new Date(),
        },
      }),
      ...safeClauses.map(clause =>
        prisma.clause.create({
          data: {
            contractId,
            clauseType: clause.clause_type || 'General Clause',
            extractedText: clause.extracted_text || '',
            riskLevel: normalizeRiskLevel(clause.risk_level),
            explanation: clause.explanation || 'No explanation provided by AI.',
            negotiationRecommendation: clause.negotiation_recommendation || 'No recommendation provided.',
          },
        })
      ),
    ])

    console.log(`Contract ${contractId} analyzed successfully`)
  } catch (err) {
    console.error(`Analysis failed for contract ${contractId}:`, err.message)

    await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'ERROR',
        errorMessage: err.message,
      },
    })
  }
}

module.exports = { analyzeContract }
