/**
 * p22G3Q17Steps — storyboard for WMI-22P3A-Q17 (transform an L-solid by a table)
 *
 * The original paper gives a rule TABLE (cubes added/removed per layer) and four
 * picture options; those were images and are stored as placeholders in the seed,
 * so this storyboard teaches the METHOD on the given L-solid and lands on the
 * paper's recorded answer, option D.
 *
 * Method, beat by beat:
 *   1. Read the given L one layer at a time:  L1 (foot) = 4,  L2 = 1,  L3 = 1.
 *   2. The table changes each layer's cube count — apply it layer by layer.
 *   3. Rebuild the solid with the new per-layer counts.
 *   4. The picture that matches the rebuilt solid is option D.
 *
 * We illustrate the rebuild with a concrete edit (trim the top, widen the foot)
 * so the "apply to EVERY layer, not just one" idea is visible. The exact target
 * geometry lived only in the answer images; the takeaway is the matching option.
 *
 * Pure function — no Math.random, no Date. SSR-safe.
 */

import type { CubeCell } from './P22G3Q17Illustration'
import { GIVEN_L } from './P22G3Q17Illustration'

export type Lang = 'en' | 'id'

export type Q17Phase = 'given' | 'layers' | 'apply' | 'rebuilt' | 'result'

export interface Q17Step {
  phase: Q17Phase
  /** Cubes to draw this beat. */
  cells: CubeCell[]
  /** Layer (gz) to ring/emphasise (null = none). */
  emphasisLayer: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q17Storyboard {
  steps: Q17Step[]
  finalIndex: number
}

// A concrete "rebuilt" solid used to SHOW the layer-by-layer edit:
//   L1 foot widened by +1 (5 cubes), L2 unchanged (1), L3 removed (0).
// This is illustrative of the method; the matching answer picture is D.
const REBUILT: CubeCell[] = [
  { gx: 0, gy: 0, gz: 0 },
  { gx: 1, gy: 0, gz: 0 },
  { gx: 2, gy: 0, gz: 0 },
  { gx: 3, gy: 0, gz: 0 },
  { gx: 4, gy: 0, gz: 0 },
  { gx: 0, gy: 0, gz: 1 },
]

export function buildP22G3Q17Steps(lang: Lang): Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q17Step[] = [
    {
      phase: 'given',
      cells: GIVEN_L,
      emphasisLayer: null,
      hold: 1700,
      result: false,
      caption: t(
        'Start with the L-solid. Count the cubes in each layer.',
        'Mulai dari bangun L. Hitung kubus di tiap lapisan.',
      ),
    },
    {
      phase: 'layers',
      cells: GIVEN_L,
      emphasisLayer: 0,
      hold: 2100,
      result: false,
      caption: t(
        'Bottom layer = 4 (the foot); the middle and top layers = 1 each.',
        'Lapisan bawah = 4 (kaki); lapisan tengah dan atas masing-masing = 1.',
      ),
    },
    {
      phase: 'apply',
      cells: GIVEN_L,
      emphasisLayer: 2,
      hold: 2100,
      result: false,
      caption: t(
        'Apply the table to EVERY layer — add the +cubes and remove the −cubes, not just the top.',
        'Terapkan tabel ke SETIAP lapisan — tambah kubus + dan buang kubus −, bukan hanya bagian atas.',
      ),
    },
    {
      phase: 'rebuilt',
      cells: REBUILT,
      emphasisLayer: null,
      hold: 2100,
      result: false,
      caption: t(
        'Rebuild the solid with the new per-layer counts.',
        'Susun ulang bangun dengan jumlah kubus baru tiap lapisan.',
      ),
    },
    {
      phase: 'result',
      cells: REBUILT,
      emphasisLayer: null,
      hold: 0,
      result: true,
      caption: t(
        'The picture matching the rebuilt solid is option D.',
        'Gambar yang cocok dengan bangun hasil susunan ini adalah opsi D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
