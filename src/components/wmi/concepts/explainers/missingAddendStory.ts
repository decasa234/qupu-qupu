import type { BasicStep } from './logicSteps'

export type MissingAddendParams = { a: number; b: number }

export interface MissingAddendStory {
  a: number
  b: number
  sum: number
  steps: BasicStep[]
  finalIndex: number
}

// A9 (grades 1–2): teach the missing addend with a part–whole model and the
// inverse operation — the whole minus the known part gives the missing part —
// NOT algebraic "move it across the equals sign" transposition.
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
      hold: 1700,
    },
    {
      phase: 'parts',
      caption: T(
        `? and ${b} are two parts that together make ${sum}.`,
        `? dan ${b} adalah dua bagian yang bersama membentuk ${sum}.`,
      ),
      hold: 1800,
    },
    {
      phase: 'inverse',
      caption: T(
        `To find a missing part, subtract the part you know.`,
        `Untuk mencari bagian yang hilang, kurangi bagian yang diketahui.`,
      ),
      hold: 1900,
    },
    {
      phase: 'solve',
      caption: T(`Whole minus known part: ${sum} − ${b} = ${a}.`, `Seluruh dikurangi bagian diketahui: ${sum} − ${b} = ${a}.`),
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
