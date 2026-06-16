import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { PANEL_ANSWER, type Panel3x3 } from './P22G1Q15Illustration'

// WMI-22P1A-Q15 — "Which figure comes next?" (Grade 1, answer B).
//
// The animation teaches the rule, not just the picture:
//   1. Every panel has exactly TWO triangles.
//   2. ONE triangle never moves — it sits in the centre cell.
//   3. The OTHER triangle steps one place counter-clockwise around the centre
//      each panel: top → top-left → left → bottom-left.
//   4. So the next panel = centre triangle + bottom-left triangle  → option B.

export type Q15Phase = 'show' | 'centre' | 'orbit' | 'reveal' | 'result'

export interface Q15Step {
  phase: Q15Phase
  /** When set, the 4th panel renders this answer panel; otherwise it shows "?". */
  answerPanel?: Panel3x3
  caption: string
  hold: number
  result: boolean
}

export interface Q15Storyboard {
  answerLetter: string
  steps: Q15Step[]
  finalIndex: number
}

export function buildP22G1Q15Steps(lang: Lang, answerLetter: string): Q15Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q15Step[] = [
    {
      phase: 'show',
      hold: 2000,
      result: false,
      caption: t(
        'Each panel has two triangles among the circles. What moves?',
        'Setiap panel punya dua segitiga di antara lingkaran. Apa yang bergerak?',
      ),
    },
    {
      phase: 'centre',
      hold: 2100,
      result: false,
      caption: t(
        'One triangle is ALWAYS in the centre cell — it never moves.',
        'Satu segitiga SELALU di kotak tengah — tidak pernah berpindah.',
      ),
    },
    {
      phase: 'orbit',
      hold: 2400,
      result: false,
      caption: t(
        'The other triangle steps around the centre: top → top-left → left …',
        'Segitiga lainnya melangkah mengelilingi pusat: atas → kiri-atas → kiri …',
      ),
    },
    {
      phase: 'reveal',
      answerPanel: PANEL_ANSWER,
      hold: 2200,
      result: false,
      caption: t(
        'Next step is bottom-left. So: centre triangle + bottom-left triangle.',
        'Langkah berikutnya kiri-bawah. Jadi: segitiga tengah + segitiga kiri-bawah.',
      ),
    },
    {
      phase: 'result',
      answerPanel: PANEL_ANSWER,
      hold: 0,
      result: true,
      caption: t(
        `That is figure ${answerLetter}.`,
        `Itu adalah gambar ${answerLetter}.`,
      ),
    },
  ]

  return { answerLetter, steps, finalIndex: steps.length - 1 }
}
