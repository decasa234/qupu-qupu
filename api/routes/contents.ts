import { Router, type Request, type Response } from 'express'
import supabase from '../db.js'
import { authenticateToken } from '../middleware/auth.js'
import Joi from 'joi'

const router = Router()

/**
 * Get All Contents
 * GET /api/contents
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, ageGroup, search, page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = supabase
      .from('contents')
      .select('*, subjects(name, color_hex), age_groups(name)', { count: 'exact' })

    if (subject) {
      query = query.eq('subjects.name', subject)
    }

    if (ageGroup) {
      query = query.eq('age_groups.name', ageGroup)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,code.ilike.%${search}%`)
    }

    const { data, count, error } = await query
      .range(offset, offset + Number(limit) - 1)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: {
        contents: data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil((count || 0) / Number(limit))
        }
      }
    })
  } catch (err: any) {
    console.error('Get contents error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * Get Content by ID
 * GET /api/contents/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('contents')
      .select('*, subjects(name, color_hex), age_groups(name)')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      res.status(404).json({ success: false, error: 'Content not found' })
      return
    }

    res.json({ success: true, data })
  } catch (err: any) {
    console.error('Get content error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
