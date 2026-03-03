import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import 'express-async-errors'
import authRoutes from './routes/authRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import deliveryRoutes from './routes/deliveryRoutes.js'
import billingRoutes from './routes/billingRoutes.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://theaquatrack.vercel.app/'
  ],
  credentials: true
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'AquaTrack API Running', version: '2.0' })
})

app.use('/api/auth', authRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/deliveries', deliveryRoutes)
app.use('/api/billing', billingRoutes)

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(err.status || 500).json({ success: false, message: err.message })
})

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB Connected')
  app.listen(process.env.PORT, () => {
    console.log('Server running on port ' + process.env.PORT)
  })
}

start()
