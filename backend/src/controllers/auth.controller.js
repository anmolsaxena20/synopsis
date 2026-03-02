const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const prisma = require('../lib/prisma')

function generateToken(user) {
  return jwt.sign(
    {
      id:        user.id,
      email:     user.email,
      role:      user.role,
      companyId: user.companyId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

async function register(req, res) {
  try {
    const { companyName, domain, name, email, password } = req.body
    const normalizedEmail = email?.trim().toLowerCase()

    if (!companyName || !name || !normalizedEmail || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      if (existingUser.passwordHash !== 'INVITED') {
        return res.status(400).json({ error: 'Email already in use' })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const activated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          passwordHash,
          role: 'MEMBER',
        },
      })

      const token = generateToken(activated)

      return res.status(200).json({
        token,
        user: {
          id:        activated.id,
          name:      activated.name,
          email:     activated.email,
          role:      activated.role,
          companyId: activated.companyId,
        },
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name:   companyName,
          domain: domain || null,
          plan:   'STARTER',
        },
      })

      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role:      'ADMIN',
          companyId: company.id,
        },
      })

      return { company, user }
    })

    const token = generateToken(result.user)

    res.status(201).json({
      token,
      user: {
        id:        result.user.id,
        name:      result.user.name,
        email:     result.user.email,
        role:      result.user.role,
        companyId: result.user.companyId,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (user.passwordHash === 'INVITED') {
      return res.status(403).json({ error: 'Invitation pending. Complete sign up first.' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user)

    res.status(200).json({
      token,
      user: {
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        companyId: user.companyId,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { register, login }
