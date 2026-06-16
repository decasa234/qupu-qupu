import type { Lang } from '../concepts/explainers/makeTenSteps'
import { LEADER_POS, ROW_LENGTH, VICE_POS } from './P24G2Q4Illustration'

// Storyboard for the WMI-24P2A-Q4 explainer (animals in a row).
//
// Method, one idea per beat:
//   1. show the row.
//   2. count 10 from the LEFT -> the leader (10th).
//   3. "7th from the RIGHT" is awkward; flip it to a count from the left.
//   4. 15 − 7 + 1 = 9 -> the vice-leader is the 9th from the left.
//   5. positions 9 and 10 are NEIGHBOURS — that adjacent pair is the answer.
//   6. result: the option with the 9th + 10th animals is C.

export type AnimalPhase = 'show' | 'leader' | 'flip' | 'vice' | 'pair' | 'result'

export interface AnimalStep {
  phase: AnimalPhase
  /** 0-based indices to spotlight in the row. */
  litIndices: number[]
  /** Print the 1-based position number under every animal. */
  showPositions: boolean
  caption: string
  hold: number
  result: boolean
}

export interface AnimalStoryboard {
  rowLength: number
  leaderPos: number
  vicePos: number
  answer: string
  steps: AnimalStep[]
  finalIndex: number
}

export function buildP24G2Q4Steps(lang: Lang, answer: string): AnimalStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const leaderIdx = LEADER_POS - 1 // 9
  const viceIdx = VICE_POS - 1 // 8

  const steps: AnimalStep[] = [
    {
      phase: 'show',
      litIndices: [],
      showPositions: false,
      hold: 1700,
      result: false,
      caption: t(
        `${ROW_LENGTH} animals stand in a row. Find the leader and the vice-leader.`,
        `${ROW_LENGTH} hewan berdiri sebaris. Cari ketua dan wakil ketua.`,
      ),
    },
    {
      phase: 'leader',
      litIndices: [leaderIdx],
      showPositions: true,
      hold: 2000,
      result: false,
      caption: t(
        `Count ${LEADER_POS} from the LEFT — that is the leader (the ${LEADER_POS}th).`,
        `Hitung ${LEADER_POS} dari KIRI — itulah ketua (ke-${LEADER_POS}).`,
      ),
    },
    {
      phase: 'flip',
      litIndices: [leaderIdx],
      showPositions: true,
      hold: 2000,
      result: false,
      caption: t(
        `"7th from the right" is easier as a count from the left.`,
        `"Ke-7 dari kanan" lebih mudah diubah jadi hitungan dari kiri.`,
      ),
    },
    {
      phase: 'vice',
      litIndices: [viceIdx, leaderIdx],
      showPositions: true,
      hold: 2100,
      result: false,
      caption: t(
        `${ROW_LENGTH} − 7 + 1 = ${VICE_POS}: the vice-leader is the ${VICE_POS}th from the left.`,
        `${ROW_LENGTH} − 7 + 1 = ${VICE_POS}: wakil ketua adalah ke-${VICE_POS} dari kiri.`,
      ),
    },
    {
      phase: 'pair',
      litIndices: [viceIdx, leaderIdx],
      showPositions: true,
      hold: 2000,
      result: false,
      caption: t(
        `${VICE_POS}th and ${LEADER_POS}th sit side by side — we need that neighbouring pair.`,
        `Ke-${VICE_POS} dan ke-${LEADER_POS} bersebelahan — itulah pasangan yang dicari.`,
      ),
    },
    {
      phase: 'result',
      litIndices: [viceIdx, leaderIdx],
      showPositions: true,
      hold: 0,
      result: true,
      caption: t(
        `The option with the ${VICE_POS}th + ${LEADER_POS}th animals is ${answer}.`,
        `Pilihan dengan hewan ke-${VICE_POS} + ke-${LEADER_POS} adalah ${answer}.`,
      ),
    },
  ]

  return {
    rowLength: ROW_LENGTH,
    leaderPos: LEADER_POS,
    vicePos: VICE_POS,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
