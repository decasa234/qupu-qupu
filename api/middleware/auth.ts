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
      // 401, not 403: an invalid/expired token is an AUTHENTICATION failure.
      // The frontend interceptor force-logs-out on 401 only (P1.7); 403 is
      // reserved for authorization denials on a valid session (requireAdmin,
      // child-ownership checks) and must not wipe the session.
      res.status(401).json({ success: false, error: 'Invalid or expired token' })
      return
    }
    req.user = decoded as AuthUser
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' })
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
