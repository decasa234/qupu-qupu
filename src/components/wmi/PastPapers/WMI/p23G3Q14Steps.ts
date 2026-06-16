import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { lockerColour } from './P23G3Q14Illustration'

export type Q14Phase = 'show' | 'pattern' | 'optA' | 'reject' | 'result'

export interface Q14Step {
  phase: Q14Phase
  revealAll: boolean
  bright: boolean
  marks: Array<{ n: number; tag: 'g' | 'r' }>
  caption: string
  hold: number
  result: boolean
}

export interface Q14Storyboard {
  answerOption: 'A' | 'B' | 'C' | 'D'
  steps: Q14Step[]
  finalIndex: number
}

// Option A = the answer: 20 (green), 24 (green), 11 (red).
const A_TRIPLE = [20, 24, 11] as const

export function buildP23G3Q14Steps(lang: Lang): Q14Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Tag each locker in option A with its true colour-class glyph (g / r).
  const markFor = (n: number): 'g' | 'r' => (lockerColour(n) === 'Green' ? 'g' : 'r')
  const aMarks = A_TRIPLE.map((n) => ({ n, tag: markFor(n) }))

  const steps: Q14Step[] = [
    {
      phase: 'show',
      revealAll: false,
      bright: false,
      marks: [],
      hold: 1800,
      result: false,
      caption: t(
        'Lockers are numbered left→right, top→bottom — fill in the blanks.',
        'Loker dinomori kiri→kanan, atas→bawah — isi yang kosong.',
      ),
    },
    {
      phase: 'pattern',
      revealAll: true,
      bright: false,
      marks: [],
      hold: 2100,
      result: false,
      caption: t(
        'White 1–6, Red 7–12, Yellow 13–18, Green 19–24.',
        'Putih 1–6, Merah 7–12, Kuning 13–18, Hijau 19–24.',
      ),
    },
    {
      phase: 'optA',
      revealAll: true,
      bright: true,
      marks: aMarks,
      hold: 2100,
      result: false,
      caption: t(
        'Option A: 20 → green, 24 → green, 11 → red.',
        'Pilihan A: 20 → hijau, 24 → hijau, 11 → merah.',
      ),
    },
    {
      phase: 'reject',
      revealAll: true,
      bright: false,
      marks: aMarks,
      hold: 2000,
      result: false,
      caption: t(
        'Others fail: order or colours are wrong (e.g. D is green, red, green).',
        'Yang lain gagal: urutan atau warnanya salah (mis. D hijau, merah, hijau).',
      ),
    },
    {
      phase: 'result',
      revealAll: true,
      bright: true,
      marks: aMarks,
      hold: 0,
      result: true,
      caption: t(
        '20, 24, 11 = green, green, red — answer A.',
        '20, 24, 11 = hijau, hijau, merah — jawaban A.',
      ),
    },
  ]

  return {
    answerOption: 'A',
    steps,
    finalIndex: steps.length - 1,
  }
}
