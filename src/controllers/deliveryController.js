import Delivery from '../models/Delivery.js'
import Customer from '../models/Customer.js'

// GET /api/deliveries?date=2026-03-01
export const getDeliveries = async (req, res) => {
  const { date, customerId } = req.query
  const filter = { tenantId: req.user.tenantId }

  if (date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    filter.date = { $gte: start, $lte: end }
  }

  if (customerId) filter.customerId = customerId

  const deliveries = await Delivery.find(filter)
    .populate('customerId', 'name mobile area rate')
    .sort({ createdAt: -1 })

  res.json({ success: true, count: deliveries.length, deliveries })
}

// POST /api/deliveries
export const createDelivery = async (req, res) => {
  const { customerId, delivered, returned, deliveryPerson, date } = req.body

  // Get customer to calculate revenue
  const customer = await Customer.findOne({
    _id: customerId,
    tenantId: req.user.tenantId
  })

  if (!customer)
    return res.status(404).json({ success: false, message: 'Customer not found' })

  const netCans = delivered - returned
  const revenue = delivered * customer.rate

  // Create delivery record
  const delivery = await Delivery.create({
    tenantId: req.user.tenantId,
    customerId,
    delivered,
    returned,
    netCans,
    revenue,
    deliveryPerson: deliveryPerson || 'Suresh',
    date: date ? new Date(date) : new Date(),
  })

  // Update customer cansOut and balance
 await Customer.findByIdAndUpdate(customerId, {
  $inc: {
    cansOut: netDelivered,
    balance: revenueAdded,
    cansReturned: +returned || 0
  }
})

  // Populate customer info before sending response
  await delivery.populate('customerId', 'name mobile area rate')

  res.status(201).json({ success: true, delivery })
}

// DELETE /api/deliveries/:id
export const deleteDelivery = async (req, res) => {
  const delivery = await Delivery.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })

  if (!delivery)
    return res.status(404).json({ success: false, message: 'Delivery not found' })

  // Reverse the customer update
  await Customer.findByIdAndUpdate(delivery.customerId, {
    $inc: {
      cansOut: -delivery.netCans,
      balance: -delivery.revenue
    }
  })

  await delivery.deleteOne()
  res.json({ success: true, message: 'Delivery deleted and customer updated' })
}

// GET /api/deliveries/summary?date=2026-03-01
export const getDailySummary = async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0]
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const deliveries = await Delivery.find({
    tenantId: req.user.tenantId,
    date: { $gte: start, $lte: end }
  })

  const summary = {
    totalDeliveries: deliveries.length,
    totalDelivered: deliveries.reduce((s, d) => s + d.delivered, 0),
    totalReturned: deliveries.reduce((s, d) => s + d.returned, 0),
    totalRevenue: deliveries.reduce((s, d) => s + d.revenue, 0),
    netCans: deliveries.reduce((s, d) => s + d.netCans, 0),
  }

  res.json({ success: true, summary, deliveries })
}