// Storyboard for WMI-21P1A-Q23 — the "match all three views" explainer.
//
// The three bees see the top, right-side and front views of ONE solid. The
// method is elimination: a candidate solid must reproduce ALL three views; drop
// any solid that fails even one. Only Solid A survives → answer A.
import type { Lang } from '../concepts/explainers/makeTenSteps'

export type Q23Phase = 'show' | 'top' | 'right' | 'front' | 'eliminate' | 'result'

export interface Q23Step {
  phase: Q23Phase
  /** Which view to spotlight (-1 = none): 0 top, 1 right, 2 front. */
  glowIndex: number
  caption: string
  hold: number
  result: boolean
}

export interface Q23Storyboard {
  answer: string
  steps: Q23Step[]
  finalIndex: number
}

export function buildP21G1Q23Steps(lang: Lang): Q23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q23Step[] = [
    {
      phase: 'show',
      glowIndex: -1,
      hold: 1700,
      result: false,
      caption: t(
        'Three bees see three views of ONE solid: top, right, and front.',
        'Tiga lebah melihat tiga tampilan dari SATU bangun: atas, kanan, dan depan.',
      ),
    },
    {
      phase: 'top',
      glowIndex: 0,
      hold: 1900,
      result: false,
      caption: t(
        'Top view (blue bee): looking straight down, the solid covers this shape.',
        'Tampilan atas (lebah biru): dilihat dari atas, bangun menutupi bentuk ini.',
      ),
    },
    {
      phase: 'right',
      glowIndex: 1,
      hold: 1900,
      result: false,
      caption: t(
        'Right view (green bee): from the side it must look exactly like this.',
        'Tampilan kanan (lebah hijau): dari samping harus tampak persis seperti ini.',
      ),
    },
    {
      phase: 'front',
      glowIndex: 2,
      hold: 1900,
      result: false,
      caption: t(
        'Front view (pink bee): from the front it must be this staircase.',
        'Tampilan depan (lebah merah muda): dari depan harus berbentuk tangga ini.',
      ),
    },
    {
      phase: 'eliminate',
      glowIndex: -1,
      hold: 2100,
      result: false,
      caption: t(
        'Test each solid: drop any that fails even ONE of the three views.',
        'Uji tiap bangun: buang yang gagal walau di SATU tampilan saja.',
      ),
    },
    {
      phase: 'result',
      glowIndex: -1,
      hold: 0,
      result: true,
      caption: t(
        'Only Solid A matches all three views at once — answer A.',
        'Hanya Bangun A yang cocok dengan ketiga tampilan sekaligus — jawaban A.',
      ),
    },
  ]

  return { answer: 'A', steps, finalIndex: steps.length - 1 }
}
