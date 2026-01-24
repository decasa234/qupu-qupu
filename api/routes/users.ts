import { Router, type Response } from 'express'
import supabase from '../db.js'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import Joi from 'joi'

const router = Router()

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  age: Joi.number().min(6).max(16),
  phone: Joi.string(),
  email: Joi.string().email()
})

/**
 * Get Current User Profile
 * GET /api/users/me
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id
    const { data, error } = await supabase
      .from('users')
      .select('*, age_groups(name)')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }

    const { password_hash, ...userWithoutPassword } = data
    res.json({ success: true, data: userWithoutPassword })
  } catch (err: any) {
    console.error('Get profile error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * Update Profile
 * PUT /api/users/me
 */
router.put('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const userId = req.user.id
    
    // If age is updated, update age_group_id as well
    if (value.age) {
        const { data: ageGroup } = await supabase
        .from('age_groups')
        .select('id')
        .lte('min_age', value.age)
        .gte('max_age', value.age)
        .single()
        
        if (ageGroup) {
            value.age_group_id = ageGroup.id
        }
    }

    const { data, error: updateError } = await supabase
      .from('users')
      .update(value)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    const { password_hash, ...userWithoutPassword } = data
    res.json({ success: true, data: userWithoutPassword })
  } catch (err: any) {
    console.error('Update profile error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
