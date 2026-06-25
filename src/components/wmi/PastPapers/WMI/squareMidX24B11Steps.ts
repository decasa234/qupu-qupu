/**
 * SEAMOX-24-B-Q11 — Beat-by-beat storyboard.
 *
 * Strategy: express △BGC as 1/5 of the square, then scale from 48 cm².
 *
 * Phase legend:
 *  'setup' — show square with midpoints only (no lines)
 *  'lines' — draw EB and FC to reveal intersection G
 *  'shade' — highlight triangle BGC and show fraction
 *  'solve' — state the equation s²/5 = 48 → answer 240 cm²
 */

export type SquareMidPhase = 'setup' | 'lines' | 'shade' | 'solve'

export interface SquareMidStep {
  phase: SquareMidPhase
  showLines: boolean
  showShade: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SquareMidStoryboard {
  steps: SquareMidStep[]
  finalIndex: number
}

export function buildSquareMidX24B11Steps(lang: 'en' | 'id'): SquareMidStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SquareMidStep[] = [
    {
      phase: 'setup',
      showLines: false,
      showShade: false,
      hold: 1400,
      result: false,
      caption: t(
        'Square ABCD, side s. Mark E = midpoint of AD; F = midpoint of AB.',
        'Persegi ABCD, sisi s. Tandai E = titik tengah AD; F = titik tengah AB.',
      ),
    },
    {
      phase: 'lines',
      showLines: true,
      showShade: false,
      hold: 1600,
      result: false,
      caption: t(
        'Draw diagonal EB and diagonal FC — they cross inside the square at G.',
        'Tarik garis EB dan FC — keduanya bersilangan di dalam persegi di titik G.',
      ),
    },
    {
      phase: 'shade',
      showLines: true,
      showShade: true,
      hold: 1800,
      result: false,
      caption: t(
        'The shaded region is △BGC. Setting A at (0,0): G = (3s/5, s/5), so area = s²/5.',
        'Daerah yang diarsir adalah △BGC. Dengan A di (0,0): G = (3s/5, s/5), luas = s²/5.',
      ),
    },
    {
      phase: 'solve',
      showLines: true,
      showShade: true,
      hold: 0,
      result: true,
      caption: t(
        's²/5 = 48  →  s² = 5 × 48 = 240 cm².',
        's²/5 = 48  →  s² = 5 × 48 = 240 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
