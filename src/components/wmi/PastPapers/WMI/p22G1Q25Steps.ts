import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { MAX_GROUPS, VERIFIED_PACKING } from './P22G1Q25Illustration'

export type NumberGrid25Phase = 'intro' | 'pack' | 'result'

export interface NumberGrid25Step {
  phase: NumberGrid25Phase
  /** How many of the verified groups to shade so far (0..13). */
  groupCount: number
  showCount: boolean
  caption: string
  hold: number
  result: boolean
}

export interface NumberGrid25Storyboard {
  maxGroups: number
  steps: NumberGrid25Step[]
  finalIndex: number
}

export function buildP22G1Q25Steps(lang: Lang): NumberGrid25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const total = VERIFIED_PACKING.length // 13

  const steps: NumberGrid25Step[] = [
    {
      phase: 'intro',
      groupCount: 0,
      showCount: false,
      caption: t(
        'Each group is 3 touching squares that add to 16, and no square may be reused.',
        'Setiap kelompok adalah 3 kotak bersebelahan yang berjumlah 16, dan tiap kotak hanya sekali.',
      ),
      hold: 2000,
      result: false,
    },
    {
      phase: 'pack',
      groupCount: 4,
      showCount: true,
      caption: t(
        'Start in the top rows: e.g. 3+9+4, 5+2+9, 6+4+6, 6+4+6 — four groups so far.',
        'Mulai dari baris atas: mis. 3+9+4, 5+2+9, 6+4+6, 6+4+6 — empat kelompok.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'pack',
      groupCount: 8,
      showCount: true,
      caption: t(
        'Keep packing the middle, leaving no gaps you could have filled — eight now.',
        'Terus isi bagian tengah, jangan sisakan celah yang bisa dipakai — sekarang delapan.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'pack',
      groupCount: total,
      showCount: true,
      caption: t(
        `Fit the rest into the lower rows. The most you can fit at once is ${total}.`,
        `Pasang sisanya di baris bawah. Paling banyak yang muat sekaligus adalah ${total}.`,
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'result',
      groupCount: total,
      showCount: true,
      caption: t(
        `${MAX_GROUPS} non-overlapping groups of 16 — the answer is ${MAX_GROUPS} (D).`,
        `${MAX_GROUPS} kelompok berjumlah 16 yang tak bertumpang — jawabannya ${MAX_GROUPS} (D).`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return { maxGroups: MAX_GROUPS, steps, finalIndex: steps.length - 1 }
}
