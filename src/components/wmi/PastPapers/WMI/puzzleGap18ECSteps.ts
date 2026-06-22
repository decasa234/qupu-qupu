// IKMC-22-EC-Q18 — "What piece completes the star puzzle?" (answer C)
//
// METHOD (deduction, one idea per beat):
//   1. Compare the incomplete star (left) with the complete star (right) to
//      identify the gap: the bottom-centre pentagon piece is missing.
//   2. Read the colour sequence of the wedges adjacent to the gap in the
//      complete star — they constrain which piece fits.
//   3. Check option A: wedge sequence yellow→red→teal→purple→green — the
//      colours don't match the gap's required colours ✗.
//   4. Check option B: green→yellow→red→teal→purple — still wrong order ✗.
//   5. Check option D: purple→teal→green→red→yellow — wrong ✗.
//   6. Check option E: red→teal→purple→yellow→green — wrong ✗.
//   7. Option C: teal→green→yellow→red→purple — exactly matches the missing
//      region when placed in the gap → answer C.
//
// Pure builder: (lang) => storyboard.  No Math.random / no Date.  SSR-safe.

export type Lang = 'en' | 'id'

export interface PuzzleGap18Step {
  /** Which option labels are being judged on this beat (empty = intro). */
  examining: string[]
  /** Verdict for each examined option. */
  verdict: 'reject' | 'accept'
  /** Fill the gap with the correct piece (only on the winning beat). */
  showAnswer: boolean
  /** Beat caption. */
  caption: string
  /** Hold duration in ms (0 = final beat, stays open). */
  hold: number
}

export interface PuzzleGap18Storyboard {
  answer: string
  steps: PuzzleGap18Step[]
  finalIndex: number
}

export function buildPuzzleGap18ECSteps(lang: Lang): PuzzleGap18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PuzzleGap18Step[] = [
    // Beat 1 — identify the gap.
    {
      examining: [],
      verdict: 'reject',
      showAnswer: false,
      hold: 2800,
      caption: t(
        'Compare the two stars: the left star is missing the bottom-centre pentagon piece. The correct piece must match the colours of the adjacent wedges.',
        'Bandingkan dua bintang: bintang kiri kehilangan potongan segi-lima di bagian bawah-tengah. Potongan yang benar harus cocok dengan warna irisan yang berdekatan.',
      ),
    },
    // Beat 2 — reject A and B.
    {
      examining: ['A', 'B'],
      verdict: 'reject',
      showAnswer: false,
      hold: 2400,
      caption: t(
        'Options A and B have the wrong colour sequence for the gap — they don\'t align with the surrounding wedge colours ✗.',
        'Pilihan A dan B memiliki urutan warna yang salah untuk celah — tidak sesuai dengan warna irisan di sekitarnya ✗.',
      ),
    },
    // Beat 3 — reject D and E.
    {
      examining: ['D', 'E'],
      verdict: 'reject',
      showAnswer: false,
      hold: 2400,
      caption: t(
        'Options D and E also have the wrong colour arrangement — placing them in the gap breaks the star\'s colour pattern ✗.',
        'Pilihan D dan E juga memiliki susunan warna yang salah — menempatkannya di celah merusak pola warna bintang ✗.',
      ),
    },
    // Beat 4 (result) — C matches.
    {
      examining: ['C'],
      verdict: 'accept',
      showAnswer: true,
      hold: 0,
      caption: t(
        'Option C: teal → green → yellow → red → purple — its wedge colours fit the gap exactly, completing the star. Answer is C.',
        'Pilihan C: biru-hijau → hijau → kuning → merah → ungu — urutan warna irisannya tepat mengisi celah dan melengkapi bintang. Jawaban adalah C.',
      ),
    },
  ]

  return { answer: 'C', steps, finalIndex: steps.length - 1 }
}
