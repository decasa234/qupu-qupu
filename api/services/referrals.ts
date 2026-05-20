// api/services/referrals.ts
//
// Plan 5c — parent-to-parent referrals.
//
// Each user has at most one lifetime referral code. Each new user can
// be credited to at most one referrer (via UNIQUE on referral_uses.referred_user_id).
//
// Frontend flow:
//   1. Visitor lands on /register?ref=CODE
//   2. Register.tsx stashes the code in localStorage
//   3. After successful registration + login, frontend POSTs the code
//      to /api/me/referrals/use. Self-referrals, duplicates, and
//      invalid codes are silently swallowed by the route handler.

import { queryOne, withTransaction } from '../db.js'

export interface ReferralCodeResult {
  code: string
  shareUrl: string  // e.g. https://qupu.id/register?ref=ABC123
}

function generateRandomCode(): string {
  // 8 chars, alphanumeric, uppercase. Plenty of entropy for v1 scale.
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // skip easy-confuse glyphs
  let out = ''
  for (let i = 0; i < 8; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

function buildShareUrl(code: string): string {
  const origin =
    process.env.APP_ORIGIN?.split(',')[0]?.trim() ||
    'https://qupu.id'
  return `${origin}/register?ref=${code}`
}

/**
 * Idempotent. Returns the caller's lifetime referral code, generating
 * one if none exists. Retries on the rare UNIQUE collision.
 */
export async function getOrCreateReferralCode(
  userId: string,
): Promise<ReferralCodeResult> {
  return withTransaction(async (client) => {
    const existing = await queryOne<{ code: string }>(
      `SELECT code FROM user_referral_codes WHERE user_id = $1`,
      [userId],
      client,
    )
    if (existing) {
      return { code: existing.code, shareUrl: buildShareUrl(existing.code) }
    }

    // Up to 5 attempts on collision — single-digit probability even at
    // 100k users (8 chars × 31 alphabet ≈ 8.5e11 space).
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRandomCode()
      const inserted = await queryOne<{ code: string }>(
        `INSERT INTO user_referral_codes (user_id, code)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING
           RETURNING code`,
        [userId, code],
        client,
      )
      if (inserted) {
        return { code: inserted.code, shareUrl: buildShareUrl(inserted.code) }
      }
    }
    throw new Error('Failed to generate referral code after 5 attempts')
  })
}

export type RecordReferralOutcome =
  | { recorded: true; referrerUserId: string }
  | { recorded: false; reason: 'invalid_code' | 'self_referral' | 'already_referred' }

/**
 * Records a referral use. Best-effort; never throws on user error.
 * Returns an outcome the caller can log but typically ignores.
 */
export async function recordReferralUse(
  referredUserId: string,
  code: string,
): Promise<RecordReferralOutcome> {
  return withTransaction(async (client) => {
    const codeRow = await queryOne<{ user_id: string }>(
      `SELECT user_id FROM user_referral_codes WHERE code = $1`,
      [code],
      client,
    )
    if (!codeRow) return { recorded: false, reason: 'invalid_code' }
    if (codeRow.user_id === referredUserId) {
      return { recorded: false, reason: 'self_referral' }
    }

    // Idempotent insert. If the referred user is already credited to
    // someone (including this same referrer), the UNIQUE catches.
    const inserted = await queryOne<{ id: string }>(
      `INSERT INTO referral_uses (referrer_user_id, referred_user_id)
         VALUES ($1, $2)
         ON CONFLICT (referred_user_id) DO NOTHING
         RETURNING id`,
      [codeRow.user_id, referredUserId],
      client,
    )
    if (!inserted) return { recorded: false, reason: 'already_referred' }

    return { recorded: true, referrerUserId: codeRow.user_id }
  })
}
