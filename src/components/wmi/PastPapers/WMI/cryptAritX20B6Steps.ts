// cryptAritX20B6Steps.ts
// Storyboard for SEAMO-X 2020 Paper B Q6 — AT × AT = CAT, find C.
// Solution: AT = 25 (automorphic), 25² = 625 → A=2, T=5, C=6.

export interface CryptAritX20B6Step {
  /** Letters to reveal (show digit in green). */
  revealed: Record<string, boolean>
  /** Letter to highlight with amber band, or null. */
  focusLetter: string | null
  /** Auto-advance hold time in ms (0 = final beat). */
  hold: number
  /** When true, style caption as answer card. */
  result: boolean
  caption: string
}

export interface CryptAritX20B6Story {
  steps: CryptAritX20B6Step[]
  finalIndex: number
}

export function buildCryptAritX20B6Story(lang: 'en' | 'id'): CryptAritX20B6Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CryptAritX20B6Step[] = [
    // Beat 0 — introduce the puzzle
    {
      revealed: {},
      focusLetter: null,
      hold: 2400,
      result: false,
      caption: t(
        'AT × AT = CAT. The last two digits of AT² must be A and T — the same as AT itself!',
        'AT × AT = CAT. Dua digit terakhir AT² harus A dan T — sama seperti AT itu sendiri!',
      ),
    },
    // Beat 1 — explain automorphic property
    {
      revealed: {},
      focusLetter: 'T',
      hold: 2600,
      result: false,
      caption: t(
        "A number whose square ends in itself is called automorphic. Which 2-digit number satisfies n² ends in n?",
        'Bilangan yang kuadratnya berakhiran dirinya sendiri disebut automorfik. Bilangan 2-digit mana yang memenuhi n² berakhiran n?',
      ),
    },
    // Beat 2 — test AT = 25
    {
      revealed: {},
      focusLetter: 'A',
      hold: 2600,
      result: false,
      caption: t(
        'Try AT = 25: 25 × 25 = 625. Last two digits are 25 — matches AT! ✓',
        'Coba AT = 25: 25 × 25 = 625. Dua digit terakhir adalah 25 — sesuai AT! ✓',
      ),
    },
    // Beat 3 — reveal A and T
    {
      revealed: { A: true, T: true },
      focusLetter: null,
      hold: 2400,
      result: false,
      caption: t(
        'So A = 2 and T = 5. Now 25² = 625, a 3-digit number.',
        'Jadi A = 2 dan T = 5. Sekarang 25² = 625, sebuah bilangan 3-digit.',
      ),
    },
    // Beat 4 — reveal C
    {
      revealed: { A: true, T: true, C: true },
      focusLetter: 'C',
      hold: 0,
      result: true,
      caption: t(
        '25 × 25 = 625 → C = 6, A = 2, T = 5. Answer: C = 6.',
        '25 × 25 = 625 → C = 6, A = 2, T = 5. Jawaban: C = 6.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
