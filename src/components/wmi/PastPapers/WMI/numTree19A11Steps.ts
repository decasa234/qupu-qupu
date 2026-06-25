// SEAMO-19-A-Q11 — hint steps (bilingual)
// Rule: center + bottom = topLeft × topRight
// Tree 3: 28 + ? = 7 × 8 = 56 → ? = 28 (Answer E)

export interface NumTree19A11Step {
  caption:      string
  equation:     string | null
  revealAnswer: boolean
  result:       boolean
  hold:         number   // ms
}

export interface NumTree19A11Story {
  steps:      NumTree19A11Step[]
  finalIndex: number
}

export function buildNumTree19A11Steps(lang: 'en' | 'id'): NumTree19A11Story {
  const en = lang === 'en'

  const steps: NumTree19A11Step[] = [
    {
      caption: en
        ? 'Look at Tree 1: the two top numbers are 5 and 3.'
        : 'Perhatikan Pohon 1: dua angka atas adalah 5 dan 3.',
      equation: null,
      revealAnswer: false,
      result: false,
      hold: 2000,
    },
    {
      caption: en
        ? 'Tree 1 rule: center (7) + bottom (8) = 5 × 3 = 15. ✓'
        : 'Aturan Pohon 1: tengah (7) + bawah (8) = 5 × 3 = 15. ✓',
      equation: '7 + 8 = 15 = 5 × 3',
      revealAnswer: false,
      result: false,
      hold: 2800,
    },
    {
      caption: en
        ? 'Tree 2 confirms: center (20) + bottom (10) = 6 × 5 = 30. ✓'
        : 'Pohon 2 mengonfirmasi: tengah (20) + bawah (10) = 6 × 5 = 30. ✓',
      equation: '20 + 10 = 30 = 6 × 5',
      revealAnswer: false,
      result: false,
      hold: 2800,
    },
    {
      caption: en
        ? 'Tree 3: 7 × 8 = 56, and the center is 28, so ? = 56 − 28 = 28.'
        : 'Pohon 3: 7 × 8 = 56, dan tengah = 28, jadi ? = 56 − 28 = 28.',
      equation: '7 × 8 = 56 → 28 + ? = 56 → ? = 28',
      revealAnswer: false,
      result: false,
      hold: 3000,
    },
    {
      caption: en
        ? 'The missing number is 28 — Answer E!'
        : 'Angka yang hilang adalah 28 — Jawaban E!',
      equation: '? = 28',
      revealAnswer: true,
      result: true,
      hold: 2500,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
