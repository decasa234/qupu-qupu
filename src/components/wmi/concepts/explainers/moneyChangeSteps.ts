import type { Lang } from './makeTenSteps'

export type MoneyChangePhase = 'setup' | 'rule' | 'compute' | 'result'

export interface MoneyChangeStep {
  phase: MoneyChangePhase
  caption: string
  result: boolean
}

export interface MoneyChangeStoryboard {
  cost: number
  pay: number
  change: number
  name: string
  steps: MoneyChangeStep[]
  finalIndex: number
}

export function buildMoneyChangeSteps(
  cost: number,
  pay: number,
  name: string,
  itemEn: string,
  itemId: string,
  lang: Lang,
): MoneyChangeStoryboard {
  const change = pay - cost
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MoneyChangeStep[] = [
    {
      phase: 'setup',
      caption: t(
        `${name} pays ${pay} for a ${itemEn} that costs ${cost}.`,
        `${name} membayar ${pay} untuk ${itemId} seharga ${cost}.`,
      ),
      result: false,
    },
    {
      phase: 'rule',
      caption: t('Change = money paid − price.', 'Kembalian = uang dibayar − harga.'),
      result: false,
    },
    {
      phase: 'compute',
      caption: t(`${pay} − ${cost} = ${change}.`, `${pay} − ${cost} = ${change}.`),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`${name} gets ${change} back.`, `${name} menerima kembalian ${change}.`),
      result: true,
    },
  ]

  return { cost, pay, change, name, steps, finalIndex: steps.length - 1 }
}
