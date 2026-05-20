// src/lib/referralStorage.ts
//
// Lightweight localStorage shim for the referral code captured from
// ?ref=CODE on the registration landing. Cleared after a successful
// /api/me/referrals/use call.

import api from './api'

const KEY = 'qupu_pending_referral'

export function savePendingReferralCode(code: string): void {
  try {
    if (!code || code.length > 20) return
    localStorage.setItem(KEY, code)
  } catch {
    // localStorage may be disabled in private mode — silently no-op.
  }
}

export function readPendingReferralCode(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function clearPendingReferralCode(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

/**
 * Best-effort POST to /api/me/referrals/use with the stashed code.
 * Always clears localStorage afterward, even on failure — referrals
 * are fire-and-forget by design. Call after a SUCCESSFUL registration
 * (not after login of an existing user).
 */
export async function redeemPendingReferral(): Promise<void> {
  const code = readPendingReferralCode()
  if (!code) return
  try {
    await api.post('/me/referrals/use', { code })
  } catch {
    // ignore — referrals never bubble
  } finally {
    clearPendingReferralCode()
  }
}
