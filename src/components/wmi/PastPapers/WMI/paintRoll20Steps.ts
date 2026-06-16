import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { PAINT_ANSWER, type PaintCellKey } from './PaintRoll20Illustration'

export type PaintRollPhase = 'start' | 'roll1' | 'roll2' | 'roll3' | 'roll4' | 'result'

export interface PaintRollStep {
  phase: PaintRollPhase
  /** Cumulative wet cell keys so far (front 'f' / back 'b' row + column). */
  stamped: PaintCellKey[]
  /** Cell keys newly wet on this beat. */
  fresh: PaintCellKey[]
  /** Numbered squares that stay clean (a dry side reached them). */
  cleanCells: PaintCellKey[]
  caption: string
  hold: number
  result: boolean
}

export interface PaintRollStoryboard {
  answer: string
  /** Localized badge text for the clean squares. */
  cleanLabel: string
  steps: PaintRollStep[]
  finalIndex: number
}

export function buildPaintRoll20Steps(lang: Lang): PaintRollStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Cumulative wet cells per beat (editor-confirmed, 8×2 grid). The tall BACK
  // stack lays a long wet trail along its whole row; the little FRONT cube only
  // stamps f1, then f5, f6, f7. So back col 4 ("2"), front col 5 ("3") and front
  // col 6 ("4") end up wet, while front col 3 ("1", a dry side lands there) and
  // front col 8 ("5", the front paint stops before it) stay clean.
  //   beat 1   back 1 1 0 0 0 0 0 0    front 1 0 0 0 0 0 0 0
  //   beat 2   back 1 1 1 0 0 0 0 0    front 1 0 0 0 0 0 0 0
  //   beat 3   back 1 1 1 1 1 0 0 0    front 1 0 0 0 1 0 0 0
  //   beat 4   back 1 1 1 1 1 1 0 0    front 1 0 0 0 1 1 0 0
  //   beat 5   back 1 1 1 1 1 1 1 1    front 1 0 0 0 1 1 1 0
  const s1: PaintCellKey[] = ['b1', 'b2', 'f1']
  const s2: PaintCellKey[] = [...s1, 'b3']
  const s3: PaintCellKey[] = [...s2, 'b4', 'b5', 'f5']
  const s4: PaintCellKey[] = [...s3, 'b6', 'f6']
  const s5: PaintCellKey[] = [...s4, 'b7', 'b8', 'f7']

  const steps: PaintRollStep[] = [
    {
      phase: 'start',
      stamped: s1,
      fresh: s1,
      cleanCells: [],
      hold: 2600,
      result: false,
      caption: t(
        'The paint has SPILLED and the block stands in the puddle, so its BOTTOM and LEFT side are wet. It starts at the far left: the tall back stack tips first, laying its wet side across the first two back squares.',
        'Catnya TUMPAH dan balok berdiri di genangannya, jadi ALAS dan sisi KIRI-nya basah. Balok mulai dari ujung paling kiri: tumpukan tinggi di belakang rebah lebih dulu, menempelkan sisi basahnya pada dua kotak belakang pertama.',
      ),
    },
    {
      phase: 'roll1',
      stamped: s2,
      fresh: ['b3'],
      cleanCells: [],
      hold: 2200,
      result: false,
      caption: t(
        'It tumbles to the RIGHT. The tall back stack keeps laying down a long wet trail along the BACK row.',
        'Balok terus menggelinding ke KANAN. Tumpukan tinggi di belakang terus meninggalkan jejak basah panjang di baris BELAKANG.',
      ),
    },
    {
      phase: 'roll2',
      stamped: s3,
      fresh: ['b4', 'b5', 'f5'],
      cleanCells: ['f3'],
      hold: 2600,
      result: false,
      caption: t(
        "Reaching the middle, the back stack's wet side paints square 2, and the little front cube stamps square 3! Square 1 only met a DRY side, so it stays clean.",
        'Sampai di tengah, sisi basah tumpukan belakang mengecap kotak 2, dan kubus kecil depan mengecap kotak 3! Kotak 1 hanya tersentuh sisi KERING, jadi tetap bersih.',
      ),
    },
    {
      phase: 'roll3',
      stamped: s4,
      fresh: ['b6', 'f6'],
      cleanCells: ['f3'],
      hold: 2400,
      result: false,
      caption: t(
        'One more roll: the front cube stamps square 4, right next to square 3.',
        'Satu gulingan lagi: kubus depan mengecap kotak 4, tepat di sebelah kotak 3.',
      ),
    },
    {
      phase: 'roll4',
      stamped: s5,
      fresh: ['b7', 'b8', 'f7'],
      cleanCells: ['f3', 'f8'],
      hold: 2600,
      result: false,
      caption: t(
        'The block rolls off to the end. The back trail runs all the way out, but in the FRONT row the paint stops before square 5 — so square 5 stays clean too.',
        'Balok menggelinding sampai ujung. Jejak belakang sampai ke ujung, tetapi di baris DEPAN catnya berhenti sebelum kotak 5 — jadi kotak 5 juga tetap bersih.',
      ),
    },
    {
      phase: 'result',
      stamped: s5,
      fresh: [],
      cleanCells: ['f3', 'f8'],
      hold: 0,
      result: true,
      caption: t(
        `Painted: 2, 3, 4 → write ${PAINT_ANSWER}. Squares 1 and 5 stay clean.`,
        `Yang terkena cat: 2, 3, 4 → tulis ${PAINT_ANSWER}. Kotak 1 dan 5 tetap bersih.`,
      ),
    },
  ]

  return {
    answer: PAINT_ANSWER,
    cleanLabel: t('clean', 'bersih'),
    steps,
    finalIndex: steps.length - 1,
  }
}
