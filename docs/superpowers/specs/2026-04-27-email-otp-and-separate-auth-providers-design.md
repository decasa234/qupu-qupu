---
date: 2026-04-27
topic: email-otp-and-separate-auth-providers
status: design
---

# Email OTP + Separate Auth Providers

## Problem

The current authentication flow has two compounding issues that combine into an OAuth pre-hijacking vulnerability:

1. **`POST /api/auth/register` performs no email verification.** Anyone can register with any email they don't own. The `users.is_verified` and `users.verification_token` columns exist but are unused.
2. **`findOrCreateGoogleUser` auto-links a Google identity to any existing email-matched row** when the row's `google_sub` is `NULL`, regardless of whether that row has a `password_hash`. Combined with item 1, an attacker who pre-registers with a victim's email gets the victim's Google identity merged into the attacker's row. The attacker keeps password access (because `password_hash` is preserved during link), so both parties authenticate to the same `users.id`.

Verified attack chain (TRUE POSITIVE in the security review of this branch):

1. Attacker `POST /api/auth/register` with `email = victim@gmail.com`, attacker's phone, password `P` — succeeds, no verification.
2. Victim later signs in with Google. Backend matches by email, sees `google_sub IS NULL`, runs `UPDATE users SET google_sub = $sub` on the attacker's row. Victim is now logged into the attacker's row.
3. Attacker logs in with `email + P`. Login route only rejects when `password_hash IS NULL`; here it is set. Attacker now has a JWT for the row the victim is using — exposes children, scores, badges, and admin role if the row was promoted.

## Goal

Eliminate the pre-hijacking class entirely by:
- Adding email verification (OTP) on password registration so emails cannot be squatted.
- Treating Google and email/password as **separate identities** that may share an email string but never share a `users.id`. No automatic linking. Vulnerability has no surface left.

## Non-Goals

- Manual "Connect Google" linking from a settings page. Out of scope; can be added later if real users ask for it.
- Phone OTP, SMS, or WhatsApp verification.
- Password reset email flow. Existing `reset_token` columns remain unused; not part of this change.
- Migration of existing users: the dev DB will be wiped + re-seeded. No production users yet.

## Architecture

### Data model changes

**`users` table:**
- Drop the table-level `UNIQUE` on `email`.
- Add partial unique index: `UNIQUE (email) WHERE password_hash IS NOT NULL`. At most one password account per email.
- The existing `UNIQUE (google_sub)` is implicitly partial via NULLs in Postgres; left as-is.
- `phone` UNIQUE: keep as-is. NULL allows many; non-NULL must be unique. Register-init enforces uniqueness against password rows only.

**New table `pending_registrations`:**

```sql
CREATE TABLE pending_registrations (
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
CREATE INDEX idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX idx_pending_registrations_expires_at ON pending_registrations(expires_at);
```

`expires_at` = `NOW() + 10 minutes`. `last_sent_at` powers the 60-second resend cooldown.

### OAuth changes

`api/services/oauth.ts` `findOrCreateGoogleUser` is reduced to:

1. Look up by `google_sub`. If found → return the user.
2. Reject if `claims.emailVerified === false`.
3. INSERT a brand-new `users` row with `google_sub`, `email`, `name`, `role = 'parent'`, `is_verified = TRUE`. Do **not** look up by email. Do **not** check for collision with password rows.

Result: A human with email `x@y.com` who registered with a password and later signs in with Google ends up with **two** independent `users` rows. They are different accounts. Children/scores/badges do not merge. This trade-off is accepted.

### Endpoints

```
POST /api/auth/register-init
  body: { email, phone, name, age?, password }
  - Joi validate.
  - 409 if a password user with this email already exists, or a password user with this phone already exists.
  - bcrypt.hash(password, 12).
  - Generate 6-digit OTP via crypto.randomInt; bcrypt.hash(otp, 10).
  - DELETE any existing pending_registrations rows for this email.
  - INSERT new row with expires_at = NOW() + 10m, last_sent_at = NOW().
  - Send OTP via email (Resend).
  - Return: 201 { pendingId, expiresAt }.

POST /api/auth/register-verify
  body: { pendingId, otp }
  - SELECT pending WHERE id = pendingId AND expires_at > NOW() (FOR UPDATE inside a transaction).
  - 400 "Kode kadaluarsa." if not found.
  - 429 "Terlalu banyak percobaan." if attempts_count >= 5; DELETE the row.
  - bcrypt.compare(otp, otp_hash).
  - On mismatch: UPDATE attempts_count += 1; return 400 "Kode salah."
  - On match (still inside transaction):
      - Re-check no password user exists for this email/phone (race guard). If exists → 409.
      - INSERT users from pending data.
      - DELETE pending row.
      - Issue access + refresh tokens.
      - Return 201 { user, token, refreshToken }.

POST /api/auth/register-resend
  body: { pendingId }
  - SELECT pending WHERE id = pendingId AND expires_at > NOW().
  - 400 "Kode kadaluarsa." if not found.
  - 429 if last_sent_at > NOW() - 60 seconds.
  - Generate new OTP, bcrypt hash; UPDATE otp_hash, attempts_count = 0, expires_at = NOW() + 10m, last_sent_at = NOW().
  - Send email.
  - Return 200 { expiresAt }.

POST /api/auth/login   (unchanged behavior)
  - SELECT users WHERE email = $1 AND password_hash IS NOT NULL.
  - 401 if not found.
  - bcrypt.compare; 401 on mismatch.
  - Issue tokens.

POST /api/auth/google  (changed: no email-based linking)
  - verifyGoogleIdToken (existing).
  - findOrCreateGoogleUser as described above.
  - Issue tokens.

POST /api/auth/register  (legacy)
  - Removed. Frontend no longer calls it.
```

### Email service

`api/services/email.ts`:
- Single export `sendOtpEmail(to: string, name: string, otp: string): Promise<void>`.
- Uses Resend's REST API directly via `fetch` (no SDK to keep deps small) with `RESEND_API_KEY`.
- From address: `noreply@<APP_DOMAIN>` configured via env `RESEND_FROM`.
- Throws on non-2xx response.

Email body (plain text + matching HTML):

```
Subject: Kode verifikasi QUPU

Hai {name},

Kode verifikasi QUPU kamu: 123456

Berlaku 10 menit. Jangan kasih kode ini ke siapa pun — staf QUPU
tidak akan pernah minta kode ini.

Kalau bukan kamu yang daftar, abaikan email ini.
```

### Frontend register flow

`src/pages/Register.tsx` becomes a 2-step form:

**Step 1 — credentials form** (current form, minus the immediate registration call):
- On submit → `POST /auth/register-init` → store `{ pendingId, expiresAt }` in component state → switch to step 2.
- Errors display inline (409 etc.).

**Step 2 — OTP form:**
- Six single-character `<input>` boxes that auto-focus the next box on type, support paste of full 6-digit string, support Backspace to step back.
- Countdown timer to `expiresAt` displayed.
- "Resend" button disabled for 60 sec after entering step 2; counts down visibly.
- "Back" button returns to step 1, drops `pendingId`.
- On full code entry → `POST /auth/register-verify`. On 200 → `login()` + navigate to `/onboarding/child` (same as existing).
- On 400 "Kode kadaluarsa." or 429 → return to step 1 with a notice.

Google sign-in button on the standalone register page continues to call `/auth/google` directly. No OTP for Google flow.

### AuthModal (score-first flow)

The inline auth modal on `/videos/:slug` already supports a tabbed login/register interior. Replace the register tab's submit with the new 2-step flow inside the modal. Tab toggle persists across the OTP step. Pending score replay continues to work because the JWT issuance happens at the same end of the flow.

## Error handling summary

| Case | Status | User message |
|---|---|---|
| Email already a password user | 409 | "Email sudah terdaftar, silakan login." |
| Phone already a password user | 409 | "No. HP sudah terdaftar." |
| OTP wrong | 400 | "Kode salah." |
| OTP expired (or pending row missing) | 400 | "Kode kadaluarsa." |
| 5 wrong attempts | 429 | "Terlalu banyak percobaan." |
| Resend within 60 sec | 429 | "Tunggu sebentar sebelum kirim ulang." |
| Resend send fail / Init send fail | 500 | "Gagal kirim email. Cek koneksi atau coba beberapa saat lagi." |
| Google `email_verified=false` | 401 | "Email Google belum terverifikasi." |

## Security properties

- **No more squatting:** an attacker cannot create a `users` row for an email they do not control because OTP delivery requires inbox access.
- **No more pre-hijacking:** Google login never modifies an existing `users` row that wasn't created via Google. The two providers cannot collide.
- **OTP brute force resistance:** 5-attempt limit per pending row (≈ 1 in 200,000 chance of guessing within limit), bcrypt-hashed at rest, 10-minute expiry, 60-sec resend cooldown.
- **No info leak:** register-init's 409 response is the only signal of email availability. Register-verify never reveals whether a `pendingId` was valid vs the OTP wrong vs already verified — uniformly returns "Kode kadaluarsa." or "Kode salah."

## Environment

New env vars:

```
RESEND_API_KEY=re_xxx
RESEND_FROM=noreply@qupu.id
```

Documented in `.env.example` and `CLAUDE.md`.

## Migration

`db/migrations/0006_email_otp_and_separate_providers.sql`:

```sql
-- Drop table-level UNIQUE on users.email; replace with partial unique constrained to password users.
ALTER TABLE users DROP CONSTRAINT users_email_key;
CREATE UNIQUE INDEX users_email_password_unique
  ON users(email)
  WHERE password_hash IS NOT NULL;

-- Pending registrations (email-OTP staging area).
CREATE TABLE pending_registrations (
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
CREATE INDEX idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX idx_pending_registrations_expires_at ON pending_registrations(expires_at);
```

Applied with `psql "$DATABASE_URL" -f db/migrations/0006_email_otp_and_separate_providers.sql`.
`db/schema.sql` updated to mirror for fresh installs.

## Acceptance criteria

- A user can register a new email/password account only by completing the OTP step.
- Two `users` rows can exist with the same `email`: at most one with `password_hash IS NOT NULL`, optionally one with `google_sub IS NOT NULL`. They are distinct accounts.
- A Google login never modifies a row that has `password_hash` set.
- The pre-hijacking PoC from the security review (squat → Google login → password login as victim) no longer reaches the takeover step. Verified by reproducing steps 1–3 against the new flow and observing two separate `users.id` values.
- The score-first auth modal on `/videos/:slug` still works end-to-end via Google and via email-OTP register.
- All existing tests / typecheck / lint pass.

## Out of scope (deferred)

- Manual "Connect Google" linking from authenticated session.
- Rate-limiting register-init by IP (would require Redis or in-memory limiter).
- HTML email template polish — plain text + minimal HTML is enough for v1.
- Email change flow for existing users.
- Password reset OTP (separate spec when needed).
