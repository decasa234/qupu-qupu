// Animation steps for SASMO-19-G2-Q12 — pencil mirror image.
//
// Strategy:
//   0. Show the reference pencil # arrangement.
//   1. Draw the mirror axis (vertical line at the right edge).
//   2. Reveal the mirror image (Option B) — tips flip to the opposite side.
//   3. Check A, C, D, E are wrong (tips in wrong directions).
//   4. Crown B as the answer.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type MirrorPhase = 'intro' | 'axis' | 'flip' | 'check' | 'result'

export interface MirrorStep {
  phase: MirrorPhase
  /** Which option is being evaluated, or null. */
  checkLabel: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Pass/fail for the current check, or null. */
  checkPass: boolean | null
  /** Show the mirror axis line. */
  showAxis: boolean
  /** Show the reflected/option arrangement. */
  showFlip: boolean
  /** Label to crown as correct (result phase). */
  answerLabel: 'B' | null
  caption: string
  hold: number
  result: boolean
}

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

export interface MirrorStoryboard {
  steps: MirrorStep[]
  finalIndex: number
}

const WRONG_LABELS: Array<'A' | 'C' | 'D' | 'E'> = ['A', 'C', 'D', 'E']

export function buildPencilMirrorSteps(lang: Lang): MirrorStoryboard {
  const steps: MirrorStep[] = []

  // Beat 0 — show the reference arrangement
  steps.push({
    phase: 'intro',
    checkLabel: null,
    checkPass: null,
    showAxis: false,
    showFlip: false,
    answerLabel: null,
    hold: 1600,
    result: false,
    caption: t(
      lang,
      'Here is the original picture — coloured pencils crossed in a # pattern.',
      'Ini gambar aslinya — pensil warna tersusun membentuk pola #.',
    ),
  })

  // Beat 1 — draw the mirror axis
  steps.push({
    phase: 'axis',
    checkLabel: null,
    checkPass: null,
    showAxis: true,
    showFlip: false,
    answerLabel: null,
    hold: 1400,
    result: false,
    caption: t(
      lang,
      'Imagine a mirror standing on the RIGHT side of the picture.',
      'Bayangkan cermin berdiri di sisi KANAN gambar.',
    ),
  })

  // Beat 2 — reveal the mirror image alongside the reference
  steps.push({
    phase: 'flip',
    checkLabel: null,
    checkPass: null,
    showAxis: true,
    showFlip: true,
    answerLabel: null,
    hold: 2000,
    result: false,
    caption: t(
      lang,
      'In the mirror the LEFT and RIGHT sides swap — the tips now point the other way.',
      'Di cermin, sisi KIRI dan KANAN bertukar — ujung pensil sekarang mengarah ke sisi yang berlawanan.',
    ),
  })

  // Beat 3–6 — check each wrong option, then B
  const allLabels: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E']
  for (const label of allLabels) {
    const pass = label === 'B'
    steps.push({
      phase: 'check',
      checkLabel: label,
      checkPass: pass,
      showAxis: false,
      showFlip: false,
      answerLabel: null,
      hold: pass ? 1800 : 1100,
      result: false,
      caption: pass
        ? t(
            lang,
            'B — the tips are flipped exactly left-to-right. This is the mirror image! ✓',
            'B — ujung-ujung pensil tertukar tepat dari kiri ke kanan. Ini bayangan cerminnya! ✓',
          )
        : t(
            lang,
            `${label} — the tips do not match a left-right flip of the original. ✗`,
            `${label} — ujung pensil tidak sesuai dengan kebalikan kiri-kanan dari gambar asli. ✗`,
          ),
    })
  }

  // Beat 8 — result
  steps.push({
    phase: 'result',
    checkLabel: 'B',
    checkPass: true,
    showAxis: false,
    showFlip: false,
    answerLabel: 'B',
    hold: 0,
    result: true,
    caption: t(
      lang,
      'Answer: B — it is the exact left-right mirror of the original picture.',
      'Jawaban: B — gambar B adalah bayangan cermin kiri-kanan dari gambar asli.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
