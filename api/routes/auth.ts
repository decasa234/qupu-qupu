import { Router, type Request, type Response, type NextFunction } from 'express'
import bcrypt from 'bcrypt'
import Joi from 'joi'
import { queryOne } from '../db.js'
import { findOrCreateGoogleUser, verifyGoogleIdToken } from '../services/oauth.js'
import { signToken } from '../lib/jwt.js'
import { enforceRateLimit, RateLimitError } from '../lib/rateLimit.js'
import {
  RegistrationError,
  initRegistration,
  resendOtp,
  verifyOtp,
} from '../services/registration.js'

const router = Router()

// A precomputed bcrypt hash used only to equalize timing on the
// unknown-email login path (see /login) — never matches any real password.
const DUMMY_BCRYPT_HASH = bcrypt.hashSync('qupu-timing-equalizer', 12)

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const googleSchema = Joi.object({
  idToken: Joi.string().required(),
})

const initSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().min(6).max(120).optional().allow(null),
  password: Joi.string().min(8).required(),
})

const verifySchema = Joi.object({
  pendingId: Joi.string().uuid().required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
})

const resendSchema = Joi.object({
  pendingId: Joi.string().uuid().required(),
})

// Durable, Postgres-backed rate limiting — shared across all serverless
// instances, unlike an in-memory store that resets on every cold start.
// Fails closed: a DB error blocks the request (auth needs the DB anyway).
function limitRequests(
  routeKey: string,
  max: number,
  windowSeconds: number,
  keyFn: (req: Request) => string,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await enforceRateLimit(keyFn(req), routeKey, { max, windowSeconds })
      next()
    } catch (err) {
      if (err instanceof RateLimitError) {
        res.set('Retry-After', String(err.retryAfterSeconds))
        res.status(429).json({
          success: false,
          error: 'Terlalu banyak percobaan. Coba lagi nanti.',
        })
        return
      }
      next(err)
    }
  }
}

const byIp = (req: Request): string => `ip:${req.ip ?? 'unknown'}`
const byEmail = (req: Request): string =>
  `email:${typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : 'unknown'}`
const byPendingId = (req: Request): string =>
  `pending:${typeof req.body?.pendingId === 'string' ? req.body.pendingId : 'unknown'}`

function issueToken(user: { id: string; email: string; role: string }) {
  // Admins get a 12h hard cap on the backend; the frontend enforces a 15m idle
  // timeout (auto-logout on inactivity). Parents stay logged in for 7d.
  const expiresIn = user.role === 'admin' ? '12h' : '7d'
  return signToken(user, { expiresIn })
}

function issueRefreshToken(userId: string) {
  return signToken({ id: userId }, { expiresIn: '30d' })
}

function handleRegistrationError(res: Response, error: unknown): void {
  if (error instanceof RegistrationError) {
    res.status(error.status).json({ success: false, error: error.message })
    return
  }
  console.error('Registration error:', error)
  res.status(500).json({ success: false, error: 'Internal server error' })
}

router.post('/register-init', limitRequests('auth:register-init-ip', 5, 3600, byIp), limitRequests('auth:register-init-email', 5, 86400, byEmail), async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = initSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const result = await initRegistration({
      email: value.email,
      phone: value.phone,
      name: value.name,
      age: value.age ?? null,
      password: value.password,
    })

    res.status(201).json({ success: true, data: result })
  } catch (error) {
    handleRegistrationError(res, error)
  }
})

router.post('/register-verify', limitRequests('auth:register-verify', 10, 600, byIp), async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = verifySchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const user = await verifyOtp({ pendingId: value.pendingId, otp: value.otp })

    res.status(201).json({
      success: true,
      data: {
        user,
        token: issueToken(user),
        refreshToken: issueRefreshToken(user.id),
      },
    })
  } catch (error) {
    handleRegistrationError(res, error)
  }
})

// Keyed by pendingId so the 5-attempt OTP cap (which resendOtp resets) cannot
// be renewed indefinitely: at most 5 resends per pending registration per hour.
router.post('/register-resend', limitRequests('auth:register-resend', 5, 3600, byPendingId), async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = resendSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const result = await resendOtp({ pendingId: value.pendingId })

    res.json({ success: true, data: result })
  } catch (error) {
    handleRegistrationError(res, error)
  }
})

router.post('/login', limitRequests('auth:login', 10, 300, byIp), async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const user = await queryOne<{
      id: string
      email: string
      name: string
      role: string
      phone: string | null
      age: number | null
      password_hash: string // WHERE password_hash IS NOT NULL guarantees non-null
    }>(
      `
        SELECT id, email, name, role, phone, age, password_hash
        FROM users
        WHERE email = $1 AND password_hash IS NOT NULL
      `,
      [value.email],
    )

    if (!user) {
      // Run a dummy compare so an unknown email takes the same time as a
      // wrong password — closes the user-enumeration timing side-channel.
      await bcrypt.compare(value.password, DUMMY_BCRYPT_HASH)
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    const validPassword = await bcrypt.compare(value.password, user.password_hash)

    if (!validPassword) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      age: user.age,
    }

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: issueToken(userWithoutPassword),
        refreshToken: issueRefreshToken(user.id),
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/google', limitRequests('auth:google', 20, 300, byIp), async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = googleSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    let claims
    try {
      claims = await verifyGoogleIdToken(value.idToken)
    } catch (verifyErr) {
      console.error('Google ID token verification failed:', verifyErr)
      res.status(401).json({ success: false, error: 'Invalid Google credential' })
      return
    }

    let user
    try {
      user = await findOrCreateGoogleUser(claims)
    } catch (linkErr) {
      const message = linkErr instanceof Error ? linkErr.message : 'Unable to sign in with Google'
      res.status(409).json({ success: false, error: message })
      return
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        token: issueToken(user),
        refreshToken: issueRefreshToken(user.id),
      },
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
