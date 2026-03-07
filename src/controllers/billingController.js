import Invoice from '../models/Invoice.js'
import Delivery from '../models/Delivery.js'
import Customer from '../models/Customer.js'

// ─── GENERATE INVOICE NUMBER ──────────────────────────────────────────────────
const generateInvoiceNo = async (tenantId, month, year) => {
  const count = await Invoice.countDocuments({ tenantId, month: +month, year: +year })
  const m = String(month).padStart(2, '0')
  const idx = String(count + 1).padStart(3, '0')
  return `INV-${year}${m}-${idx}`
}

// ─── GENERATE MONTHLY BILLING ─────────────────────────────────────────────────
// POST /api/billing/generate
export const generateMonthlyBilling = async (req, res) => {
  const { month, year } = req.body
  const tenantId = req.user.tenantId

  if (!month || !year) {
    return res.status(400).json({ success: false, message: 'Month and year are required' })
  }

  const customers = await Customer.find({ tenantId, active: true })

  if (!customers.length) {
    return res.status(404).json({ success: false, message: 'No active customers found' })
  }

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const invoices = []

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i]

    // Get all deliveries for this customer this month
    const deliveries = await Delivery.find({
      tenantId,
      customerId: customer._id,
      date: { $gte: startDate, $lte: endDate }
    })

    const totalCansDelivered = deliveries.reduce((s, d) => s + d.delivered, 0)
    const totalCansReturned = deliveries.reduce((s, d) => s + d.returned, 0)
    const subtotal = totalCansDelivered * customer.rate
    const previousBalance = customer.balance > subtotal ? customer.balance - subtotal : 0
    const totalAmount = subtotal + previousBalance

    // Check if invoice already exists for this month
    let invoice = await Invoice.findOne({
      tenantId,
      customerId: customer._id,
      month: +month,
      year: +year
    })

    if (invoice) {
      // Update existing invoice
      invoice.totalCansDelivered = totalCansDelivered
      invoice.totalCansReturned = totalCansReturned
      invoice.subtotal = subtotal
      invoice.previousBalance = previousBalance
      invoice.totalAmount = totalAmount
      invoice.balanceAmount = totalAmount - invoice.paidAmount
      invoice.ratePerCan = customer.rate
      await invoice.save()
    } else {
      // Create new invoice
      invoice = await Invoice.create({
        tenantId,
        customerId: customer._id,
        customerName: customer.name,
        customerMobile: customer.mobile,
        customerAddress: customer.address,
        invoiceNo: await generateInvoiceNo(tenantId, month, year),
        month: +month,
        year: +year,
        totalCansDelivered,
        totalCansReturned,
        ratePerCan: customer.rate,
        subtotal,
        previousBalance,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        paid: false
      })
    }

    invoices.push(invoice)
  }

  res.json({
    success: true,
    message: `Generated ${invoices.length} invoices for ${month}/${year}`,
    count: invoices.length,
    invoices
  })
}

// ─── GET ALL INVOICES ─────────────────────────────────────────────────────────
// GET /api/billing?month=3&year=2026
export const getInvoices = async (req, res) => {
  const { month, year } = req.query
  const filter = { tenantId: req.user.tenantId }

  if (month) filter.month = +month
  if (year) filter.year = +year

  const invoices = await Invoice.find(filter)
    .populate('customerId', 'name mobile area rate')
    .sort({ createdAt: -1 })

  const totalRevenue = invoices.reduce((s, i) => s + i.totalAmount, 0)
  const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0)
  const totalPending = invoices.reduce((s, i) => s + i.balanceAmount, 0)
  const paidCount = invoices.filter(i => i.paid).length

  res.json({
    success: true,
    count: invoices.length,
    totalRevenue,
    totalPaid,
    totalPending,
    paidCount,
    invoices
  })
}

// ─── MARK INVOICE AS PAID ─────────────────────────────────────────────────────
// PUT /api/billing/:id/pay
export const markAsPaid = async (req, res) => {
  const { paidAmount } = req.body

  const invoice = await Invoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId
  })

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found' })
  }

  invoice.paidAmount = paidAmount || invoice.totalAmount
  invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount
  invoice.paid = invoice.balanceAmount <= 0
  invoice.paidDate = new Date()
  await invoice.save()

  // Update customer balance
  await Customer.findByIdAndUpdate(invoice.customerId, {
    balance: invoice.balanceAmount
  })

  res.json({ success: true, invoice })
}

// ─── GET BILLING SUMMARY ──────────────────────────────────────────────────────
// GET /api/billing/summary
export const getBillingSummary = async (req, res) => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const invoices = await Invoice.find({
    tenantId: req.user.tenantId,
    month,
    year
  })

  const totalRevenue = invoices.reduce((s, i) => s + i.totalAmount, 0)
  const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0)
  const totalPending = invoices.reduce((s, i) => s + i.balanceAmount, 0)

  res.json({
    success: true,
    month,
    year,
    totalRevenue,
    totalPaid,
    totalPending,
    paidCount: invoices.filter(i => i.paid).length,
    pendingCount: invoices.filter(i => !i.paid).length
  })
}
