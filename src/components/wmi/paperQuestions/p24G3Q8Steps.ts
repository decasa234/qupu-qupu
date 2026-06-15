/**
 * Deterministic storyboard for WMI-24P3A-Q8 (folding a regular hexagon twice).
 *
 * Method (one idea per beat):
 *   1. Show the hexagon and the rule: the fold line must be a line of symmetry.
 *   2. Fold 1 (horizontal axis) → the half of a regular hexagon is an isosceles
 *      trapezoid.
 *   3. Fold 2 (vertical axis of that trapezoid) → a smaller right trapezoid,
 *      a quarter of the hexagon.
 *   4. That quarter-trapezoid is the pictured shape — option A.
 *
 * The choice figures A–D were separate images (not in the seed), so the final
 * beat names the answer letter explicitly.
 */
import type { Lang } from '../concepts/explainers/makeTenSteps'

export type P24G3Q8Phase = 'show' | 'fold1' | 'half' | 'fold2' | 'result'

export interface P24G3Q8Step {
  phase: P24G3Q8Phase
  showFold1: boolean
  showFold2: boolean
  showHalf: boolean
  showQuarter: boolean
  caption: string
  hold: number
  result: boolean
}

export interface P24G3Q8Storyboard {
  answer: string
  steps: P24G3Q8Step[]
  finalIndex: number
}

export function buildP24G3Q8Steps(lang: Lang): P24G3Q8Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: P24G3Q8Step[] = [
    {
      phase: 'show',
      showFold1: false,
      showFold2: false,
      showHalf: false,
      showQuarter: false,
      hold: 1800,
      result: false,
      caption: t('The fold line must be a line of symmetry, so the halves match.', 'Garis lipat harus garis simetri, agar kedua bagian sama.'),
    },
    {
      phase: 'fold1',
      showFold1: true,
      showFold2: false,
      showHalf: false,
      showQuarter: false,
      hold: 1900,
      result: false,
      caption: t('Fold 1: along the middle, vertex to vertex.', 'Lipat 1: sepanjang tengah, dari titik ke titik.'),
    },
    {
      phase: 'half',
      showFold1: true,
      showFold2: false,
      showHalf: true,
      showQuarter: false,
      hold: 2000,
      result: false,
      caption: t('Half a regular hexagon is a trapezoid (sides s and 2s).', 'Setengah segi enam beraturan adalah trapesium (sisi s dan 2s).'),
    },
    {
      phase: 'fold2',
      showFold1: false,
      showFold2: true,
      showHalf: true,
      showQuarter: false,
      hold: 2000,
      result: false,
      caption: t('Fold 2: fold the trapezoid in half again.', 'Lipat 2: lipat trapesium itu jadi dua lagi.'),
    },
    {
      phase: 'result',
      showFold1: false,
      showFold2: false,
      showHalf: false,
      showQuarter: true,
      hold: 0,
      result: true,
      caption: t('A right trapezoid (a quarter hexagon) is left — option A.', 'Tersisa trapesium siku-siku (seperempat segi enam) — pilihan A.'),
    },
  ]

  return { answer: 'A', steps, finalIndex: steps.length - 1 }
}
