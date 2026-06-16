import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { P20G3Q4_ANSWER } from './P20G3Q4Illustration'

export type Q4Phase = 'show' | 'oneArrow' | 'allTurn' | 'next' | 'result'

export interface Q4Step {
  phase: Q4Phase
  /** Show the solved arrows in the 4th slot instead of "?". */
  revealAnswer: boolean
  /** Tint the revealed answer green. */
  hotAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q4Storyboard {
  answer: string
  steps: Q4Step[]
  finalIndex: number
}

export function buildP20G3Q4Steps(lang: Lang): Q4Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q4Step[] = [
    {
      phase: 'show',
      revealAnswer: false,
      hotAnswer: false,
      hold: 1700,
      result: false,
      caption: t(
        'Same five cells in every grid — only the arrows change.',
        'Lima sel yang sama di tiap kisi — hanya arah panahnya berubah.',
      ),
    },
    {
      phase: 'oneArrow',
      revealAnswer: false,
      hotAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        'Track one arrow: up → right → down. It turns a quarter clockwise each step.',
        'Ikuti satu panah: atas → kanan → bawah. Tiap langkah berputar seperempat searah jarum jam.',
      ),
    },
    {
      phase: 'allTurn',
      revealAnswer: false,
      hotAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        'Every arrow follows the SAME rule: turn 90° clockwise.',
        'Setiap panah ikut aturan yang SAMA: putar 90° searah jarum jam.',
      ),
    },
    {
      phase: 'next',
      revealAnswer: true,
      hotAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        'So turn each one once more: down→left, left→up, right→down…',
        'Maka putar lagi sekali: bawah→kiri, kiri→atas, kanan→bawah…',
      ),
    },
    {
      phase: 'result',
      revealAnswer: true,
      hotAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `That grid is option ${P20G3Q4_ANSWER}.`,
        `Kisi itu adalah pilihan ${P20G3Q4_ANSWER}.`,
      ),
    },
  ]

  return { answer: P20G3Q4_ANSWER, steps, finalIndex: steps.length - 1 }
}
