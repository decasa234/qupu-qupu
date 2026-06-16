// Storyboard for the WMI-22P1A-Q4 explainer: spot the fixed 45° clockwise turn,
// continue it one more step to 180°, then match that against the options → A.
import type { Lang } from '../concepts/explainers/makeTenSteps'
import { NEXT_DEG, STEP_DEG } from './P22G1Q4Illustration'

export interface Q4Step {
  spotlight: number
  showArrows: boolean
  revealNext: boolean
  /** Show the A-D option row and (optionally) which one is ringed. */
  showOptions: boolean
  ringedOption: number // index 0..3, or -1
  caption: string
  hold: number
  result: boolean
}

export interface Q4Storyboard {
  steps: Q4Step[]
  finalIndex: number
  answer: string
}

export function buildP22G1Q4Steps(lang: Lang, answer: string): Q4Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  // Option index that matches the answer letter (A→0, B→1, ...).
  const answerIdx = Math.max(0, answer.toUpperCase().charCodeAt(0) - 65)

  const steps: Q4Step[] = [
    {
      spotlight: -1,
      showArrows: false,
      revealNext: false,
      showOptions: false,
      ringedOption: -1,
      hold: 1700,
      result: false,
      caption: t(
        'The same tile keeps turning. How far does it turn each step?',
        'Ubin yang sama terus berputar. Berapa besar putaran tiap langkah?',
      ),
    },
    {
      spotlight: 1,
      showArrows: true,
      revealNext: false,
      showOptions: false,
      ringedOption: -1,
      hold: 2000,
      result: false,
      caption: t(
        `Each step it turns ${STEP_DEG}° clockwise — a quarter of a quarter, always the same.`,
        `Tiap langkah berputar ${STEP_DEG}° searah jarum jam — selalu sama besar.`,
      ),
    },
    {
      spotlight: 3,
      showArrows: true,
      revealNext: true,
      showOptions: false,
      ringedOption: -1,
      hold: 2000,
      result: false,
      caption: t(
        `So the next tile turns ${STEP_DEG}° more: it lands at ${NEXT_DEG}° (the dots flip to the other diagonal).`,
        `Maka ubin berikutnya berputar ${STEP_DEG}° lagi: berhenti di ${NEXT_DEG}° (titik pindah ke diagonal lain).`,
      ),
    },
    {
      spotlight: -1,
      showArrows: false,
      revealNext: true,
      showOptions: true,
      ringedOption: -1,
      hold: 2000,
      result: false,
      caption: t(
        'Now find the option that matches that tile.',
        'Sekarang cari pilihan yang sama dengan ubin itu.',
      ),
    },
    {
      spotlight: -1,
      showArrows: false,
      revealNext: true,
      showOptions: true,
      ringedOption: answerIdx,
      hold: 0,
      result: true,
      caption: t(
        `Only ${answer} shows the tile turned to ${NEXT_DEG}°. Answer ${answer}.`,
        `Hanya ${answer} yang menunjukkan ubin di ${NEXT_DEG}°. Jawaban ${answer}.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer }
}
