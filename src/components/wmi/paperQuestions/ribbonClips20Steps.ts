import type { Lang } from '../concepts/explainers/makeTenSteps'
import { CLIPS_ANSWER } from './RibbonClips20Illustration'

export interface RibbonClipsStep {
  /** Measuring clips visible under the ribbon (0 = just the loose reference clip). */
  clipsShown: number
  /** Final beat: count labels turn green. */
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface RibbonClipsStoryboard {
  answer: number
  steps: RibbonClipsStep[]
  finalIndex: number
}

export function buildRibbonClips20Steps(lang: Lang): RibbonClipsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RibbonClipsStep[] = [
    {
      clipsShown: 0,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'How many paperclips long is the ribbon? Use the paperclip as a measuring stick.',
        'Pita itu sama panjang dengan berapa klip kertas? Gunakan klip kertas sebagai alat ukur.',
      ),
    },
    {
      clipsShown: 1,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'Lay a paperclip right under the ribbon — that is 1.',
        'Susun satu klip kertas tepat di bawah pita — itu 1.',
      ),
    },
    {
      clipsShown: 2,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'Add another, end to end with no gaps — 2 so far.',
        'Tambah satu lagi, berjajar tanpa celah — sudah 2.',
      ),
    },
    {
      clipsShown: 3,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'One more fits — 3, and it reaches the end of the ribbon exactly.',
        'Satu lagi muat — 3, dan pas sampai ujung pita.',
      ),
    },
    {
      clipsShown: 3,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `Exactly ${CLIPS_ANSWER} paperclips fit — the ribbon is ${CLIPS_ANSWER} paperclips long (B).`,
        `Tepat ${CLIPS_ANSWER} klip kertas muat — panjang pita itu ${CLIPS_ANSWER} klip kertas (B).`,
      ),
    },
  ]

  return { answer: CLIPS_ANSWER, steps, finalIndex: steps.length - 1 }
}
