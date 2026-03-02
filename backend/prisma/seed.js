const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  const company = await prisma.company.upsert({
    where: { domain: 'acmecorp.com' },
    update: {},
    create: {
      name: 'Acme Corporation',
      domain: 'acmecorp.com',
      plan: 'PRO',
    },
  })

  await prisma.user.upsert({
    where: { email: 'arpit@acmecorp.com' },
    update: {},
    create: {
      name: 'Arpit Sharma',
      email: 'arpit@acmecorp.com',
      passwordHash,
      role: 'ADMIN',
      companyId: company.id,
    },
  })

  await prisma.clause.deleteMany({})
  await prisma.contract.deleteMany({ where: { companyId: company.id } })

  const contracts = [
    {
      fileName: 'Salesforce SaaS Master Agreement',
      s3Key: 'contracts/dummy-salesforce.pdf',
      status: 'DONE',
      overallRiskScore: 78,
      executiveSummary: 'This contract presents high risk due to an aggressive auto-renewal clause with a 90-day notice window, a liability cap that heavily favors Salesforce, and IP ownership terms that grant the vendor broad rights over customer data. Legal review is strongly recommended before signing.',
      redFlags: [
        'Auto-renewal requires 90 days notice to cancel — easy to miss',
        'Liability cap is limited to 3 months of fees paid',
        'Vendor retains broad rights to anonymized customer data',
      ],
      clauses: [
        {
          clauseType: 'Auto-Renewal',
          extractedText: 'This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least ninety (90) days prior to the end of the then-current term.',
          riskLevel: 'CRITICAL',
          explanation: 'A 90-day notice window is unusually long and creates a high risk of unwanted renewal if the deadline is missed during busy procurement cycles.',
          negotiationRecommendation: 'Negotiate the notice period down to 30 days and request an email reminder from the vendor 120 days before renewal.',
        },
        {
          clauseType: 'Liability Cap',
          extractedText: 'In no event shall either party be liable for any indirect, incidental, or consequential damages. Salesforce total liability shall not exceed fees paid in the three months preceding the claim.',
          riskLevel: 'HIGH',
          explanation: 'A 3-month liability cap is well below industry standard of 12 months and leaves the buyer exposed in case of a data breach or service failure.',
          negotiationRecommendation: 'Push for a 12-month liability cap and carve out data breaches and IP infringement from the cap entirely.',
        },
        {
          clauseType: 'IP Ownership',
          extractedText: 'Customer grants Salesforce a worldwide, royalty-free license to use, reproduce, and modify Customer Data solely for the purpose of providing and improving the Services.',
          riskLevel: 'HIGH',
          explanation: 'The right to modify customer data and use it to improve services goes beyond what is necessary and could expose proprietary business data.',
          negotiationRecommendation: 'Remove the right to modify and restrict usage strictly to service delivery. Add explicit prohibition on using data to train AI models.',
        },
        {
          clauseType: 'Termination',
          extractedText: 'Salesforce may terminate this Agreement immediately upon written notice if Customer breaches any material term and fails to cure such breach within 30 days.',
          riskLevel: 'MEDIUM',
          explanation: 'While a 30-day cure period is standard, the vendor retains unilateral termination rights which could disrupt operations.',
          negotiationRecommendation: 'Request mutual termination for convenience with 60-day notice and ensure data export rights are guaranteed upon termination.',
        },
        {
          clauseType: 'Payment Terms',
          extractedText: 'All fees are due and payable within 15 days of invoice date. Late payments shall accrue interest at 1.5% per month.',
          riskLevel: 'MEDIUM',
          explanation: 'A 15-day payment window is tight for enterprise procurement cycles and the 1.5% monthly interest is aggressive.',
          negotiationRecommendation: 'Negotiate to net-30 payment terms and cap late payment interest at 0.5% per month.',
        },
        {
          clauseType: 'Governing Law',
          extractedText: 'This Agreement shall be governed by the laws of the State of California.',
          riskLevel: 'LOW',
          explanation: 'California jurisdiction is standard for US-based SaaS vendors and is generally acceptable.',
          negotiationRecommendation: 'If your company is based outside California, negotiate for your local jurisdiction or a neutral arbitration venue.',
        },
      ],
    },
    {
      fileName: 'AWS Enterprise Support Agreement',
      s3Key: 'contracts/dummy-aws.pdf',
      status: 'DONE',
      overallRiskScore: 55,
      executiveSummary: 'This AWS agreement carries medium risk. The primary concerns are around data processing terms and the unilateral right to modify service pricing. Most clauses are standard for cloud infrastructure agreements but several warrant negotiation before signing.',
      redFlags: [
        'AWS reserves the right to modify pricing with 30 days notice',
        'Data processing addendum requires separate negotiation',
        'Indemnification scope is narrower than industry standard',
      ],
      clauses: [
        {
          clauseType: 'Payment Terms',
          extractedText: 'AWS reserves the right to modify pricing for any service upon thirty (30) days written notice to the Customer.',
          riskLevel: 'HIGH',
          explanation: 'Unilateral pricing changes with only 30 days notice creates significant budget planning risk for enterprise customers.',
          negotiationRecommendation: 'Negotiate a price lock for the committed contract term with changes only applying at renewal.',
        },
        {
          clauseType: 'Data Privacy',
          extractedText: 'Customer data may be processed and stored in any AWS region globally unless Customer has purchased specific data residency guarantees.',
          riskLevel: 'HIGH',
          explanation: 'Without data residency guarantees, customer data may be stored in jurisdictions that conflict with GDPR or local data protection laws.',
          negotiationRecommendation: 'Specify data residency requirements explicitly and include this as a contractual obligation, not just a feature purchase.',
        },
        {
          clauseType: 'Indemnification',
          extractedText: 'AWS will defend Customer against third-party claims that the Services infringe any patent, copyright, or trademark, subject to the limitations set forth herein.',
          riskLevel: 'MEDIUM',
          explanation: 'The indemnification scope excludes claims arising from customer configurations, which limits protection in many real-world scenarios.',
          negotiationRecommendation: 'Expand indemnification to cover customer configurations made in good faith following AWS documentation.',
        },
        {
          clauseType: 'Termination',
          extractedText: 'Either party may terminate for convenience upon 90 days written notice.',
          riskLevel: 'LOW',
          explanation: 'Mutual termination for convenience with 90 days notice is reasonable and balanced.',
          negotiationRecommendation: 'Ensure data export and migration assistance is included during the 90-day wind-down period.',
        },
      ],
    },
    {
      fileName: 'HubSpot CRM Services NDA',
      s3Key: 'contracts/dummy-hubspot.pdf',
      status: 'DONE',
      overallRiskScore: 28,
      executiveSummary: 'This NDA and services agreement is low risk with standard terms across most clause types. The confidentiality period and non-solicitation clause are slightly aggressive but not deal-breakers. This agreement can likely be signed with minor modifications.',
      redFlags: [
        'Non-solicitation clause covers all employees not just direct contacts',
        'Confidentiality period extends 3 years post-termination',
      ],
      clauses: [
        {
          clauseType: 'Confidentiality',
          extractedText: 'Each party agrees to maintain the confidentiality of the other party Confidential Information for a period of three (3) years following termination of this Agreement.',
          riskLevel: 'MEDIUM',
          explanation: 'A 3-year post-termination confidentiality period is longer than the industry standard of 1-2 years.',
          negotiationRecommendation: 'Negotiate down to 1 year post-termination or request a carve-out for information that becomes publicly available.',
        },
        {
          clauseType: 'Non-Solicitation',
          extractedText: 'During the term and for 12 months thereafter, neither party shall solicit or hire any employee of the other party who was involved in the performance of this Agreement.',
          riskLevel: 'LOW',
          explanation: 'Standard non-solicitation terms limited to involved employees with a reasonable 12-month window.',
          negotiationRecommendation: 'Acceptable as-is. Consider adding a carve-out for employees who respond to general public job postings.',
        },
        {
          clauseType: 'Governing Law',
          extractedText: 'This Agreement shall be governed by the laws of the State of Massachusetts.',
          riskLevel: 'LOW',
          explanation: 'Massachusetts jurisdiction is standard for HubSpot agreements and is generally acceptable.',
          negotiationRecommendation: 'Acceptable as-is for most US-based companies.',
        },
      ],
    },
    {
      fileName: 'Stripe Payment Processing Agreement',
      s3Key: 'contracts/dummy-stripe.pdf',
      status: 'PROCESSING',
      overallRiskScore: null,
      executiveSummary: null,
      redFlags: [],
      clauses: [],
    },
    {
      fileName: 'Zoom Enterprise License',
      s3Key: 'contracts/dummy-zoom.pdf',
      status: 'ERROR',
      overallRiskScore: null,
      executiveSummary: null,
      redFlags: [],
      errorMessage: 'Could not extract text from scanned PDF. Please try uploading a text-based PDF.',
      clauses: [],
    },
  ]

  for (const c of contracts) {
    const { clauses, ...contractData } = c
    const contract = await prisma.contract.create({
      data: {
        ...contractData,
        companyId: company.id,
      },
    })

    for (const clause of clauses) {
      await prisma.clause.create({
        data: {
          ...clause,
          contractId: contract.id,
        },
      })
    }
  }

  console.log('Seed complete!')
  console.log('Email: arpit@acmecorp.com')
  console.log('Password: password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())