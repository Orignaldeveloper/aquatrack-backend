import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  area: { type: String, required: true },
  rate: { type: Number, required: true, default: 30 },
  deposit: { type: Number, default: 500 },
  balance: { type: Number, default: 0 },
  cansOut: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true })

customerSchema.index({ tenantId: 1 })
customerSchema.index({ tenantId: 1, area: 1 })

export default mongoose.model('Customer', customerSchema)