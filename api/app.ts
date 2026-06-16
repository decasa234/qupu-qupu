import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import metaRoutes from './routes/meta.js'
import publicRoutes from './routes/public.js'
import wmiPublicRoutes from './routes/wmi-public.js'
import memberRoutes from './routes/member.js'
import wmiMemberRoutes from './routes/wmi-member.js'
import fundamentalsMemberRoutes from './routes/fundamentals-member.js'
import childrenRoutes from './routes/children.js'
import dashboardRoutes from './routes/dashboard.js'
import adminRoutes from './routes/admin.js'
import wmiAdminRoutes from './routes/wmi-admin.js'
import analyticsRoutes from './routes/analytics.js'
import cronRoutes from './routes/cron.js'
import shopRoutes, { inventoryRouter as inventoryRoutes } from './routes/shop.js'
import { applyCacheControl } from './middleware/cacheControl.js'
import { validateChannelHandle } from './services/youtubeChannel.js'
import { assertJwtSecret } from './lib/jwt.js'

dotenv.config()

// Fail fast at app construction (not on first request) on misconfiguration:
// - JWT_SECRET must be present, and non-default/long enough in production.
//   The entire authorization model reduces to this secret.
// - YOUTUBE_CHANNEL_HANDLE, when set, is interpolated into a Google API URL.
assertJwtSecret()
validateChannelHandle(process.env.YOUTUBE_CHANNEL_HANDLE)

const app: express.Application = express()

// Baseline security headers (HSTS, no-sniff, frameguard, etc.). CORP is set
// to cross-origin because the SPA and this API may be served from different
// origins in some environments; CORS still gates credentialed requests.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

// Required so req.ip resolves to the real client IP behind
// Vercel/Nginx/Cloudflare proxies (used as the rate-limit key for the auth
// and analytics routes). Reads X-Forwarded-For trustingly only one hop deep;
// harmless when running locally without a proxy.
app.set('trust proxy', 1)

// APP_ORIGIN: comma-separated allowlist (e.g., "https://qupu.id,https://www.qupu.id").
// Empty/unset → reflect any origin (dev convenience). Falls through to allow when
// origin is in the allowlist; otherwise the cors lib blocks the response.
const allowedOrigins = (process.env.APP_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

// In production an explicit allowlist is required — never reflect arbitrary
// origins. In dev, an empty allowlist reflects the request origin for
// convenience.
if (allowedOrigins.length === 0 && process.env.NODE_ENV === 'production') {
  throw new Error(
    'APP_ORIGIN must be set to a comma-separated origin allowlist in production.',
  )
}

app.use(
  cors({
    origin: allowedOrigins.length === 0 ? true : allowedOrigins,
    credentials: true,
  }),
)
app.use(applyCacheControl)
// 1mb is ample for every endpoint (largest payloads are video descriptions
// and ≤50 import ids). The previous 10mb limit was an unbounded-ingestion
// vector for the unauthenticated analytics endpoint.
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

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
app.use('/api/me/fundamentals', fundamentalsMemberRoutes)
app.use('/api/me', memberRoutes)
app.use('/api/admin/wmi', wmiAdminRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/cron', cronRoutes)

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
