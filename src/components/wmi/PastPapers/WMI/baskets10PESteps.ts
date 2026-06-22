/**
 * IKMC-22-PE-Q10 — storyboard for "Which basket is the puppy sleeping in?"
 *
 * Five animals, five baskets:
 *   • Koala + Fox  → same pattern AND shape → polka-dot tubs (baskets 2 & 4)
 *   • Kangaroo + Ostrich → same pattern (different shape) → diagonal weave (baskets 1 & 3)
 *   • Puppy → remaining basket → basket 5 (horizontal brick picnic)
 *
 * Key quantities (from breakdown.quantities in the seed):
 *   Koala + fox:          same pattern AND shape → 2 polka-dot tub baskets
 *   Kangaroo + ostrich:   same pattern           → 2 weave baskets
 *   Puppy:                the one left over      → basket 5  (answer E)
 *
 * Teaching walk, one idea per beat:
 *   0. intro        — show all 5 baskets, state the puzzle.
 *   1. koala-fox    — highlight baskets 2 & 4 (same dots + same shape).
 *   2. kang-ostrich — highlight baskets 1 & 3 (same weave, different shape).
 *   3. process      — the 4 assigned baskets are covered; 1 remains.
 *   4. result       — basket 5 = puppy → answer E (green).
 *
 * Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.
 */

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'koala-fox' | 'kang-ostrich' | 'process' | 'result'

export interface AnimBeat {
  phase: PhaseId
  /** Which basket indices (0-based) to highlight (koala/fox pair). */
  highlightKoalaFox: boolean
  /** Which basket indices (0-based) to highlight (kang/ostrich pair). */
  highlightKangOstrich: boolean
  /** Highlight the puppy basket (index 4). */
  highlightPuppy: boolean
  /** Equation / deduction line; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Baskets10Storyboard {
  steps: AnimBeat[]
  finalIndex: number
}

export function buildBaskets10PESteps(lang: Lang): Baskets10Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightKoalaFox: false,
      highlightKangOstrich: false,
      highlightPuppy: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'One animal sleeps in each basket. Use the clues to figure out which basket belongs to the puppy.',
        'Satu hewan tidur di masing-masing keranjang. Gunakan petunjuk untuk menemukan keranjang milik anak anjing.',
      ),
    },

    // Beat 1 — koala + fox share same pattern AND shape
    {
      phase: 'koala-fox',
      highlightKoalaFox: true,
      highlightKangOstrich: false,
      highlightPuppy: false,
      equation: t('Baskets 2 & 4: same dots + same shape', 'Keranjang 2 & 4: titik sama + bentuk sama'),
      hold: 2600,
      result: false,
      caption: t(
        'Koala and fox sleep in baskets with the SAME pattern AND shape. → Baskets 2 and 4 match perfectly (both polka-dot tubs).',
        'Koala dan rubah tidur di keranjang dengan pola DAN bentuk yang SAMA. → Keranjang 2 dan 4 cocok sempurna (keduanya tub berbintik).',
      ),
    },

    // Beat 2 — kangaroo + ostrich share same pattern (different shape)
    {
      phase: 'kang-ostrich',
      highlightKoalaFox: true,
      highlightKangOstrich: true,
      highlightPuppy: false,
      equation: t('Baskets 1 & 3: same weave pattern', 'Keranjang 1 & 3: pola anyaman sama'),
      hold: 2600,
      result: false,
      caption: t(
        'Kangaroo and ostrich have the SAME pattern on their baskets. → Baskets 1 and 3 share the diagonal weave (but different shapes).',
        'Kanguru dan burung unta memiliki pola yang SAMA pada keranjang mereka. → Keranjang 1 dan 3 berbagi pola anyaman diagonal (tapi bentuk berbeda).',
      ),
    },

    // Beat 3 — process of elimination
    {
      phase: 'process',
      highlightKoalaFox: true,
      highlightKangOstrich: true,
      highlightPuppy: false,
      equation: t('4 baskets assigned → 1 remains', '4 keranjang sudah ditugaskan → 1 tersisa'),
      hold: 2200,
      result: false,
      caption: t(
        'Baskets 1, 2, 3, and 4 belong to the koala, fox, kangaroo, and ostrich. Only basket 5 is left!',
        'Keranjang 1, 2, 3, dan 4 milik koala, rubah, kanguru, dan burung unta. Hanya keranjang 5 yang tersisa!',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlightKoalaFox: false,
      highlightKangOstrich: false,
      highlightPuppy: true,
      equation: t('Basket 5 = puppy → E', 'Keranjang 5 = anak anjing → E'),
      hold: 0,
      result: true,
      caption: t(
        'Basket 5 (horizontal brick pattern) is the only basket left — the puppy sleeps there. Answer E.',
        'Keranjang 5 (pola bata horizontal) adalah satu-satunya yang tersisa — anak anjing tidur di sini. Jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
