import { Router, type Request, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.js'
import { listConceptsForPreview, sampleConcept } from '../services/wmi/concepts/preview.js'
import { ALL_SLUGS } from '../services/wmi/concepts/registry.js'
import {
  getConceptReview,
  listConceptReviewStatuses,
  listWmiRefinedSlugs,
  upsertConceptReview,
} from '../services/wmi/concepts/reviews.js'
import {
  getPaperReview,
  listAdminPaperQuestions,
  listPapersForAdmin,
  upsertPaperReview,
} from '../services/wmi/paperReviews.js'
import {
  ISSUE_PARTS,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  createIssue,
  getOpenIssueCounts,
  listIssues,
  updateIssue,
  type IssueFilter,
} from '../services/wmi/reviewIssues.js'

const VALID_SLUGS = new Set<string>(ALL_SLUGS)

const router = Router()

// Concept proofreading is admin-only — same gate as the rest of /api/admin.
router.use(authenticateToken, requireAdmin)

router.get('/concepts', async (_req: Request, res: Response): Promise<void> => {
  let statuses: Record<string, string> = {}
  let refined = new Set<string>()
  try {
    statuses = await listConceptReviewStatuses()
    refined = await listWmiRefinedSlugs()
  } catch (e) {
    // Reviews table may not be migrated yet — degrade to all-pending so the
    // proofreading page still loads.
    console.error('WMI review statuses unavailable:', e)
  }
  const concepts = listConceptsForPreview().map((c) => ({
    ...c,
    status: statuses[c.slug] ?? 'pending',
    wmi_refined: refined.has(c.slug),
  }))
  res.json({ success: true, data: { concepts } })
})

const reviewSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'needs_changes').required(),
  notes: Joi.string().allow('').max(5000).default(''),
})

router.get(
  '/concepts/:slug/review',
  async (req: Request, res: Response): Promise<void> => {
    const slug = req.params.slug
    if (!VALID_SLUGS.has(slug)) {
      res.status(404).json({ success: false, error: 'Concept not found' })
      return
    }
    try {
      const review = await getConceptReview(slug)
      res.json({
        success: true,
        data: {
          review:
            review ?? {
              concept_slug: slug,
              status: 'pending',
              notes: '',
              reviewed_by: null,
              updated_at: null,
            },
        },
      })
    } catch (e) {
      console.error('WMI concept review load error:', e)
      res.status(500).json({ success: false, error: 'Unable to load review' })
    }
  },
)

router.put(
  '/concepts/:slug/review',
  async (req: AuthRequest, res: Response): Promise<void> => {
    const slug = req.params.slug
    if (!VALID_SLUGS.has(slug)) {
      res.status(404).json({ success: false, error: 'Concept not found' })
      return
    }
    const { error, value } = reviewSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    try {
      const review = await upsertConceptReview(
        slug,
        value.status,
        value.notes,
        req.user?.email ?? null,
      )
      res.json({ success: true, data: { review } })
    } catch (e) {
      console.error('WMI concept review save error:', e)
      res.status(500).json({ success: false, error: 'Unable to save review' })
    }
  },
)

const samplesSchema = Joi.object({
  count: Joi.number().integer().min(1).max(24).default(6),
  seed: Joi.number().integer().min(0).max(1_000_000_000).optional(),
})

router.get('/concepts/:slug/samples', (req: Request, res: Response): void => {
  const { error, value } = samplesSchema.validate(req.query)
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message })
    return
  }
  try {
    const baseSeed = value.seed ?? Math.floor(Math.random() * 1_000_000)
    const samples = sampleConcept(req.params.slug, value.count, baseSeed)
    res.json({ success: true, data: { slug: req.params.slug, baseSeed, samples } })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unable to sample concept'
    res.status(message === 'Concept not found' ? 404 : 400).json({ success: false, error: message })
  }
})

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

router.get('/papers', async (_req: Request, res: Response): Promise<void> => {
  try {
    const papers = await listPapersForAdmin()
    res.json({ success: true, data: { papers } })
  } catch (e) {
    console.error('WMI admin papers error:', e)
    res.status(500).json({ success: false, error: 'Unable to load papers' })
  }
})

router.get('/papers/:id/questions', async (req: Request, res: Response): Promise<void> => {
  if (!UUID_RE.test(req.params.id)) {
    res.status(404).json({ success: false, error: 'Paper not found' })
    return
  }
  try {
    const questions = await listAdminPaperQuestions(req.params.id)
    if (questions.length === 0) {
      res.status(404).json({ success: false, error: 'Paper not found' })
      return
    }
    res.json({ success: true, data: { questions } })
  } catch (e) {
    console.error('WMI admin paper questions error:', e)
    res.status(500).json({ success: false, error: 'Unable to load questions' })
  }
})

router.get('/papers/:id/review', async (req: Request, res: Response): Promise<void> => {
  if (!UUID_RE.test(req.params.id)) {
    res.status(404).json({ success: false, error: 'Paper not found' })
    return
  }
  try {
    const review = await getPaperReview(req.params.id)
    res.json({
      success: true,
      data: {
        review:
          review ?? {
            paper_id: req.params.id,
            status: 'pending',
            notes: '',
            reviewed_by: null,
            updated_at: null,
          },
      },
    })
  } catch (e) {
    console.error('WMI admin paper review load error:', e)
    res.status(500).json({ success: false, error: 'Unable to load review' })
  }
})

router.put('/papers/:id/review', async (req: AuthRequest, res: Response): Promise<void> => {
  if (!UUID_RE.test(req.params.id)) {
    res.status(404).json({ success: false, error: 'Paper not found' })
    return
  }
  const { error, value } = reviewSchema.validate(req.body)
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message })
    return
  }
  try {
    const review = await upsertPaperReview(
      req.params.id,
      value.status,
      value.notes,
      req.user?.email ?? null,
    )
    res.json({ success: true, data: { review } })
  } catch (e) {
    console.error('WMI admin paper review save error:', e)
    res.status(500).json({ success: false, error: 'Unable to save review' })
  }
})

// --- Review issues (granular, stateful, per-part) ---

const issueCreateSchema = Joi.object({
  target_type: Joi.string().valid('paper', 'paper_question', 'concept').required(),
  paper_id: Joi.string().guid({ version: 'uuidv4' }).optional(),
  question_id: Joi.string().guid({ version: 'uuidv4' }).optional(),
  concept_slug: Joi.string().max(120).optional(),
  part: Joi.string().valid(...ISSUE_PARTS).required(),
  severity: Joi.string().valid(...ISSUE_SEVERITIES).default('warning'),
  title: Joi.string().min(1).max(300).required(),
  detail: Joi.string().allow('').max(8000).default(''),
  ai_actionable: Joi.boolean().default(true),
})

const issuePatchSchema = Joi.object({
  status: Joi.string().valid(...ISSUE_STATUSES),
  fix_note: Joi.string().allow('').max(8000),
  severity: Joi.string().valid(...ISSUE_SEVERITIES),
  ai_actionable: Joi.boolean(),
  title: Joi.string().min(1).max(300),
  detail: Joi.string().allow('').max(8000),
}).min(1)

const issueQuerySchema = Joi.object({
  status: Joi.string().valid(...ISSUE_STATUSES),
  ai_actionable: Joi.boolean(),
  target_type: Joi.string().valid('paper', 'paper_question', 'concept'),
  concept_slug: Joi.string().max(120),
  paper_id: Joi.string().guid({ version: 'uuidv4' }),
  question_id: Joi.string().guid({ version: 'uuidv4' }),
  part: Joi.string().valid(...ISSUE_PARTS),
  severity: Joi.string().valid(...ISSUE_SEVERITIES),
})

router.get('/issues', async (req: Request, res: Response): Promise<void> => {
  const { error, value } = issueQuerySchema.validate(req.query)
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message })
    return
  }
  try {
    const issues = await listIssues(value as IssueFilter)
    res.json({ success: true, data: { issues } })
  } catch (e) {
    console.error('WMI issues list error:', e)
    res.status(500).json({ success: false, error: 'Unable to load issues' })
  }
})

router.get('/issues/counts', async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ success: true, data: await getOpenIssueCounts() })
  } catch (e) {
    console.error('WMI issue counts error:', e)
    res.status(500).json({ success: false, error: 'Unable to load issue counts' })
  }
})

router.post('/issues', async (req: AuthRequest, res: Response): Promise<void> => {
  const { error, value } = issueCreateSchema.validate(req.body)
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message })
    return
  }
  try {
    const issue = await createIssue(value, req.user?.email ?? null)
    res.status(201).json({ success: true, data: { issue } })
  } catch (e) {
    console.error('WMI issue create error:', e)
    res.status(500).json({ success: false, error: 'Unable to create issue' })
  }
})

router.patch('/issues/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  if (!UUID_RE.test(req.params.id)) {
    res.status(404).json({ success: false, error: 'Issue not found' })
    return
  }
  const { error, value } = issuePatchSchema.validate(req.body)
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message })
    return
  }
  try {
    const issue = await updateIssue(req.params.id, value, req.user?.email ?? null)
    if (!issue) {
      res.status(404).json({ success: false, error: 'Issue not found' })
      return
    }
    res.json({ success: true, data: { issue } })
  } catch (e) {
    console.error('WMI issue update error:', e)
    res.status(500).json({ success: false, error: 'Unable to update issue' })
  }
})

export default router
