import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: any
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' })
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}
