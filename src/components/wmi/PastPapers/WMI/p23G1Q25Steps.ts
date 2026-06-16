import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type Q25Phase = 'show' | 'noRotate' | 'unique' | 'read' | 'result'

export interface Q25Step {
  phase: Q25Phase
  /** Ring the asked-about 2×2 region. */
  spotlight: boolean
  /** Tint the 2×2 region as solved. */
  solved: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q25Storyboard {
  answer: string
  steps: Q25Step[]
  finalIndex: number
}

export function buildP23G1Q25Steps(lang: Lang, correctAnswer = 'A'): Q25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answer = correctAnswer || 'A'

  const steps: Q25Step[] = [
    {
      phase: 'show',
      spotlight: true,
      solved: false,
      hold: 2000,
      result: false,
      caption: t(
        'Slot the 4 pieces into the 4×4 board to finish the picture. What fills the shaded 2×2 corner?',
        'Pasang 4 keping ke papan 4×4 untuk menyelesaikan gambar. Apa yang mengisi pojok 2×2 yang diarsir?',
      ),
    },
    {
      phase: 'noRotate',
      spotlight: true,
      solved: false,
      hold: 2200,
      result: false,
      caption: t(
        'The pieces may NOT be rotated, so each one keeps its drawing exactly as shown.',
        'Keping-keping TIDAK boleh diputar, jadi tiap keping mempertahankan gambarnya persis seperti ditunjukkan.',
      ),
    },
    {
      phase: 'unique',
      spotlight: true,
      solved: false,
      hold: 2300,
      result: false,
      caption: t(
        'With fixed orientation, the tabs and notches only fit one way — the assembly is forced.',
        'Dengan arah tetap, tonjolan dan lekukan hanya cocok satu cara — susunannya terpaksa demikian.',
      ),
    },
    {
      phase: 'read',
      spotlight: true,
      solved: true,
      hold: 2200,
      result: false,
      caption: t(
        'Build it, then just read off the shaded 2×2 corner of the finished picture.',
        'Susun, lalu baca saja pojok 2×2 yang diarsir dari gambar yang sudah jadi.',
      ),
    },
    {
      phase: 'result',
      spotlight: true,
      solved: true,
      hold: 0,
      result: true,
      caption: t(
        `The shaded corner matches option ${answer} — answer ${answer}.`,
        `Pojok yang diarsir cocok dengan pilihan ${answer} — jawaban ${answer}.`,
      ),
    },
  ]

  return { answer, steps, finalIndex: steps.length - 1 }
}
