import type { Lang } from './makeTenSteps'

export type ClockPhase = 'show' | 'minutes' | 'hours' | 'result'

export interface ClockStep {
  phase: ClockPhase
  /** Minute-hand angle in degrees (accumulated, so the hand sweeps forward). */
  minAngle: number
  /** Hour-hand angle in degrees (accumulated). */
  hourAngle: number
  caption: string
  result: boolean
}

export interface ClockStoryboard {
  hour: number
  minute: number
  addHour: number
  addMin: number
  startStr: string
  resultStr: string
  result: { hour: number; minute: number }
  steps: ClockStep[]
  finalIndex: number
}

function fmt(h: number, m: number): string {
  return `${h}:${String(m).padStart(2, '0')}`
}

function timeAfter(hour: number, minute: number, addHour: number, addMin: number): { hour: number; minute: number } {
  const start = (hour % 12) * 60 + minute
  const total = (start + addHour * 60 + addMin) % 720
  const h12 = Math.floor(total / 60)
  return { hour: h12 === 0 ? 12 : h12, minute: total % 60 }
}

export function buildClockAfterSteps(
  hour: number,
  minute: number,
  addHour: number,
  addMin: number,
  lang: Lang,
): ClockStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const startStr = fmt(hour, minute)
  const afterMin = timeAfter(hour, minute, 0, addMin)
  const final = timeAfter(hour, minute, addHour, addMin)
  const afterMinStr = fmt(afterMin.hour, afterMin.minute)
  const resultStr = fmt(final.hour, final.minute)

  // Accumulated angles so each hand sweeps forward (the minute hand moves on the
  // 'minutes' beat; the hour hand creeps with the minutes, then jumps the hours).
  const baseMin = minute * 6
  const baseHour = (hour % 12) * 30 + minute * 0.5
  const minAfter = baseMin + addMin * 6
  const hourAfterMin = baseHour + addMin * 0.5
  const hourFinal = hourAfterMin + addHour * 30

  const hWord = addHour === 1 ? 'hour' : 'hours'
  const steps: ClockStep[] = [
    {
      phase: 'show', minAngle: baseMin, hourAngle: baseHour, result: false,
      caption: t(`The clock shows ${startStr}.`, `Jam menunjukkan ${startStr}.`),
    },
    {
      phase: 'minutes', minAngle: minAfter, hourAngle: hourAfterMin, result: false,
      caption: t(`Forward ${addMin} minutes → ${afterMinStr}.`, `Maju ${addMin} menit → ${afterMinStr}.`),
    },
    {
      phase: 'hours', minAngle: minAfter, hourAngle: hourFinal, result: false,
      caption: t(`Forward ${addHour} ${hWord} → ${resultStr}.`, `Maju ${addHour} jam → ${resultStr}.`),
    },
    {
      phase: 'result', minAngle: minAfter, hourAngle: hourFinal, result: true,
      caption: t(`The clock shows ${resultStr}.`, `Jam menunjukkan ${resultStr}.`),
    },
  ]

  return { hour, minute, addHour, addMin, startStr, resultStr, result: final, steps, finalIndex: steps.length - 1 }
}
