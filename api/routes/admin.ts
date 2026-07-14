import { Router, type Response } from 'express'
import Joi from 'joi'
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.js'
import { createVideo, deleteVideo, listAdminVideos, updateVideo } from '../services/videos.js'
import {
  createAdminAgeGroup,
  createAdminSubject,
  deleteAdminAgeGroup,
  deleteAdminSubject,
  deleteAdminUser,
  getAdminDashboardStats,
  listAdminAgeGroups,
  listAdminSubjects,
  listAdminUsers,
  updateAdminAgeGroup,
  updateAdminSubject,
  updateAdminUserRole,
} from '../services/admin.js'
import { getAnalyticsOverview } from '../services/analytics.js'
import { fetchYouTubeMetadata } from '../services/youtubeImport.js'
import {
  YouTubeMisconfiguredError,
  YouTubeUnavailableError,
  listChannelVideosCached,
  paginateChannelItems,
} from '../services/youtubeChannel.js'
import { SHORT_VIDEO_MAX_SECONDS } from '../lib/youtube.js'
import { bulkImportAsDrafts } from '../services/youtubeChannelImport.js'
import { deleteVideosByIds, findStaleVideos } from '../services/staleVideos.js'
import { autocompleteDrafts } from '../services/draftPrefill.js'
import { RateLimitError, enforceRateLimit } from '../lib/rateLimit.js'

const router = Router()

// Admin error copy: service validation errors are plain Errors with human
// messages meant for the editor UI — echo those. Postgres/system errors carry
// a `code`; echoing them leaks constraint/SQL internals, so those (and
// non-Error throws) get the route's fallback copy instead.
function adminErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && !('code' in error)) return error.message
  return fallback
}

const badgeRangeSchema = Joi.object({
  minCorrect: Joi.number().integer().min(0).required(),
  maxCorrect: Joi.number().integer().min(0).allow(null).required(),
  badgeCount: Joi.number().integer().min(0).required(),
})

// Drafts (isPublished=false) may omit subjectId, ageGroupId, numberOfQuestions,
// and badgeRanges. The DB CHECK constraint and `normalizeVideoInput` enforce
// that the publish transition has all four populated.
const videoSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  slug: Joi.string().allow('', null),
  youtubeUrl: Joi.string().uri().required(),
  thumbnailUrl: Joi.string().uri().allow('', null),
  subjectId: Joi.string()
    .uuid()
    .when('isPublished', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.string().uuid().allow(null, '').optional(),
    }),
  ageGroupId: Joi.string()
    .uuid()
    .when('isPublished', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.string().uuid().allow(null, '').optional(),
    }),
  numberOfQuestions: Joi.number()
    .integer()
    .when('isPublished', {
      is: true,
      then: Joi.number().integer().min(1).required(),
      otherwise: Joi.number().integer().min(1).allow(null).optional(),
    }),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  description: Joi.string().allow('', null),
  isPublished: Joi.boolean().required(),
  isFeatured: Joi.boolean().required(),
  sortOrder: Joi.number().integer().min(0).required(),
  // Real YouTube upload time. Only consumed on CREATE; UPDATE ignores it so
  // admin edits never disturb the column. Bulk channel import threads this
  // through automatically; the single-video form may forward it from the
  // /youtube-import metadata response.
  publishedAt: Joi.string().isoDate().allow(null).optional(),
  badgeRanges: Joi.array()
    .items(badgeRangeSchema)
    .when('isPublished', {
      is: true,
      then: Joi.array().items(badgeRangeSchema).min(1).required(),
      otherwise: Joi.array().items(badgeRangeSchema).optional().default([]),
    }),
})

router.use(authenticateToken, requireAdmin)

router.get('/videos', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const videos = await listAdminVideos()
    res.json({ success: true, data: { videos } })
  } catch (error) {
    console.error('Admin list videos error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/videos', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = videoSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const video = await createVideo(value)
    res.status(201).json({ success: true, data: video })
  } catch (error: unknown) {
    console.error('Admin create video error:', error)
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'Unable to create video'),
    })
  }
})

router.put('/videos/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = videoSchema.validate(req.body)

    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const video = await updateVideo(req.params.id, value)

    if (!video) {
      res.status(404).json({ success: false, error: 'Video not found' })
      return
    }

    res.json({ success: true, data: video })
  } catch (error: unknown) {
    console.error('Admin update video error:', error)
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'Unable to update video'),
    })
  }
})

router.delete('/videos/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await deleteVideo(req.params.id)

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Video not found' })
      return
    }

    res.json({ success: true, message: 'Video deleted' })
  } catch (error) {
    console.error('Admin delete video error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// ===== Analytics =====

router.get('/analytics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = typeof req.query.days === 'string' ? Number(req.query.days) : 7
    const overview = await getAnalyticsOverview({ days: Number.isFinite(days) ? days : 7 })
    res.json({ success: true, data: overview })
  } catch (error) {
    console.error('Admin analytics error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// ===== YouTube import =====

router.get('/youtube-import', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const url = typeof req.query.url === 'string' ? req.query.url : ''
    if (!url) {
      res.status(400).json({ success: false, error: 'url query param required' })
      return
    }
    const metadata = await fetchYouTubeMetadata(url)
    res.json({ success: true, data: metadata })
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'YouTube import failed'),
    })
  }
})

// ===== YouTube channel listing =====

router.get(
  '/youtube-channel/videos',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      try {
        await enforceRateLimit(req.user.id, 'youtube-channel-videos', {
          max: 30,
          windowSeconds: 60,
        })
      } catch (error) {
        if (error instanceof RateLimitError) {
          res.set('Retry-After', String(error.retryAfterSeconds))
          res.status(429).json({
            success: false,
            error: 'rate_limited',
            retryAfter: error.retryAfterSeconds,
          })
          return
        }
        throw error
      }

      const pageRaw = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1
      const page = Number.isFinite(pageRaw) ? Math.max(1, pageRaw) : 1

      const { items: allItems } = await listChannelVideosCached()
      // Hide already-imported and Shorts so the picker only shows new
      // long-form candidates. Filter and sort run here (not just inside the
      // cached fetch) so existing cache entries written before these rules
      // were added still display correctly without waiting for TTL.
      // durationSeconds === 0 / undefined is a pass-through sentinel for
      // older cached payloads that don't have the field — better to risk
      // showing one Short than to hide every video on a cache miss quirk.
      const visibleItems = allItems
        .filter((item) => {
          if (item.alreadyImported) return false
          const dur = item.durationSeconds ?? 0
          return dur === 0 || dur > SHORT_VIDEO_MAX_SECONDS
        })
        .sort((a, b) => {
          const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
          const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
          return tb - ta
        })
      const result = paginateChannelItems(visibleItems, page)

      res.json({ success: true, data: result })
    } catch (error: unknown) {
      if (error instanceof YouTubeUnavailableError) {
        res.status(502).json({ success: false, error: 'youtube_unavailable' })
        return
      }
      if (error instanceof YouTubeMisconfiguredError) {
        res.status(500).json({ success: false, error: 'server_misconfigured' })
        return
      }
      console.error('Channel listing error:', error)
      res.status(500).json({ success: false, error: 'internal_error' })
    }
  },
)

const channelImportSchema = Joi.object({
  youtubeVideoIds: Joi.array()
    .items(Joi.string().min(8).max(20).regex(/^[A-Za-z0-9_-]+$/))
    .min(1)
    .max(50)
    .required(),
})

router.post(
  '/youtube-channel/import',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = channelImportSchema.validate(req.body)
      if (error) {
        res.status(400).json({ success: false, error: error.details[0].message })
        return
      }

      const results = await bulkImportAsDrafts(value.youtubeVideoIds)
      res.json({ success: true, data: { results } })
    } catch (error: unknown) {
      console.error('Bulk import error:', error)
      res.status(500).json({ success: false, error: 'internal_error' })
    }
  },
)

// ===== Stale videos (source gone from YouTube) =====

// Scan the catalog for videos whose YouTube source is deleted/private. Hits the
// YouTube API, so it's rate-limited per admin to keep quota bounded.
router.get('/videos/stale', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    try {
      await enforceRateLimit(req.user.id, 'videos-stale-scan', { max: 10, windowSeconds: 60 })
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.set('Retry-After', String(error.retryAfterSeconds))
        res.status(429).json({
          success: false,
          error: 'rate_limited',
          retryAfter: error.retryAfterSeconds,
        })
        return
      }
      throw error
    }

    const videos = await findStaleVideos()
    res.json({ success: true, data: { videos } })
  } catch (error: unknown) {
    if (error instanceof YouTubeMisconfiguredError) {
      res.status(500).json({ success: false, error: 'server_misconfigured' })
      return
    }
    console.error('Stale video scan error:', error)
    res.status(502).json({ success: false, error: 'youtube_unavailable' })
  }
})

const staleDeleteSchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).max(500).required(),
})

// Hard-delete the given video ids (cascades to scores + earned badges).
router.post('/videos/stale/delete', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = staleDeleteSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const deleted = await deleteVideosByIds(value.ids)
    res.json({ success: true, data: { deleted } })
  } catch (error) {
    console.error('Stale video delete error:', error)
    res.status(500).json({ success: false, error: 'internal_error' })
  }
})

// Apply title-pattern prefill rules to every incomplete draft (fills subject /
// age group / question count / badge template; never auto-publishes).
router.post('/videos/autocomplete-drafts', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await autocompleteDrafts()
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Autocomplete drafts error:', error)
    res.status(500).json({ success: false, error: 'internal_error' })
  }
})

// ===== Stats =====

router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await getAdminDashboardStats()
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// ===== Subjects =====

const subjectSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  slug: Joi.string().min(1).max(60).required(),
  colorHex: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
  description: Joi.string().allow('', null),
  defaultBadgeRanges: Joi.array()
    .items(
      Joi.object({
        minCorrect: Joi.number().integer().min(0).required(),
        maxCorrect: Joi.number().integer().min(0).allow(null).required(),
        badgeCount: Joi.number().integer().min(0).required(),
      }),
    )
    .default([]),
})

router.get('/subjects', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subjects = await listAdminSubjects()
    res.json({ success: true, data: { subjects } })
  } catch (error) {
    console.error('Admin list subjects error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/subjects', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = subjectSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const subject = await createAdminSubject(value)
    res.status(201).json({ success: true, data: { subject } })
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'Unable to create subject'),
    })
  }
})

router.put('/subjects/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = subjectSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const subject = await updateAdminSubject(req.params.id, value)
    if (!subject) {
      res.status(404).json({ success: false, error: 'Subject not found' })
      return
    }
    res.json({ success: true, data: { subject } })
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'Unable to update subject'),
    })
  }
})

router.delete('/subjects/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await deleteAdminSubject(req.params.id)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Subject not found' })
      return
    }
    res.json({ success: true, message: 'Subject deleted' })
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'Unable to delete subject'),
    })
  }
})

// ===== Age groups =====

const ageGroupSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  minAge: Joi.number().integer().min(0).max(120).required(),
  maxAge: Joi.number().integer().min(0).max(120).required(),
  description: Joi.string().allow('', null),
})

router.get('/age-groups', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ageGroups = await listAdminAgeGroups()
    res.json({ success: true, data: { ageGroups } })
  } catch (error) {
    console.error('Admin list age groups error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.post('/age-groups', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = ageGroupSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const ageGroup = await createAdminAgeGroup(value)
    res.status(201).json({ success: true, data: { ageGroup } })
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'Unable to create age group'),
    })
  }
})

router.put('/age-groups/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = ageGroupSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const ageGroup = await updateAdminAgeGroup(req.params.id, value)
    if (!ageGroup) {
      res.status(404).json({ success: false, error: 'Age group not found' })
      return
    }
    res.json({ success: true, data: { ageGroup } })
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'Unable to update age group'),
    })
  }
})

router.delete('/age-groups/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await deleteAdminAgeGroup(req.params.id)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Age group not found' })
      return
    }
    res.json({ success: true, message: 'Age group deleted' })
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'Unable to delete age group'),
    })
  }
})

// ===== Users =====

const userRoleSchema = Joi.object({
  role: Joi.string().valid('student', 'teacher', 'parent', 'admin').required(),
})

router.get('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const users = await listAdminUsers(search)
    res.json({ success: true, data: { users } })
  } catch (error) {
    console.error('Admin list users error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.put('/users/:id/role', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = userRoleSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }
    const user = await updateAdminUserRole(req.params.id, value.role)
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }
    res.json({ success: true, data: { user } })
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'Unable to update user role'),
    })
  }
})

router.delete('/users/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.params.id === req.user.id) {
      res.status(400).json({ success: false, error: 'Cannot delete your own account' })
      return
    }
    const deleted = await deleteAdminUser(req.params.id)
    if (!deleted) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }
    res.json({ success: true, message: 'User deleted' })
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: adminErrorMessage(error, 'Unable to delete user'),
    })
  }
})

export default router
