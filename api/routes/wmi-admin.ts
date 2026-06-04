import { Router, type Request, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import { listConceptsForPreview, sampleConcept } from '../services/wmi/concepts/preview.js'

const router = Router()

// Whole router is admin-only.
router.use(authenticateToken, requireAdmin)

router.get('/concepts', (_req: Request, res: Response): void => {
  res.json({ success: true, data: { concepts: listConceptsForPreview() } })
})

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
