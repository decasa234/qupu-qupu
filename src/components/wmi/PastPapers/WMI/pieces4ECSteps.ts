/**
 * Storyboard for IKMC-23-EC-Q4 (answer C = pieces 1 and 4).
 *
 * Strategy: try-and-fit each pair of pieces mentally.
 *   Beat 0  — State the goal: which two pieces form a square?
 *   Beat 1  — Try pair 1+2: P1 + P2 both have notches on the same side → gap at top. ✗
 *   Beat 2  — Try pair 1+3: P1 + P3 → step goes the wrong direction → gap at corner. ✗
 *   Beat 3  — Try pair 2+3: P2 + P3 → mirror of top but misaligned → gap. ✗
 *   Beat 4  — Try pair 1+4: highlight both → slide P4's step into P1's notch → ✓ square!
 *   Beat 5  — Winning reveal: assembled square, answer C.
 *
 * Each step carries: which pair is being tried, whether it is rejected,
 * whether it is the winning result, hold duration, and a bilingual caption.
 */

export interface PieceStep {
  /** Which pair is being tried (1-indexed piece labels). */
  pair: [number, number] | null
  /** True when this beat is the winning reveal. */
  result: boolean
  /** True when this beat is a rejection. */
  reject: boolean
  hold: number
  caption: string
}

export interface PieceStoryboard {
  steps: PieceStep[]
  finalIndex: number
}

export function buildPieces4ECStory(lang: 'en' | 'id' = 'en'): PieceStoryboard {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const steps: PieceStep[] = [
    // Beat 0 — introduce the goal
    {
      pair: null,
      result: false,
      reject: false,
      hold: 2400,
      caption: t(
        'Goal: find 2 pieces that join to form a perfect square.',
        'Tujuan: temukan 2 potongan yang digabungkan membentuk persegi sempurna.',
      ),
    },

    // Beat 1 — try 1+2 → reject
    {
      pair: [1, 2],
      result: false,
      reject: true,
      hold: 2200,
      caption: t(
        'Pieces 1 + 2: both have their step on the same side — they leave a gap. ✗',
        'Potongan 1 + 2: keduanya bertangga di sisi yang sama — ada celah. ✗',
      ),
    },

    // Beat 2 — try 1+3 → reject
    {
      pair: [1, 3],
      result: false,
      reject: true,
      hold: 2200,
      caption: t(
        'Pieces 1 + 3: steps go the wrong direction — corners don\'t align. ✗',
        'Potongan 1 + 3: tangga ke arah yang salah — sudut tidak sejajar. ✗',
      ),
    },

    // Beat 3 — try 2+3 → reject
    {
      pair: [2, 3],
      result: false,
      reject: true,
      hold: 2200,
      caption: t(
        'Pieces 2 + 3: mismatched steps — leave an uneven edge. ✗',
        'Potongan 2 + 3: tangga tidak cocok — tepi tidak rata. ✗',
      ),
    },

    // Beat 4 — try 1+4 → fit!
    {
      pair: [1, 4],
      result: false,
      reject: false,
      hold: 2400,
      caption: t(
        'Pieces 1 + 4: piece 4\'s step slots perfectly into piece 1\'s notch…',
        'Potongan 1 + 4: tangga potongan 4 masuk pas ke lekukan potongan 1…',
      ),
    },

    // Beat 5 — winning reveal
    {
      pair: [1, 4],
      result: true,
      reject: false,
      hold: 0,
      caption: t(
        'Pieces 1 and 4 form a perfect square → answer C.',
        'Potongan 1 dan 4 membentuk persegi sempurna → jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
