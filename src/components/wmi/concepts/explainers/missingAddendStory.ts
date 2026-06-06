import type { BasicStep } from './logicSteps'

export type MissingAddendParams = { a: number; b: number }

export interface MissingAddendStory {
  a: number
  b: number
  sum: number
  steps: BasicStep[]
  finalIndex: number
}

// A9: solve the missing addend by switching the known term across the equals
// sign — the basic rule being that a term flips sign when it crosses (+ ↔ −).
export function buildMissingAddendStory(
  p: MissingAddendParams,
  lang: 'en' | 'id' = 'en',
): MissingAddendStory {
  const a = p.a
  const b = p.b
  const sum = a + b
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BasicStep[] = [
    {
      phase: 'equation',
      caption: T(`Find the missing number: ? + ${b} = ${sum}.`, `Cari bilangan yang hilang: ? + ${b} = ${sum}.`),
      hold: 1600,
    },
    {
      phase: 'isolate',
      caption: T(`To get ? by itself, switch +${b} across the = sign.`, `Agar ? sendiri, pindahkan +${b} melewati tanda =.`),
      hold: 1700,
    },
    {
      phase: 'switch',
      caption: T(`Crossing the = sign, +${b} becomes −${b}.`, `Melewati tanda =, +${b} menjadi −${b}.`),
      hold: 1900,
    },
    {
      phase: 'solve',
      caption: T(`Now ? = ${sum} − ${b} = ${a}.`, `Sekarang ? = ${sum} − ${b} = ${a}.`),
      hold: 1700,
    },
    {
      phase: 'answer',
      caption: T(`So ? = ${a}.`, `Jadi ? = ${a}.`),
      hold: 0,
      result: true,
    },
  ]

  return { a, b, sum, steps, finalIndex: steps.length - 1 }
}
