// IKMC-19-EC-Q15 — storyboard for the glass-of-water weight animation.
//
// Question: Full glass = 400 g, empty glass = 100 g. Half-full = ? g.
// Answer: D (250 g).
//
// Teaching walk, one idea per beat:
//   0. intro       — show the three glasses; state the two given weights.
//   1. water-mass  — water alone = 400 − 100 = 300 g.
//   2. half-water  — half the water = 300 ÷ 2 = 150 g.
//   3. half-full   — half-full glass = glass + half-water = 100 + 150 = 250 g.
//   4. result      — 250 g → D (green).
//
// The `fillFraction` and `highlightIndex` fields drive the explainer SVG.
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type GlassPhase = 'intro' | 'water-mass' | 'half-water' | 'half-full' | 'result'

export interface GlassBeat {
  phase: GlassPhase
  /**
   * Fill fractions for the three glasses [full, empty, question].
   * The question glass animates from 0.5 (problem state) to the final reveal.
   */
  fills: [number, number, number]
  /** Index (0/1/2) of the glass to highlight with a ring; -1 = none. */
  highlight: number
  /** Equation / maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface GlassStoryboard {
  steps: GlassBeat[]
  finalIndex: number
}

// Fixed problem quantities — bind to the seed's breakdown.quantities so the
// animation can never drift from the data.
export const FULL_GLASS_G = 400     // full glass weight
export const EMPTY_GLASS_G = 100    // empty glass weight
export const WATER_G = FULL_GLASS_G - EMPTY_GLASS_G  // 300 g
export const HALF_WATER_G = WATER_G / 2               // 150 g
export const HALF_FULL_G = EMPTY_GLASS_G + HALF_WATER_G // 250 g — answer D

export function buildGlassWater15ECSteps(lang: Lang): GlassStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GlassBeat[] = [
    // Beat 0 — intro: show the three glasses and the two known weights
    {
      phase: 'intro',
      fills: [1, 0, 0.5],
      highlight: -1,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        `Full glass = ${FULL_GLASS_G} g. Empty glass = ${EMPTY_GLASS_G} g. How much does the half-full glass weigh?`,
        `Gelas penuh = ${FULL_GLASS_G} g. Gelas kosong = ${EMPTY_GLASS_G} g. Berapa berat gelas setengah penuh?`,
      ),
    },

    // Beat 1 — isolate the water weight
    {
      phase: 'water-mass',
      fills: [1, 0, 0.5],
      highlight: 0,
      equation: `${FULL_GLASS_G} − ${EMPTY_GLASS_G} = ${WATER_G} g`,
      hold: 2200,
      result: false,
      caption: t(
        `Water alone = full − empty = ${FULL_GLASS_G} − ${EMPTY_GLASS_G} = ${WATER_G} g.`,
        `Berat air saja = penuh − kosong = ${FULL_GLASS_G} − ${EMPTY_GLASS_G} = ${WATER_G} g.`,
      ),
    },

    // Beat 2 — halve the water
    {
      phase: 'half-water',
      fills: [1, 0, 0.5],
      highlight: 2,
      equation: `${WATER_G} ÷ 2 = ${HALF_WATER_G} g`,
      hold: 2200,
      result: false,
      caption: t(
        `Half-full means half the water: ${WATER_G} ÷ 2 = ${HALF_WATER_G} g of water.`,
        `Setengah penuh berarti setengah air: ${WATER_G} ÷ 2 = ${HALF_WATER_G} g air.`,
      ),
    },

    // Beat 3 — add the glass back
    {
      phase: 'half-full',
      fills: [1, 0, 0.5],
      highlight: 2,
      equation: `${EMPTY_GLASS_G} + ${HALF_WATER_G} = ${HALF_FULL_G} g`,
      hold: 2200,
      result: false,
      caption: t(
        `Half-full glass = glass + half water = ${EMPTY_GLASS_G} + ${HALF_WATER_G} = ${HALF_FULL_G} g.`,
        `Gelas setengah penuh = gelas + setengah air = ${EMPTY_GLASS_G} + ${HALF_WATER_G} = ${HALF_FULL_G} g.`,
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      fills: [1, 0, 0.5],
      highlight: 2,
      equation: `${HALF_FULL_G} g → D`,
      hold: 0,
      result: true,
      caption: t(
        `A half-full glass weighs ${HALF_FULL_G} grams — answer D.`,
        `Gelas setengah penuh beratnya ${HALF_FULL_G} gram — jawaban D.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
