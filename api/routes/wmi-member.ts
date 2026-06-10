import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import { getWmiPaperDetail, listWmiPapers } from '../services/wmi/papers.js'
import { submitWmiAttempt } from '../services/wmi/attempts.js'
import {
  completeWmiExamSession,
  getWmiExamSession,
  startWmiExamSession,
} from '../services/wmi/sessions.js'
import { getNextConceptQuestion, submitConceptVote } from '../services/wmi/concepts/engine.js'
import { getConceptProgress } from '../services/wmi/concepts/progress.js'
import { getGarden } from '../services/wmi/concepts/garden.js'
import { startChapterTest, submitChapterTest } from '../services/wmi/concepts/chapterTest.js'
import { gradeConceptAnswer, commitKonsepSession, SESSION_SIZE } from '../services/wmi/concepts/session.js'
import { SUBJECTS } from '../services/wmi/concepts/curriculum.js'

const router = Router()

const childQuerySchema = Joi.object({
  childId: Joi.string().uuid().required(),
}).unknown(true)

const papersQuerySchema = childQuerySchema.keys({
  grade: Joi.number().integer().min(0).max(3).required(),
})

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

const konsepNextQuerySchema = Joi.object({
  childId: Joi.string().uuid().required(),
  grade: Joi.number().integer().min(0).max(3).required(),
  concept: Joi.string().pattern(/^[a-z0-9-]+$/).optional(),
}).unknown(true)

const voteSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  concept_instance_id: Joi.string().uuid().required(),
  vote: Joi.number().integer().valid(1, -1).required(),
})

const WMI_SUBJECT_KEYS = SUBJECTS.map((s) => s.subjectKey)

const chapterTestStartSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  subject_key: Joi.string().valid(...WMI_SUBJECT_KEYS).required(),
})
const chapterTestSubmitSchema = chapterTestStartSchema.keys({
  answers: Joi.array().items(Joi.object({
    concept_instance_id: Joi.string().uuid().required(),
    selected_answer: Joi.string().trim().min(1).max(200).required(),
  })).min(1).max(30).required(),
})

router.get(
  '/konsep/next',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = konsepNextQuerySchema.validate(req.query)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const question = await getNextConceptQuestion(
        req.user.id,
        value.childId,
        value.grade,
        value.concept,
      )
      res.json({ success: true, data: { question } })
    } catch (error) {
      console.error('WMI konsep next error:', error)
      sendError(res, error, 'Unable to load concept question')
    }
  },
)

router.get(
  '/konsep/progress',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = childQuerySchema.validate(req.query)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const progress = await getConceptProgress(req.user.id, value.childId)
      res.json({ success: true, data: progress })
    } catch (error) {
      console.error('WMI konsep progress error:', error)
      sendError(res, error, 'Unable to load concept progress')
    }
  },
)

router.get(
  '/garden',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = papersQuerySchema.validate(req.query)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const garden = await getGarden(req.user.id, value.childId, value.grade)
      res.json({ success: true, data: garden })
    } catch (error) {
      console.error('WMI garden error:', error)
      sendError(res, error, 'Unable to load garden')
    }
  },
)

router.post(
  '/chapter-test/start',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = chapterTestStartSchema.validate(req.body)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const out = await startChapterTest(req.user.id, value.childId, value.subject_key)
      res.json({ success: true, data: out })
    } catch (error) {
      console.error('WMI chapter-test start error:', error)
      sendError(res, error, 'Unable to start test')
    }
  },
)

router.post(
  '/chapter-test/submit',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = chapterTestSubmitSchema.validate(req.body)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const out = await submitChapterTest(req.user.id, value.childId, value.subject_key, value.answers)
      res.status(201).json({ success: true, data: out })
    } catch (error) {
      console.error('WMI chapter-test submit error:', error)
      sendError(res, error, 'Unable to submit test')
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

const konsepGradeSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  concept_instance_id: Joi.string().uuid().required(),
  selected_answer: Joi.string().trim().min(1).max(200).required(),
})

const konsepCommitSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  subject_key: Joi.string().valid(...WMI_SUBJECT_KEYS).required(),
  answers: Joi.array()
    .length(SESSION_SIZE)
    .items(
      Joi.object({
        concept_instance_id: Joi.string().uuid().required(),
        selected_answer: Joi.string().trim().min(1).max(200).required(),
      }),
    )
    .required(),
})

router.post(
  '/konsep/grade',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = konsepGradeSchema.validate(req.body)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const out = await gradeConceptAnswer(
        req.user.id,
        value.childId,
        value.concept_instance_id,
        value.selected_answer,
      )
      res.json({ success: true, data: out })
    } catch (error) {
      console.error('WMI konsep grade error:', error)
      sendError(res, error, 'Unable to grade')
    }
  },
)

router.post(
  '/konsep/commit',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = konsepCommitSchema.validate(req.body)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }
      const answers = value.answers.map(
        (a: { concept_instance_id: string; selected_answer: string }) => ({
          conceptInstanceId: a.concept_instance_id,
          selectedAnswer: a.selected_answer,
        }),
      )
      const out = await commitKonsepSession(
        req.user.id,
        value.childId,
        value.subject_key,
        answers,
      )
      res.status(201).json({ success: true, data: out })
    } catch (error) {
      console.error('WMI konsep commit error:', error)
      sendError(res, error, 'Unable to commit session')
    }
  },
)

export default router
