const prisma = require('../lib/prisma')

async function getMembers(req, res) {
  try {
    const members = await prisma.user.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
    res.json(members)
  } catch (err) {
    console.error('Get members error:', err)
    res.status(500).json({ error: 'Failed to fetch members' })
  }
}

async function inviteMember(req, res) {
  try {
    const { email } = req.body

    if (!email) return res.status(400).json({ error: 'Email is required' })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ error: 'A user with this email already exists' })

    const invited = await prisma.user.create({
      data: {
        name: email.split('@')[0],
        email,
        passwordHash: 'INVITED',
        role: 'MEMBER',
        companyId: req.user.companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    res.status(201).json(invited)
  } catch (err) {
    console.error('Invite member error:', err)
    res.status(500).json({ error: 'Failed to invite member' })
  }
}

module.exports = { getMembers, inviteMember }