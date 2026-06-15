import type { Lang } from '../concepts/explainers/makeTenSteps'
import { FIGURES } from './CircleRect22G1Option'

// Storyboard for WMI-22F1A-Q10 (Grade 1). The question: "Which figure has MORE
// circles than rectangles?" We state the goal, then check each option A→D —
// counting its circles and its rectangles and judging circles > rectangles.
// Only figure A passes. Counts are DERIVED from FIGURES (the illustrator's
// verified per-option data) so captions can never drift from the drawing.
//
// Pure function of `lang` — SSR-safe and deterministic (no random/date).

export type Label = 'A' | 'B' | 'C' | 'D'

export interface CircleRectStep {
  /** Which option this beat is examining (undefined on the goal-framing intro). */
  label?: Label
  /** Highlight one shape kind on this beat: ring the circles, then the rectangles. */
  mark?: 'circle' | 'rect'
  /** Circle count shown so far (revealed once the circles have been marked). */
  showCircles: boolean
  /** Rectangle count shown so far (revealed once the rectangles have been marked). */
  showRects: boolean
  /** 'pass' | 'fail' | undefined (not yet judged) — drives the verdict badge. */
  verdict?: 'pass' | 'fail'
  caption: string
  hold: number
  /** True only on the winning final beat (green styling). */
  result: boolean
}

export interface CircleRectStoryboard {
  answer: Label
  goalLabel: string
  circlesLabel: string
  rectsLabel: string
  steps: CircleRectStep[]
  finalIndex: number
}

const ORDER: Label[] = ['A', 'B', 'C', 'D']

export function buildCircleRect22G1Steps(lang: Lang): CircleRectStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answer: Label = 'A'
  const tick = '✓'
  const cross = '✗'

  const steps: CircleRectStep[] = []

  // Beat 1 — state the goal. Show figure A as a neutral sample, no counts yet.
  steps.push({
    showCircles: false,
    showRects: false,
    hold: 2400,
    result: false,
    caption: t(
      'Goal: find the picture with MORE circles than rectangles. Check each one — count the circles, count the rectangles!',
      'Tujuan: cari gambar dengan lebih banyak LINGKARAN daripada PERSEGI PANJANG. Cek satu per satu — hitung lingkaran, hitung persegi panjang!',
    ),
  })

  // Beats per option: ring the circles (reveal circle count), ring the
  // rectangles (reveal rect count + judge circles > rects).
  for (const label of ORDER) {
    const fig = FIGURES[label]
    const circles = fig.circles
    const rects = fig.rects
    const pass = circles > rects
    const tie = circles === rects

    // Circle count beat.
    steps.push({
      label,
      mark: 'circle',
      showCircles: true,
      showRects: false,
      hold: 1900,
      result: false,
      caption: t(
        `Figure ${label}: count the circles… ${circles} circles. Now the rectangles…`,
        `Gambar ${label}: hitung lingkarannya… ${circles} lingkaran. Sekarang persegi panjangnya…`,
      ),
    })

    // Rectangle count beat + verdict.
    steps.push({
      label,
      mark: 'rect',
      showCircles: true,
      showRects: true,
      verdict: pass ? 'pass' : 'fail',
      hold: pass ? 2200 : 2400,
      result: false,
      caption: pass
        ? t(
            `Figure ${label}: ${circles} circles vs ${rects} rectangles — more circles ${tick}!`,
            `Gambar ${label}: ${circles} lingkaran lawan ${rects} persegi panjang — lebih banyak lingkaran ${tick}!`,
          )
        : tie
          ? t(
              `Figure ${label}: ${circles} circles vs ${rects} rectangles — that's a TIE, not MORE ${cross}, so ${label} is out.`,
              `Gambar ${label}: ${circles} lingkaran lawan ${rects} persegi panjang — itu SERI, bukan LEBIH BANYAK ${cross}, jadi ${label} gugur.`,
            )
          : t(
              `Figure ${label}: ${circles} circles vs ${rects} rectangles — fewer circles ${cross}, so ${label} is out.`,
              `Gambar ${label}: ${circles} lingkaran lawan ${rects} persegi panjang — lebih sedikit lingkaran ${cross}, jadi ${label} gugur.`,
            ),
    })
  }

  // Final beat — A is the only figure with more circles than rectangles.
  const win = FIGURES[answer]
  steps.push({
    label: answer,
    showCircles: true,
    showRects: true,
    verdict: 'pass',
    hold: 0,
    result: true,
    caption: t(
      `Only figure ${answer} has more circles than rectangles (${win.circles} vs ${win.rects}) — the answer is ${answer}.`,
      `Hanya gambar ${answer} yang lebih banyak lingkaran daripada persegi panjang (${win.circles} lawan ${win.rects}) — jawabannya ${answer}.`,
    ),
  })

  return {
    answer,
    goalLabel: t('more circles than rectangles', 'lebih banyak lingkaran'),
    circlesLabel: t('circles', 'lingkaran'),
    rectsLabel: t('rectangles', 'persegi panjang'),
    steps,
    finalIndex: steps.length - 1,
  }
}
