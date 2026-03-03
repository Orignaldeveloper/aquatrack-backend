import express from 'express'
import { login, registerTenant, addUser, getMe } from '../controllers/authController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.post('/login', login)
router.post('/register-tenant', protect, authorize('superadmin'), registerTenant)
router.post('/add-user', protect, authorize('admin', 'superadmin'), addUser)
router.get('/me', protect, getMe)

export default router