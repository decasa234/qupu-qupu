# Performance Cache and Cookie Consent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve QUPU load performance with safe cache headers, public GET caching, and consent-gated analytics/preferences storage.

**Architecture:** Add server-side cache middleware before API routes, a small typed client GET cache for public reads, and a QUPU-styled consent banner mounted at the app root. Analytics will no-op until consent is accepted, while essential performance caching remains always enabled.

**Tech Stack:** Express 4, React 18, TypeScript, Axios, Tailwind CSS, Vitest/Supertest.

---

## File Structure

- Create: `api/middleware/cacheControl.ts` — owns route-level `Cache-Control` policies.
- Modify: `api/app.ts` — mounts cache middleware before routes.
- Create: `api/__tests__/cacheControl.test.ts` — verifies public/private cache headers.
- Create: `src/lib/clientCache.ts` — owns in-memory/sessionStorage TTL cache helpers for public GETs.
- Modify: `src/lib/api.ts` — exposes cached public GET helper while preserving existing axios behavior.
- Create: `src/lib/cookieConsent.ts` — owns consent storage and safe localStorage access.
- Modify: `src/lib/analytics.ts` — gates analytics session creation/event posting on consent.
- Create: `src/components/CookieConsentBanner.tsx` — public/member QUPU-styled consent UI.
- Modify: `src/App.tsx` — mounts the banner outside route layouts.

---

### Task 1: Server Cache-Control Middleware

**Files:**
- Create: `api/middleware/cacheControl.ts`
- Modify: `api/app.ts:50-65`
- Test: `api/__tests__/cacheControl.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `api/__tests__/cacheControl.test.ts`:

```ts
import request from 'supertest'
import app from '../app.js'

describe('cache control headers', () => {
  it('marks public API reads as publicly cacheable', async () => {
    const response = await request(app).get('/api/public/videos')

    expect(response.headers['cache-control']).toBe('public, max-age=60, stale-while-revalidate=300')
  })

  it('keeps authenticated API reads private and uncached', async () => {
    const response = await request(app).get('/api/me/progress')

    expect(response.headers['cache-control']).toBe('private, no-store')
  })

  it('keeps health checks uncached', async () => {
    const response = await request(app).get('/api/health')

    expect(response.headers['cache-control']).toBe('no-store')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api/__tests__/cacheControl.test.ts`

Expected: FAIL because `cache-control` headers are missing.

- [ ] **Step 3: Create the middleware**

Create `api/middleware/cacheControl.ts`:

```ts
import type { NextFunction, Request, Response } from 'express'

const PUBLIC_CACHE = 'public, max-age=60, stale-while-revalidate=300'
const PRIVATE_NO_STORE = 'private, no-store'
const NO_STORE = 'no-store'

const publicPrefixes = ['/api/public', '/api/meta']
const privatePrefixes = ['/api/auth', '/api/me', '/api/users', '/api/admin', '/api/shop', '/api/analytics']

export function applyCacheControl(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', PRIVATE_NO_STORE)
    next()
    return
  }

  if (req.path === '/api/health') {
    res.setHeader('Cache-Control', NO_STORE)
    next()
    return
  }

  if (publicPrefixes.some((prefix) => req.path.startsWith(prefix))) {
    res.setHeader('Cache-Control', PUBLIC_CACHE)
    next()
    return
  }

  if (privatePrefixes.some((prefix) => req.path.startsWith(prefix))) {
    res.setHeader('Cache-Control', PRIVATE_NO_STORE)
    next()
    return
  }

  res.setHeader('Cache-Control', NO_STORE)
  next()
}
```

- [ ] **Step 4: Mount the middleware**

Modify `api/app.ts` to import and mount the middleware after body parsing and before routes:

```ts
import { applyCacheControl } from './middleware/cacheControl.js'
```

```ts
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(applyCacheControl)
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- api/__tests__/cacheControl.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Only commit if the user explicitly requested commits. Otherwise skip.

```bash
git add api/middleware/cacheControl.ts api/app.ts api/__tests__/cacheControl.test.ts
git commit -m "feat: add api cache control headers"
```

---

### Task 2: Client Public GET Cache

**Files:**
- Create: `src/lib/clientCache.ts`
- Modify: `src/lib/api.ts:1-60`
- Test: `src/lib/clientCache.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/clientCache.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearClientCache, getCachedValue, makeCacheKey, setCachedValue } from './clientCache'

describe('clientCache', () => {
  beforeEach(() => {
    clearClientCache()
    sessionStorage.clear()
    vi.useRealTimers()
  })

  it('creates stable keys from urls and params', () => {
    expect(makeCacheKey('/public/videos', { subject: 'math', page: 1 })).toBe(
      '/public/videos?page=1&subject=math',
    )
  })

  it('returns cached values before ttl expires', () => {
    setCachedValue('key', { ok: true }, 1000)

    expect(getCachedValue('key')).toEqual({ ok: true })
  })

  it('drops expired values', () => {
    vi.useFakeTimers()
    setCachedValue('key', { ok: true }, 1000)

    vi.advanceTimersByTime(1001)

    expect(getCachedValue('key')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/clientCache.test.ts`

Expected: FAIL because `src/lib/clientCache.ts` does not exist.

- [ ] **Step 3: Implement the cache helper**

Create `src/lib/clientCache.ts`:

```ts
type CacheRecord<T> = {
  value: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheRecord<unknown>>()
const STORAGE_PREFIX = 'qupu_public_cache:'

export function makeCacheKey(url: string, params?: Record<string, unknown>): string {
  const entries = Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))

  if (entries.length === 0) return url

  const search = new URLSearchParams()
  for (const [key, value] of entries) {
    search.set(key, String(value))
  }

  return `${url}?${search.toString()}`
}

export function getCachedValue<T>(key: string): T | null {
  const now = Date.now()
  const memoryRecord = memoryCache.get(key) as CacheRecord<T> | undefined

  if (memoryRecord) {
    if (memoryRecord.expiresAt > now) return memoryRecord.value
    memoryCache.delete(key)
  }

  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (!raw) return null
    const stored = JSON.parse(raw) as CacheRecord<T>
    if (stored.expiresAt <= now) {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`)
      return null
    }
    memoryCache.set(key, stored)
    return stored.value
  } catch {
    return null
  }
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number): void {
  const record: CacheRecord<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  }

  memoryCache.set(key, record)

  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(record))
  } catch {
    memoryCache.set(key, record)
  }
}

export function clearClientCache(): void {
  memoryCache.clear()

  try {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index)
      if (key?.startsWith(STORAGE_PREFIX)) {
        sessionStorage.removeItem(key)
      }
    }
  } catch {
    return
  }
}
```

- [ ] **Step 4: Add cached public GET helper to api client**

Modify `src/lib/api.ts`:

```ts
import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'
import { useLoadingState } from '../hooks/useLoadingState'
import { getCachedValue, makeCacheKey, setCachedValue } from './clientCache'
```

Add before `export default api`:

```ts
export async function getCachedPublic<T>(
  url: string,
  config?: AxiosRequestConfig,
  ttlMs = 60_000,
): Promise<T> {
  const params = config?.params as Record<string, unknown> | undefined
  const key = makeCacheKey(url, params)
  const cached = getCachedValue<T>(key)
  if (cached) return cached

  const response = await api.get<T>(url, config)
  setCachedValue(key, response.data, ttlMs)
  return response.data
}
```

- [ ] **Step 5: Run cache tests**

Run: `npm test -- src/lib/clientCache.test.ts`

Expected: PASS.

- [ ] **Step 6: Run typecheck**

Run: `npm run check`

Expected: PASS.

- [ ] **Step 7: Commit**

Only commit if the user explicitly requested commits. Otherwise skip.

```bash
git add src/lib/clientCache.ts src/lib/clientCache.test.ts src/lib/api.ts
git commit -m "feat: add public client cache helper"
```

---

### Task 3: Cookie Consent Storage and Analytics Gate

**Files:**
- Create: `src/lib/cookieConsent.ts`
- Modify: `src/lib/analytics.ts:1-53`
- Test: `src/lib/cookieConsent.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/cookieConsent.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import {
  COOKIE_CONSENT_KEY,
  getCookieConsent,
  hasAnalyticsConsent,
  setCookieConsent,
} from './cookieConsent'

describe('cookieConsent', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to undecided with analytics disabled', () => {
    expect(getCookieConsent()).toBe('undecided')
    expect(hasAnalyticsConsent()).toBe(false)
  })

  it('stores accepted consent', () => {
    setCookieConsent('accepted')

    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('accepted')
    expect(hasAnalyticsConsent()).toBe(true)
  })

  it('stores declined consent', () => {
    setCookieConsent('declined')

    expect(getCookieConsent()).toBe('declined')
    expect(hasAnalyticsConsent()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/cookieConsent.test.ts`

Expected: FAIL because `src/lib/cookieConsent.ts` does not exist.

- [ ] **Step 3: Implement consent storage**

Create `src/lib/cookieConsent.ts`:

```ts
export const COOKIE_CONSENT_KEY = 'qupu_cookie_consent'

export type CookieConsent = 'accepted' | 'declined' | 'undecided'

export function getCookieConsent(): CookieConsent {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (stored === 'accepted' || stored === 'declined') return stored
    return 'undecided'
  } catch {
    return 'undecided'
  }
}

export function setCookieConsent(value: Exclude<CookieConsent, 'undecided'>): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value)
  } catch {
    return
  }
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === 'accepted'
}
```

- [ ] **Step 4: Gate analytics on consent**

Modify `src/lib/analytics.ts`:

```ts
import api from './api'
import { hasAnalyticsConsent } from './cookieConsent'
```

Update `trackEvent`:

```ts
export function trackEvent(
  eventName: AnalyticsEventName,
  metadata?: Record<string, unknown>,
): void {
  if (!hasAnalyticsConsent()) return
  void postEvent(eventName, metadata)
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/lib/cookieConsent.test.ts`

Expected: PASS.

- [ ] **Step 6: Run typecheck**

Run: `npm run check`

Expected: PASS.

- [ ] **Step 7: Commit**

Only commit if the user explicitly requested commits. Otherwise skip.

```bash
git add src/lib/cookieConsent.ts src/lib/cookieConsent.test.ts src/lib/analytics.ts
git commit -m "feat: gate analytics on cookie consent"
```

---

### Task 4: QUPU Cookie Consent Banner

**Files:**
- Create: `src/components/CookieConsentBanner.tsx`
- Modify: `src/App.tsx:1-204`

- [ ] **Step 1: Create the banner component**

Create `src/components/CookieConsentBanner.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { getCookieConsent, setCookieConsent } from '../lib/cookieConsent'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getCookieConsent() === 'undecided')
  }, [])

  if (!visible) return null

  const accept = () => {
    setCookieConsent('accepted')
    setVisible(false)
  }

  const decline = () => {
    setCookieConsent('declined')
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4 sm:bottom-6">
      <div className="mx-auto max-w-3xl rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Cookie QUPU
          </div>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-qupu-muted sm:text-base">
            Kami memakai cache penting supaya QUPU lebih cepat. Untuk cookie analitik dan preferensi tambahan, boleh kami aktifkan?
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:mt-0 sm:min-w-48">
          <button
            type="button"
            onClick={accept}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-qupu-brand-blue px-5 py-2.5 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          >
            Boleh
          </button>
          <button
            type="button"
            onClick={decline}
            className="font-display text-sm font-bold text-qupu-muted transition-colors hover:text-qupu-brand-orange"
          >
            Jangan dulu
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Mount the banner in App**

Modify `src/App.tsx` imports:

```tsx
import CookieConsentBanner from './components/CookieConsentBanner'
```

Mount it below `LoadingOverlay`:

```tsx
<RouteLoadingTrigger />
<LoadingOverlay />
<CookieConsentBanner />
<Routes>
```

- [ ] **Step 3: Run typecheck**

Run: `npm run check`

Expected: PASS.

- [ ] **Step 4: Commit**

Only commit if the user explicitly requested commits. Otherwise skip.

```bash
git add src/components/CookieConsentBanner.tsx src/App.tsx
git commit -m "feat: add cookie consent banner"
```

---

### Task 5: Use Cached Public Reads on Existing Public Pages

**Files:**
- Modify: selected files under `src/pages/` that call `api.get('/public/...')`
- Use search before editing: `api.get\('/public|api.get\("/public|api.get\('/meta|api.get\("/meta`

- [ ] **Step 1: Find public GET call sites**

Use Grep for:

```text
api\.get\(['"]/(public|meta)
```

Expected: identify public page call sites such as public meta, public videos, and public video detail.

- [ ] **Step 2: Update imports in each matching public page**

For each public page that imports default `api` only to call public GETs, replace:

```ts
import api from '../lib/api'
```

with:

```ts
import { getCachedPublic } from '../lib/api'
```

If the page also needs non-public API calls, keep both:

```ts
import api, { getCachedPublic } from '../lib/api'
```

- [ ] **Step 3: Replace public GET calls**

Replace direct public GET calls like:

```ts
const response = await api.get('/public/videos', { params })
const videos = response.data.data.videos
```

with:

```ts
const response = await getCachedPublic<{ success: boolean; data: { videos: Video[] } }>(
  '/public/videos',
  { params },
)
const videos = response.data.videos
```

For page-specific response shapes, define local inline generic types that match existing usage. Keep the rest of the component logic unchanged.

- [ ] **Step 4: Run typecheck**

Run: `npm run check`

Expected: PASS.

- [ ] **Step 5: Manually smoke test public pages**

Run: `npm run dev`

Open:

- `/`
- `/videos`
- `/videos/<existing-slug>`

Expected: pages load, repeat navigation reuses cached public data within 60 seconds, no private data is cached by `getCachedPublic`.

- [ ] **Step 6: Commit**

Only commit if the user explicitly requested commits. Otherwise skip.

```bash
git add src/pages src/lib/api.ts
git commit -m "perf: cache public page api reads"
```

---

### Task 6: Final Verification

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run unit tests**

Run: `npm test -- api/__tests__/cacheControl.test.ts src/lib/clientCache.test.ts src/lib/cookieConsent.test.ts`

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run: `npm run check`

Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 4: Inspect git diff**

Run: `git diff -- api src docs/superpowers`

Expected: diff only includes cache middleware, tests, client cache, consent storage, analytics gating, banner, public GET cache usage, and approved spec/plan docs.

- [ ] **Step 5: Manual browser verification**

Run: `npm run dev`

Verify:

- Cookie banner appears on first visit.
- Accept hides banner and allows future analytics events.
- Decline hides banner and analytics events no-op.
- Public endpoints include `Cache-Control: public, max-age=60, stale-while-revalidate=300`.
- Private endpoints include `Cache-Control: private, no-store`.
- Performance cache works without accepting cookies.

---

## Self-Review

Spec coverage:

- Server cache headers: Task 1.
- Auth/admin private no-store: Task 1.
- Client-side public GET cache: Task 2 and Task 5.
- QUPU-styled consent banner: Task 4.
- Analytics/preferences only consent: Task 3 and Task 4.
- Performance cache always on: Task 1, Task 2, Task 5.
- Verification: Task 6.

Placeholder scan: no TBD/TODO/fill-in placeholders remain.

Type consistency: `CookieConsent`, `getCachedPublic`, `makeCacheKey`, `getCachedValue`, and `setCachedValue` names are consistent across tasks.
