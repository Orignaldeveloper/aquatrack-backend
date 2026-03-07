import mongoose from 'mongoose'

const invoiceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String },
  customerMobile: { type: String },
  customerAddress: { type: String },
  invoiceNo: { type: String },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalCansDelivered: { type: Number, default: 0 },
  totalCansReturned: { type: Number, default: 0 },
  ratePerCan: { type: Number, required: true },
  subtotal: { type: Number, default: 0 },
  previousBalance: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  paid: { type: Boolean, default: false },
  paidDate: { type: Date },
}, { timestamps: true })

invoiceSchema.index({ tenantId: 1, month: 1, year: 1 })
invoiceSchema.index({ tenantId: 1, customerId: 1 })

export default mongoose.model('Invoice', invoiceSchema)
