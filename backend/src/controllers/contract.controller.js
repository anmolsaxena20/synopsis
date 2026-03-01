const prisma     = require('../lib/prisma')
const storageService = require('../services/storage.service')
const aiService  = require('../services/ai.service')

async function getPresignedUrl(req, res) {
  try {
    const { fileName } = req.query

    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' })
    }

    const uploadData = await storageService.getUploadSignature(fileName)
    res.json(uploadData)
  } catch (err) {
    console.error('Presign error:', err)
    res.status(500).json({ error: 'Failed to generate upload signature' })
  }
}

async function createContract(req, res) {
  try {
    const { fileName, s3Key } = req.body
    const companyId = req.user.companyId

    if (!fileName || !s3Key) {
      return res.status(400).json({ error: 'fileName and s3Key are required' })
    }

    const contract = await prisma.contract.create({
      data: {
        fileName,
        s3Key,
        status: 'PROCESSING',
        companyId,
      },
    })

    res.status(202).json({ id: contract.id, status: contract.status })

    aiService.analyzeContract(contract.id, s3Key)
  } catch (err) {
    console.error('Create contract error:', err)
    res.status(500).json({ error: 'Failed to create contract' })
  }
}

async function listContracts(req, res) {
  try {
    const contracts = await prisma.contract.findMany({
      where:   { companyId: req.user.companyId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        clauses: {
          select: { riskLevel: true },
        },
      },
    })
    res.json(contracts)
  } catch (err) {
    console.error('List contracts error:', err)
    res.status(500).json({ error: 'Failed to fetch contracts' })
  }
}

async function getContract(req, res) {
  try {
    const contract = await prisma.contract.findFirst({
      where: {
        id:        req.params.id,
        companyId: req.user.companyId,
      },
      include: { clauses: true },
    })

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' })
    }

    res.json(contract)
  } catch (err) {
    console.error('Get contract error:', err)
    res.status(500).json({ error: 'Failed to fetch contract' })
  }
}

async function deleteContract(req, res) {
  try {
    const contract = await prisma.contract.findFirst({
      where: {
        id:   req.params.id,
        companyId: req.user.companyId,
      },
    })

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' })
    }

    await prisma.clause.deleteMany({
      where: { contractId: req.params.id },
    })

    await prisma.contract.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Contract deleted successfully' })
  } catch (err) {
    console.error('Delete contract error:', err)
    res.status(500).json({ error: 'Failed to delete contract' })
  }
}

module.exports = {
  getPresignedUrl,
  createContract,
  listContracts,
  getContract,
  deleteContract,
}