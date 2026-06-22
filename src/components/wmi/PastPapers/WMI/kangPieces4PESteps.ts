import type { Lang } from '../../concepts/explainers/makeTenSteps'

// IKMC-23-PE-Q4 — "Mr. Beaver rearranges the pieces to make a kangaroo figure.
// Which piece is missing?" (answer A — the parallelogram).
//
// The animation story:
//   Beat 0 — show the original square with tangram cuts
//   Beat 1 — show the assembled kangaroo (6 pieces placed, gap outlined)
//   Beat 2 — highlight the gap more prominently, prompt the learner
//   Beat 3 — glow the gap, name it as a parallelogram shape
//   Beat 4 (result) — confirm answer A fills the gap exactly

export interface KangPiecesStep {
  /** Which phase of the explanation (controls what's rendered). */
  phase: 'square' | 'kangaroo' | 'gap-focus' | 'gap-glow' | 'result'
  /** Whether the dashed gap outline is shown. */
  showGap: boolean
  /** Whether the gap is glowing/highlighted. */
  glowGap: boolean
  /** True on the final closing answer beat. */
  result: boolean
  caption: string
  hold: number
}

export interface KangPiecesStoryboard {
  answer: 'A'
  steps: KangPiecesStep[]
  finalIndex: number
}

export function buildKangPieces4PESteps(lang: Lang): KangPiecesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: KangPiecesStep[] = [
    // Beat 0 — show the source square with cuts
    {
      phase: 'square',
      showGap: false,
      glowGap: false,
      result: false,
      hold: 2200,
      caption: t(
        'The blue square is cut into 7 tangram-style pieces.',
        'Persegi biru dipotong menjadi 7 potongan seperti tangram.',
      ),
    },
    // Beat 1 — show the kangaroo assembled from 6 pieces, gap visible
    {
      phase: 'kangaroo',
      showGap: true,
      glowGap: false,
      result: false,
      hold: 2000,
      caption: t(
        'Mr. Beaver rearranges the pieces into a kangaroo shape — but one piece is missing!',
        'Pak Berang-berang menyusun potongan menjadi bentuk kanguru — tetapi satu potongan hilang!',
      ),
    },
    // Beat 2 — focus on the gap
    {
      phase: 'gap-focus',
      showGap: true,
      glowGap: false,
      result: false,
      hold: 2000,
      caption: t(
        'Find the shape that fits the empty gap in the kangaroo.',
        'Temukan bentuk yang pas mengisi celah kosong pada kanguru.',
      ),
    },
    // Beat 3 — glow the gap, name the parallelogram
    {
      phase: 'gap-glow',
      showGap: true,
      glowGap: true,
      result: false,
      hold: 2200,
      caption: t(
        'The gap is a slanted four-sided shape — a parallelogram.',
        'Celahnya berbentuk sisi empat miring — sebuah jajargenjang.',
      ),
    },
    // Beat 4 — result
    {
      phase: 'result',
      showGap: false,
      glowGap: false,
      result: true,
      hold: 0,
      caption: t(
        'Piece A — the parallelogram — fills the gap exactly. Answer A.',
        'Potongan A — jajargenjang — mengisi celah dengan tepat. Jawaban A.',
      ),
    },
  ]

  return { answer: 'A', steps, finalIndex: steps.length - 1 }
}
