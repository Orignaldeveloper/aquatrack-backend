import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

await mongoose.connect(process.env.MONGO_URI)

await User.deleteMany({ role: 'superadmin' })

await User.create({
  name: 'Super Admin',
  email: 'super@aquatrack.com',
  password: 'super123',
  role: 'superadmin',
  tenantId: null
})

console.log('✅ Superadmin created: super@aquatrack.com / super123')
process.exit()