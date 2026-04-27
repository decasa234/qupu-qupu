# Email OTP + Separate Auth Providers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the OAuth pre-hijacking vulnerability by adding email-OTP verification to password registration and decoupling Google identity from password identity (no automatic linking, separate `users` rows per provider).

**Architecture:**
- Add a `pending_registrations` staging table; password registration becomes a 2-step flow (`register-init` → email OTP → `register-verify`).
- `findOrCreateGoogleUser` only matches by `google_sub`. Email collisions with password rows are allowed (separate accounts).
- Drop the table-level `UNIQUE` on `users.email`; replace with a partial unique index that only applies to rows with `password_hash IS NOT NULL`.

**Tech Stack:** Node/Express + TypeScript (`api/`), React + Vite (`src/`), PostgreSQL (`db/`), bcrypt for hashing, Joi for validation, Resend for transactional email.

**Verification model:** This repo has no automated test runner (per `CLAUDE.md`). Each task is verified by `npm run check` (typecheck) and `npm run lint`, plus manual curl/browser checks listed in the final task.

---

## File Structure

**New files:**
- `db/migrations/0006_email_otp_and_separate_providers.sql` — schema migration
- `api/services/email.ts` — Resend HTTP client + `sendOtpEmail`
- `api/services/registration.ts` — `initRegistration`, `verifyOtp`, `resendOtp` (pending row lifecycle + DB calls)

**Modified files:**
- `db/schema.sql` — mirror migration so fresh installs match
- `api/services/oauth.ts` — drop email-based linking
- `api/routes/auth.ts` — remove `POST /register`, add `/register-init`, `/register-verify`, `/register-resend`
- `.env.example` — add `RESEND_API_KEY`, `RESEND_FROM`
- `CLAUDE.md` — document new flow + env vars
- `src/pages/Register.tsx` — orchestrate 2-step register flow
- `src/components/AuthModal.tsx` — same 2-step register inside the score-flow modal

---

## Task 1: Schema migration

**Files:**
- Create: `db/migrations/0006_email_otp_and_separate_providers.sql`
- Modify: `db/schema.sql`

- [ ] **Step 1: Create migration file**

Write `db/migrations/0006_email_otp_and_separate_providers.sql`:

```sql
-- Migration 0006: email OTP register + separate auth providers
-- Drops the table-level UNIQUE on users.email so the same email string can
-- co-exist as both a password account and a Google account (no auto-linking).
-- Adds the pending_registrations staging table for the OTP flow.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_password_unique
  ON users(email)
  WHERE password_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  password_hash VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires_at ON pending_registrations(expires_at);
```

- [ ] **Step 2: Update `db/schema.sql` to match**

In `db/schema.sql`, change the `users` table `email` column from:

```sql
  email VARCHAR(255) UNIQUE NOT NULL,
```

to:

```sql
  email VARCHAR(255) NOT NULL,
```

After the existing `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);` line, add:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS users_email_password_unique
  ON users(email)
  WHERE password_hash IS NOT NULL;
```

At the end of `db/schema.sql` (before the final newline), add the same `pending_registrations` table + indexes from Step 1.

- [ ] **Step 3: Apply migration locally**

Run:

```bash
psql "$DATABASE_URL" -f db/migrations/0006_email_otp_and_separate_providers.sql
```

Expected: `ALTER TABLE` / `CREATE INDEX` / `CREATE TABLE` notices, no errors.

Verify with:

```bash
psql "$DATABASE_URL" -c "\d users" | grep email
psql "$DATABASE_URL" -c "\d pending_registrations"
```

`users.email` should no longer say `unique`. `pending_registrations` should exist with all the columns above.

- [ ] **Step 4: Commit**

```bash
git add db/migrations/0006_email_otp_and_separate_providers.sql db/schema.sql
git commit -m "feat(db): add pending_registrations and partial unique on users.email"
```

---

## Task 2: Email service (Resend)

**Files:**
- Create: `api/services/email.ts`
- Modify: `.env.example`

- [ ] **Step 1: Add env vars to `.env.example`**

Append to `.env.example`:

```
# Resend (transactional email — used for OTP register)
RESEND_API_KEY=
RESEND_FROM=noreply@example.com
```

- [ ] **Step 2: Create `api/services/email.ts`**

Write the full file:

```ts
interface ResendError {
  statusCode?: number
  message?: string
  name?: string
}

const ENDPOINT = 'https://api.resend.com/emails'

export async function sendOtpEmail(to: string, name: string, otp: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY or RESEND_FROM is not configured')
  }

  const safeName = (name || '').trim() || 'Orang tua QUPU'

  const text = [
    `Hai ${safeName},`,
    '',
    `Kode verifikasi QUPU kamu: ${otp}`,
    '',
    'Berlaku 10 menit. Jangan kasih kode ini ke siapa pun — staf QUPU',
    'tidak akan pernah minta kode ini.',
    '',
    'Kalau bukan kamu yang daftar, abaikan email ini.',
  ].join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <p>Hai ${escapeHtml(safeName)},</p>
      <p>Kode verifikasi QUPU kamu:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#1d4ed8">${otp}</p>
      <p>Berlaku 10 menit. Jangan kasih kode ini ke siapa pun &mdash; staf QUPU tidak akan pernah minta kode ini.</p>
      <p style="color:#6b7280;font-size:13px">Kalau bukan kamu yang daftar, abaikan email ini.</p>
    </div>
  `

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Kode verifikasi QUPU',
      text,
      html,
    }),
  })

  if (!response.ok) {
    let body: ResendError = {}
    try {
      body = (await response.json()) as ResendError
    } catch {
      // ignore parse errors
    }
    throw new Error(
      `Resend send failed: ${response.status} ${body.message ?? response.statusText}`,
    )
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
```

- [ ] **Step 3: Typecheck**

Run:

```bash
npm run check
```

Expected: clean (`tsc --noEmit` no output).

- [ ] **Step 4: Commit**

```bash
git add api/services/email.ts .env.example
git commit -m "feat(api): add Resend email service for OTP delivery"
```

---

## Task 3: OAuth simplification (drop email-based linking)

**Files:**
- Modify: `api/services/oauth.ts`

- [ ] **Step 1: Replace `findOrCreateGoogleUser`**

In `api/services/oauth.ts`, replace the entire `findOrCreateGoogleUser` function with:

```ts
export async function findOrCreateGoogleUser(claims: GoogleClaims): Promise<OAuthUser> {
  return withTransaction(async (client) => {
    const bySub = await queryOne<OAuthUser>(
      `SELECT id, email, name, role, phone, age FROM users WHERE google_sub = $1`,
      [claims.sub],
      client,
    )

    if (bySub) {
      return bySub
    }

    if (!claims.emailVerified) {
      throw new Error('Google email is not verified')
    }

    const created = await queryOne<OAuthUser>(
      `
        INSERT INTO users (email, name, google_sub, role, is_verified)
        VALUES ($1, $2, $3, 'parent', TRUE)
        RETURNING id, email, name, role, phone, age
      `,
      [claims.email, claims.name, claims.sub],
      client,
    )

    if (!created) {
      throw new Error('Failed to create user')
    }

    return created
  })
}
```

This drops the `byEmail` branch entirely. A Google login that matches no existing `google_sub` always creates a brand-new user row, regardless of whether the email collides with an existing password account.

- [ ] **Step 2: Typecheck**

Run:

```bash
npm run check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add api/services/oauth.ts
git commit -m "fix(auth): stop auto-linking Google to password rows by email"
```

---

## Task 4: Registration service (pending row lifecycle)

**Files:**
- Create: `api/services/registration.ts`

- [ ] **Step 1: Create `api/services/registration.ts`**

Write the full file:

```ts
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import type { PoolClient } from 'pg'
import { query, queryOne, withTransaction } from '../db.js'
import { sendOtpEmail } from './email.js'

const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_OTP_ATTEMPTS = 5
const OTP_BCRYPT_COST = 10
const PASSWORD_BCRYPT_COST = 12

export class RegistrationError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export interface InitInput {
  email: string
  phone: string
  name: string
  age: number | null
  password: string
}

export interface InitResult {
  pendingId: string
  expiresAt: string
}

export interface VerifyResult {
  user: {
    id: string
    email: string
    name: string
    role: string
    phone: string | null
    age: number | null
  }
}

function generateOtp(): string {
  const n = crypto.randomInt(0, 1_000_000)
  return String(n).padStart(6, '0')
}

async function findExistingPasswordUser(
  client: PoolClient,
  email: string,
  phone: string,
): Promise<{ field: 'email' | 'phone' } | null> {
  const byEmail = await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE email = $1 AND password_hash IS NOT NULL`,
    [email],
    client,
  )
  if (byEmail) return { field: 'email' }

  const byPhone = await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE phone = $1 AND password_hash IS NOT NULL`,
    [phone],
    client,
  )
  if (byPhone) return { field: 'phone' }

  return null
}

export async function initRegistration(input: InitInput): Promise<InitResult> {
  return withTransaction(async (client) => {
    const conflict = await findExistingPasswordUser(client, input.email, input.phone)
    if (conflict?.field === 'email') {
      throw new RegistrationError(409, 'Email sudah terdaftar, silakan login.')
    }
    if (conflict?.field === 'phone') {
      throw new RegistrationError(409, 'No. HP sudah terdaftar.')
    }

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_BCRYPT_COST)
    const otp = generateOtp()
    const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_COST)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    await client.query(
      `DELETE FROM pending_registrations WHERE email = $1`,
      [input.email],
    )

    const inserted = await queryOne<{ id: string; expires_at: string }>(
      `
        INSERT INTO pending_registrations
          (email, phone, name, age, password_hash, otp_hash, expires_at, last_sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, expires_at
      `,
      [
        input.email,
        input.phone,
        input.name,
        input.age,
        passwordHash,
        otpHash,
        expiresAt.toISOString(),
      ],
      client,
    )

    if (!inserted) {
      throw new RegistrationError(500, 'Gagal membuat pending registration.')
    }

    try {
      await sendOtpEmail(input.email, input.name, otp)
    } catch (error) {
      // Roll back the pending row by deleting it; transaction commits will
      // happen anyway, so we explicitly delete here.
      await client.query(`DELETE FROM pending_registrations WHERE id = $1`, [inserted.id])
      console.error('Resend send failed:', error)
      throw new RegistrationError(
        500,
        'Gagal kirim email. Cek koneksi atau coba beberapa saat lagi.',
      )
    }

    return {
      pendingId: inserted.id,
      expiresAt: inserted.expires_at,
    }
  })
}

export interface VerifyInput {
  pendingId: string
  otp: string
}

export async function verifyOtp(input: VerifyInput): Promise<VerifyResult['user']> {
  return withTransaction(async (client) => {
    const pending = await queryOne<{
      id: string
      email: string
      phone: string
      name: string
      age: number | null
      password_hash: string
      otp_hash: string
      attempts_count: number
    }>(
      `
        SELECT id, email, phone, name, age, password_hash, otp_hash, attempts_count
        FROM pending_registrations
        WHERE id = $1 AND expires_at > NOW()
        FOR UPDATE
      `,
      [input.pendingId],
      client,
    )

    if (!pending) {
      throw new RegistrationError(400, 'Kode kadaluarsa.')
    }

    if (pending.attempts_count >= MAX_OTP_ATTEMPTS) {
      await client.query(`DELETE FROM pending_registrations WHERE id = $1`, [pending.id])
      throw new RegistrationError(429, 'Terlalu banyak percobaan.')
    }

    const matches = await bcrypt.compare(input.otp, pending.otp_hash)
    if (!matches) {
      await client.query(
        `UPDATE pending_registrations SET attempts_count = attempts_count + 1 WHERE id = $1`,
        [pending.id],
      )
      throw new RegistrationError(400, 'Kode salah.')
    }

    const conflict = await findExistingPasswordUser(client, pending.email, pending.phone)
    if (conflict) {
      await client.query(`DELETE FROM pending_registrations WHERE id = $1`, [pending.id])
      throw new RegistrationError(409, 'Email sudah terdaftar, silakan login.')
    }

    const ageGroup =
      pending.age !== null
        ? await queryOne<{ id: string }>(
            `
              SELECT id FROM age_groups
              WHERE min_age <= $1 AND max_age >= $1
              ORDER BY min_age ASC
              LIMIT 1
            `,
            [pending.age],
            client,
          )
        : null

    const user = await queryOne<{
      id: string
      email: string
      name: string
      role: string
      phone: string | null
      age: number | null
    }>(
      `
        INSERT INTO users (email, phone, name, age, age_group_id, password_hash, role, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, 'parent', TRUE)
        RETURNING id, email, name, role, phone, age
      `,
      [
        pending.email,
        pending.phone,
        pending.name,
        pending.age,
        ageGroup?.id ?? null,
        pending.password_hash,
      ],
      client,
    )

    if (!user) {
      throw new RegistrationError(500, 'Gagal membuat akun.')
    }

    await client.query(`DELETE FROM pending_registrations WHERE id = $1`, [pending.id])

    return user
  })
}

export interface ResendInput {
  pendingId: string
}

export async function resendOtp(input: ResendInput): Promise<{ expiresAt: string }> {
  return withTransaction(async (client) => {
    const pending = await queryOne<{
      id: string
      email: string
      name: string
      last_sent_at: string
    }>(
      `
        SELECT id, email, name, last_sent_at
        FROM pending_registrations
        WHERE id = $1 AND expires_at > NOW()
        FOR UPDATE
      `,
      [input.pendingId],
      client,
    )

    if (!pending) {
      throw new RegistrationError(400, 'Kode kadaluarsa.')
    }

    const lastSent = new Date(pending.last_sent_at).getTime()
    if (Date.now() - lastSent < RESEND_COOLDOWN_MS) {
      throw new RegistrationError(429, 'Tunggu sebentar sebelum kirim ulang.')
    }

    const otp = generateOtp()
    const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_COST)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    const updated = await queryOne<{ expires_at: string }>(
      `
        UPDATE pending_registrations
        SET otp_hash = $2, attempts_count = 0, expires_at = $3, last_sent_at = NOW()
        WHERE id = $1
        RETURNING expires_at
      `,
      [pending.id, otpHash, expiresAt.toISOString()],
      client,
    )

    if (!updated) {
      throw new RegistrationError(500, 'Gagal memperbarui kode.')
    }

    try {
      await sendOtpEmail(pending.email, pending.name, otp)
    } catch (error) {
      console.error('Resend send failed:', error)
      throw new RegistrationError(
        500,
        'Gagal kirim email. Cek koneksi atau coba beberapa saat lagi.',
      )
    }

    return { expiresAt: updated.expires_at }
  })
}

// Lazy cleanup of stale rows. Called occasionally on read paths to keep the
// table from accumulating expired entries forever.
export async function purgeExpiredPendingRegistrations(): Promise<void> {
  await query(
    `DELETE FROM pending_registrations WHERE expires_at < NOW() - INTERVAL '7 days'`,
  )
}
```

- [ ] **Step 2: Typecheck**

Run:

```bash
npm run check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add api/services/registration.ts
git commit -m "feat(api): add registration service for OTP-gated signup"
```

---

## Task 5: Auth routes (init / verify / resend, drop legacy register)

**Files:**
- Modify: `api/routes/auth.ts`

- [ ] **Step 1: Add imports + Joi schemas**

In `api/routes/auth.ts`, replace the existing `import` block at the top with:

```ts
import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { queryOne } from '../db.js'
import { findOrCreateGoogleUser, verifyGoogleIdToken } from '../services/oauth.js'
import {
  RegistrationError,
  initRegistration,
  resendOtp,
  verifyOtp,
} from '../services/registration.js'
```

Right below the existing `loginSchema` and `googleSchema`, add:

```ts
const initSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().min(6).max(120).optional().allow(null),
  password: Joi.string().min(8).required(),
})

const verifySchema = Joi.object({
  pendingId: Joi.string().uuid().required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
})

const resendSchema = Joi.object({
  pendingId: Joi.string().uuid().required(),
})
```

- [ ] **Step 2: Remove the legacy `POST /register` handler**

Delete the entire existing `router.post('/register', ...)` block in `api/routes/auth.ts` (the bcrypt-hash + INSERT into users path). The replacement endpoints below take its place.

- [ ] **Step 3: Add the three new endpoints**

After the `loginSchema` validation and before the `router.post('/login', ...)` block (or wherever order makes sense, but **above** `export default router`), add:

```ts
function handleRegistrationError(res: Response, error: unknown): void {
  if (error instanceof RegistrationError) {
    res.status(error.status).json({ success: false, error: error.message })
    return
  }
  console.error('Registration error:', error)
  res.status(500).json({ success: false, error: 'Internal server error' })
}

router.post('/register-init', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = initSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const result = await initRegistration({
      email: value.email,
      phone: value.phone,
      name: value.name,
      age: value.age ?? null,
      password: value.password,
    })

    res.status(201).json({ success: true, data: result })
  } catch (error) {
    handleRegistrationError(res, error)
  }
})

router.post('/register-verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = verifySchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const user = await verifyOtp({ pendingId: value.pendingId, otp: value.otp })

    res.status(201).json({
      success: true,
      data: {
        user,
        token: issueToken(user),
        refreshToken: issueRefreshToken(user.id),
      },
    })
  } catch (error) {
    handleRegistrationError(res, error)
  }
})

router.post('/register-resend', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = resendSchema.validate(req.body)
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message })
      return
    }

    const result = await resendOtp({ pendingId: value.pendingId })

    res.json({ success: true, data: result })
  } catch (error) {
    handleRegistrationError(res, error)
  }
})
```

- [ ] **Step 4: Update the `/login` handler to use the partial unique constraint**

Find the existing login handler's user lookup query and update the `WHERE` clause to:

```ts
const user = await queryOne<{
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  age: number | null
  password_hash: string | null
}>(
  `
    SELECT id, email, name, role, phone, age, password_hash
    FROM users
    WHERE email = $1 AND password_hash IS NOT NULL
  `,
  [value.email],
)
```

This makes the login route ignore Google-only rows that happen to share an email string with a password row.

- [ ] **Step 5: Typecheck + lint**

Run:

```bash
npm run check
npm run lint
```

Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add api/routes/auth.ts
git commit -m "feat(api): replace /auth/register with init/verify/resend OTP flow"
```

---

## Task 6: Frontend Register page (2-step flow)

**Files:**
- Modify: `src/pages/Register.tsx`

- [ ] **Step 1: Replace the entire file**

Overwrite `src/pages/Register.tsx` with:

```tsx
// src/pages/Register.tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { trackEvent } from '../lib/analytics'
import AuthCard from '../components/AuthCard'
import GoogleSignInButton from '../components/GoogleSignInButton'
import OtpInput from '../components/OtpInput'
import PillField from '../components/PillField'
import { useAuthStore } from '../store/authStore'
import type { AuthPayload, Child } from '../types'

type Step = 'credentials' | 'otp'

interface PendingState {
  pendingId: string
  expiresAt: string
  email: string
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [step, setStep] = useState<Step>('credentials')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<PendingState | null>(null)

  const handleGoogleAuthenticated = async (payload: AuthPayload) => {
    setLoading(true)
    setError('')
    try {
      trackEvent('google_login_completed')
      login(payload.user, payload.token)

      let children: Child[] = []
      try {
        const childrenResponse = await api.get('/me/children')
        children = childrenResponse.data.data.children ?? []
      } catch (childrenError) {
        console.error('Failed to load children after Google sign-in:', childrenError)
      }

      useAuthStore.getState().setChildren(children)
      navigate(children.length === 0 ? '/onboarding/child' : '/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const handleInit = async (event: React.FormEvent) => {
    event.preventDefault()
    trackEvent('register_button_click')
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/register-init', { ...form, age: null })
      const data = response.data.data as { pendingId: string; expiresAt: string }
      setPending({ pendingId: data.pendingId, expiresAt: data.expiresAt, email: form.email })
      setStep('otp')
    } catch (requestError: unknown) {
      setError(extractError(requestError, 'Registrasi gagal.'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (otp: string) => {
    if (!pending) return
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/register-verify', {
        pendingId: pending.pendingId,
        otp,
      })
      const payload = response.data.data as AuthPayload
      login(payload.user, payload.token)
      trackEvent('register_completed')
      navigate('/onboarding/child', { replace: true })
    } catch (requestError: unknown) {
      const message = extractError(requestError, 'Verifikasi gagal.')
      setError(message)
      if (message === 'Kode kadaluarsa.' || message === 'Terlalu banyak percobaan.') {
        setStep('credentials')
        setPending(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!pending) return
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/register-resend', { pendingId: pending.pendingId })
      const data = response.data.data as { expiresAt: string }
      setPending({ ...pending, expiresAt: data.expiresAt })
    } catch (requestError: unknown) {
      setError(extractError(requestError, 'Gagal kirim ulang kode.'))
    } finally {
      setLoading(false)
    }
  }

  const handleBackToCredentials = () => {
    setStep('credentials')
    setPending(null)
    setError('')
  }

  if (step === 'otp' && pending) {
    return (
      <AuthCard
        mascotSrc="/achievement-right.png"
        eyebrow="Verifikasi"
        title="Cek email kamu"
        subtitle={`Kami kirim kode 6 digit ke ${pending.email}. Berlaku 10 menit.`}
        footer={
          <button
            type="button"
            onClick={handleBackToCredentials}
            className="font-bold text-qupu-brand-orange hover:underline"
          >
            ← Ganti email
          </button>
        }
      >
        <div className="space-y-4">
          <OtpInput
            length={6}
            disabled={loading}
            onComplete={handleVerify}
          />

          {error && (
            <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <ResendOtpButton
            disabled={loading}
            onResend={handleResend}
            expiresAt={pending.expiresAt}
          />
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      mascotSrc="/achievement-right.png"
      eyebrow="Daftar"
      title="Buat akun orang tua"
      subtitle="Satu akun untuk semua anak. Tambah profil tiap anak setelah daftar."
      footer={
        <span>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-qupu-brand-orange hover:underline">
            Login di sini
          </Link>
        </span>
      }
    >
      <div className="space-y-5">
        <GoogleSignInButton onAuthenticated={handleGoogleAuthenticated} onError={setError} />

        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-muted">
          <span className="h-px flex-1 bg-qupu-peach" />
          atau daftar dengan email
          <span className="h-px flex-1 bg-qupu-peach" />
        </div>

        <form className="space-y-4" onSubmit={handleInit}>
          <PillField
            label="Nama orang tua"
            icon="fa-solid fa-user"
            value={form.name}
            onChange={(value) => setForm((state) => ({ ...state, name: value }))}
            placeholder="Nama kamu"
            required
          />
          <PillField
            label="Email"
            icon="fa-solid fa-envelope"
            type="email"
            value={form.email}
            onChange={(value) => setForm((state) => ({ ...state, email: value }))}
            placeholder="orangtua@contoh.com"
            required
          />
          <PillField
            label="No. HP"
            icon="fa-solid fa-phone"
            type="tel"
            value={form.phone}
            onChange={(value) => setForm((state) => ({ ...state, phone: value }))}
            placeholder="0812xxxx"
            required
          />
          <PillField
            label="Password"
            icon="fa-solid fa-lock"
            type="password"
            value={form.password}
            onChange={(value) => setForm((state) => ({ ...state, password: value }))}
            placeholder="minimal 8 karakter"
            required
          />

          {error && (
            <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <i className="fa-solid fa-paper-plane text-base text-qupu-brand-orange" aria-hidden="true" />
            </span>
            {loading ? 'Mengirim kode...' : 'Kirim kode verifikasi'}
          </button>
        </form>
      </div>
    </AuthCard>
  )
}

function ResendOtpButton({
  disabled,
  onResend,
  expiresAt,
}: {
  disabled: boolean
  onResend: () => void
  expiresAt: string
}) {
  const [secondsLeft, setSecondsLeft] = useState(60)

  useEffect(() => {
    setSecondsLeft(60)
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [expiresAt])

  const ready = secondsLeft <= 0

  return (
    <button
      type="button"
      onClick={onResend}
      disabled={disabled || !ready}
      className="w-full rounded-full border-2 border-qupu-brand-blue bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-blue transition-colors hover:bg-qupu-brand-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {ready ? 'Kirim ulang kode' : `Kirim ulang dalam ${secondsLeft}s`}
    </button>
  )
}

function extractError(requestError: unknown, fallback: string): string {
  if (
    typeof requestError === 'object' &&
    requestError !== null &&
    'response' in requestError &&
    typeof (requestError as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
  ) {
    return (requestError as { response: { data: { error: string } } }).response.data.error
  }
  return fallback
}
```

- [ ] **Step 2: Create the `OtpInput` component**

Create `src/components/OtpInput.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'

interface OtpInputProps {
  length: number
  disabled?: boolean
  onComplete: (otp: string) => void
}

export default function OtpInput({ length, disabled, onComplete }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(() => Array(length).fill(''))
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  const updateAt = (index: number, char: string) => {
    setValues((prev) => {
      const next = [...prev]
      next[index] = char
      const joined = next.join('')
      if (joined.length === length && !next.includes('')) {
        onComplete(joined)
      }
      return next
    })
  }

  const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/\D/g, '')
    if (raw.length <= 1) {
      updateAt(index, raw)
      if (raw && index < length - 1) {
        inputs.current[index + 1]?.focus()
      }
      return
    }
    // Pasted multiple digits
    const chars = raw.slice(0, length - index).split('')
    setValues((prev) => {
      const next = [...prev]
      chars.forEach((c, offset) => {
        next[index + offset] = c
      })
      const joined = next.join('')
      if (joined.length === length && !next.includes('')) {
        onComplete(joined)
      }
      return next
    })
    const focusIndex = Math.min(index + chars.length, length - 1)
    inputs.current[focusIndex]?.focus()
  }

  const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={length}
          value={values[i]}
          onChange={handleChange(i)}
          onKeyDown={handleKeyDown(i)}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="h-12 w-10 rounded-xl border-2 border-qupu-peach bg-qupu-shell text-center font-mono text-xl font-bold text-qupu-brand-blue outline-none focus:border-qupu-brand-orange disabled:opacity-60"
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Typecheck + lint**

Run:

```bash
npm run check
npm run lint
```

Expected: both clean.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Register.tsx src/components/OtpInput.tsx
git commit -m "feat(web): 2-step register flow with OTP code input"
```

---

## Task 7: AuthModal — 2-step register inside the modal

**Files:**
- Modify: `src/components/AuthModal.tsx`

- [ ] **Step 1: Refactor `AuthModal`**

In `src/components/AuthModal.tsx`, replace the existing `handleRegister` function and the register-tab JSX with the OTP-aware variant.

Find this existing block (the entire register form path) and replace its `handleRegister` + the register tab JSX:

```ts
const handleRegister = async (event: React.FormEvent) => {
  event.preventDefault()
  trackEvent('register_button_click')
  setLoading(true)
  setError('')
  try {
    const response = await api.post('/auth/register', { name, email, phone, password, age: null })
    const payload = response.data.data as AuthPayload
    await finishAuth(payload)
    trackEvent('register_completed')
  } catch (requestError) {
    setError(extractError(requestError, 'Registrasi gagal.'))
  } finally {
    setLoading(false)
  }
}
```

Replace with the OTP-aware register flow. At the top of the component (next to the existing `useState` calls), add:

```ts
const [registerStep, setRegisterStep] = useState<'form' | 'otp'>('form')
const [pendingId, setPendingId] = useState<string | null>(null)
```

Add a new `OtpInput` import at the top of the file:

```ts
import OtpInput from './OtpInput'
```

Replace `handleRegister` with:

```ts
const handleRegister = async (event: React.FormEvent) => {
  event.preventDefault()
  trackEvent('register_button_click')
  setLoading(true)
  setError('')
  try {
    const response = await api.post('/auth/register-init', {
      name,
      email,
      phone,
      password,
      age: null,
    })
    const data = response.data.data as { pendingId: string }
    setPendingId(data.pendingId)
    setRegisterStep('otp')
  } catch (requestError) {
    setError(extractError(requestError, 'Registrasi gagal.'))
  } finally {
    setLoading(false)
  }
}

const handleVerifyOtp = async (otp: string) => {
  if (!pendingId) return
  setLoading(true)
  setError('')
  try {
    const response = await api.post('/auth/register-verify', { pendingId, otp })
    const payload = response.data.data as AuthPayload
    await finishAuth(payload)
    trackEvent('register_completed')
  } catch (requestError) {
    const message = extractError(requestError, 'Verifikasi gagal.')
    setError(message)
    if (message === 'Kode kadaluarsa.' || message === 'Terlalu banyak percobaan.') {
      setRegisterStep('form')
      setPendingId(null)
    }
  } finally {
    setLoading(false)
  }
}

const handleResendOtp = async () => {
  if (!pendingId) return
  setLoading(true)
  setError('')
  try {
    await api.post('/auth/register-resend', { pendingId })
  } catch (requestError) {
    setError(extractError(requestError, 'Gagal kirim ulang kode.'))
  } finally {
    setLoading(false)
  }
}
```

Find the register-tab JSX (the `<form className="space-y-3" onSubmit={handleRegister}>` block) and wrap it with a step toggle. Replace the entire register branch (the `tab === 'login' ? (...) : (...)` register half) with:

```tsx
) : registerStep === 'otp' ? (
  <div className="space-y-4">
    <p className="text-center text-sm font-semibold text-qupu-muted">
      Kode 6 digit dikirim ke <span className="text-qupu-brand-blue">{email}</span>. Berlaku 10 menit.
    </p>
    <OtpInput length={6} disabled={loading} onComplete={handleVerifyOtp} />
    {error && (
      <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
        {error}
      </div>
    )}
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => {
          setRegisterStep('form')
          setPendingId(null)
          setError('')
        }}
        className="flex-1 rounded-full border-2 border-qupu-brand-blue bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-blue"
      >
        ← Ganti email
      </button>
      <button
        type="button"
        onClick={handleResendOtp}
        disabled={loading}
        className="flex-1 rounded-full bg-qupu-brand-blue px-5 py-2.5 font-display text-sm font-extrabold text-white disabled:opacity-60"
      >
        Kirim ulang
      </button>
    </div>
  </div>
) : (
  <form className="space-y-3" onSubmit={handleRegister}>
    {/* …existing register form fields, unchanged… */}
  </form>
)
```

**Important:** keep the existing `<form>` body for the credentials step exactly as it is today (name/email/phone/password fields + submit button). Only the surrounding logic changes.

- [ ] **Step 2: Reset register step on modal close**

Find the `onClose` handler (or wherever `open` flips to false) and ensure `registerStep` is reset. Add this `useEffect` near the other effects in the component:

```tsx
useEffect(() => {
  if (!open) {
    setRegisterStep('form')
    setPendingId(null)
  }
}, [open])
```

- [ ] **Step 3: Typecheck + lint**

Run:

```bash
npm run check
npm run lint
```

Expected: both clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/AuthModal.tsx
git commit -m "feat(web): OTP step inside AuthModal register tab"
```

---

## Task 8: Docs + manual verification

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.env.example` (already touched in Task 2 — verify)

- [ ] **Step 1: Update `CLAUDE.md`**

In `CLAUDE.md`, find the `## Commands` section and update the env vars line to:

```
Required env (`.env`, see `.env.example`): `DATABASE_URL`, `JWT_SECRET`, `PORT`, `APP_ORIGIN`, `VITE_API_BASE_URL`. Optional but required for Google sign-in: `GOOGLE_CLIENT_ID` (server) and `VITE_GOOGLE_CLIENT_ID` (client) — same Google Cloud Web OAuth client id. Required for password registration OTP email delivery: `RESEND_API_KEY` and `RESEND_FROM`.
```

In the `### API surface` section, update the `/api/auth` line to:

```
- `/api/auth` — `POST /register-init` + `POST /register-verify` + `POST /register-resend` (email-OTP gated registration), `POST /login`, `POST /google` (no email-based linking — separate accounts per provider). Access token expiry is role-aware: 12h hard cap for `admin`, 7d for everyone else. Admin sessions also have a 30-minute frontend idle-timeout via `src/hooks/useIdleLogout.ts` — auto-logout after 30m of no mouse/key/scroll/touch activity.
```

In the database bootstrap line, update to:

```
- Database bootstrap is manual: apply `db/schema.sql` then `db/seed.sql` against the Postgres instance in `DATABASE_URL`. For an existing DB, also apply migrations in `db/migrations/` in numeric order. The `supabase/migrations` folder is legacy and not part of the current flow.
```

- [ ] **Step 2: Verify `.env.example` has both new vars**

Confirm `.env.example` includes (added in Task 2):

```
RESEND_API_KEY=
RESEND_FROM=noreply@example.com
```

If missing, append.

- [ ] **Step 3: Typecheck + lint (final)**

Run:

```bash
npm run check
npm run lint
```

Expected: both clean.

- [ ] **Step 4: Manual verification**

Set up env:
1. Add `RESEND_API_KEY` and `RESEND_FROM` to `.env`. For `RESEND_FROM`, use a verified Resend sender (or `onboarding@resend.dev` for testing — only works for sending to your own Resend account email).
2. Restart `npm run dev`.

**Test A: Happy path register**
- Open incognito → `/register`
- Fill form with a real email you control + any phone + any password (≥8 chars)
- Click "Kirim kode verifikasi"
- Expected: redirect to OTP screen, email lands in inbox within ~10 seconds
- Type the 6-digit code
- Expected: redirect to `/onboarding/child`, JWT issued, `users` row exists (`SELECT * FROM users WHERE email = '<your email>'`)

**Test B: Wrong OTP**
- Repeat Test A through the OTP screen
- Type 6 wrong digits
- Expected: "Kode salah." appears, OTP boxes clear
- Try 4 more times (5 total wrong)
- Expected: 5th attempt → "Terlalu banyak percobaan." → returned to credentials step
- DB: `SELECT * FROM pending_registrations WHERE email = '<email>'` should be empty

**Test C: Expired OTP**
- Repeat Test A through the OTP screen
- In another shell: `psql $DATABASE_URL -c "UPDATE pending_registrations SET expires_at = NOW() - INTERVAL '1 minute'"`
- Type the (now-expired) OTP
- Expected: "Kode kadaluarsa." → returned to credentials step

**Test D: Resend cooldown**
- Repeat Test A through the OTP screen
- Wait <60 sec, click "Kirim ulang"
- Expected: button disabled until 60-sec countdown completes
- After 60 sec, click → new email arrives

**Test E: Email collision (squat-prevention)**
- Register `victim@example.com` via Test A end-to-end (real account created)
- Try to register `victim@example.com` again with a different password
- Expected: 409 "Email sudah terdaftar, silakan login." on `register-init`. No email is sent.

**Test F: Separate accounts per provider**
- Register `alice@example.com` via password (Test A)
- In an incognito window, sign in with Google using `alice@example.com`
- Expected: a NEW `users` row is created (different `id`, `password_hash IS NULL`, `google_sub IS NOT NULL`).
- Verify via:
  ```sql
  SELECT id, email, password_hash IS NOT NULL AS has_pw, google_sub IS NOT NULL AS has_google
  FROM users
  WHERE email = 'alice@example.com';
  ```
  Should show two rows: one password, one google.

**Test G: Pre-hijacking attempted (the original PoC)**
- Register `target@example.com` via password (Test A)
- In an incognito window, sign in with Google using `target@example.com`
- Verify via SQL: the password row's `google_sub` is still NULL. The Google login creates its own row. Attacker who registered as `target@example.com` cannot access the Google user's data.

- [ ] **Step 5: Commit docs update**

```bash
git add CLAUDE.md .env.example
git commit -m "docs: update CLAUDE.md for OTP register flow + Resend env vars"
```

---

## Self-review

**Spec coverage check:**
- ✅ Drop UNIQUE on `users.email`, add partial unique → Task 1
- ✅ `pending_registrations` table → Task 1
- ✅ `findOrCreateGoogleUser` no-link refactor → Task 3
- ✅ `register-init` / `register-verify` / `register-resend` endpoints → Task 5
- ✅ Login route guard for `password_hash IS NOT NULL` → Task 5 Step 4
- ✅ Resend integration → Task 2
- ✅ Frontend 2-step register → Task 6
- ✅ AuthModal 2-step register → Task 7
- ✅ All Indonesian error messages match spec → Tasks 4, 5
- ✅ OTP attempt limit (5), expiry (10m), resend cooldown (60s), bcrypt at rest → Task 4
- ✅ Race guard on verify → Task 4 (re-check inside transaction with `FOR UPDATE`)
- ✅ Env vars + docs → Tasks 2, 8
- ✅ `email_verified=false` rejection on Google → Task 3
- ✅ Manual verification covering happy path, wrong OTP, expired OTP, resend, collision, separate accounts, pre-hijacking → Task 8 Step 4

**Placeholder scan:** none.

**Type consistency:** `RegistrationError` declared in Task 4, imported and handled identically in Task 5. `pendingId` is a `string` (UUID) at every site. `expiresAt` is an ISO string consistently.

**No tests:** project has no test runner per `CLAUDE.md`. Verification is `npm run check` + `npm run lint` per task + the manual matrix in Task 8 Step 4.
