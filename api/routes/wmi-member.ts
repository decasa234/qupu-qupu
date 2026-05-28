import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import { getWmiDrillQuestion, getWmiPaperDetail, listWmiPapers } from '../services/wmi/papers.js'
import { submitWmiAttempt } from '../services/wmi/attempts.js'
import {
  completeWmiExamSession,
  getWmiExamSession,
  startWmiExamSession,
} from '../services/wmi/sessions.js'
import { getNextConceptQuestion, submitConceptVote } from '../services/wmi/concepts/engine.js'

const router = Router()

const childQuerySchema = Joi.object({
  childId: Joi.string().uuid().required(),
}).unknown(true)

const papersQuerySchema = childQuerySchema.keys({
  grade: Joi.number().integer().min(0).max(3).required(),
})

const drillQuerySchema = papersQuerySchema

const startSessionSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  paper_id: Joi.string().uuid().required(),
})

const attemptSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  mode: Joi.string().valid('drill', 'exam', 'concept').required(),
  question_id: Joi.string()
    .uuid()
    .when('mode', {
      is: 'concept',
      then: Joi.forbidden(),
      otherwise: Joi.required(),
    }),
  concept_instance_id: Joi.string()
    .uuid()
    .when('mode', {
      is: 'concept',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  session_id: Joi.string()
    .uuid()
    .when('mode', {
      is: 'exam',
      then: Joi.required(),
      otherwise: Joi.allow(null).optional(),
    }),
  selected_answer: Joi.string().trim().min(1).max(200).required(),
  time_taken_ms: Joi.number().integer().min(0).allow(null).optional(),
  revealed_id_translation: Joi.boolean().optional(),
  looked_up_terms: Joi.array().items(Joi.string().pattern(/^[a-z0-9-]+$/)).default([]),
})

function sendError(res: Response, error: unknown, fallback: string): void {
  const message = error instanceof Error ? error.message : fallback
  const status =
    message === 'Child not found' ||
    message === 'Paper not found' ||
    message === 'Question not found'
      ? 404
      : message === 'Sesi ujian ini milik profil anak yang lain'
        ? 403
        : 400
  res.status(status).json({ success: false, error: message })
}

router.get('/papers', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = papersQuerySchema.validate(req.query)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const papers = await listWmiPapers(req.user.id, value.childId, value.grade)
    res.json({ success: true, data: { papers } })
  } catch (error) {
    console.error('WMI papers error:', error)
    sendError(res, error, 'Unable to load papers')
  }
})

router.get('/papers/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childQuerySchema.validate(req.query)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const paper = await getWmiPaperDetail(req.user.id, value.childId, req.params.id)
    res.json({ success: true, data: paper })
  } catch (error) {
    console.error('WMI paper detail error:', error)
    sendError(res, error, 'Unable to load paper')
  }
})

router.get('/drill/next', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = drillQuerySchema.validate(req.query)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const question = await getWmiDrillQuestion(req.user.id, value.childId, value.grade)
    res.json({ success: true, data: { question } })
  } catch (error) {
    console.error('WMI drill error:', error)
    sendError(res, error, 'Unable to load drill question')
  }
})

router.post('/attempts', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = attemptSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const attempt = await submitWmiAttempt(req.user.id, {
      childId: value.childId,
      questionId: value.question_id,
      conceptInstanceId: value.concept_instance_id,
      mode: value.mode,
      sessionId: value.session_id,
      selectedAnswer: value.selected_answer,
      timeTakenMs: value.time_taken_ms,
      revealedIdTranslation: value.revealed_id_translation,
      lookedUpTerms: value.looked_up_terms,
    })
    res.status(201).json({ success: true, data: attempt })
  } catch (error) {
    console.error('WMI attempt error:', error)
    sendError(res, error, 'Unable to save attempt')
  }
})

router.post('/exam/sessions', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = startSessionSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const snapshot = await startWmiExamSession(req.user.id, value.childId, value.paper_id)
    res.status(201).json({ success: true, data: snapshot })
  } catch (error) {
    console.error('WMI start session error:', error)
    sendError(res, error, 'Unable to start exam')
  }
})

router.get('/exam/sessions/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childQuerySchema.validate(req.query)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const snapshot = await getWmiExamSession(req.user.id, value.childId, req.params.id)
    res.json({ success: true, data: snapshot })
  } catch (error) {
    console.error('WMI get session error:', error)
    sendError(res, error, 'Unable to load exam')
  }
})

router.patch('/exam/sessions/:id/complete', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childQuerySchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const session = await completeWmiExamSession(req.user.id, value.childId, req.params.id)
    res.json({ success: true, data: { session } })
  } catch (error) {
    console.error('WMI complete session error:', error)
    sendError(res, error, 'Unable to complete exam')
  }
})

const voteSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  concept_instance_id: Joi.string().uuid().required(),
  vote: Joi.number().integer().valid(1, -1).required(),
})

router.get(
  '/konsep/next',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = childQuerySchema.validate(req.query)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const question = await getNextConceptQuestion(req.user.id, value.childId)
      res.json({ success: true, data: { question } })
    } catch (error) {
      console.error('WMI konsep next error:', error)
      sendError(res, error, 'Unable to load concept question')
    }
  },
)

router.post(
  '/konsep/vote',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = voteSchema.validate(req.body)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const counts = await submitConceptVote(
        req.user.id,
        value.childId,
        value.concept_instance_id,
        value.vote,
      )
      res.json({ success: true, data: counts })
    } catch (error) {
      console.error('WMI konsep vote error:', error)
      sendError(res, error, 'Unable to save vote')
    }
  },
)

export default router
