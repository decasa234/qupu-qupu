import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthUser {
  id: string
  email: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ success: false, error: 'Access token required' })
    return
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err || !user || typeof user === 'string') {
      res.status(403).json({ success: false, error: 'Invalid or expired token' })
      return
    }

    req.user = user as AuthUser
    next()
  })
}

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' })
    return
  }

  next()
}
