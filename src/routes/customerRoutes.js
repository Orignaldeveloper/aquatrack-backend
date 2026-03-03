import express from 'express'
import {
  getCustomers, getCustomer, createCustomer,
  updateCustomer, deleteCustomer, getAreas
} from '../controllers/customerController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// All routes require login
router.use(protect)

router.get('/areas', getAreas)
router.get('/', getCustomers)
router.get('/:id', getCustomer)
router.post('/', authorize('admin', 'superadmin'), createCustomer)
router.put('/:id', authorize('admin', 'superadmin'), updateCustomer)
router.delete('/:id', authorize('admin', 'superadmin'), deleteCustomer)

export default router