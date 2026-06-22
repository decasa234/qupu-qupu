// IKMC-21-PE-Q8 — storyboard for the two-mushroom height difference animation.
//
// Problem: two mushrooms shown beside a ruler (0–12).
//   Left mushroom height  = 11
//   Right mushroom height = 6
//   Difference            = 11 − 6 = 5  → answer B.
//
// Teaching beats:
//   0. intro    — show the scene; ask students to read the ruler.
//   1. tall     — highlight the tall mushroom; read its height = 11.
//   2. short    — highlight the short mushroom; read its height = 6.
//   3. subtract — show the difference bracket; 11 − 6 = 5.
//   4. result   — 5 → answer B (green).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export const MUSHROOMS_8_PE_ANSWER = '5'
export const MUSHROOMS_8_PE_CHOICE = 'B'

export type Mushrooms8PEPhase = 'intro' | 'tall' | 'short' | 'subtract' | 'result'

export interface Mushrooms8PEStep {
  phase: Mushrooms8PEPhase
  /** Show height bracket alongside the tall mushroom. */
  showTallBracket: boolean
  /** Show height bracket alongside the short mushroom. */
  showShortBracket: boolean
  /** Show the difference bracket between the two tops. */
  showDiffBracket: boolean
  /** Equation / maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Mushrooms8PEStoryboard {
  steps: Mushrooms8PEStep[]
  finalIndex: number
  tallHeight: number
  shortHeight: number
  answer: number
}

export function buildMushrooms8PESteps(lang: Lang): Mushrooms8PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const TALL = 11
  const SHORT = 6
  const DIFF = TALL - SHORT  // 5

  const steps: Mushrooms8PEStep[] = [
    // Beat 0 — intro: show the scene; prompt to read the scale
    {
      phase: 'intro',
      showTallBracket: false,
      showShortBracket: false,
      showDiffBracket: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Two mushrooms are shown next to a ruler. Read the height of each mushroom from the scale, then find the difference.',
        'Dua jamur ditampilkan di sebelah penggaris. Baca tinggi setiap jamur dari skala, lalu cari selisihnya.',
      ),
    },

    // Beat 1 — read the tall mushroom
    {
      phase: 'tall',
      showTallBracket: true,
      showShortBracket: false,
      showDiffBracket: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        `The taller mushroom (left) reaches up to ${TALL} on the ruler → height = ${TALL}.`,
        `Jamur yang lebih tinggi (kiri) mencapai angka ${TALL} pada penggaris → tinggi = ${TALL}.`,
      ),
    },

    // Beat 2 — read the short mushroom
    {
      phase: 'short',
      showTallBracket: true,
      showShortBracket: true,
      showDiffBracket: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        `The shorter mushroom (right) reaches up to ${SHORT} on the ruler → height = ${SHORT}.`,
        `Jamur yang lebih pendek (kanan) mencapai angka ${SHORT} pada penggaris → tinggi = ${SHORT}.`,
      ),
    },

    // Beat 3 — find the difference
    {
      phase: 'subtract',
      showTallBracket: true,
      showShortBracket: true,
      showDiffBracket: true,
      equation: `${TALL} − ${SHORT} = ${DIFF}`,
      hold: 2400,
      result: false,
      caption: t(
        `The question asks for the DIFFERENCE (not the sum). Subtract the shorter height from the taller: ${TALL} − ${SHORT} = ${DIFF}.`,
        `Pertanyaannya mencari SELISIH (bukan jumlah). Kurangkan tinggi yang lebih pendek dari yang lebih tinggi: ${TALL} − ${SHORT} = ${DIFF}.`,
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      showTallBracket: true,
      showShortBracket: true,
      showDiffBracket: true,
      equation: `${TALL} − ${SHORT} = ${DIFF} → ${MUSHROOMS_8_PE_CHOICE}`,
      hold: 0,
      result: true,
      caption: t(
        `The difference between their heights is ${DIFF}. Answer: ${MUSHROOMS_8_PE_CHOICE}.`,
        `Selisih tinggi kedua jamur adalah ${DIFF}. Jawaban: ${MUSHROOMS_8_PE_CHOICE}.`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
    tallHeight: TALL,
    shortHeight: SHORT,
    answer: DIFF,
  }
}
