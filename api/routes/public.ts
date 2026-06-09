import { Router, type Request, type Response } from 'express'
import { listMeta, listPublicVideos, getPublicVideoBySlug } from '../services/videos.js'
import { getWmiPublicStats } from '../services/wmiStats.js'

const router = Router()

router.get('/meta', async (req: Request, res: Response): Promise<void> => {
  try {
    const [meta, featuredVideos] = await Promise.all([
      listMeta(),
      listPublicVideos({ featured: true }),
    ])

    const featuredCount = Array.isArray(featuredVideos)
      ? featuredVideos.length
      : featuredVideos.items.length

    res.json({
      success: true,
      data: {
        ...meta,
        stats: {
          featuredVideos: featuredCount,
        },
      },
    })
  } catch (error) {
    console.error('Public meta error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/videos', async (req: Request, res: Response): Promise<void> => {
  try {
    const pageRaw = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : NaN
    const pageSizeRaw =
      typeof req.query.pageSize === 'string' ? parseInt(req.query.pageSize, 10) : NaN
    const paginated = Number.isFinite(pageRaw) || Number.isFinite(pageSizeRaw)

    const result = await listPublicVideos({
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      subject: typeof req.query.subject === 'string' ? req.query.subject : undefined,
      featured: req.query.featured === 'true',
      ...(paginated && {
        page: Number.isFinite(pageRaw) ? pageRaw : 1,
        pageSize: Number.isFinite(pageSizeRaw) ? pageSizeRaw : 12,
      }),
    })

    if (Array.isArray(result)) {
      res.json({ success: true, data: { videos: result } })
      return
    }

    res.json({
      success: true,
      data: {
        videos: result.items,
        page: result.page,
        pageSize: result.pageSize,
        pageCount: result.pageCount,
        total: result.total,
      },
    })
  } catch (error) {
    console.error('Public videos error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/videos/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const video = await getPublicVideoBySlug(req.params.slug)

    if (!video) {
      res.status(404).json({ success: false, error: 'Video not found' })
      return
    }

    res.json({ success: true, data: video })
  } catch (error) {
    console.error('Public video detail error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/wmi-stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getWmiPublicStats()
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Public wmi-stats error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
