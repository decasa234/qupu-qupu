import { Router, type Response } from 'express'
import supabase from '../db.js'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import Joi from 'joi'

const router = Router()

const scoreSchema = Joi.object({
  contentId: Joi.string().required(),
  correctAnswers: Joi.number().min(0).required(),
  totalQuestions: Joi.number().min(1).required()
})

/**
 * Submit Score
 * POST /api/scores
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = scoreSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const { contentId, correctAnswers, totalQuestions } = value
    const userId = req.user.id

    const scorePercentage = (correctAnswers / totalQuestions) * 100

    const { data, error: dbError } = await supabase
      .from('scores')
      .insert({
        user_id: userId,
        content_id: contentId,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        score_percentage: scorePercentage
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    res.status(201).json({
      success: true,
      data
    })
  } catch (err: any) {
    console.error('Submit score error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * Get User Scores
 * GET /api/scores/user/:userId
 */
router.get('/user/:userId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    
    // Allow users to see only their own scores unless admin/teacher
    if (req.user.id !== userId && req.user.role === 'student') {
        res.status(403).json({ success: false, error: 'Unauthorized' })
        return
    }

    const { data, error } = await supabase
      .from('scores')
      .select('*, contents(title, code, subjects(name, color_hex))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({ success: true, data })
  } catch (err: any) {
    console.error('Get user scores error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
