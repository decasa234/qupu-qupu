import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Storyboard for HKIMO-19-P2H-Q18 — repeating shape-sequence pattern.
// Four beats:
//   1. Introduce: look at the sequence, can you spot the repeating unit?
//   2. Show bracket under slots 0–4: the unit is ○ □ □ △ ○ (length 5)
//   3. Highlight blank slot (index 14, position 15); show division 15 ÷ 5
//   4. Reveal the blank as ○ (final answer)

export interface HK19P2Q18Step {
  /** Show the repeating-unit bracket under slots 0–4. */
  showCycleBracket: boolean
  /** 0-indexed slot indices to highlight. */
  highlightSlots: number[]
  /** Whether to fill the blank slot with ○ (the answer). */
  fillBlank: boolean
  /** Whether to show the 15 ÷ 5 division note. */
  showDivision: boolean
  caption: string
  /** Hold duration in ms (0 = final beat, stays). */
  hold: number
  result: boolean
}

export interface HK19P2Q18Storyboard {
  steps: HK19P2Q18Step[]
  finalIndex: number
}

export function buildPatternHK19P2Q18Steps(lang: Lang): HK19P2Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HK19P2Q18Step[] = [
    // Beat 1 — introduce the sequence
    {
      showCycleBracket: false,
      highlightSlots: [],
      fillBlank: false,
      showDivision: false,
      hold: 2000,
      result: false,
      caption: t(
        'Look at the sequence: ○ □ □ △ ○ ○ □ □ △ ○ … Can you spot the repeating unit?',
        'Perhatikan barisan: ○ □ □ △ ○ ○ □ □ △ ○ … Dapatkah kamu menemukan unit yang berulang?',
      ),
    },
    // Beat 2 — show the repeating unit bracket
    {
      showCycleBracket: true,
      highlightSlots: [0, 1, 2, 3, 4],
      fillBlank: false,
      showDivision: false,
      hold: 2500,
      result: false,
      caption: t(
        'The repeating unit is ○ □ □ △ ○ — 5 shapes that repeat over and over.',
        'Unit berulangnya adalah ○ □ □ △ ○ — 5 gambar yang berulang terus-menerus.',
      ),
    },
    // Beat 3 — highlight blank + show division
    {
      showCycleBracket: true,
      highlightSlots: [14],
      fillBlank: false,
      showDivision: true,
      hold: 2800,
      result: false,
      caption: t(
        'The blank is at position 15. 15 ÷ 5 = 3 remainder 0, so it falls on the 5th symbol of the cycle.',
        'Garis kosong ada di posisi 15. 15 ÷ 5 = 3 sisa 0, jadi jatuh pada simbol ke-5 dalam pola.',
      ),
    },
    // Beat 4 — reveal the answer
    {
      showCycleBracket: true,
      highlightSlots: [14],
      fillBlank: true,
      showDivision: true,
      hold: 0,
      result: true,
      caption: t(
        'The 5th symbol in ○ □ □ △ ○ is ○. The answer is ○!',
        'Simbol ke-5 dalam ○ □ □ △ ○ adalah ○. Jawabannya adalah ○!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
