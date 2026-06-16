import { Router, type Request, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  getLessonForAdmin,
  listForAdmin,
  updateLesson,
  updateModule,
} from '../services/fundamentals/admin.js'

const router = Router()

// Admin-only — same gate as the rest of /api/admin.
router.use(authenticateToken, requireAdmin)

const slugRule = Joi.string().pattern(/^[a-z0-9-]+$/).max(80)
const statusRule = Joi.string().valid('draft', 'published')

const moduleCreateSchema = Joi.object({
  slug: slugRule.required(),
  title_en: Joi.string().min(1).max(200).required(),
  title_id: Joi.string().min(1).max(200).required(),
  summary_en: Joi.string().allow(null, '').max(500),
  summary_id: Joi.string().allow(null, '').max(500),
  sort_order: Joi.number().integer().min(0),
  status: statusRule,
})

const modulePatchSchema = Joi.object({
  title_en: Joi.string().min(1).max(200),
  title_id: Joi.string().min(1).max(200),
  summary_en: Joi.string().allow(null, '').max(500),
  summary_id: Joi.string().allow(null, '').max(500),
  sort_order: Joi.number().integer().min(0),
  status: statusRule,
}).min(1)

const lessonCreateSchema = Joi.object({
  slug: slugRule.required(),
  module_slug: slugRule.required(),
  brand: Joi.string().allow(null).max(40),
  title_en: Joi.string().min(1).max(200).required(),
  title_id: Joi.string().min(1).max(200).required(),
  summary_en: Joi.string().allow(null, '').max(500),
  summary_id: Joi.string().allow(null, '').max(500),
  est_minutes: Joi.number().integer().min(0).max(600).allow(null),
  sort_order: Joi.number().integer().min(0),
  status: statusRule,
})

const lessonPatchSchema = Joi.object({
  module_slug: slugRule,
  brand: Joi.string().allow(null).max(40),
  title_en: Joi.string().min(1).max(200),
  title_id: Joi.string().min(1).max(200),
  summary_en: Joi.string().allow(null, '').max(500),
  summary_id: Joi.string().allow(null, '').max(500),
  est_minutes: Joi.number().integer().min(0).max(600).allow(null),
  sort_order: Joi.number().integer().min(0),
  status: statusRule,
  // Real shape validation happens in the service via the zod block schema.
  blocks: Joi.array().items(Joi.object().unknown(true)),
}).min(1)

function sendError(res: Response, error: unknown, fallback: string): void {
  const message = error instanceof Error ? error.message : fallback
  const status = /not found/i.test(message)
    ? 404
    : /already exists/i.test(message)
      ? 409
      : 400
  res.status(status).json({ success: false, error: message })
}

function validate(res: Response, schema: Joi.ObjectSchema, payload: unknown): unknown | undefined {
  const { error, value } = schema.validate(payload)
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message })
    return undefined
  }
  return value
}

// ── Modules ──────────────────────────────────────────────────────────────

router.get('/modules', async (_req: Request, res: Response): Promise<void> => {
  try {
    const modules = await listForAdmin()
    res.json({ success: true, data: { modules } })
  } catch (e) {
    console.error('Fundamentals admin list error:', e)
    sendError(res, e, 'Unable to load course')
  }
})

router.post('/modules', async (req: Request, res: Response): Promise<void> => {
  const value = validate(res, moduleCreateSchema, req.body)
  if (!value) return
  try {
    await createModule(value as Parameters<typeof createModule>[0])
    res.status(201).json({ success: true })
  } catch (e) {
    sendError(res, e, 'Unable to create module')
  }
})

router.patch('/modules/:slug', async (req: Request, res: Response): Promise<void> => {
  const value = validate(res, modulePatchSchema, req.body)
  if (!value) return
  try {
    await updateModule(req.params.slug, value as Record<string, unknown>)
    res.json({ success: true })
  } catch (e) {
    sendError(res, e, 'Unable to update module')
  }
})

router.delete('/modules/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteModule(req.params.slug)
    res.json({ success: true })
  } catch (e) {
    sendError(res, e, 'Unable to delete module')
  }
})

// ── Lessons ──────────────────────────────────────────────────────────────

router.get('/lessons/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await getLessonForAdmin(req.params.slug)
    res.json({ success: true, data: { lesson } })
  } catch (e) {
    sendError(res, e, 'Unable to load lesson')
  }
})

router.post('/lessons', async (req: Request, res: Response): Promise<void> => {
  const value = validate(res, lessonCreateSchema, req.body)
  if (!value) return
  try {
    await createLesson(value as Parameters<typeof createLesson>[0])
    res.status(201).json({ success: true })
  } catch (e) {
    sendError(res, e, 'Unable to create lesson')
  }
})

router.patch('/lessons/:slug', async (req: Request, res: Response): Promise<void> => {
  const value = validate(res, lessonPatchSchema, req.body)
  if (!value) return
  try {
    await updateLesson(req.params.slug, value as Record<string, unknown>)
    res.json({ success: true })
  } catch (e) {
    sendError(res, e, 'Unable to update lesson')
  }
})

router.delete('/lessons/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteLesson(req.params.slug)
    res.json({ success: true })
  } catch (e) {
    sendError(res, e, 'Unable to delete lesson')
  }
})

export default router
