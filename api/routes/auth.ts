import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import supabase from '../db.js'
import Joi from 'joi'

const router = Router()

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().min(6).max(16).required(),
  password: Joi.string().min(8).required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = registerSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const { email, phone, name, age, password } = value

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single()

    if (existingUser) {
      res.status(409).json({ success: false, error: 'Email or phone already registered' })
      return
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Determine age group
    const { data: ageGroup } = await supabase
      .from('age_groups')
      .select('id')
      .lte('min_age', age)
      .gte('max_age', age)
      .single()

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        phone,
        name,
        age,
        age_group_id: ageGroup?.id,
        password_hash: passwordHash,
        role: 'student'
      })
      .select('id, email, name, role')
      .single()

    if (createError) {
      throw createError
    }

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    )
    
    const refreshToken = jwt.sign(
        { id: newUser.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: newUser,
        token,
        refreshToken
      }
    })
  } catch (err: any) {
    console.error('Registration error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const { email, password } = value

    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    // Generate tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    )
    
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    )

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: userWithoutPassword
      }
    })
  } catch (err: any) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
