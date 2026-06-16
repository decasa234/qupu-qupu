import type { Lang } from '../concepts/explainers/makeTenSteps'
import { STAR_ANSWER } from './Pyramid20Illustration'

export type PyramidPhase = 'rule' | 'clue-7' | 'clue-10' | 'row-up' | 'row-2' | 'result'

export interface PyramidStep {
  phase: PyramidPhase
  /** Values revealed so far, keyed "row-index" (row 0 = bottom). */
  solved: Record<string, number>
  /** Blocks tinted green for this beat. */
  activeKeys: string[]
  /** Replace the star with 35 in green. */
  showStar: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PyramidStoryboard {
  answer: number
  steps: PyramidStep[]
  finalIndex: number
}

export function buildPyramid20Steps(lang: Lang): PyramidStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Reveal order, accumulated beat by beat (keys: row 0 = bottom).
  const afterClue7 = { '0-2': 2 }
  const afterClue10 = { ...afterClue7, '0-4': 2 }
  const afterRowUp = { ...afterClue10, '1-1': 4, '1-2': 5, '1-3': 5, '2-1': 9 }
  const afterRow2 = { ...afterRowUp, '3-0': 16, '3-1': 19 }
  const full = { ...afterRow2, '4-0': STAR_ANSWER }

  const steps: PyramidStep[] = [
    {
      phase: 'rule',
      solved: {},
      activeKeys: [],
      showStar: false,
      hold: 1800,
      result: false,
      caption: t(
        'The rule: every block is the two blocks right below it, added together.',
        'Aturannya: setiap balok adalah jumlah dua balok tepat di bawahnya.',
      ),
    },
    {
      phase: 'clue-7',
      solved: afterClue7,
      activeKeys: ['2-0', '1-0', '1-1', '0-1', '0-2'],
      showStar: false,
      hold: 2200,
      result: false,
      caption: t(
        'The 7 clue: 7 = 3 + (2 + ?), so 2 + ? = 4. The first mystery block is 2!',
        'Petunjuk 7: 7 = 3 + (2 + ?), jadi 2 + ? = 4. Balok misteri pertama adalah 2!',
      ),
    },
    {
      phase: 'clue-10',
      solved: afterClue10,
      activeKeys: ['2-2', '1-2', '1-3', '0-3', '0-4'],
      showStar: false,
      hold: 2200,
      result: false,
      caption: t(
        'The 10 clue: 10 = (2 + 3) + (3 + ?) = 5 + (3 + ?), so 3 + ? = 5. The last block is 2 too!',
        'Petunjuk 10: 10 = (2 + 3) + (3 + ?) = 5 + (3 + ?), jadi 3 + ? = 5. Balok terakhir juga 2!',
      ),
    },
    {
      phase: 'row-up',
      solved: afterRowUp,
      activeKeys: ['1-1', '1-2', '1-3', '2-1'],
      showStar: false,
      hold: 2100,
      result: false,
      caption: t(
        'Now build up! The next row is 3, 4, 5, 5 — and the middle of the row above is 4 + 5 = 9.',
        'Sekarang susun ke atas! Baris berikutnya 3, 4, 5, 5 — dan tengah baris di atasnya 4 + 5 = 9.',
      ),
    },
    {
      phase: 'row-2',
      solved: afterRow2,
      activeKeys: ['3-0', '3-1'],
      showStar: false,
      hold: 2000,
      result: false,
      caption: t(
        'Almost there: 7 + 9 = 16 and 9 + 10 = 19.',
        'Hampir sampai: 7 + 9 = 16 dan 9 + 10 = 19.',
      ),
    },
    {
      phase: 'result',
      solved: full,
      activeKeys: ['4-0'],
      showStar: true,
      hold: 0,
      result: true,
      caption: t(
        `The star = 16 + 19 = ${STAR_ANSWER}.`,
        `Bintang = 16 + 19 = ${STAR_ANSWER}.`,
      ),
    },
  ]

  return { answer: STAR_ANSWER, steps, finalIndex: steps.length - 1 }
}
