import type { Lang } from './makeTenSteps'

export type ReversePhase = 'puzzle' | 'base' | 'flip' | 'number' | 'digits' | 'result'

export interface ReverseStep {
  phase: ReversePhase
  caption: string
  result: boolean
}

export interface ReverseStoryboard {
  d: number
  r: number
  /** Smallest d-digit number (10 or 100). */
  base: number
  /** The mystery number = base + r. */
  number: number
  digits: number[]
  /** Digit sum of the number — the answer. */
  answer: number
  steps: ReverseStep[]
  finalIndex: number
}

export function buildReverseArithmeticSteps(d: number, r: number, lang: Lang): ReverseStoryboard {
  const dd = d >= 3 ? 3 : 2
  const base = dd === 2 ? 10 : 100
  const number = base + r
  const digits = String(number)
    .split('')
    .map((c) => Number(c))
  const answer = digits.reduce((s, x) => s + x, 0)
  const word = dd === 2 ? (lang === 'id' ? 'dua' : 'two') : lang === 'id' ? 'tiga' : 'three'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const sumStr = digits.join(' + ')

  const steps: ReverseStep[] = [
    {
      phase: 'puzzle',
      caption: t(`A number minus ${base} equals ${r}.`, `Sebuah bilangan dikurangi ${base} sama dengan ${r}.`),
      result: false,
    },
    {
      phase: 'base',
      caption: t(`The smallest ${word}-digit number is ${base}.`, `Bilangan ${word} angka terkecil adalah ${base}.`),
      result: false,
    },
    {
      phase: 'flip',
      caption: t(`Work backward: undo −${base} by adding ${base}.`, `Kerja terbalik: batalkan −${base} dengan menambah ${base}.`),
      result: false,
    },
    {
      phase: 'number',
      caption: t(`So the number is ${number}.`, `Jadi bilangannya ${number}.`),
      result: false,
    },
    {
      phase: 'digits',
      caption: t(`Add its digits: ${sumStr}.`, `Jumlahkan digitnya: ${sumStr}.`),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`The digit sum is ${answer}.`, `Jumlah digitnya ${answer}.`),
      result: true,
    },
  ]

  return { d: dd, r, base, number, digits, answer, steps, finalIndex: steps.length - 1 }
}
