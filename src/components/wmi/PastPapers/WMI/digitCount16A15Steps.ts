// Beat steps for SEAMO-16-A-Q15:
// Jane writes 1 to 59 — how many digits total?
// Strategy: count by digit length. 1–9: 9×1 = 9. 10–59: 50×2 = 100. Total = 109.

export type DigitCountPhase = 'intro' | 'group1' | 'group2' | 'sum' | 'result'

export interface DigitCountStep {
  phase: DigitCountPhase
  revealedGroups: 0 | 1 | 2
  showTotal: boolean
  caption: string
  hold: number
  result: boolean
}

export interface DigitCountStoryboard {
  steps: DigitCountStep[]
  finalIndex: number
}

export function buildDigitCount16A15Steps(lang: 'en' | 'id'): DigitCountStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DigitCountStep[] = [
    {
      phase: 'intro',
      revealedGroups: 0,
      showTotal: false,
      hold: 1600,
      result: false,
      caption: t(
        'Split the numbers into groups by how many digits they have.',
        'Kelompokkan bilangan berdasarkan banyaknya digit.',
      ),
    },
    {
      phase: 'group1',
      revealedGroups: 1,
      showTotal: false,
      hold: 2200,
      result: false,
      caption: t(
        '1-digit numbers 1–9: 9 numbers × 1 digit = 9 digits.',
        'Bilangan 1 digit (1–9): 9 bilangan × 1 digit = 9 digit.',
      ),
    },
    {
      phase: 'group2',
      revealedGroups: 2,
      showTotal: false,
      hold: 2200,
      result: false,
      caption: t(
        '2-digit numbers 10–59: 50 numbers × 2 digits = 100 digits.',
        'Bilangan 2 digit (10–59): 50 bilangan × 2 digit = 100 digit.',
      ),
    },
    {
      phase: 'sum',
      revealedGroups: 2,
      showTotal: false,
      hold: 1800,
      result: false,
      caption: t(
        'Add both groups: 9 + 100 = 109.',
        'Jumlahkan kedua kelompok: 9 + 100 = 109.',
      ),
    },
    {
      phase: 'result',
      revealedGroups: 2,
      showTotal: true,
      hold: 0,
      result: true,
      caption: t(
        'Jane wrote 109 digits in total — answer B.',
        'Jane menulis total 109 digit — jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
