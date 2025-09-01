const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { authenticateToken } = require('../middlewares/auth')
const { registerSchema, loginSchema, validateRequest } = require('../middlewares/authValidation')

router.post('/register', validateRequest(registerSchema), authController.register)
router.post('/login', validateRequest(loginSchema), authController.login)
router.post('/logout', authController.logout)
router.get('/profile', authenticateToken, authController.getProfile)

module.exports = router
