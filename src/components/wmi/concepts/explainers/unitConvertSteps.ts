import type { Lang } from './makeTenSteps'

export type UnitConvertMode = 'm-cm' | 'kg-g' | 'dollar-cent'
export type UnitConvertPhase = 'setup' | 'rule' | 'compute' | 'result'

export interface UnitConvertStep {
  phase: UnitConvertPhase
  caption: string
  result: boolean
}

export interface UnitConvertStoryboard {
  mode: UnitConvertMode
  big: number
  small: number
  factor: number
  bigU: string
  smallU: string
  answer: number
  steps: UnitConvertStep[]
  finalIndex: number
}

const UNITS: Record<
  UnitConvertMode,
  { factor: number; bigEn: string; smallEn: string; bigId: string; smallId: string }
> = {
  'm-cm': { factor: 100, bigEn: 'm', smallEn: 'cm', bigId: 'meter', smallId: 'cm' },
  'kg-g': { factor: 1000, bigEn: 'kg', smallEn: 'g', bigId: 'kg', smallId: 'gram' },
  'dollar-cent': { factor: 100, bigEn: 'dollar', smallEn: 'cent', bigId: 'dolar', smallId: 'sen' },
}

export function buildUnitConvertSteps(
  mode: UnitConvertMode,
  big: number,
  small: number,
  lang: Lang,
): UnitConvertStoryboard {
  const u = UNITS[mode]
  const factor = u.factor
  const bigU = lang === 'id' ? u.bigId : u.bigEn
  const smallU = lang === 'id' ? u.smallId : u.smallEn
  const answer = big * factor + small

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: UnitConvertStep[] = [
    {
      phase: 'setup',
      caption: t(
        `Convert ${big} ${bigU} ${small} ${smallU} into ${smallU}.`,
        `Ubah ${big} ${bigU} ${small} ${smallU} ke ${smallU}.`,
      ),
      result: false,
    },
    {
      phase: 'rule',
      caption: t(`1 ${bigU} = ${factor} ${smallU}.`, `1 ${bigU} = ${factor} ${smallU}.`),
      result: false,
    },
    {
      phase: 'compute',
      caption: t(
        `${big} × ${factor} = ${big * factor}, then + ${small}.`,
        `${big} × ${factor} = ${big * factor}, lalu + ${small}.`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`= ${answer} ${smallU}.`, `= ${answer} ${smallU}.`),
      result: true,
    },
  ]

  return { mode, big, small, factor, bigU, smallU, answer, steps, finalIndex: steps.length - 1 }
}
