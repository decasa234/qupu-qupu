import type { Lang } from '../concepts/explainers/makeTenSteps'

export const SNAKE_ANSWER = '37'

export interface NumberSnakeStep {
  /** 9 display strings in row-major position order ('' = empty egg). */
  cells: string[]
  /** Position index (0..8) of the egg to highlight this beat, if any. */
  litIndex?: number
  caption: string
  hold: number
  result: boolean
}

export interface NumberSnakeStoryboard {
  answer: string
  steps: NumberSnakeStep[]
  finalIndex: number
}

/**
 * 3x3 egg grid linked into a snake. Along the path the values are
 * 1, 2, 4, 7, 11, 16, 22, 29, 37 — each jump grows by one (+1, +2, +3, ...).
 *
 * Grid positions (row-major 0..8):
 *   pos0=1  pos1=2  pos2=4(blank)
 *   pos3=29 pos4=?(=37, center) pos5=7
 *   pos6=22(blank) pos7=16 pos8=11
 *
 * Snake order (path):
 *   pos0 -> pos1 -> pos2 -> pos5 -> pos8 -> pos7 -> pos6 -> pos3 -> pos4
 *   values 1 -> 2 -> 4 -> 7 -> 11 -> 16 -> 22 -> 29 -> 37
 *
 * The animation walks the path one jump at a time, naming each concrete sum and
 * filling the two blanks (pos2 = 4, pos6 = 22) before landing on the center (pos4 = 37).
 */
export function buildNumberSnake22G1Steps(lang: Lang): NumberSnakeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Position order: [pos0, pos1, pos2, pos3, pos4, pos5, pos6, pos7, pos8]
  // Given figure (two blanks + center '?').
  const given = ['1', '2', '', '29', '?', '7', '', '16', '11']

  // Progressive fills.
  const withFour = ['1', '2', '4', '29', '?', '7', '', '16', '11']
  const withTwentyTwo = ['1', '2', '4', '29', '?', '7', '22', '16', '11']
  const withCenter = ['1', '2', '4', '29', '37', '7', '22', '16', '11']

  const steps: NumberSnakeStep[] = [
    {
      cells: given,
      hold: 2600,
      result: false,
      caption: t(
        'The eggs are joined into ONE path. Let us follow the snake and find the jumps from number to number.',
        'Telur-telur disambung menjadi SATU jalur. Ayo ikuti ularnya dan cari lompatan dari angka ke angka.',
      ),
    },
    {
      cells: given,
      litIndex: 1,
      hold: 2100,
      result: false,
      caption: t('First jump: 1 → 2 is +1.', 'Lompatan pertama: 1 → 2 yaitu +1.'),
    },
    {
      cells: withFour,
      litIndex: 2,
      hold: 2300,
      result: false,
      caption: t(
        'Each jump grows by one. After +1 comes +2, so 2 + 2 = 4. Fill that egg.',
        'Setiap lompatan bertambah satu. Setelah +1 datang +2, jadi 2 + 2 = 4. Isi telur itu.',
      ),
    },
    {
      cells: withFour,
      litIndex: 5,
      hold: 2100,
      result: false,
      caption: t('Next jump is +3: 4 + 3 = 7. The 7 is already there ✓', 'Lompatan berikutnya +3: 4 + 3 = 7. Angka 7 sudah ada ✓'),
    },
    {
      cells: withFour,
      litIndex: 8,
      hold: 2100,
      result: false,
      caption: t('+4: 7 + 4 = 11. The 11 is already there ✓', '+4: 7 + 4 = 11. Angka 11 sudah ada ✓'),
    },
    {
      cells: withFour,
      litIndex: 7,
      hold: 2100,
      result: false,
      caption: t('+5: 11 + 5 = 16. The 16 is already there ✓', '+5: 11 + 5 = 16. Angka 16 sudah ada ✓'),
    },
    {
      cells: withTwentyTwo,
      litIndex: 6,
      hold: 2300,
      result: false,
      caption: t('+6: 16 + 6 = 22. Fill that blank egg.', '+6: 16 + 6 = 22. Isi telur kosong itu.'),
    },
    {
      cells: withTwentyTwo,
      litIndex: 3,
      hold: 2100,
      result: false,
      caption: t('+7: 22 + 7 = 29. The 29 is already there ✓', '+7: 22 + 7 = 29. Angka 29 sudah ada ✓'),
    },
    {
      cells: withCenter,
      litIndex: 4,
      hold: 0,
      result: true,
      caption: t('Last jump +8: 29 + 8 = 37. So ? = 37.', 'Lompatan terakhir +8: 29 + 8 = 37. Jadi ? = 37.'),
    },
  ]

  return {
    answer: SNAKE_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
