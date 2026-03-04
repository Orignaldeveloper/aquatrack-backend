import mongoose from 'mongoose'

const deliverySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, default: '' },
  deliveryPersonName: { type: String, default: 'Suresh' },
  date: { type: Date, default: Date.now },
  delivered: { type: Number, required: true, min: 0 },
  returned: { type: Number, default: 0, min: 0 },
  netDelivered: { type: Number, default: 0 },
  ratePerCan: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true })

deliverySchema.index({ tenantId: 1, date: -1 })
deliverySchema.index({ tenantId: 1, customerId: 1 })

export default mongoose.model('Delivery', deliverySchema)