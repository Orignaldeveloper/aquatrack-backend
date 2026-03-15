import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import Tenant from './models/Tenant.js'

dotenv.config()

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to staging DB')

  // Clear existing data
  await User.deleteMany({})
  await Tenant.deleteMany({})

  // Create superadmin
  await User.create({
    name: 'Super Admin',
    email: 'rosubijode@gmail.com',
    password: 'Originals!777',
    role: 'superadmin',
    tenantId: null
  })

  // Create test tenant
  const tenant = await Tenant.create({
    name: 'Test Distributors',
    email: 'test@aquatrack.com',
    phone: '9999999999',
    address: 'Test Address City',
    plan: 'pro',
    active: true
  })

  // Create test admin
  await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    tenantId: tenant._id
  })

  console.log('Staging seed complete!')
  console.log('Superadmin: super@aquatrack.com / super123')
  console.log('Admin: admin@test.com / admin123')
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})