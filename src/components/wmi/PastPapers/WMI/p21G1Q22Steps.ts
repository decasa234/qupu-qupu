// Storyboard for the WMI-21P1A-Q22 explainer (kite-pattern matrix).
//
// Two intrinsic rules pin the missing kite:
//   COLOUR: each row & column carries red / yellow / white once. Row 1 already
//           has yellow + white → "?" is RED.
//   SHAPE:  each column has exactly one compact diamond, walking down the
//           diagonal (col1→row0, col2→row1, col0→row2). Col 0's diamond is the
//           row-2 yellow kite, so "?" (row1,col0) is a tall LONG-KITE.
//   ⇒ "?" is a RED LONG-KITE — option C.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { P21G1Q22_ANSWER_LETTER } from './P21G1Q22Illustration'

export type Q22Phase = 'show' | 'colorRow' | 'colorCol' | 'shape' | 'result'

export interface Q22Step {
  phase: Q22Phase
  revealAnswer: boolean
  highlightRow: number | null
  highlightCol: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q22Storyboard {
  answerLetter: string
  steps: Q22Step[]
  finalIndex: number
}

export function buildP21G1Q22Steps(lang: Lang): Q22Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q22Step[] = [
    {
      phase: 'show',
      revealAnswer: false,
      highlightRow: null,
      highlightCol: null,
      hold: 1800,
      result: false,
      caption: t(
        'Look at two things on every kite: its colour and its shape.',
        'Perhatikan dua hal pada tiap layang-layang: warna dan bentuknya.',
      ),
    },
    {
      phase: 'colorRow',
      revealAnswer: false,
      highlightRow: 1,
      highlightCol: null,
      hold: 2100,
      result: false,
      caption: t(
        'Colours: every row has red, yellow and white once. This row already has yellow and white — so "?" is RED.',
        'Warna: tiap baris punya merah, kuning, putih sekali. Baris ini sudah ada kuning dan putih — jadi "?" MERAH.',
      ),
    },
    {
      phase: 'colorCol',
      revealAnswer: false,
      highlightRow: null,
      highlightCol: 2,
      hold: 2000,
      result: false,
      caption: t(
        'Each column proves it too: this column shows yellow, white and red — all three.',
        'Tiap kolom juga membuktikan: kolom ini menampilkan kuning, putih, merah — ketiganya.',
      ),
    },
    {
      phase: 'shape',
      revealAnswer: false,
      highlightCol: 0,
      highlightRow: null,
      hold: 2200,
      result: false,
      caption: t(
        'Shape: each column has one compact diamond, sliding down the diagonal. The left column’s diamond sits at the bottom, so "?" is a tall long-kite.',
        'Bentuk: tiap kolom punya satu wajik gepeng yang turun diagonal. Wajik kolom kiri ada di bawah, jadi "?" layang-layang tinggi.',
      ),
    },
    {
      phase: 'result',
      revealAnswer: true,
      highlightRow: null,
      highlightCol: null,
      hold: 0,
      result: true,
      caption: t(
        `So "?" is a RED long-kite — answer ${P21G1Q22_ANSWER_LETTER}.`,
        `Jadi "?" layang-layang MERAH yang tinggi — jawaban ${P21G1Q22_ANSWER_LETTER}.`,
      ),
    },
  ]

  return { answerLetter: P21G1Q22_ANSWER_LETTER, steps, finalIndex: steps.length - 1 }
}
