import { Router, type Request, type Response } from 'express'
import supabase from '../db.js'

const router = Router()

/**
 * Get All Subjects
 * GET /api/meta/subjects
 */
router.get('/subjects', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name')

    if (error) throw error

    res.json({ success: true, data })
  } catch (err: any) {
    console.error('Get subjects error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * Get All Age Groups
 * GET /api/meta/age-groups
 */
router.get('/age-groups', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('age_groups')
      .select('*')
      .order('min_age')

    if (error) throw error

    res.json({ success: true, data })
  } catch (err: any) {
    console.error('Get age groups error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
