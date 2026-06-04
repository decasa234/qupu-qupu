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
import wmiPublicRoutes from './routes/wmi-public.js'
import memberRoutes from './routes/member.js'
import wmiMemberRoutes from './routes/wmi-member.js'
import childrenRoutes from './routes/children.js'
import dashboardRoutes from './routes/dashboard.js'
import adminRoutes from './routes/admin.js'
import wmiAdminRoutes from './routes/wmi-admin.js'
import analyticsRoutes from './routes/analytics.js'
import shopRoutes, { inventoryRouter as inventoryRoutes } from './routes/shop.js'
import { validateChannelHandle } from './services/youtubeChannel.js'

dotenv.config()

// Fail fast if YOUTUBE_CHANNEL_HANDLE is set to a malformed value. The
// Channel listing service uses this in a Google API URL via `forHandle=...`,
// so format validation belongs at app construction, not first request.
validateChannelHandle(process.env.YOUTUBE_CHANNEL_HANDLE)

const app: express.Application = express()

// Required for express-rate-limit to identify the real client IP behind
// Vercel/Nginx/Cloudflare proxies. Reads X-Forwarded-For trustingly only one
// hop deep; harmless when running locally without a proxy.
app.set('trust proxy', 1)

// APP_ORIGIN: comma-separated allowlist (e.g., "https://qupu.id,https://www.qupu.id").
// Empty/unset → reflect any origin (dev convenience). Falls through to allow when
// origin is in the allowlist; otherwise the cors lib blocks the response.
const allowedOrigins = (process.env.APP_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length === 0 ? true : allowedOrigins,
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/meta', metaRoutes)
app.use('/api/public/wmi', wmiPublicRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/shop', shopRoutes)
app.use('/api/me/dashboard', dashboardRoutes)
app.use('/api/me/inventory', inventoryRoutes)
app.use('/api/me/children', childrenRoutes)
app.use('/api/me/wmi', wmiMemberRoutes)
app.use('/api/me', memberRoutes)
app.use('/api/admin/wmi', wmiAdminRoutes)
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
