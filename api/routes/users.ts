import { Router, type Response } from 'express'
import Joi from 'joi'
import { queryOne } from '../db.js'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'

const router = Router()

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
    }>(
      `
        SELECT id, email, phone, name, age, role, age_group_id, plan, notify_email
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

export default router
