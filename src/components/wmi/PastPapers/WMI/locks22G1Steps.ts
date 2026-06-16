import type { Lang } from '../concepts/explainers/makeTenSteps'

export const LOCKS_ANSWER = '3'

/**
 * WMI-22F1A-Q13 — "which locks does the key open?" (Grade 1).
 *
 * Six locks stand in a row (0-based positions), each printed with a little
 * sum. The key opens a lock only when its value is MORE than 10 AND LESS
 * than 15 (i.e. 11, 12, 13 or 14):
 *
 *   lock 0:  6 + 5      = 11   ✓ open  (more than 10, less than 15)
 *   lock 1:  14 − 4     = 10   ✗       (not more than 10)
 *   lock 2:  18 − 6     = 12   ✓ open
 *   lock 3:  7 + 9      = 16   ✗       (too big — not less than 15)
 *   lock 4:  15 − 3 − 3 = 9    ✗       (too small — not more than 10)
 *   lock 5:  4 + 6 + 4  = 14   ✓ open
 *
 * Three locks open (positions 0, 2, 5) → the answer is 3.
 *
 * The animation checks ONE lock per beat: it works out the sum, compares it to
 * the 10 < n < 15 window, and either opens the lock (✓) or rejects it (✗) with
 * the reason visible. The static figure never reveals which locks open — the
 * animator lights one lock at a time with `litIndex` and accumulates the open
 * ones in `openIndexes`.
 */
export const LOCK_VALUES = [11, 10, 12, 16, 9, 14] as const

export interface LocksStep {
  /** 0-based locks shown OPEN so far (cumulative). Passed to <LockRow openIndexes>. */
  openIndexes: number[]
  /** 0-based lock being checked THIS beat (highlighted). Passed to <LockRow litIndex>. */
  litIndex?: number
  /** The arithmetic shown big this beat, e.g. "6 + 5 = 11" (optional on framing beats). */
  build?: string
  /** True when this beat's lock OPENS (✓) — drives a green chip. */
  pass?: boolean
  /** True when this beat's lock STAYS LOCKED (✗) — drives a gray/red chip. */
  fail?: boolean
  caption: string
  /** ms to hold this beat before advancing. Rejections linger; the win sits at 0. */
  hold: number
  /** True only on the final result beat — flips the caption box green. */
  result: boolean
}

export interface LocksStoryboard {
  answer: string
  steps: LocksStep[]
  finalIndex: number
}

export function buildLocks22G1Steps(lang: Lang): LocksStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: LocksStep[] = [
    {
      // 1. State the rule with all six locks shut.
      openIndexes: [],
      hold: 2600,
      result: false,
      caption: t(
        'Six locks! The key only opens a lock whose number is MORE than 10 AND LESS than 15.',
        'Enam gembok! Kunci hanya membuka gembok yang angkanya LEBIH dari 10 DAN KURANG dari 15.',
      ),
    },
    {
      // 2. Lock 1: 6 + 5 = 11 → between 10 and 15 → opens.
      openIndexes: [0],
      litIndex: 0,
      build: '6 + 5 = 11',
      pass: true,
      hold: 2400,
      result: false,
      caption: t(
        'Lock 1: 6 + 5 = 11. 11 is between 10 and 15 — it OPENS! ✓',
        'Gembok 1: 6 + 5 = 11. 11 ada di antara 10 dan 15 — TERBUKA! ✓',
      ),
    },
    {
      // 3. Lock 2: 14 − 4 = 10 → not MORE than 10 → stays locked.
      openIndexes: [0],
      litIndex: 1,
      build: '14 − 4 = 10',
      fail: true,
      hold: 2100,
      result: false,
      caption: t(
        'Lock 2: 14 − 4 = 10. 10 is NOT more than 10, so it stays locked. ✗',
        'Gembok 2: 14 − 4 = 10. 10 TIDAK lebih dari 10, jadi tetap terkunci. ✗',
      ),
    },
    {
      // 4. Lock 3: 18 − 6 = 12 → between → opens.
      openIndexes: [0, 2],
      litIndex: 2,
      build: '18 − 6 = 12',
      pass: true,
      hold: 2400,
      result: false,
      caption: t(
        'Lock 3: 18 − 6 = 12. 12 is between 10 and 15 — it OPENS! ✓',
        'Gembok 3: 18 − 6 = 12. 12 ada di antara 10 dan 15 — TERBUKA! ✓',
      ),
    },
    {
      // 5. Lock 4: 7 + 9 = 16 → not LESS than 15 → stays locked.
      openIndexes: [0, 2],
      litIndex: 3,
      build: '7 + 9 = 16',
      fail: true,
      hold: 2100,
      result: false,
      caption: t(
        'Lock 4: 7 + 9 = 16. 16 is too big — not less than 15. Stays locked. ✗',
        'Gembok 4: 7 + 9 = 16. 16 terlalu besar — tidak kurang dari 15. Tetap terkunci. ✗',
      ),
    },
    {
      // 6. Lock 5: 15 − 3 − 3 = 9 → not MORE than 10 → stays locked.
      openIndexes: [0, 2],
      litIndex: 4,
      build: '15 − 3 − 3 = 9',
      fail: true,
      hold: 2100,
      result: false,
      caption: t(
        'Lock 5: 15 − 3 − 3 = 9. 9 is too small — not more than 10. Stays locked. ✗',
        'Gembok 5: 15 − 3 − 3 = 9. 9 terlalu kecil — tidak lebih dari 10. Tetap terkunci. ✗',
      ),
    },
    {
      // 7. Lock 6: 4 + 6 + 4 = 14 → between → opens.
      openIndexes: [0, 2, 5],
      litIndex: 5,
      build: '4 + 6 + 4 = 14',
      pass: true,
      hold: 2400,
      result: false,
      caption: t(
        'Lock 6: 4 + 6 + 4 = 14. 14 is between 10 and 15 — it OPENS! ✓',
        'Gembok 6: 4 + 6 + 4 = 14. 14 ada di antara 10 dan 15 — TERBUKA! ✓',
      ),
    },
    {
      // 8. Count the open locks → 3.
      openIndexes: [0, 2, 5],
      hold: 0,
      result: true,
      build: '3',
      caption: t(
        `Count the open locks: 11, 12, 14 → ${LOCKS_ANSWER} locks open.`,
        `Hitung gembok yang terbuka: 11, 12, 14 → ${LOCKS_ANSWER} gembok terbuka.`,
      ),
    },
  ]

  return {
    answer: LOCKS_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
