import type { Lang } from '../concepts/explainers/makeTenSteps'
import { PAINT_ANSWER, type PaintCellKey } from './PaintRoll20Illustration'

export type PaintRollPhase = 'stand' | 'roll1' | 'roll2' | 'roll3' | 'roll4' | 'result'

export interface PaintRollStep {
  phase: PaintRollPhase
  /** Quarter-turns completed so far. */
  rollsDone: 0 | 1 | 2 | 3 | 4
  /** Cell keys stamped purple so far (front 'f' / back 'b' row + column). */
  stamped: PaintCellKey[]
  /** Cell keys of numbered squares a DRY face landed on (they stay clean). */
  dryCells: PaintCellKey[]
  caption: string
  hold: number
  result: boolean
}

export interface PaintRollStoryboard {
  answer: string
  /** Localized badge text for the dry squares. */
  dryLabel: string
  /** Localized chip text for a wet landing face. */
  wetLabel: string
  steps: PaintRollStep[]
  finalIndex: number
}

export function buildPaintRoll20Steps(lang: Lang): PaintRollStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Stamps accumulated roll by roll. Only the BOTTOM each piece stands on is
  // dry — right, top and left faces are all wet, so rolls 1–3 stamp paint and
  // roll 4 lands back on the dry bottom.
  const afterRoll1: PaintCellKey[] = ['f4', 'b4', 'b5'] // wet RIGHTs: empty f4, "2" + b5
  const afterRoll2: PaintCellKey[] = [...afterRoll1, 'f5', 'b6'] // wet TOPS: "3" + empty b6
  const afterRoll3: PaintCellKey[] = [...afterRoll2, 'f6', 'b7', 'b8'] // wet LEFTs: "4" + empty b7–b8

  const steps: PaintRollStep[] = [
    {
      phase: 'stand',
      rollsDone: 0,
      stamped: [],
      dryCells: ['f3'],
      hold: 2400,
      result: false,
      caption: t(
        'Only the BOTTOM is dry — the face the block stands on. Every other face is wet. The block stands right on square 1, so the dry bottom covers it: square 1 never gets paint.',
        'Hanya ALASNYA yang kering — sisi tempat balok berdiri. Semua sisi lainnya basah. Balok berdiri tepat di atas kotak 1, jadi alas yang kering menutupinya: kotak 1 tidak pernah kena cat.',
      ),
    },
    {
      phase: 'roll1',
      rollsDone: 1,
      stamped: afterRoll1,
      dryCells: ['f3'],
      hold: 2400,
      result: false,
      caption: t(
        'Roll 1: the wet RIGHT sides stamp — the front cube hits an empty square, and the tall stack behind paints square 2 and the square next to it.',
        'Gulingan 1: sisi KANAN yang basah mengecap — kubus depan mengenai kotak kosong, dan tumpukan tinggi di belakang mengecat kotak 2 serta kotak di sebelahnya.',
      ),
    },
    {
      phase: 'roll2',
      rollsDone: 2,
      stamped: afterRoll2,
      dryCells: ['f3'],
      hold: 2200,
      result: false,
      caption: t(
        'Roll 2: the wet TOPS land — the front cube stamps square 3; the stack stamps an empty square behind.',
        'Gulingan 2: sisi ATAS yang basah menempel — kubus depan mengecap kotak 3; tumpukan mengecap kotak kosong di belakang.',
      ),
    },
    {
      phase: 'roll3',
      rollsDone: 3,
      stamped: afterRoll3,
      dryCells: ['f3'],
      hold: 2200,
      result: false,
      caption: t(
        'Roll 3: the wet LEFT sides land — the front cube stamps square 4; the stack stamps more empty squares behind.',
        'Gulingan 3: sisi KIRI yang basah menempel — kubus depan mengecap kotak 4; tumpukan mengecap kotak kosong lagi di belakang.',
      ),
    },
    {
      phase: 'roll4',
      rollsDone: 4,
      stamped: afterRoll3,
      dryCells: ['f3', 'f8'],
      hold: 2400,
      result: false,
      caption: t(
        'Roll 4: only the dry bottoms are left, and the paint is finished — square 5 never gets paint. Painted: 2, 3, 4 → write 234.',
        'Gulingan 4: tinggal alas yang kering, dan catnya sudah habis — kotak 5 tidak pernah kena cat. Yang terkena cat: 2, 3, 4 → tulis 234.',
      ),
    },
    {
      phase: 'result',
      rollsDone: 4,
      stamped: afterRoll3,
      dryCells: ['f3', 'f8'],
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
    dryLabel: t('dry', 'kering'),
    wetLabel: t('wet', 'basah'),
    steps,
    finalIndex: steps.length - 1,
  }
}
