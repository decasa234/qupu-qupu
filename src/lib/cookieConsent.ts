export const COOKIE_CONSENT_KEY = 'qupu_cookie_consent'

export type CookieConsent = 'accepted' | 'declined' | 'undecided'

type StoredCookieConsent = Exclude<CookieConsent, 'undecided'>

export function getCookieConsent(): CookieConsent {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY)
    return value === 'accepted' || value === 'declined' ? value : 'undecided'
  } catch {
    return 'undecided'
  }
}

export function setCookieConsent(consent: StoredCookieConsent): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, consent)
  } catch {
    // ignore storage failures
  }
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === 'accepted'
}
