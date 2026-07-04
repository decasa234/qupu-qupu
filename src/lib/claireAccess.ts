// Emails allowed into WMI Claire (the finalist warmup) — and, on the
// admin-only deploy, allowed through the admin gate so they can reach the game.
// Temporary allow-list; the API (api/services/wmi/claire.ts) enforces the same
// set server-side, which is the real boundary.
export const CLAIRE_ALLOWED_EMAILS = ['johan@decasa.co.id', 'vicopratama449@gmail.com']

export function isClaireEmail(email: string | null | undefined): boolean {
  return CLAIRE_ALLOWED_EMAILS.includes((email ?? '').trim().toLowerCase())
}
