import { Router, type Response } from 'express'
import Joi from 'joi'
import bcrypt from 'bcrypt'
import { queryOne } from '../db.js'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import { PIN_REGEX } from '../lib/pin.js'
import { enforceRateLimit, RateLimitError } from '../lib/rateLimit.js'

const router = Router()

// Same cost as account passwords (services/registration.ts).
const PIN_BCRYPT_COST = 12

// Brute-force protection shared by /me/pin/verify and the current_pin branch
// of /me/pin — a kid mashing the pad gets 10 tries per minute, Postgres-backed
// so the cap holds across serverless instances.
const PIN_VERIFY_LIMIT = { max: 10, windowSeconds: 60 }
const PIN_VERIFY_ROUTE = 'pin:verify'

const pinMessages = {
  'string.pattern.base': 'PIN harus 4 digit angka.',
  'string.empty': 'PIN wajib diisi.',
  'any.required': 'PIN wajib diisi.',
}

const setPinSchema = Joi.object({
  pin: Joi.string().pattern(PIN_REGEX).required().messages(pinMessages),
  current_pin: Joi.string().pattern(PIN_REGEX).messages({
    'string.pattern.base': 'PIN lama harus 4 digit angka.',
    'string.empty': 'PIN lama wajib diisi.',
  }),
  password: Joi.string().messages({
    'string.empty': 'Kata sandi wajib diisi.',
  }),
})

const verifyPinSchema = Joi.object({
  pin: Joi.string().pattern(PIN_REGEX).required().messages(pinMessages),
})

function sendRateLimited(res: Response, err: RateLimitError): void {
  res.set('Retry-After', String(err.retryAfterSeconds))
  res.status(429).json({
    success: false,
    error: 'Terlalu banyak percobaan. Coba lagi nanti.',
  })
}

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  age: Joi.number().min(6).max(16),
  phone: Joi.string(),
  email: Joi.string().email(),
  // Parent notification opt-out (P2.5): streak-at-risk reminders + the
  // Monday weekly digest. Toggled from the Me page.
  notify_email: Joi.boolean(),
})

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await queryOne<{
      id: string
      email: string
      phone: string
      name: string
      age: number
      role: string
      age_group_id: string | null
      plan: string
      notify_email: boolean
      pinSet: boolean
    }>(
      `
        SELECT id, email, phone, name, age, role, age_group_id, plan, notify_email,
               (parent_pin_hash IS NOT NULL) AS "pinSet"
        FROM users
        WHERE id = $1
      `,
      [req.user.id],
    )

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }

    res.json({ success: true, data: user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.put('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    let ageGroupId: string | null | undefined
    if (typeof value.age === 'number') {
      const ageGroup = await queryOne<{ id: string }>(
        `
          SELECT id
          FROM age_groups
          WHERE min_age <= $1 AND max_age >= $1
          LIMIT 1
        `,
        [value.age],
      )
      ageGroupId = ageGroup?.id ?? null
    }

    const user = await queryOne<{
      id: string
      email: string
      phone: string
      name: string
      age: number
      role: string
      age_group_id: string | null
      notify_email: boolean
    }>(
      `
        UPDATE users
        SET
          name = COALESCE($2, name),
          age = COALESCE($3, age),
          phone = COALESCE($4, phone),
          email = COALESCE($5, email),
          age_group_id = COALESCE($6, age_group_id),
          notify_email = COALESCE($7, notify_email),
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, phone, name, age, role, age_group_id, notify_email
      `,
      [
        req.user.id,
        value.name ?? null,
        value.age ?? null,
        value.phone ?? null,
        value.email ?? null,
        ageGroupId ?? null,
        value.notify_email ?? null,
      ],
    )

    res.json({ success: true, data: user })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Set or change the parent PIN.
//
// First-time set needs only { pin }. Changing an existing PIN requires
// proof: { current_pin } (rate-limited like /pin/verify so the change
// endpoint is not a brute-force side door) OR the account { password }
// ("Lupa PIN" — password accounts only). v1 limitation: Google-only
// accounts have no password, so a forgotten PIN cannot be reset in-app.
router.post('/me/pin', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = setPinSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const user = await queryOne<{
      parent_pin_hash: string | null
      password_hash: string | null
    }>(
      `SELECT parent_pin_hash, password_hash FROM users WHERE id = $1`,
      [req.user.id],
    )

    if (!user) {
      res.status(404).json({ success: false, error: 'Akun tidak ditemukan.' })
      return
    }

    if (user.parent_pin_hash) {
      if (typeof value.current_pin === 'string') {
        await enforceRateLimit(`user:${req.user.id}`, PIN_VERIFY_ROUTE, PIN_VERIFY_LIMIT)
        const validPin = await bcrypt.compare(value.current_pin, user.parent_pin_hash)
        if (!validPin) {
          res.status(400).json({ success: false, error: 'PIN salah.' })
          return
        }
      } else if (typeof value.password === 'string') {
        // Same brute-force cap as the current_pin branch — an authenticated
        // session must not be able to grind the account password here.
        await enforceRateLimit(`user:${req.user.id}`, PIN_VERIFY_ROUTE, PIN_VERIFY_LIMIT)
        if (!user.password_hash) {
          res.status(400).json({
            success: false,
            error: 'Akun Google: keluar lalu masuk lagi, kemudian atur PIN baru.',
          })
          return
        }
        const validPassword = await bcrypt.compare(value.password, user.password_hash)
        if (!validPassword) {
          res.status(400).json({ success: false, error: 'Kata sandi salah.' })
          return
        }
      } else {
        res.status(400).json({
          success: false,
          error: 'Masukkan PIN lama atau kata sandi untuk mengganti PIN.',
        })
        return
      }
    }

    const pinHash = await bcrypt.hash(value.pin, PIN_BCRYPT_COST)
    await queryOne(
      `UPDATE users SET parent_pin_hash = $2, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [req.user.id, pinHash],
    )

    res.json({ success: true, data: { pinSet: true } })
  } catch (error) {
    if (error instanceof RateLimitError) {
      sendRateLimited(res, error)
      return
    }
    console.error('Set PIN error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// Verify the parent PIN (unlocks the parent area for the browser session).
router.post('/me/pin/verify', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = verifyPinSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    await enforceRateLimit(`user:${req.user.id}`, PIN_VERIFY_ROUTE, PIN_VERIFY_LIMIT)

    const user = await queryOne<{ parent_pin_hash: string | null }>(
      `SELECT parent_pin_hash FROM users WHERE id = $1`,
      [req.user.id],
    )

    if (!user) {
      res.status(404).json({ success: false, error: 'Akun tidak ditemukan.' })
      return
    }

    if (!user.parent_pin_hash) {
      res.status(400).json({ success: false, error: 'PIN belum diatur.' })
      return
    }

    const valid = await bcrypt.compare(value.pin, user.parent_pin_hash)
    if (!valid) {
      res.status(400).json({ success: false, error: 'PIN salah.' })
      return
    }

    res.json({ success: true, data: { ok: true } })
  } catch (error) {
    if (error instanceof RateLimitError) {
      sendRateLimited(res, error)
      return
    }
    console.error('Verify PIN error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
