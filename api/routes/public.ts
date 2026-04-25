import { Router, type Request, type Response } from 'express'
import { listMeta, listPublicVideos, getPublicVideoBySlug } from '../services/videos.js'

const router = Router()

router.get('/meta', async (req: Request, res: Response): Promise<void> => {
  try {
    const [meta, featuredVideos] = await Promise.all([
      listMeta(),
      listPublicVideos({ featured: true }),
    ])

    res.json({
      success: true,
      data: {
        ...meta,
        stats: {
          featuredVideos: featuredVideos.length,
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
    const videos = await listPublicVideos({
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      subject: typeof req.query.subject === 'string' ? req.query.subject : undefined,
      featured: req.query.featured === 'true',
    })

    res.json({ success: true, data: { videos } })
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

export default router
