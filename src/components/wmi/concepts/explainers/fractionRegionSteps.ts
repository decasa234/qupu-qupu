import type { Lang } from './makeTenSteps'

export type FractionRegionPhase = 'whole' | 'shade' | 'count' | 'result'

export interface FractionRegionStep {
  phase: FractionRegionPhase
  caption: string
  result: boolean
}

export interface FractionRegionStoryboard {
  parts: number
  shaded: number
  unshaded: number
  answer: number
  steps: FractionRegionStep[]
  finalIndex: number
}

export function buildFractionRegionSteps(
  parts: number,
  shaded: number,
  lang: Lang,
): FractionRegionStoryboard {
  const unshaded = parts - shaded
  const answer = parts - shaded

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FractionRegionStep[] = [
    {
      phase: 'whole',
      caption: t(
        `This bar is divided into ${parts} equal parts.`,
        `Batang ini dibagi menjadi ${parts} bagian sama besar.`,
      ),
      result: false,
    },
    {
      phase: 'shade',
      caption: t(`${shaded} parts are shaded.`, `${shaded} bagian diarsir.`),
      result: false,
    },
    {
      phase: 'count',
      caption: t(
        `Count the parts that are NOT shaded.`,
        `Hitung bagian yang TIDAK diarsir.`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        `${parts} − ${shaded} = ${answer} parts.`,
        `${parts} − ${shaded} = ${answer} bagian.`,
      ),
      result: true,
    },
  ]

  return { parts, shaded, unshaded, answer, steps, finalIndex: steps.length - 1 }
}
