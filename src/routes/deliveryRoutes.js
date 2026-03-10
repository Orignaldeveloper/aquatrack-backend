import express from 'express'
import { getDeliveries, createDelivery, deleteDelivery, getTodaySummary, updateDelivery } from '../controllers/deliveryController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get('/today-summary', getTodaySummary)
router.get('/', getDeliveries)
router.post('/', authorize('admin', 'delivery', 'superadmin'), createDelivery)
router.put('/:id', authorize('admin', 'delivery', 'superadmin'), updateDelivery)
router.delete('/:id', authorize('admin', 'superadmin'), deleteDelivery)

export default router