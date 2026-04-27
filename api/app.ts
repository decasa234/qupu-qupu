import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import metaRoutes from './routes/meta.js'
import publicRoutes from './routes/public.js'
import memberRoutes from './routes/member.js'
import childrenRoutes from './routes/children.js'
import adminRoutes from './routes/admin.js'
import analyticsRoutes from './routes/analytics.js'

dotenv.config()

const app: express.Application = express()

app.use(
  cors({
    origin: process.env.APP_ORIGIN || true,
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/meta', metaRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/me', memberRoutes)
app.use('/api/me/children', childrenRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/analytics', analyticsRoutes)

app.use('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'ok',
  })
})

app.use((error: Error, _req: Request, res: Response, _unusedNext: NextFunction) => {
  void _unusedNext
  console.error('Unhandled server error:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
