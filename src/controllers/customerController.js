import Customer from '../models/Customer.js'

// GET /api/customers
export const getCustomers = async (req, res) => {
  const { area, search, active } = req.query
  const filter = { tenantId: req.user.tenantId }

  if (area) filter.area = area
  if (active !== undefined) filter.active = active === 'true'
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { mobile: { $regex: search, $options: 'i' } }
  ]

  const customers = await Customer.find(filter).sort({ createdAt: -1 })
  res.json({ success: true, count: customers.length, customers })
}

// GET /api/customers/:id
export const getCustomer = async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })
  if (!customer)
    return res.status(404).json({ success: false, message: 'Customer not found' })

  res.json({ success: true, customer })
}

// POST /api/customers
export const createCustomer = async (req, res) => {
  const customer = await Customer.create({
    ...req.body,
    tenantId: req.user.tenantId
  })
  res.status(201).json({ success: true, customer })
}

// PUT /api/customers/:id
export const updateCustomer = async (req, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  )
  if (!customer)
    return res.status(404).json({ success: false, message: 'Customer not found' })

  res.json({ success: true, customer })
}

// DELETE /api/customers/:id
export const deleteCustomer = async (req, res) => {
  const customer = await Customer.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })
  if (!customer)
    return res.status(404).json({ success: false, message: 'Customer not found' })

  res.json({ success: true, message: 'Customer deleted' })
}

// GET /api/customers/areas
export const getAreas = async (req, res) => {
  const areas = await Customer.distinct('area', { tenantId: req.user.tenantId })
  res.json({ success: true, areas })
}