import mongoose from 'mongoose'

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  plan: { type: String, enum: ['basic', 'pro'], default: 'basic' },
  active: { type: Boolean, default: true },
  subscriptionExpiry: { type: Date, default: () => new Date(+new Date() + 30*24*60*60*1000) },
}, { timestamps: true })

export default mongoose.model('Tenant', tenantSchema)