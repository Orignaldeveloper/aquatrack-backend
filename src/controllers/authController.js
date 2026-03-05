import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Tenant from '../models/Tenant.js'

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// @POST /api/auth/register-tenant  (superadmin creates new tenant + admin user)
export const registerTenant = async (req, res) => {
  const { tenantName, tenantEmail, tenantPhone, adminName, adminEmail, adminPassword, plan } = req.body

  // Create tenant
  const tenant = await Tenant.create({
    name: tenantName,
    email: tenantEmail,
    phone: tenantPhone,
    plan: plan || 'basic'
  })

  // Create admin user for tenant
  const user = await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    tenantId: tenant._id
  })

  res.status(201).json({
    success: true,
    message: 'Tenant created successfully',
    tenant,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  })
}

// @POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Please provide email and password' })

  const user = await User.findOne({ email }).populate('tenantId')

  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' })

  if (!user.active)
    return res.status(401).json({ success: false, message: 'Account is deactivated' })

  // Check tenant is active (skip for superadmin)
  if (user.role !== 'superadmin' && user.tenantId && !user.tenantId.active)
    return res.status(401).json({ success: false, message: 'Your subscription is inactive. Contact support.' })

  const token = generateToken(user._id)

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?._id || null,
      tenantName: user.tenantId?.name || null,
    }
  })
}

// @POST /api/auth/add-user  (admin adds delivery person)
export const addUser = async (req, res) => {
  try {
    const { name, email, password, role, mobile, area } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' })

    const existing = await User.findOne({ email })
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already exists' })

    const user = await User.create({
      name, email, password,
      role: role || 'delivery',
      tenantId: req.user.tenantId,
      mobile: mobile || '',
      area: area || ''
    })

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        area: user.area,
        active: user.active
      }
    })
  } catch (err) {
    console.error('addUser error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}
// @GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('tenantId').select('-password')
  res.json({ success: true, user })
}
// GET /api/auth/delivery-persons
export const getDeliveryPersons = async (req, res) => {
  try {
    const persons = await User.find({
      tenantId: req.user.tenantId,
      role: 'delivery'
    }).select('-password')
    res.json({ success: true, count: persons.length, persons })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/auth/delivery-persons/:id
export const updateDeliveryPerson = async (req, res) => {
  try {
    const { name, mobile, area, active } = req.body
    const person = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId, role: 'delivery' },
      { name, mobile, area, active },
      { new: true }
    ).select('-password')
    if (!person)
      return res.status(404).json({ success: false, message: 'Person not found' })
    res.json({ success: true, person })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/auth/delivery-persons/:id
export const deleteDeliveryPerson = async (req, res) => {
  try {
    const person = await User.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      role: 'delivery'
    })
    if (!person)
      return res.status(404).json({ success: false, message: 'Person not found' })
    res.json({ success: true, message: 'Delivery person deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}