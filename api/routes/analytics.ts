import { Router, type Response } from 'express'
import supabase from '../db.js'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'

const router = Router()

/**
 * Get User Analytics Summary
 * GET /api/analytics/summary
 */
router.get('/summary', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id

    // Get total quizzes taken
    const { count: totalQuizzes, error: countError } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) throw countError

    // Get average score
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('score_percentage')
      .eq('user_id', userId)

    if (scoresError) throw scoresError

    const totalScore = scores.reduce((sum, s) => sum + Number(s.score_percentage), 0)
    const averageScore = scores.length > 0 ? totalScore / scores.length : 0

    // Get recent activity
    const { data: recent, error: recentError } = await supabase
      .from('scores')
      .select('*, contents(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (recentError) throw recentError

    res.json({
      success: true,
      data: {
        totalQuizzes,
        averageScore: Math.round(averageScore * 100) / 100,
        recentActivity: recent
      }
    })
  } catch (err: any) {
    console.error('Get analytics error:', err)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
