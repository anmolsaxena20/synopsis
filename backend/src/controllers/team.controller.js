const bcrypt = require('bcryptjs')
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

async function updateProfile(req, res) {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required' })

    await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
    })

    res.json({ message: 'Profile updated' })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) return res.status(400).json({ error: 'Current password is incorrect' })

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    })

    res.json({ message: 'Password changed' })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Failed to change password' })
  }
}

module.exports = { getMembers, inviteMember, updateProfile, changePassword }
