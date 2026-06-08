// Pure per-concept comprehension model. No DB access.
export type ComprehensionTier = 0 | 1 | 2 | 3 | 4
export const PROFICIENT_TIER: ComprehensionTier = 3
export const TIER_KEY = ['belum', 'baru', 'berlatih', 'mahir', 'dikuasai'] as const

export interface AttemptSignal {
  attempts: number
  correct: number
  recent: boolean[] // oldest -> newest
}

const C_BERLATIH = 3
const C_MAHIR = 6
const C_DIKUASAI = 10
const WINDOW = 7
const MAHIR_RECENT = 5     // >=5 of last 7
const DIKUASAI_STREAK = 4  // last 4 in a row
const DIKUASAI_RECENT = 6  // or >=6 of last 7

function recentCorrect(recent: boolean[]): number {
  return recent.slice(-WINDOW).filter(Boolean).length
}
export function trailingStreak(recent: boolean[]): number {
  let s = 0
  for (let i = recent.length - 1; i >= 0 && recent[i]; i--) s++
  return s
}

function rawTier(sig: AttemptSignal): ComprehensionTier {
  if (sig.attempts <= 0) return 0
  const rc = recentCorrect(sig.recent)
  const streak = trailingStreak(sig.recent)
  if (sig.correct >= C_DIKUASAI && (streak >= DIKUASAI_STREAK || rc >= DIKUASAI_RECENT)) return 4
  if (sig.correct >= C_MAHIR && rc >= MAHIR_RECENT) return 3
  if (sig.correct >= C_BERLATIH) return 2
  return 1
}

function pctFor(sig: AttemptSignal, tier: ComprehensionTier): number {
  const c = sig.correct
  if (tier === 0) return 0
  if (tier === 4) return 100
  if (tier === 3) {
    const p = 70 + Math.min(1, Math.max(0, (c - C_MAHIR) / (C_DIKUASAI - C_MAHIR))) * 30
    return Math.round(Math.min(92, p))
  }
  if (tier === 2) {
    const p = 35 + Math.min(1, Math.max(0, (c - C_BERLATIH) / (C_MAHIR - C_BERLATIH))) * 35
    return Math.round(Math.min(65, p))
  }
  return Math.round(10 + Math.min(1, c / C_BERLATIH) * 25)
}

export interface Comprehension {
  tier: ComprehensionTier
  pct: number // 0..100
  streak: number
}

export function computeComprehension(sig: AttemptSignal): Comprehension {
  const tier = rawTier(sig)
  return { tier, pct: pctFor(sig, tier), streak: trailingStreak(sig.recent) }
}
