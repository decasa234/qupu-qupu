import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { queryOne } from '../db.js'
import { findOrCreateGoogleUser, verifyGoogleIdToken } from '../services/oauth.js'
import {
  RegistrationError,
  initRegistration,
  resendOtp,
  verifyOtp,
} from '../services/registration.js'

const router = Router()

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

function issueToken(user: { id: string; email: string; role: string }) {
  // Admins get a 12h hard cap on the backend; the frontend enforces a 30m idle
  // timeout (auto-logout on inactivity). Parents stay logged in for 7d.
  const expiresIn = user.role === 'admin' ? '12h' : '7d'
  return jwt.sign(user, process.env.JWT_SECRET || 'secret', {
    expiresIn,
  })
}

function issueRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  })
}

function handleRegistrationError(res: Response, error: unknown): void {
  if (error instanceof RegistrationError) {
    res.status(error.status).json({ success: false, error: error.message })
    return
  }
  console.error('Registration error:', error)
  res.status(500).json({ success: false, error: 'Internal server error' })
}

router.post('/register-init', async (req: Request, res: Response): Promise<void> => {
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

router.post('/register-verify', async (req: Request, res: Response): Promise<void> => {
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

router.post('/register-resend', async (req: Request, res: Response): Promise<void> => {
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

router.post('/login', async (req: Request, res: Response): Promise<void> => {
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
      password_hash: string | null
    }>(
      `
        SELECT id, email, name, role, phone, age, password_hash
        FROM users
        WHERE email = $1 AND password_hash IS NOT NULL
      `,
      [value.email],
    )

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    if (!user.password_hash) {
      res.status(401).json({ success: false, error: 'Akun ini terdaftar via Google. Silakan masuk dengan Google.' })
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

router.post('/google', async (req: Request, res: Response): Promise<void> => {
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
