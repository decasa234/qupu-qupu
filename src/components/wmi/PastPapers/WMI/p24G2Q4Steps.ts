import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  ANIMALS,
  ANIMAL_COUNT,
  LEADER_INDEX,
  VICE_INDEX,
} from './P24G2Q4Illustration'

// Storyboard for the WMI-24P2A-Q4 explainer (animals in a row).
//
// Same 14-animal figure as the Grade-1 sibling WMI-24P1A-Q4:
//   1 lion 2 owl 3 frog 4 penguin 5 cow 6 turtle 7 mouse 8 snake
//   9 dinosaur 10 koala 11 bird 12 crab 13 chick 14 dog
// "The 10th from the left is the leader; the 7th from the right is the vice
//  leader. Which option has both?"  The options are small PICTURES (A–D);
//  the one showing both the koala and the snake is C.
//
// Method, one idea per beat: state the goal, COUNT 10 in from the LEFT
// (lands on the koala = leader), COUNT 7 in from the RIGHT (with 14 animals
// that is animal 14 − 7 + 1 = 8 = the snake = vice leader), then pick the
// picture option containing BOTH. Indices are 0-based to match the AnimalRow
// primitive's litLeft / litRight props (koala = 9, snake = 7).

export const LEADER = ANIMALS[LEADER_INDEX] // koala (10th from left)
export const VICE = ANIMALS[VICE_INDEX] // snake (7th from right)

export type AnimalPhase = 'goal' | 'countLeft' | 'countRight' | 'match' | 'result'

export interface AnimalStep {
  phase: AnimalPhase
  /** 0-based indices lit as "counted from the LEFT" (blue). */
  litLeft: number[]
  /** 0-based indices lit as "counted from the RIGHT" (orange). */
  litRight: number[]
  /** Print the ordinal above lit tiles this beat. */
  showOrdinals: boolean
  caption: string
  hold: number
  result: boolean
}

export interface AnimalStoryboard {
  leaderEn: string
  viceEn: string
  answerLetter: string
  steps: AnimalStep[]
  finalIndex: number
}

export function buildP24G2Q4Steps(lang: Lang, answer: string): AnimalStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const name = (e: typeof LEADER) => (lang === 'id' ? e.id : e.en)

  const steps: AnimalStep[] = []

  // --- Beat 0: state the goal. Nothing lit. ---
  steps.push({
    phase: 'goal',
    litLeft: [],
    litRight: [],
    showOrdinals: false,
    hold: 2100,
    result: false,
    caption: t(
      'Find the 10th animal from the left and the 7th from the right.',
      'Cari hewan ke-10 dari kiri dan ke-7 dari kanan.',
    ),
  })

  // --- Count 10 in from the LEFT: lands on the koala (leader). ---
  steps.push({
    phase: 'countLeft',
    litLeft: Array.from({ length: LEADER_INDEX + 1 }, (_, k) => k),
    litRight: [],
    showOrdinals: true,
    hold: 2200,
    result: false,
    caption: t(
      `Count 10 from the left: 1, 2, 3 … 10 lands on the ${name(LEADER)} — the leader.`,
      `Hitung 10 dari kiri: 1, 2, 3 … 10 jatuh di ${name(LEADER)} — sang pemimpin.`,
    ),
  })

  // --- Count 7 in from the RIGHT: lands on the snake (vice leader). ---
  steps.push({
    phase: 'countRight',
    litLeft: [LEADER_INDEX],
    litRight: Array.from({ length: 7 }, (_, k) => ANIMAL_COUNT - 1 - k),
    showOrdinals: true,
    hold: 2400,
    result: false,
    caption: t(
      `There are ${ANIMAL_COUNT} animals, so count 7 back from the right: it lands on the ${name(VICE)} — the vice leader.`,
      `Ada ${ANIMAL_COUNT} hewan, jadi hitung 7 mundur dari kanan: jatuh di ${name(VICE)} — sang wakil.`,
    ),
  })

  // --- Match: both found animals lit together. ---
  steps.push({
    phase: 'match',
    litLeft: [LEADER_INDEX],
    litRight: [VICE_INDEX],
    showOrdinals: false,
    hold: 2200,
    result: false,
    caption: t(
      `Leader = ${name(LEADER)}, vice = ${name(VICE)}. Find the picture option with BOTH.`,
      `Pemimpin = ${name(LEADER)}, wakil = ${name(VICE)}. Cari opsi gambar yang memuat KEDUANYA.`,
    ),
  })

  // --- Result: the option letter. ---
  steps.push({
    phase: 'result',
    litLeft: [LEADER_INDEX],
    litRight: [VICE_INDEX],
    showOrdinals: false,
    hold: 0,
    result: true,
    caption: t(
      `The picture showing both the ${name(LEADER)} and the ${name(VICE)} is option ${answer}.`,
      `Gambar yang memuat ${name(LEADER)} sekaligus ${name(VICE)} adalah pilihan ${answer}.`,
    ),
  })

  return {
    leaderEn: LEADER.en,
    viceEn: VICE.en,
    answerLetter: answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
