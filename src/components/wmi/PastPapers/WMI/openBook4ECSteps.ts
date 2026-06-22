// IKMC-19-EC-Q4 — "Olaf has an open book. He can see five vehicles on the right
// page. The cover has two holes. When he closes the book, which vehicles can he
// see through the holes?" Answer: D = motorcycle + orange van + magenta tractor.
//
// Storyboard for the post-answer animation.
//   beat 0 — open book, holes fixed on cover (stage 0). State the setup.
//   beat 1 — highlight holes on cover (stage 1). Draw attention to their positions.
//   beat 2 — book closing: cover flips left↔right (stage 2). Explain the mirror.
//   beat 3 — RESULT: closed book, holes reveal motorcycle + van + tractor (stage 3).
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { OpenBook4ECStage } from './OpenBook4ECIllustration'

export type OpenBook4ECPhase = 'observe' | 'flip' | 'result'

export interface OpenBook4ECStep {
  stage: OpenBook4ECStage
  phase: OpenBook4ECPhase
  caption: string
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface OpenBook4ECStoryboard {
  /** The correct answer label as a string. */
  answer: string
  steps: OpenBook4ECStep[]
  finalIndex: number
}

export function buildOpenBook4ECSteps(lang: Lang): OpenBook4ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: OpenBook4ECStep[] = [
    {
      stage: 0,
      phase: 'observe',
      hold: 2400,
      result: false,
      caption: t(
        'The book is open. Two holes in the cover (left page) sit at fixed positions.',
        'Buku terbuka. Dua lubang di sampul (halaman kiri) berada di posisi tetap.',
      ),
    },
    {
      stage: 1,
      phase: 'observe',
      hold: 2400,
      result: false,
      caption: t(
        'Through the holes you can see part of the right page — but closing the book flips the cover left↔right!',
        'Melalui lubang kamu bisa melihat sebagian halaman kanan — tetapi menutup buku membalik sampul kiri↔kanan!',
      ),
    },
    {
      stage: 2,
      phase: 'flip',
      hold: 2600,
      result: false,
      caption: t(
        'The cover folds over: hole positions are MIRRORED. The left hole is now on the right, and vice versa.',
        'Sampul terlipat: posisi lubang DICERMINKAN. Lubang kiri sekarang di kanan, dan sebaliknya.',
      ),
    },
    {
      stage: 3,
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        'After closing, the holes align with the motorcycle, van, and tractor — answer D!',
        'Setelah ditutup, lubang sejajar dengan motor, van, dan traktor — jawaban D!',
      ),
    },
  ]

  return { answer: 'D', steps, finalIndex: steps.length - 1 }
}
