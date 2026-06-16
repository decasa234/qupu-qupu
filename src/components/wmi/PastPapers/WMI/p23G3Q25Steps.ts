import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { UNIT_SQUARES, MIN_TILING, MIN_SQUARES } from './P23G3Q25Illustration'

// WMI-23P3A-Q25 — the figure has 52 unit cells. To use as FEW squares as
// possible we must use the BIGGEST squares that fit. The most efficient packing
// of this shape still needs 10 squares (shown one at a time). Since the fewest
// possible is 10, you can never cut it into only 9 — so 9 cannot be □ → A.
// MIN_SQUARES and UNIT_SQUARES drive the numbers; nothing is hardcoded.

export interface DissectStep {
  /** How many tiling squares of MIN_TILING are shown. */
  shown: number
  /** Cells covered so far (running). */
  covered: number
  result: boolean
  caption: string
  hold: number
}

export interface DissectStoryboard {
  answer: number
  steps: DissectStep[]
  finalIndex: number
}

export function buildP23G3Q25Steps(lang: Lang): DissectStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DissectStep[] = []

  steps.push({
    shown: 0,
    covered: 0,
    result: false,
    hold: 2400,
    caption: t(
      `The figure has ${UNIT_SQUARES} unit cells. To use the fewest squares, pack in the biggest squares that fit.`,
      `Gambar punya ${UNIT_SQUARES} sel satuan. Untuk memakai sesedikit mungkin persegi, isi dengan persegi terbesar yang muat.`,
    ),
  })

  let covered = 0
  MIN_TILING.forEach((sq, i) => {
    covered += sq.size * sq.size
    const n = i + 1
    steps.push({
      shown: n,
      covered,
      result: false,
      hold: 1250,
      caption: t(
        `Square ${n}: a ${sq.size}×${sq.size} block (${sq.size * sq.size} cells) → ${covered} of ${UNIT_SQUARES} covered.`,
        `Persegi ${n}: blok ${sq.size}×${sq.size} (${sq.size * sq.size} sel) → ${covered} dari ${UNIT_SQUARES} tertutup.`,
      ),
    })
  })

  // Closing beat — the minimum is 10, so 9 is impossible → A.
  steps.push({
    shown: MIN_TILING.length,
    covered: UNIT_SQUARES,
    result: true,
    hold: 0,
    caption: t(
      `Even the tightest packing needs ${MIN_SQUARES} squares, so 9 is too few — 9 cannot be □ — answer A.`,
      `Bahkan susunan terketat butuh ${MIN_SQUARES} persegi, jadi 9 terlalu sedikit — 9 tidak bisa jadi □ — jawaban A.`,
    ),
  })

  return { answer: MIN_SQUARES, steps, finalIndex: steps.length - 1 }
}
