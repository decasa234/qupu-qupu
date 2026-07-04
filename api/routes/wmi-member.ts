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
import {
  gradeConceptAnswer,
  commitKonsepSession,
  SESSION_SIZE,
  FOCUS_SESSION_SIZE,
} from '../services/wmi/concepts/session.js'
import { SUBJECTS } from '../services/wmi/concepts/curriculum.js'
import {
  startClaireRound,
  answerClaireRound,
  getClaireHistory,
  hasClaireAccess,
} from '../services/wmi/claire.js'
import { sendPublicError, sendValidationError } from '../lib/publicError.js'

const router = Router()

// WMI Claire is a niche, temporary mode gated to a single parent account.
// Fail closed for everyone else — invisible on the client, 403 here.
function claireGuard(req: AuthRequest, res: Response): boolean {
  if (!hasClaireAccess(req.user.email)) {
    res.status(403).json({ success: false, error: 'Fitur ini tidak tersedia.' })
    return false
  }
  return true
}

const claireAnswerSchema = Joi.object({
  childId: Joi.string().uuid().required(),
  roundId: Joi.string().uuid().required(),
  index: Joi.number().integer().min(0).max(50).required(),
  selected: Joi.string().trim().min(1).max(200).required(),
})

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

// Error responses go through the shared allowlist in api/lib/publicError.ts:
// known sentinels keep their historical status (404/403/400) and get
// Indonesian copy; anything unrecognized becomes a generic Indonesian 400.

router.get('/papers', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = papersQuerySchema.validate(req.query)
    if (error) {
      sendValidationError(res, error)
      return
    }
    const papers = await listWmiPapers(req.user.id, value.childId, value.grade)
    res.json({ success: true, data: { papers } })
  } catch (error) {
    console.error('WMI papers error:', error)
    sendPublicError(res, error)
  }
})

router.get('/papers/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childQuerySchema.validate(req.query)
    if (error) {
      sendValidationError(res, error)
      return
    }
    const paper = await getWmiPaperDetail(req.user.id, value.childId, req.params.id)
    res.json({ success: true, data: paper })
  } catch (error) {
    console.error('WMI paper detail error:', error)
    sendPublicError(res, error)
  }
})

router.post('/attempts', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = attemptSchema.validate(req.body)
    if (error) {
      sendValidationError(res, error)
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
    sendPublicError(res, error)
  }
})

router.post('/exam/sessions', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = startSessionSchema.validate(req.body)
    if (error) {
      sendValidationError(res, error)
      return
    }
    const snapshot = await startWmiExamSession(req.user.id, value.childId, value.paper_id)
    res.status(201).json({ success: true, data: snapshot })
  } catch (error) {
    console.error('WMI start session error:', error)
    sendPublicError(res, error)
  }
})

router.get('/exam/sessions/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childQuerySchema.validate(req.query)
    if (error) {
      sendValidationError(res, error)
      return
    }
    const snapshot = await getWmiExamSession(req.user.id, value.childId, req.params.id)
    res.json({ success: true, data: snapshot })
  } catch (error) {
    console.error('WMI get session error:', error)
    sendPublicError(res, error)
  }
})

router.patch('/exam/sessions/:id/complete', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = childQuerySchema.validate(req.body)
    if (error) {
      sendValidationError(res, error)
      return
    }
    const session = await completeWmiExamSession(req.user.id, value.childId, req.params.id)
    res.json({ success: true, data: { session } })
  } catch (error) {
    console.error('WMI complete session error:', error)
    sendPublicError(res, error)
  }
})

const konsepNextQuerySchema = Joi.object({
  childId: Joi.string().uuid().required(),
  grade: Joi.number().integer().min(0).max(3).required(),
  concept: Joi.string().pattern(/^[a-z0-9-]+$/).optional(),
}).unknown(true)

const konsepProgressQuerySchema = Joi.object({
  childId: Joi.string().uuid().required(),
  grade: Joi.number().integer().min(0).max(3).required(),
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
        sendValidationError(res, error)
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
      sendPublicError(res, error)
    }
  },
)

router.get(
  '/konsep/progress',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = konsepProgressQuerySchema.validate(req.query)
      if (error) {
        sendValidationError(res, error)
        return
      }
      const progress = await getConceptProgress(req.user.id, value.childId, value.grade)
      res.json({ success: true, data: progress })
    } catch (error) {
      console.error('WMI konsep progress error:', error)
      sendPublicError(res, error)
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
        sendValidationError(res, error)
        return
      }
      const garden = await getGarden(req.user.id, value.childId, value.grade)
      res.json({ success: true, data: garden })
    } catch (error) {
      console.error('WMI garden error:', error)
      sendPublicError(res, error)
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
        sendValidationError(res, error)
        return
      }
      const out = await startChapterTest(req.user.id, value.childId, value.subject_key)
      res.json({ success: true, data: out })
    } catch (error) {
      console.error('WMI chapter-test start error:', error)
      sendPublicError(res, error)
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
        sendValidationError(res, error)
        return
      }
      const out = await submitChapterTest(req.user.id, value.childId, value.subject_key, value.answers)
      res.status(201).json({ success: true, data: out })
    } catch (error) {
      console.error('WMI chapter-test submit error:', error)
      sendPublicError(res, error)
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
        sendValidationError(res, error)
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
      sendPublicError(res, error)
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
  // Client-generated when the session STARTS; survives in the resume
  // snapshot so a retried commit replays with the SAME id (idempotency key).
  session_id: Joi.string().uuid().required(),
  // Exactly FOCUS_SESSION_SIZE (focused node session) or SESSION_SIZE (full
  // chapter session) answers — mirrors src/lib/konsepPlan.ts.
  answers: Joi.array()
    .min(FOCUS_SESSION_SIZE)
    .max(SESSION_SIZE)
    .custom((value: unknown[], helpers) =>
      value.length === FOCUS_SESSION_SIZE || value.length === SESSION_SIZE
        ? value
        : helpers.error('array.length', { limit: SESSION_SIZE }),
    )
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
        sendValidationError(res, error)
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
      sendPublicError(res, error)
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
        sendValidationError(res, error)
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
        value.session_id,
        answers,
      )
      res.status(201).json({ success: true, data: out })
    } catch (error) {
      console.error('WMI konsep commit error:', error)
      sendPublicError(res, error)
    }
  },
)

// ── WMI Claire (isolated warmup drill, single-account) ─────────────────────
router.post(
  '/claire/start',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!claireGuard(req, res)) return
      const { error, value } = childQuerySchema.validate(req.body)
      if (error) {
        sendValidationError(res, error)
        return
      }
      const round = await startClaireRound(req.user.id, value.childId)
      res.status(201).json({ success: true, data: round })
    } catch (error) {
      console.error('WMI claire start error:', error)
      sendPublicError(res, error)
    }
  },
)

router.post(
  '/claire/answer',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!claireGuard(req, res)) return
      const { error, value } = claireAnswerSchema.validate(req.body)
      if (error) {
        sendValidationError(res, error)
        return
      }
      const result = await answerClaireRound(
        req.user.id,
        value.childId,
        value.roundId,
        value.index,
        value.selected,
      )
      res.json({ success: true, data: { result } })
    } catch (error) {
      console.error('WMI claire answer error:', error)
      sendPublicError(res, error)
    }
  },
)

router.get(
  '/claire/history',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!claireGuard(req, res)) return
      const { error, value } = childQuerySchema.validate(req.query)
      if (error) {
        sendValidationError(res, error)
        return
      }
      const rounds = await getClaireHistory(req.user.id, value.childId)
      res.json({ success: true, data: { rounds } })
    } catch (error) {
      console.error('WMI claire history error:', error)
      sendPublicError(res, error)
    }
  },
)

export default router
