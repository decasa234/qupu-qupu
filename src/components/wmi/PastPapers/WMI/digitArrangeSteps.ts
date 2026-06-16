import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ROWS, SORTED, TARGET_INDEX, ANSWER } from './DigitArrangeIllustration'

export type DigitArrangePhase = 'show' | 'build' | 'count' | 'result'

export interface DigitArrangeStep {
  phase: DigitArrangePhase
  /** Tens-digit rows revealed on this beat (0..4). */
  revealedRows: number
  /** Highest list index counted so far, or null. */
  countIndex: number | null
  caption: string
  hold: number
  result: boolean
}

export interface DigitArrangeStoryboard {
  answer: number
  steps: DigitArrangeStep[]
  finalIndex: number
}

const ord = (n: number, lang: Lang): string => {
  if (lang === 'id') return `ke-${n}`
  return ['1st', '2nd', '3rd', '4th', '5th', '6th'][n - 1] ?? `${n}th`
}

export function buildDigitArrangeSteps(lang: Lang): DigitArrangeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: DigitArrangeStep[] = []

  steps.push({
    phase: 'show',
    revealedRows: 0,
    countIndex: null,
    hold: 1700,
    result: false,
    caption: t(
      'Build 2-digit numbers from 1, 2, 3, 4 — the two digits must be different.',
      'Susun bilangan dua angka dari 1, 2, 3, 4 — kedua angkanya harus berbeda.',
    ),
  })

  // Reveal the list one tens-digit row at a time, smallest tens first.
  ROWS.forEach((row, r) => {
    const tens = Math.floor(row[0] / 10)
    const list = row.join(', ')
    const last = r === ROWS.length - 1
    steps.push({
      phase: 'build',
      revealedRows: r + 1,
      countIndex: null,
      hold: last ? 1600 : 1300,
      result: false,
      caption: last
        ? t(`Tens digit ${tens}: ${list}. Now the whole list is in order.`, `Angka puluhan ${tens}: ${list}. Sekarang seluruh daftar sudah urut.`)
        : t(`Tens digit ${tens}: ${list}.`, `Angka puluhan ${tens}: ${list}.`),
    })
  })

  // Count smallest-first up to the 4th...
  for (let i = 0; i < TARGET_INDEX; i++) {
    const o = ord(i + 1, lang)
    steps.push({
      phase: 'count',
      revealedRows: ROWS.length,
      countIndex: i,
      hold: 900,
      result: false,
      caption: t(`Count smallest first: the ${o} number is ${SORTED[i]}.`, `Hitung dari terkecil: yang ${o} adalah ${SORTED[i]}.`),
    })
  }

  // ...then the 5th is the answer.
  const o5 = ord(TARGET_INDEX + 1, lang)
  steps.push({
    phase: 'result',
    revealedRows: ROWS.length,
    countIndex: TARGET_INDEX,
    hold: 0,
    result: true,
    caption: t(`The ${o5} number is ${ANSWER}.`, `Bilangan ${o5} adalah ${ANSWER}.`),
  })

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
