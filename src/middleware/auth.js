import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Protect routes — must be logged in
export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1]

  if (!token)
    return res.status(401).json({ success: false, message: 'Not authorized, no token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' })
  }
}

// Restrict to specific roles
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not allowed` })
  next()
}