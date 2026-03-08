import express from 'express'
import {
  login, registerTenant, addUser, getMe,
  getDeliveryPersons, updateDeliveryPerson, deleteDeliveryPerson,
  getTenants, toggleTenant, updateTenant
} from '../controllers/authController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.post('/login', login)
router.post('/register-tenant', protect, authorize('superadmin'), registerTenant)
router.post('/add-user', protect, authorize('admin', 'superadmin'), addUser)
router.get('/me', protect, getMe)
router.get('/delivery-persons', protect, authorize('admin', 'superadmin'), getDeliveryPersons)
router.put('/delivery-persons/:id', protect, authorize('admin', 'superadmin'), updateDeliveryPerson)
router.delete('/delivery-persons/:id', protect, authorize('admin', 'superadmin'), deleteDeliveryPerson)
router.get('/tenants', protect, authorize('superadmin'), getTenants)
router.put('/tenants/:id/toggle', protect, authorize('superadmin'), toggleTenant)
router.put('/tenants/:id', protect, authorize('superadmin'), updateTenant)

export default router