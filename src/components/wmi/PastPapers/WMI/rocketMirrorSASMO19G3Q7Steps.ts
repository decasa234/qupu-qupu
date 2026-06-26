// Animation steps for SASMO-19-G3-Q7 — rocket mirror image.
// Answer: A (exact horizontal flip of the reference rocket).
//
// Beat sequence:
//   0  — intro: show reference rocket
//   1  — axis: draw the mirror line
//   2  — flip: reveal Option A beside the reference
//   3–7 — check each option A–E (A passes, B–E fail)
//   8  — result: crown A as the answer

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type RocketMirrorPhase = 'intro' | 'axis' | 'flip' | 'check' | 'result'

export interface RocketMirrorStep {
  phase:       RocketMirrorPhase
  checkLabel:  'A' | 'B' | 'C' | 'D' | 'E' | null
  checkPass:   boolean | null
  showAxis:    boolean
  showFlip:    boolean
  answerLabel: 'A' | null
  caption:     string
  hold:        number
  result:      boolean
}

export interface RocketMirrorStoryboard {
  steps:      RocketMirrorStep[]
  finalIndex: number
}

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

export function buildRocketMirrorSteps(lang: Lang): RocketMirrorStoryboard {
  const steps: RocketMirrorStep[] = []

  // Beat 0 — reference
  steps.push({
    phase: 'intro', checkLabel: null, checkPass: null,
    showAxis: false, showFlip: false, answerLabel: null,
    hold: 1600, result: false,
    caption: t(lang,
      'Here is the original picture — a rocket tilted to the LEFT with a star in the upper-RIGHT.',
      'Ini gambar aslinya — roket miring ke KIRI dengan bintang di kanan atas.',
    ),
  })

  // Beat 1 — axis
  steps.push({
    phase: 'axis', checkLabel: null, checkPass: null,
    showAxis: true, showFlip: false, answerLabel: null,
    hold: 1400, result: false,
    caption: t(lang,
      'Imagine a mirror standing on the RIGHT side of the picture.',
      'Bayangkan cermin berdiri di sisi KANAN gambar.',
    ),
  })

  // Beat 2 — reveal mirror
  steps.push({
    phase: 'flip', checkLabel: null, checkPass: null,
    showAxis: true, showFlip: true, answerLabel: null,
    hold: 2000, result: false,
    caption: t(lang,
      'In the mirror, LEFT ↔ RIGHT swap: the rocket tilts RIGHT, the star moves to the upper-LEFT, the booster is now on the LEFT.',
      'Di cermin, KIRI ↔ KANAN bertukar: roket miring ke kanan, bintang pindah ke kiri atas, booster berpindah ke sisi kiri.',
    ),
  })

  // Beat 3–7 — check A–E
  const allLabels: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E']
  for (const label of allLabels) {
    const pass = label === 'A'
    steps.push({
      phase: 'check', checkLabel: label, checkPass: pass,
      showAxis: false, showFlip: false, answerLabel: null,
      hold: pass ? 1800 : 1100, result: false,
      caption: pass
        ? t(lang,
            'A — rocket tilts RIGHT, star upper-LEFT, booster on the LEFT. All three features are correctly mirrored! ✓',
            'A — roket miring ke kanan, bintang di kiri atas, booster di sisi kiri. Ketiga fitur tercermin dengan benar! ✓',
          )
        : t(lang,
            `${label} — one or more features do not match a left-right flip of the original. ✗`,
            `${label} — satu atau lebih fitur tidak sesuai dengan kebalikan kiri-kanan dari gambar asli. ✗`,
          ),
    })
  }

  // Beat 8 — result
  steps.push({
    phase: 'result', checkLabel: 'A', checkPass: true,
    showAxis: false, showFlip: false, answerLabel: 'A',
    hold: 0, result: true,
    caption: t(lang,
      'Answer: A — the exact left-right mirror of the original rocket.',
      'Jawaban: A — bayangan cermin kiri-kanan yang tepat dari roket asli.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
