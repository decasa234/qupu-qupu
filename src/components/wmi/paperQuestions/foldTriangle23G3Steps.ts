// WMI-23F3A-Q17 (2023 Grade 3 Final) — folded triangle, angle chase.
//
// "Triangle ABC is folded along EF (E on AB, F on AC) so that B→B' and C→C'.
//  Given ∠EAF = 60° and ∠B'EA = 95°, find ∠AFC'."  Answer: 25 (fill-in).
//
// METHOD (deduce, don't assert — concrete arithmetic per beat). The fold is a
// reflection across line EF, so it preserves angles:
//
//   1. GOAL. We want ∠AFC'. We know ∠EAF = 60° and ∠B'EA = 95°.
//
//   2. Triangle AEF. Its three angles sum to 180°, so
//        ∠AEF + ∠AFE = 180 − ∠EAF = 180 − 60 = 120°.
//
//   3. At E, the points A, E, B lie on a straight line. Folding reflects ∠FEB
//      onto ∠FEB', and ∠FEB = ∠FEB' = ∠AEF (reflection of the same angle), so
//        ∠B'EA = 180 − 2·∠AEF.
//      Given ∠B'EA = 95°  ⇒  ∠AEF = (180 − 95) / 2 = 42.5°.
//
//   4. From step 2, ∠AFE = 120 − 42.5 = 77.5°. At F, the points A, F, C lie on a
//      straight line, and the same fold gives
//        ∠AFC' = 180 − 2·∠AFE = 180 − 2·77.5 = 180 − 155 = 25°.
//
//   5. SHORTCUT CHECK. Adding the two straight-line equations:
//        ∠B'EA + ∠AFC' = (180 − 2·∠AEF) + (180 − 2·∠AFE)
//                      = 360 − 2·(∠AEF + ∠AFE) = 360 − 2·120 = 120 = 2·∠EAF.
//      So ∠AFC' = 2·60 − 95 = 120 − 95 = 25°. ✓  Answer = 25.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. The numeric givens live in GIVEN so every beat stays bound to
// one source of truth; only the FINAL beat asks the figure to mark ∠AFC' = 25°.

export type Lang = 'en' | 'id'

// ---- the single source of numeric truth ------------------------------------
export const GIVEN = {
  /** ∠EAF — the apex angle of triangle AEF. */
  apex: 60,
  /** ∠B'EA — the angle the folded flap makes at E, along line AB. */
  bea: 95,
} as const

// Derived, computed once (kept exported so the component never re-asserts them).
const SUM_AEF_AFE = 180 - GIVEN.apex // 120
const ANGLE_AEF = (180 - GIVEN.bea) / 2 // 42.5
const ANGLE_AFE = SUM_AEF_AFE - ANGLE_AEF // 77.5
export const ANSWER = 180 - 2 * ANGLE_AFE // 25

// Pretty-printers: keep ".5" but drop a trailing ".0" so "120" stays "120".
function deg(n: number): string {
  return (Number.isInteger(n) ? `${n}` : `${n}`) + '°'
}

/** Which angle-ledger rows are known by this beat (fills in top → bottom). */
export interface LedgerRow {
  /** Stable key for AnimatePresence. */
  key: string
  /** Left label, e.g. "∠AEF + ∠AFE". */
  label: string
  /** Right value, e.g. "120°". */
  value: string
  /** Highlight this row as the one just derived this beat. */
  fresh?: boolean
}

export interface FoldStep {
  /** Angle-ledger rows known so far (cumulative, fills in). */
  ledger: LedgerRow[]
  /** The one-line equation surfaced this beat (null on the goal beat). */
  formula: string | null
  /** Ask the figure to mark ∠AFC' = 25° at F (final beat only). */
  showAnswer: boolean
  /** True only on the final winning beat (hold 0). */
  result: boolean
  caption: string
  hold: number
}

export interface FoldStoryboard {
  answer: number
  given: typeof GIVEN
  steps: FoldStep[]
  finalIndex: number
}

export function buildFoldTriangle23G3Steps(lang: Lang): FoldStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Ledger rows, introduced one per deduction beat. Reused by reference so each
  // later beat carries the rows from earlier beats (cumulative reveal).
  const rowGiven1: LedgerRow = { key: 'apex', label: '∠EAF', value: deg(GIVEN.apex) }
  const rowGiven2: LedgerRow = { key: 'bea', label: "∠B'EA", value: deg(GIVEN.bea) }
  const rowSum: LedgerRow = { key: 'sum', label: '∠AEF + ∠AFE', value: deg(SUM_AEF_AFE) }
  const rowAEF: LedgerRow = { key: 'aef', label: '∠AEF', value: deg(ANGLE_AEF) }
  const rowAFE: LedgerRow = { key: 'afe', label: '∠AFE', value: deg(ANGLE_AFE) }
  const rowAns: LedgerRow = { key: 'afc', label: "∠AFC'", value: deg(ANSWER) }

  const fresh = (r: LedgerRow): LedgerRow => ({ ...r, fresh: true })

  const steps: FoldStep[] = [
    // 1. GOAL — show the two givens, name the target.
    {
      ledger: [rowGiven1, rowGiven2],
      formula: null,
      showAnswer: false,
      result: false,
      hold: 2600,
      caption: t(
        "The flap BC folds along EF, so B→B' and C→C'. We know ∠EAF = 60° and ∠B'EA = 95°. Find ∠AFC'.",
        "Lipatan BC dilipat sepanjang EF, jadi B→B' dan C→C'. Kita tahu ∠EAF = 60° dan ∠B'EA = 95°. Cari ∠AFC'.",
      ),
    },
    // 2. Triangle AEF: angles sum to 180°.
    {
      ledger: [rowGiven1, rowGiven2, fresh(rowSum)],
      formula: t(
        `∠AEF + ∠AFE = 180 − 60 = ${SUM_AEF_AFE}°`,
        `∠AEF + ∠AFE = 180 − 60 = ${SUM_AEF_AFE}°`,
      ),
      showAnswer: false,
      result: false,
      hold: 2500,
      caption: t(
        'In triangle AEF the three angles add to 180°. Take away ∠EAF = 60° and the other two share 120°.',
        'Di segitiga AEF ketiga sudut berjumlah 180°. Kurangi ∠EAF = 60°, dua sudut lain berbagi 120°.',
      ),
    },
    // 3. At E: straight line A-E-B, fold gives ∠B'EA = 180 − 2·∠AEF ⇒ ∠AEF.
    {
      ledger: [rowGiven1, rowGiven2, rowSum, fresh(rowAEF)],
      formula: t(
        `∠AEF = (180 − 95) ÷ 2 = ${ANGLE_AEF}°`,
        `∠AEF = (180 − 95) ÷ 2 = ${ANGLE_AEF}°`,
      ),
      showAnswer: false,
      result: false,
      hold: 2600,
      caption: t(
        'A, E, B sit on a straight line. The fold copies ∠AEF onto the other side, so ∠B′EA = 180 − 2·∠AEF = 95 ⇒ ∠AEF = 42.5°.',
        'A, E, B segaris lurus. Lipatan menyalin ∠AEF ke sisi lain, jadi ∠B′EA = 180 − 2·∠AEF = 95 ⇒ ∠AEF = 42,5°.',
      ),
    },
    // 4. ∠AFE = 120 − 42.5, then at F: ∠AFC' = 180 − 2·∠AFE = 25.
    {
      ledger: [rowGiven1, rowGiven2, rowSum, rowAEF, fresh(rowAFE)],
      formula: t(
        `∠AFE = 120 − 42.5 = ${ANGLE_AFE}°`,
        `∠AFE = 120 − 42,5 = ${ANGLE_AFE}°`,
      ),
      showAnswer: false,
      result: false,
      hold: 2500,
      caption: t(
        'So ∠AFE = 120 − 42.5 = 77.5°. A, F, C are also straight, and the fold gives ∠AFC′ = 180 − 2·77.5 = 25°.',
        'Maka ∠AFE = 120 − 42,5 = 77,5°. A, F, C juga segaris, dan lipatan memberi ∠AFC′ = 180 − 2·77,5 = 25°.',
      ),
    },
    // 5. CONFIRM via the shortcut, mark the figure, land on the answer.
    {
      ledger: [rowGiven1, rowGiven2, rowSum, rowAEF, rowAFE, fresh(rowAns)],
      formula: t(
        `∠B'EA + ∠AFC' = 2·60 = 120  ⇒  ∠AFC' = 120 − 95 = ${ANSWER}°`,
        `∠B'EA + ∠AFC' = 2·60 = 120  ⇒  ∠AFC' = 120 − 95 = ${ANSWER}°`,
      ),
      showAnswer: true,
      result: true,
      hold: 0,
      caption: t(
        `Quick check: ∠B'EA + ∠AFC' always equals 2·∠EAF = 120°, so ∠AFC' = 120 − 95 = ${ANSWER}°.`,
        `Cek cepat: ∠B'EA + ∠AFC' selalu sama dengan 2·∠EAF = 120°, jadi ∠AFC' = 120 − 95 = ${ANSWER}°.`,
      ),
    },
  ]

  return { answer: ANSWER, given: GIVEN, steps, finalIndex: steps.length - 1 }
}
