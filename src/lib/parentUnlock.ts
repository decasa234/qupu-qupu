// src/lib/parentUnlock.ts
//
// Browser-session unlock state for the PIN-gated parent area. A correct PIN
// (or setting the PIN, which proves the same thing) marks the session
// unlocked for that user; the flag lives in sessionStorage so a new tab or
// browser session locks again, but in-session navigation never re-prompts.
function unlockKey(userId: string): string {
  return `qupu_parent_unlock:${userId}`
}

export function isParentUnlocked(userId: string): boolean {
  try {
    return sessionStorage.getItem(unlockKey(userId)) === '1'
  } catch {
    return false
  }
}

export function markParentUnlocked(userId: string): void {
  try {
    sessionStorage.setItem(unlockKey(userId), '1')
  } catch {
    /* private mode — unlock survives in React state for this view only */
  }
}
