import express from 'express'
import {
  generateMonthlyBilling,
  getInvoices,
  markAsPaid,
  getBillingSummary
} from '../controllers/billingController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get('/summary', getBillingSummary)
router.get('/', getInvoices)
router.post('/generate', authorize('admin', 'superadmin'), generateMonthlyBilling)
router.put('/:id/pay', authorize('admin', 'superadmin'), markAsPaid)

export default router
