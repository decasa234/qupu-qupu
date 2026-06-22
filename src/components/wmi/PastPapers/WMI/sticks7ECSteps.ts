export type Lang = 'en' | 'id'

export interface Sticks7ECStep {
  /** Choice label being shown ('A'–'E' or '' for intro) */
  choice: string
  /** Stick count for this shape (null for intro) */
  count: number | null
  /** Whether this shape exceeds the limit */
  exceeds: boolean
  /** Final answer beat */
  result: boolean
  caption: string
  hold: number
}

export interface Sticks7ECStoryboard {
  steps: Sticks7ECStep[]
  finalIndex: number
  stemCount: number
}

export const STEM_COUNT = 10

export const SHAPE_COUNTS: Record<string, number> = {
  A: 10,
  B: 7,
  C: 10,
  D: 12,
  E: 10,
}

export function buildSticks7ECSteps(lang: Lang): Sticks7ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const stemCount = STEM_COUNT

  const steps: Sticks7ECStep[] = [
    {
      choice: '',
      count: null,
      exceeds: false,
      result: false,
      hold: 2000,
      caption: t(
        `Pia has ${stemCount} sticks. Let's count how many each shape needs.`,
        `Pia memiliki ${stemCount} tongkat. Mari hitung berapa yang dibutuhkan setiap bentuk.`,
      ),
    },
    {
      choice: 'A',
      count: 10,
      exceeds: false,
      result: false,
      hold: 2000,
      caption: t(
        "Shape A (T-shape): 10 sticks — exactly Pia's count, fits! ✓",
        'Bentuk A (huruf T): 10 tongkat — persis jumlah Pia, muat! ✓',
      ),
    },
    {
      choice: 'B',
      count: 7,
      exceeds: false,
      result: false,
      hold: 2000,
      caption: t(
        'Shape B (2 squares tall): 7 sticks — less than 10, fits! ✓',
        'Bentuk B (2 persegi tinggi): 7 tongkat — kurang dari 10, muat! ✓',
      ),
    },
    {
      choice: 'C',
      count: 10,
      exceeds: false,
      result: false,
      hold: 2000,
      caption: t(
        "Shape C (L-shape): 10 sticks — exactly Pia's count, fits! ✓",
        'Bentuk C (huruf L): 10 tongkat — persis jumlah Pia, muat! ✓',
      ),
    },
    {
      choice: 'D',
      count: 12,
      exceeds: true,
      result: false,
      hold: 2200,
      caption: t(
        'Shape D (2×2 block): 12 sticks — MORE than 10! ✗ This is the one!',
        'Bentuk D (blok 2×2): 12 tongkat — LEBIH dari 10! ✗ Inilah jawabannya!',
      ),
    },
    {
      choice: 'E',
      count: 10,
      exceeds: false,
      result: false,
      hold: 2200,
      caption: t(
        'Shape E (3 squares in a row): 10 sticks — looks big but shares sides, so exactly 10 — fits! ✓',
        'Bentuk E (3 persegi berjajar): 10 tongkat — tampak besar tapi berbagi sisi, jadi tepat 10 — muat! ✓',
      ),
    },
    {
      choice: 'D',
      count: 12,
      exceeds: true,
      result: true,
      hold: 0,
      caption: t(
        "Answer: Shape D (2×2 block) needs 12 sticks — more than Pia's 10.",
        'Jawaban: Bentuk D (blok 2×2) butuh 12 tongkat — lebih dari 10 milik Pia.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, stemCount }
}
