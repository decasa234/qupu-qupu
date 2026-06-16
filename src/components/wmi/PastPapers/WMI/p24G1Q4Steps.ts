import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  ANIMALS,
  ANIMAL_COUNT,
  LEADER_INDEX,
  VICE_INDEX,
} from './P24G1Q4Illustration'

// WMI-24P1A-Q4 (2024 Grade-1 Semifinal). A row of 14 animals, left → right:
//   1 lion 2 owl 3 frog 4 penguin 5 cow 6 turtle 7 mouse 8 snake
//   9 dinosaur 10 koala 11 bird 12 crab 13 chick 14 dog
// "The 10th from the left is the leader; the 7th from the right is the vice
//  leader. Which option has both?"  Answer: C (snake, dinosaur, koala).
//
// The storyboard does NOT jump to the option. It walks the method one idea per
// beat: state the goal, COUNT 10 in from the LEFT (lands on koala = leader),
// then COUNT 7 in from the RIGHT (lands on snake = vice leader), then read the
// option that contains BOTH. With 14 animals, 7th from the right is animal
// 14 - 7 + 1 = 8 = the snake, which sits two places left of the koala. The two
// found animals stay lit through the match and the result. Indices are 0-based
// to match the AnimalRow primitive's litLeft / litRight props (koala = 9,
// snake = 7).

export const LEADER = ANIMALS[LEADER_INDEX] // koala (10th from left)
export const VICE = ANIMALS[VICE_INDEX] // snake (7th from right)
export const ANSWER_LETTER = 'C'
export const ANSWER_TEXT_EN = 'snake, dinosaur, koala'
export const ANSWER_TEXT_ID = 'ular, dinosaurus, koala'

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

export function buildP24G1Q4Steps(lang: Lang): AnimalStoryboard {
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
    // light every animal from the left up to and including #10
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
    // keep the koala lit, and light the right-end run of 7 in orange
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
      `Leader = ${name(LEADER)}, vice = ${name(VICE)}. Find the option with BOTH.`,
      `Pemimpin = ${name(LEADER)}, wakil = ${name(VICE)}. Cari opsi yang memuat KEDUANYA.`,
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
      `Both appear in “${ANSWER_TEXT_EN}” — answer ${ANSWER_LETTER}.`,
      `Keduanya ada di “${ANSWER_TEXT_ID}” — jawaban ${ANSWER_LETTER}.`,
    ),
  })

  return {
    leaderEn: LEADER.en,
    viceEn: VICE.en,
    answerLetter: ANSWER_LETTER,
    steps,
    finalIndex: steps.length - 1,
  }
}
