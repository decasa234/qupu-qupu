import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Router, type Request, type Response } from 'express'
import { listWmiGlossaryTerms } from '../services/wmi/glossary.js'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const figuresDir = path.resolve(__dirname, '../../db/seed/wmi/figures')

router.get('/glossary', async (_req: Request, res: Response): Promise<void> => {
  try {
    const terms = await listWmiGlossaryTerms()
    res.json({ success: true, data: { terms } })
  } catch (error) {
    console.error('WMI glossary error:', error)
    res.status(500).json({ success: false, error: 'Unable to load glossary' })
  }
})

const figureExtRe = /\.(png|jpe?g|webp|svg)$/i
router.get('/figures/:filename', (req: Request, res: Response): void => {
  const filename = path.basename(req.params.filename)
  if (!figureExtRe.test(filename)) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }
  res.sendFile(path.join(figuresDir, filename))
})

export default router
