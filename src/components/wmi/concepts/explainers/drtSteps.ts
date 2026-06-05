import type { Lang } from './makeTenSteps'

export type DrtPhase = 'setup' | 'formula' | 'compute' | 'result'

export interface DrtStep {
  phase: DrtPhase
  caption: string
  result: boolean
}

export interface DrtStoryboard {
  mode: 'distance' | 'time'
  rate: number
  t: number
  distance: number
  answer: number
  steps: DrtStep[]
  finalIndex: number
}

export function buildDrtSteps(
  mode: 'distance' | 'time',
  rate: number,
  t: number,
  lang: Lang,
): DrtStoryboard {
  const distance = rate * t
  const answer = mode === 'distance' ? distance : t
  const tr = (en: string, id: string) => (lang === 'id' ? id : en)

  let steps: DrtStep[]

  if (mode === 'distance') {
    steps = [
      {
        phase: 'setup',
        caption: tr(
          `A car goes ${rate} km every hour, for ${t} hours.`,
          `Mobil melaju ${rate} km tiap jam, selama ${t} jam.`,
        ),
        result: false,
      },
      {
        phase: 'formula',
        caption: tr('Distance = speed × time.', 'Jarak = kecepatan × waktu.'),
        result: false,
      },
      {
        phase: 'compute',
        caption: tr(`${rate} × ${t} = ${distance}.`, `${rate} × ${t} = ${distance}.`),
        result: false,
      },
      {
        phase: 'result',
        caption: tr(`It travels ${distance} km.`, `Jaraknya ${distance} km.`),
        result: true,
      },
    ]
  } else {
    steps = [
      {
        phase: 'setup',
        caption: tr(
          `A car goes ${rate} km every hour and must travel ${distance} km.`,
          `Mobil melaju ${rate} km tiap jam dan harus menempuh ${distance} km.`,
        ),
        result: false,
      },
      {
        phase: 'formula',
        caption: tr('Time = distance ÷ speed.', 'Waktu = jarak ÷ kecepatan.'),
        result: false,
      },
      {
        phase: 'compute',
        caption: tr(`${distance} ÷ ${rate} = ${t}.`, `${distance} ÷ ${rate} = ${t}.`),
        result: false,
      },
      {
        phase: 'result',
        caption: tr(`It takes ${t} hours.`, `Membutuhkan ${t} jam.`),
        result: true,
      },
    ]
  }

  return { mode, rate, t, distance, answer, steps, finalIndex: steps.length - 1 }
}
