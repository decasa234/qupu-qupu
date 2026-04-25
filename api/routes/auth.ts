import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { queryOne } from '../db.js'

const router = Router()

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().min(6).max(120).optional().allow(null),
  password: Joi.string().min(8).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

function issueToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(user, process.env.JWT_SECRET || 'secret', {
    expiresIn: '15m',
  })
}

function issueRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  })
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = registerSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const existingUser = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [value.email, value.phone],
    )

    if (existingUser) {
      res.status(409).json({ success: false, error: 'Email or phone already registered' })
      return
    }

    const ageGroup =
      value.age !== undefined && value.age !== null
        ? await queryOne<{ id: string }>(
            `
              SELECT id
              FROM age_groups
              WHERE min_age <= $1 AND max_age >= $1
              ORDER BY min_age ASC
              LIMIT 1
            `,
            [value.age],
          )
        : null

    const passwordHash = await bcrypt.hash(value.password, 12)

    const newUser = await queryOne<{
      id: string
      email: string
      name: string
      role: string
      phone: string
      age: number | null
    }>(
      `
        INSERT INTO users (email, phone, name, age, age_group_id, password_hash, role)
        VALUES ($1, $2, $3, $4, $5, $6, 'parent')
        RETURNING id, email, name, role, phone, age
      `,
      [value.email, value.phone, value.name, value.age ?? null, ageGroup?.id ?? null, passwordHash],
    )

    if (!newUser) {
      throw new Error('Failed to create user')
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: newUser,
        token: issueToken(newUser),
        refreshToken: issueRefreshToken(newUser.id),
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
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
      phone: string
      age: number | null
      password_hash: string
    }>(
      `
        SELECT id, email, name, role, phone, age, password_hash
        FROM users
        WHERE email = $1
      `,
      [value.email],
    )

    if (!user) {
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

export default router
