import type { BasicStep } from './logicSteps'

export interface ArrangeDigitsStory {
  digits: number[]
  rank: number
  /** Every 2-digit number, in the order they are formed (tens then ones). */
  formed: number[]
  /** The same numbers sorted ascending. */
  sorted: number[]
  answer: number
  steps: BasicStep[]
  finalIndex: number
}

function ordinalEn(n: number): string {
  const tens = n % 100
  const ones = n % 10
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ones === 1 ? 'st' : ones === 2 ? 'nd' : ones === 3 ? 'rd' : 'th'
  return `${n}${suffix}`
}

// N14: form all two-digit numbers from the given digits (no digit repeats),
// order them smallest-first, then count to the asked rank.
export function buildArrangeDigitsStory(
  digitsRaw: number[],
  rankRaw: number,
  lang: 'en' | 'id' = 'en',
): ArrangeDigitsStory {
  const digits = digitsRaw.slice(0, 3)
  const formed = digits.flatMap((a) => digits.filter((b) => b !== a).map((b) => a * 10 + b))
  const sorted = [...formed].sort((x, y) => x - y)
  const rank = Math.max(1, Math.min(sorted.length, Math.round(rankRaw)))
  const answer = sorted[rank - 1]
  const ord = ordinalEn(rank)

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BasicStep[] = [
    {
      phase: 'digits',
      caption: T(`Use the digits ${digits.join(', ')}.`, `Gunakan angka ${digits.join(', ')}.`),
      hold: 1500,
    },
    {
      phase: 'form',
      caption: T(`Make every 2-digit number — don't repeat a digit.`, `Buat setiap bilangan 2 angka — jangan ulang angka.`),
      hold: 2200,
    },
    {
      phase: 'sort',
      caption: T(`Put them in order, smallest first.`, `Urutkan dari yang terkecil.`),
      hold: 2100,
    },
    {
      phase: 'count',
      caption: T(`Count to the ${ord} smallest.`, `Hitung sampai urutan ke-${rank} terkecil.`),
      hold: 2000,
    },
    {
      phase: 'answer',
      caption: T(`The ${ord} smallest is ${answer}.`, `Bilangan terkecil ke-${rank} adalah ${answer}.`),
      hold: 0,
      result: true,
    },
  ]

  return { digits, rank, formed, sorted, answer, steps, finalIndex: steps.length - 1 }
}
