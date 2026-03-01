const axios  = require('axios')
const prisma = require('../lib/prisma')

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

    await prisma.$transaction([
      prisma.contract.update({
        where: { id: contractId },
        data: {
          overallRiskScore: overall_risk_score,
          executiveSummary: executive_summary,
          redFlags:  red_flags,
          status:   'DONE',
          processedAt: new Date(),
        },
      }),
      ...clauses.map(clause =>
        prisma.clause.create({
          data: {
            contractId,
            clauseType:   clause.clause_type,
            extractedText:     clause.extracted_text,
            riskLevel:       clause.risk_level,
            explanation:    clause.explanation,
            negotiationRecommendation: clause.negotiation_recommendation,
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