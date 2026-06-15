import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER_N, ANSWER_WHITE, TARGET_DIFF, grayCount, whiteCount } from './P20G3Q17Illustration'

export interface Q17Step {
  /** picture number to display (rows). */
  picture: number
  /** Show the gray/white counts under the picture. */
  showCounts: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q17Storyboard {
  answer: number
  steps: Q17Step[]
  finalIndex: number
}

export function buildP20G3Q17Steps(lang: Lang): Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q17Step[] = [
    {
      picture: 3,
      showCounts: true,
      hold: 2000,
      result: false,
      caption: t(
        `In picture n: gray (up) = ${grayCount(3)} when n = 3, white (down) = ${whiteCount(3)}.`,
        `Di gambar n: abu-abu (atas) = ${grayCount(3)} saat n = 3, putih (bawah) = ${whiteCount(3)}.`,
      ),
    },
    {
      picture: 4,
      showCounts: true,
      hold: 2100,
      result: false,
      caption: t(
        `Each new row adds 1 more gray than white, so gray − white = n (here 4 − ${whiteCount(4)}... ✓ diff = 4).`,
        `Tiap baris baru menambah 1 abu-abu lebih banyak dari putih, jadi abu-abu − putih = n (di sini selisih = 4).`,
      ),
    },
    {
      picture: 4,
      showCounts: false,
      hold: 2000,
      result: false,
      caption: t(
        `Difference = ${TARGET_DIFF} means n = ${ANSWER_N}.`,
        `Selisih = ${TARGET_DIFF} berarti n = ${ANSWER_N}.`,
      ),
    },
    {
      picture: 4,
      showCounts: false,
      hold: 0,
      result: true,
      caption: t(
        `White = n(n−1)/2 = ${ANSWER_N}×${ANSWER_N - 1}/2 = ${ANSWER_WHITE} — answer D.`,
        `Putih = n(n−1)/2 = ${ANSWER_N}×${ANSWER_N - 1}/2 = ${ANSWER_WHITE} — jawaban D.`,
      ),
    },
  ]

  return { answer: ANSWER_WHITE, steps, finalIndex: steps.length - 1 }
}
