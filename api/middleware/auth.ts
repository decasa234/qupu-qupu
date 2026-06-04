import { type Request, type Response, type NextFunction } from 'express'
import { verifyToken } from '../lib/jwt.js'

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

  try {
    const decoded = verifyToken(token)
    if (!decoded || typeof decoded === 'string') {
      res.status(403).json({ success: false, error: 'Invalid or expired token' })
      return
    }
    req.user = decoded as AuthUser
    next()
  } catch {
    res.status(403).json({ success: false, error: 'Invalid or expired token' })
  }
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
