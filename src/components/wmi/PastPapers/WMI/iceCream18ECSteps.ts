// IKMC-20-EC-Q18 — Ice cream scoops + toppings explainer storyboard.
//
// Problem recap:
//   Flavors:  vanilla×3, chocolate×2, lemon×1  (total 6)
//   Toppings: cherry×3,  wafer×2,    choc-chip×1  (total 6)
//   Rule: one topping per scoop, no two ice creams alike (every (flavor,topping) pair unique).
//   Answer: C — "lemon with a wafer" is NOT possible.
//
// Why C is impossible:
//   If lemon gets a wafer:
//     • Remaining toppings: cherry×3, wafer×1, choc-chip×1 for 5 scoops (3 vanilla + 2 choc).
//     • 3 vanilla must each get a distinct topping → vanilla+cherry, vanilla+wafer, vanilla+choc-chip.
//       That uses ALL remaining toppings: cherry×3→0 left, wafer×1→0 left, choc-chip×1→0 left.
//     • 2 chocolate scoops remain with ZERO toppings left → impossible. ✗
//
// Beat structure (6 beats):
//   0  setup    — show the 6 scoops + 6 toppings; introduce the rule
//   1  testA    — A: choc+cherry — works (mark ✓)
//   2  testB    — B: vanilla+cherry — works (mark ✓)
//   3  testC    — C: lemon+wafer — try it, vanilla takes cherry+wafer+choc-chip,
//                  both choc left with no toppings → IMPOSSIBLE (mark ✗)
//   4  testD    — D: choc+wafer — works (mark ✓)
//   5  result   — C is impossible. Answer: C.
//
// Pure builder — no DOM, no React, no side-effects.

// ── Types ─────────────────────────────────────────────────────────────────────

export type Lang = 'en' | 'id'

export type PhaseId = 'setup' | 'testA' | 'testB' | 'testC' | 'testD' | 'result'

/** Which test option is currently being examined (A–D), or null. */
export type TestOption = 'A' | 'B' | 'C' | 'D' | null

export interface IceCreamBeat {
  phase: PhaseId
  /** The option being tested on this beat (A–D), or null on setup/result beats. */
  testOption: TestOption
  /** Whether the tested option passes (true), fails (false), or is not yet tested (null). */
  testResult: boolean | null
  /** Short equation / reasoning pill shown above the caption. */
  equation: string | null
  /** Caption text. */
  caption: string
  /** Auto-advance hold in ms (0 = final beat). */
  hold: number
  /** True on the result beat (green styling). */
  isResult: boolean
}

export interface IceCreamStoryboard {
  steps: IceCreamBeat[]
  finalIndex: number
}

// ── Captions (bilingual) ──────────────────────────────────────────────────────

const CAPTIONS: Record<PhaseId, Record<Lang, string>> = {
  setup: {
    en: '6 scoops, 6 toppings. One topping per scoop — no two ice creams alike. Test each option.',
    id: '6 scoop, 6 topping. Satu topping per scoop — tidak ada dua es krim yang sama. Uji setiap pilihan.',
  },
  testA: {
    en: 'A: chocolate + cherry? Remaining toppings can still cover all other scoops without duplicates. ✓ Possible.',
    id: 'A: cokelat + ceri? Topping yang tersisa masih bisa menutupi semua scoop lain tanpa duplikat. ✓ Mungkin.',
  },
  testB: {
    en: 'B: vanilla + cherry? 2 cherries still remain for others. No conflict. ✓ Possible.',
    id: 'B: vanila + ceri? Masih ada 2 ceri tersisa untuk yang lain. Tidak ada konflik. ✓ Mungkin.',
  },
  testC: {
    en: 'C: lemon + wafer? 3 vanilla need 3 different toppings → they take cherry, wafer, choc-chip. Both chocolate scoops are left with only cherry — duplicate! ✗ Impossible!',
    id: 'C: lemon + wafer? 3 vanila butuh 3 topping berbeda → mereka mengambil ceri, wafer, kepingan cokelat. Kedua scoop cokelat tersisa hanya dengan ceri — duplikat! ✗ Tidak mungkin!',
  },
  testD: {
    en: 'D: chocolate + wafer? Remaining options can still be assigned without duplicates. ✓ Possible.',
    id: 'D: cokelat + wafer? Pilihan yang tersisa masih bisa ditetapkan tanpa duplikat. ✓ Mungkin.',
  },
  result: {
    en: 'Only option C forces a duplicate pair. Lemon + wafer is NOT possible. Answer: C.',
    id: 'Hanya opsi C yang memaksa pasangan duplikat. Lemon + wafer TIDAK mungkin. Jawaban: C.',
  },
}

const EQUATIONS: Record<PhaseId, Record<Lang, string | null>> = {
  setup: {
    en: 'vanilla×3 · choc×2 · lemon×1  +  cherry×3 · wafer×2 · chip×1',
    id: 'vanila×3 · cokelat×2 · lemon×1  +  ceri×3 · wafer×2 · keping×1',
  },
  testA: {
    en: 'choc + cherry ✓',
    id: 'cokelat + ceri ✓',
  },
  testB: {
    en: 'vanilla + cherry ✓',
    id: 'vanila + ceri ✓',
  },
  testC: {
    en: 'lemon + wafer → choc? only cherry left → DUPLICATE ✗',
    id: 'lemon + wafer → cokelat? hanya ceri tersisa → DUPLIKAT ✗',
  },
  testD: {
    en: 'choc + wafer ✓',
    id: 'cokelat + wafer ✓',
  },
  result: {
    en: 'Answer: C',
    id: 'Jawaban: C',
  },
}

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * buildIceCream18ECSteps
 *
 * Returns a 6-beat storyboard for the IKMC-20-EC-Q18 explainer animation.
 *
 * @param lang  'en' (default) or 'id' for bilingual captions
 */
export function buildIceCream18ECSteps(lang: Lang = 'en'): IceCreamStoryboard {
  const c  = (phase: PhaseId) => CAPTIONS[phase][lang]
  const eq = (phase: PhaseId) => EQUATIONS[phase][lang]

  const steps: IceCreamBeat[] = [
    // ── Beat 0: setup ─────────────────────────────────────────────────────────
    {
      phase:      'setup',
      testOption: null,
      testResult: null,
      equation:   eq('setup'),
      caption:    c('setup'),
      hold:       2400,
      isResult:   false,
    },

    // ── Beat 1: test A (choc + cherry → possible) ─────────────────────────────
    {
      phase:      'testA',
      testOption: 'A',
      testResult: true,
      equation:   eq('testA'),
      caption:    c('testA'),
      hold:       2600,
      isResult:   false,
    },

    // ── Beat 2: test B (vanilla + cherry → possible) ──────────────────────────
    {
      phase:      'testB',
      testOption: 'B',
      testResult: true,
      equation:   eq('testB'),
      caption:    c('testB'),
      hold:       2600,
      isResult:   false,
    },

    // ── Beat 3: test C (lemon + wafer → impossible!) ──────────────────────────
    {
      phase:      'testC',
      testOption: 'C',
      testResult: false,
      equation:   eq('testC'),
      caption:    c('testC'),
      hold:       3600,
      isResult:   false,
    },

    // ── Beat 4: test D (choc + wafer → possible) ──────────────────────────────
    {
      phase:      'testD',
      testOption: 'D',
      testResult: true,
      equation:   eq('testD'),
      caption:    c('testD'),
      hold:       2400,
      isResult:   false,
    },

    // ── Beat 5: result ─────────────────────────────────────────────────────────
    {
      phase:      'result',
      testOption: 'C',
      testResult: false,
      equation:   eq('result'),
      caption:    c('result'),
      hold:       0,        // final beat — stays until user advances
      isResult:   true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
