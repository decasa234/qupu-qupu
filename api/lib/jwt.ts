// api/lib/jwt.ts
//
// Single source of truth for JWT signing and verification.
//
// Why this exists: the signer (routes/auth.ts), the main verifier
// (middleware/auth.ts), and the analytics verifier each used their own
// inline `process.env.JWT_SECRET || '<literal>'` fallback — and the
// literals DISAGREED, so a missing JWT_SECRET silently produced tokens that
// some verifiers accepted and others rejected. Centralizing here guarantees
// one secret, fails fast when it is missing/weak in production, and pins the
// algorithm to HS256 so a token can never be presented under a different
// (e.g. "none") algorithm.

import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken'

const ALGORITHM = 'HS256' as const

// Known placeholder/default values that must never be a real production secret.
const WEAK_SECRETS = new Set([
  'change-me',
  'secret',
  'your-super-secret-jwt-key-change-in-production',
])

const MIN_SECRET_LENGTH = 32

// Stable fallback used ONLY under the test runner (NODE_ENV==='test'), so unit
// tests that touch token issuance don't require a configured environment.
// Unreachable in dev or production — guarded by the NODE_ENV checks below.
const TEST_FALLBACK_SECRET = 'qupu-test-secret-not-for-production-use'

let cached: string | null = null

/**
 * Returns the JWT signing secret, or throws if the environment is not safe
 * to issue/verify tokens in. Memoized for the process lifetime.
 */
export function getJwtSecret(): string {
  if (cached) return cached

  const secret = process.env.JWT_SECRET
  const nodeEnv = process.env.NODE_ENV

  if (!secret) {
    if (nodeEnv === 'test') {
      cached = TEST_FALLBACK_SECRET
      return cached
    }
    throw new Error(
      'JWT_SECRET is not set. Refusing to start without a signing secret.',
    )
  }

  if (
    nodeEnv === 'production' &&
    (WEAK_SECRETS.has(secret) || secret.length < MIN_SECRET_LENGTH)
  ) {
    throw new Error(
      `JWT_SECRET is a known default or shorter than ${MIN_SECRET_LENGTH} characters. ` +
        'Set a unique, high-entropy value in production.',
    )
  }

  cached = secret
  return cached
}

/** Call once at startup to fail fast rather than on the first auth request. */
export function assertJwtSecret(): void {
  getJwtSecret()
}

export function signToken(
  payload: string | object | Buffer,
  options: SignOptions = {},
): string {
  return jwt.sign(payload, getJwtSecret(), { algorithm: ALGORITHM, ...options })
}

/** Verifies a token with the algorithm pinned. Throws on any failure. */
export function verifyToken<T = JwtPayload>(token: string): T {
  return jwt.verify(token, getJwtSecret(), { algorithms: [ALGORITHM] }) as T
}

/** Test-only: clear the memoized secret between tests that mutate the env. */
export function _resetJwtSecretCacheForTesting(): void {
  cached = null
}
