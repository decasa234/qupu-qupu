// Storyboard for the WMI-19P3A-Q20 explainer ("which figure is the same?").
// The original options were images; the key is A — the SAME solid, rotated (not
// mirrored). These beats teach the rotate-don't-flip method and land on A.

import type { Lang } from '../concepts/explainers/makeTenSteps'

export type Q20Phase = 'given' | 'feature' | 'rotate' | 'mirror' | 'result'

export interface Q20Step {
  phase: Q20Phase
  /** 'orig' shows the given solid; 'rot' shows it rotated; 'mir' shows a flip. */
  view: 'orig' | 'rot' | 'mir'
  /** Highlight the tower (the chosen feature) this beat. */
  highlightTower: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q20Storyboard {
  answer: string
  steps: Q20Step[]
  finalIndex: number
}

export function buildP19G3Q20Steps(lang: Lang): Q20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q20Step[] = [
    {
      phase: 'given',
      view: 'orig',
      highlightTower: false,
      hold: 1800,
      result: false,
      caption: t('This is the solid we must match.', 'Inilah bangun yang harus dicocokkan.'),
    },
    {
      phase: 'feature',
      view: 'orig',
      highlightTower: true,
      hold: 2000,
      result: false,
      caption: t(
        'Pick one clear feature — the tower of 2 cubes — and follow it.',
        'Pilih satu ciri jelas — menara 2 kubus — lalu ikuti.',
      ),
    },
    {
      phase: 'rotate',
      view: 'rot',
      highlightTower: true,
      hold: 2200,
      result: false,
      caption: t(
        'A correct match is the SAME shape, just turned (rotated).',
        'Jawaban benar adalah bentuk SAMA, hanya diputar (dirotasi).',
      ),
    },
    {
      phase: 'mirror',
      view: 'mir',
      highlightTower: true,
      hold: 2200,
      result: false,
      caption: t(
        'A mirror image looks similar but the jutting cube lands on the wrong side — skip it.',
        'Bayangan cermin mirip tapi kubus yang menonjol ada di sisi yang salah — lewati.',
      ),
    },
    {
      phase: 'result',
      view: 'rot',
      highlightTower: false,
      hold: 0,
      result: true,
      caption: t(
        'Only choice A rotates exactly onto the original — the answer is A.',
        'Hanya pilihan A yang berputar tepat menjadi aslinya — jawabannya A.',
      ),
    },
  ]

  return { answer: 'A', steps, finalIndex: steps.length - 1 }
}
