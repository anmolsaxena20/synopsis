const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { getMembers, inviteMember, updateProfile, changePassword } = require('../controllers/team.controller')

router.get('/members', authenticate, getMembers)
router.post('/invite', authenticate, inviteMember)
router.patch('/profile', authenticate, updateProfile)
router.patch('/password', authenticate, changePassword)

module.exports = router
