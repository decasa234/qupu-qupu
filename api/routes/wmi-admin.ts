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

export default router
