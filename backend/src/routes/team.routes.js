const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { getMembers, inviteMember } = require('../controllers/team.controller')

router.get('/members', authenticate, getMembers)
router.post('/invite', authenticate, inviteMember)

module.exports = router