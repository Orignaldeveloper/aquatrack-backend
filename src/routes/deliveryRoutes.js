import express from 'express'
import {
  getDeliveries,
  createDelivery,
  deleteDelivery,
  getTodaySummary
} from '../controllers/deliveryController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get('/today-summary', getTodaySummary)
router.get('/', getDeliveries)
router.post('/', authorize('admin', 'delivery', 'superadmin'), createDelivery)
router.delete('/:id', authorize('admin', 'superadmin'), deleteDelivery)

export default router