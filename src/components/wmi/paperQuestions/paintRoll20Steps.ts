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

  // The block stands in the spilled paint: LEFT sides + BOTTOMS are wet, the
  // RIGHT sides (roll 1) and TOPS (roll 2) are dry. So rolls 1–2 stamp
  // nothing, roll 3 (lefts) stamps "3" and "2", roll 4 (bottoms) stamps "4".
  const afterRoll3: PaintCellKey[] = ['f4', 'b5', 'b6'] // wet LEFTs: "3", "2" + empty b6
  const afterRoll4: PaintCellKey[] = [...afterRoll3, 'f5', 'b7'] // soaked BOTTOMS: "4" + empty b7

  const steps: PaintRollStep[] = [
    {
      phase: 'stand',
      rollsDone: 0,
      stamped: [],
      dryCells: [],
      hold: 2400,
      result: false,
      caption: t(
        'The paint has SPILLED — and the block stands in the puddle! So its BOTTOM is soaked, and its LEFT side is painted too. The top and right sides are dry. The block starts at the very left.',
        'Catnya TUMPAH — dan balok berdiri di genangannya! Jadi ALAS balok basah kuyup, dan sisi KIRI-nya juga bercat. Sisi atas dan kanan kering. Balok mulai dari ujung paling kiri.',
      ),
    },
    {
      phase: 'roll1',
      rollsDone: 1,
      stamped: [],
      dryCells: [],
      hold: 2200,
      result: false,
      caption: t(
        'Roll 1: the block flops onto its RIGHT sides — they are dry, so the squares it lands on stay clean.',
        'Gulingan 1: balok rebah ke sisi KANAN-nya — sisi itu kering, jadi kotak yang ditimpanya tetap bersih.',
      ),
    },
    {
      phase: 'roll2',
      rollsDone: 2,
      stamped: [],
      dryCells: ['f3'],
      hold: 2400,
      result: false,
      caption: t(
        'Roll 2: the dry TOPS come down — the small cube lands right ON square 1. Dry side, so square 1 stays clean!',
        'Gulingan 2: sisi ATAS yang kering menempel — kubus kecil mendarat tepat DI kotak 1. Sisinya kering, jadi kotak 1 tetap bersih!',
      ),
    },
    {
      phase: 'roll3',
      rollsDone: 3,
      stamped: afterRoll3,
      dryCells: ['f3'],
      hold: 2400,
      result: false,
      caption: t(
        'Roll 3: now the wet LEFT sides land — the small cube stamps square 3, and the tall stack behind stamps square 2 (and the square next to it)!',
        'Gulingan 3: kini sisi KIRI yang basah menempel — kubus kecil mengecap kotak 3, dan tumpukan tinggi di belakang mengecap kotak 2 (serta kotak di sebelahnya)!',
      ),
    },
    {
      phase: 'roll4',
      rollsDone: 4,
      stamped: afterRoll4,
      dryCells: ['f3', 'f7'],
      hold: 2400,
      result: false,
      caption: t(
        'Roll 4: the soaked BOTTOMS land — the small cube stamps square 4; the stack stamps an empty square. Every painted side is used now, so square 5, further along, never gets paint.',
        'Gulingan 4: ALAS yang basah menempel — kubus kecil mengecap kotak 4; tumpukan mengecap kotak kosong. Semua sisi bercat sudah terpakai, jadi kotak 5 yang lebih jauh tidak pernah kena cat.',
      ),
    },
    {
      phase: 'result',
      rollsDone: 4,
      stamped: afterRoll4,
      dryCells: ['f3', 'f7'],
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
