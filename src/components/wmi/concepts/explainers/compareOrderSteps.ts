import type { Lang } from './makeTenSteps'

export interface CompareOrderStep {
  /** Bars have grown under the number cards. */
  showBars: boolean
  /** Cards are in descending order (vs the given order). */
  ordered: boolean
  /** `>` signs are shown between the cards. */
  showGt: boolean
  caption: string
  result: boolean
}

export interface CompareOrderStoryboard {
  given: number[]
  ordered: number[]
  /** The correct descending chain, e.g. "78 > 42 > 15". */
  chain: string
  steps: CompareOrderStep[]
  finalIndex: number
}

function clampTwoDigit(n: number): number {
  if (!Number.isFinite(n)) return 11
  return Math.max(11, Math.min(98, Math.round(n)))
}

export function buildCompareOrderSteps(x: number, y: number, z: number, lang: Lang): CompareOrderStoryboard {
  const given = [x, y, z].map(clampTwoDigit)
  const ordered = [...given].sort((a, b) => b - a)
  const chain = `${ordered[0]} > ${ordered[1]} > ${ordered[2]}`
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CompareOrderStep[] = [
    {
      showBars: false, ordered: false, showGt: false,
      caption: t('Three numbers to put in order.', 'Tiga bilangan untuk diurutkan.'), result: false,
    },
    {
      showBars: true, ordered: false, showGt: false,
      caption: t('A bigger number makes a taller bar.', 'Bilangan lebih besar, batangnya lebih tinggi.'), result: false,
    },
    {
      showBars: true, ordered: true, showGt: false,
      caption: t('Put them biggest first.', 'Urutkan dari yang terbesar.'), result: false,
    },
    {
      showBars: true, ordered: true, showGt: true,
      caption: t('Each is bigger than the next.', 'Tiap bilangan lebih besar dari berikutnya.'), result: false,
    },
    {
      showBars: true, ordered: true, showGt: true,
      caption: chain, result: true,
    },
  ]

  return { given, ordered, chain, steps, finalIndex: steps.length - 1 }
}
