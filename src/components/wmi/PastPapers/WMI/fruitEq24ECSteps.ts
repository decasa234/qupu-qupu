// fruitEq24ECSteps.ts
// Storyboard for IKMC-22-EC-Q24: Joanna's numbered cards and fruit equations.
//
// Problem recap:
//   Cards 1–4; each fruit = one distinct card number.
//   Eq 1: strawberry + watermelon = grapes
//   Eq 2: grapes + strawberry = tomato
//   Find: watermelon + tomato = ?
//
// Deduction (from seed quantities):
//   Let st = strawberry, wm = watermelon, gr = grapes, to = tomato.
//   Eq 1: st + wm = gr
//   Eq 2: gr + st = (st + wm) + st = 2·st + wm = to
//   Values must be {1,2,3,4} distinct.
//   Try st=1, wm=2 → gr=3, to=4. All distinct ✓.
//   watermelon + tomato = 2 + 4 = 6 → answer D.
//
// Teaching walk (one idea per beat):
//   0. intro     — show both equations; name the variables
//   1. eq1       — highlight eq 1: st + wm = gr
//   2. eq2-sub   — substitute: gr + st = (st+wm)+st = 2·st + wm = to
//   3. try       — try st=1, wm=2 → gr=3, to=4 (all distinct ✓)
//   4. reveal    — assign values under each fruit
//   5. result    — wm + to = 2 + 4 = 6 → D

export type Lang = 'en' | 'id'

export type FruitEq24Phase = 'intro' | 'eq1' | 'eq2-sub' | 'try' | 'reveal' | 'result'

export interface FruitEq24Beat {
  phase: FruitEq24Phase
  /** Highlight the first equation row. */
  highlightEq1: boolean
  /** Highlight the second equation row. */
  highlightEq2: boolean
  /** Show fruit value badges (fruit → number). */
  showValues: boolean
  /** Values to badge: null = hide badge, number = show it. */
  values: { strawberry: number | null; watermelon: number | null; grapes: number | null; tomato: number | null }
  /** Show the final answer row (wm + to = 6). */
  showAnswer: boolean
  /** Maths equation string ('' = hide). */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface FruitEq24Storyboard {
  steps: FruitEq24Beat[]
  finalIndex: number
}

const NO_VALUES = { strawberry: null, watermelon: null, grapes: null, tomato: null }
const FULL_VALUES = { strawberry: 1, watermelon: 2, grapes: 3, tomato: 4 }

export function buildFruitEq24ECSteps(lang: Lang): FruitEq24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FruitEq24Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightEq1: false,
      highlightEq2: false,
      showValues: false,
      values: NO_VALUES,
      showAnswer: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Cards 1–4: each card hides a unique fruit. The two equations tell us how the fruits relate.',
        'Kartu 1–4: setiap kartu menyembunyikan satu buah unik. Dua persamaan ini menunjukkan bagaimana buah-buahan saling berhubungan.',
      ),
    },

    // Beat 1 — highlight equation 1
    {
      phase: 'eq1',
      highlightEq1: true,
      highlightEq2: false,
      showValues: false,
      values: NO_VALUES,
      showAnswer: false,
      equation: 'st + wm = gr',
      hold: 2200,
      result: false,
      caption: t(
        'Equation 1: strawberry + watermelon = grapes.',
        'Persamaan 1: stroberi + semangka = anggur.',
      ),
    },

    // Beat 2 — highlight equation 2 + substitution
    {
      phase: 'eq2-sub',
      highlightEq1: false,
      highlightEq2: true,
      showValues: false,
      values: NO_VALUES,
      showAnswer: false,
      equation: 'gr + st = (st+wm)+st = 2·st+wm = to',
      hold: 2400,
      result: false,
      caption: t(
        'Equation 2: grapes + strawberry = tomato. Substitute gr → 2·st + wm = to.',
        'Persamaan 2: anggur + stroberi = tomat. Substitusi gr → 2·st + wm = to.',
      ),
    },

    // Beat 3 — try st=1, wm=2
    {
      phase: 'try',
      highlightEq1: false,
      highlightEq2: false,
      showValues: true,
      values: { strawberry: 1, watermelon: 2, grapes: null, tomato: null },
      showAnswer: false,
      equation: 'st=1, wm=2',
      hold: 2000,
      result: false,
      caption: t(
        'Try st=1, wm=2. Then gr = 1+2 = 3, to = 3+1 = 4. All four values are different ✓',
        'Coba st=1, wm=2. Maka gr = 1+2 = 3, to = 3+1 = 4. Keempat nilai berbeda ✓',
      ),
    },

    // Beat 4 — reveal all values
    {
      phase: 'reveal',
      highlightEq1: false,
      highlightEq2: false,
      showValues: true,
      values: FULL_VALUES,
      showAnswer: false,
      equation: 'st=1, wm=2, gr=3, to=4',
      hold: 2200,
      result: false,
      caption: t(
        'Strawberry=1, watermelon=2, grapes=3, tomato=4. All distinct — the assignment works!',
        'Stroberi=1, semangka=2, anggur=3, tomat=4. Semua berbeda — penugasannya berhasil!',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlightEq1: false,
      highlightEq2: false,
      showValues: true,
      values: FULL_VALUES,
      showAnswer: true,
      equation: 'wm + to = 2 + 4 = 6 → D',
      hold: 0,
      result: true,
      caption: t(
        'watermelon + tomato = 2 + 4 = 6 → answer D.',
        'semangka + tomat = 2 + 4 = 6 → jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
