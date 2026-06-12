import type { Lang } from '../concepts/explainers/makeTenSteps'
import { AG_ANSWER } from './ArrowGridIllustration'

export interface ArrowGridStep {
  /** Cells with a known value so far: "row-col" -> number. */
  solved: Record<string, number>
  /** Cell keys deduced on this beat (drawn green). */
  activeKeys: string[]
  /** Cell keys the active arrow is "looking at" (amber ring). */
  litKeys: string[]
  caption: string
  hold: number
  result: boolean
}

export interface ArrowGridStoryboard {
  answer: string
  steps: ArrowGridStep[]
  finalIndex: number
}

// Full solution grid (row-col -> value):
//   0-0=2  0-1=1  0-2=2
//   1-0=1  1-1=1  1-2=1
//   2-0=2  2-1=1  2-2=2 (given)
export function buildArrowGridSteps(lang: Lang): ArrowGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Cumulative solved maps (the given 2 is always shown via the cell's `given`).
  const s0: Record<string, number> = {}
  const s1 = { ...s0, '0-1': 1, '1-0': 1 }
  const s2 = { ...s1, '1-1': 1 }
  const s3 = { ...s2, '2-1': 1 } // C
  const s4 = { ...s3, '2-0': 2 } // B
  const s5 = { ...s4, '0-0': 2 } // A
  const s6 = { ...s5, '0-2': 2 }
  const s7 = { ...s6, '1-2': 1 } // D

  const steps: ArrowGridStep[] = [
    {
      solved: s0,
      activeKeys: [],
      litKeys: [],
      hold: 2600,
      result: false,
      caption: t(
        'Each arrow shows how many DIFFERENT numbers it sees in the way it points (a two-way arrow counts both ways). One arrow already shows 2.',
        'Tiap panah menunjukkan berapa banyak angka BERBEDA yang dilihatnya ke arah panah (panah dua arah menghitung kedua arah). Satu panah sudah menunjukkan 2.',
      ),
    },
    {
      solved: s1,
      activeKeys: ['0-1', '1-0'],
      litKeys: ['0-0'],
      hold: 2400,
      result: false,
      caption: t(
        'These two arrows each point at just ONE cell, so they see 1 number — both are 1.',
        'Dua panah ini masing-masing hanya menunjuk SATU kotak, jadi melihat 1 angka — keduanya 1.',
      ),
    },
    {
      solved: s2,
      activeKeys: ['1-1'],
      litKeys: ['1-2'],
      hold: 2000,
      result: false,
      caption: t(
        'This arrow also points at a single cell → it is 1.',
        'Panah ini juga menunjuk satu kotak → nilainya 1.',
      ),
    },
    {
      solved: s3,
      activeKeys: ['2-1'],
      litKeys: ['1-1', '0-1'],
      hold: 2400,
      result: false,
      caption: t(
        'C points up at two cells that are both 1 → only 1 different number, so C = 1.',
        'C menunjuk ke atas ke dua kotak yang sama-sama 1 → cuma 1 angka berbeda, jadi C = 1.',
      ),
    },
    {
      solved: s4,
      activeKeys: ['2-0'],
      litKeys: ['2-2', '2-1'],
      hold: 2600,
      result: false,
      caption: t(
        'The given 2 points left at B and C. C = 1, but it sees 2 different numbers — so B must differ: B = 2.',
        'Angka 2 yang diberikan menunjuk kiri ke B dan C. C = 1, tapi melihat 2 angka berbeda — jadi B harus beda: B = 2.',
      ),
    },
    {
      solved: s5,
      activeKeys: ['0-0'],
      litKeys: ['2-0', '1-0'],
      hold: 2600,
      result: false,
      caption: t(
        'B = 2 looks up at a 1 and at A. For 2 different numbers, A is not 1 — so A = 2.',
        'B = 2 melihat ke atas ke sebuah 1 dan ke A. Agar ada 2 angka berbeda, A bukan 1 — jadi A = 2.',
      ),
    },
    {
      solved: s6,
      activeKeys: ['0-2'],
      litKeys: ['0-0', '0-1'],
      hold: 2400,
      result: false,
      caption: t(
        'A = 2 looks right at a 1 and the top-right cell — that cell must differ, so it is 2.',
        'A = 2 melihat ke kanan ke sebuah 1 dan kotak kanan-atas — kotak itu harus beda, jadi nilainya 2.',
      ),
    },
    {
      solved: s7,
      activeKeys: ['1-2'],
      litKeys: ['0-2', '2-2'],
      hold: 2400,
      result: false,
      caption: t(
        'D points up and down at 2 and 2 — the same number, so D = 1.',
        'D menunjuk ke atas dan ke bawah ke 2 dan 2 — angka yang sama, jadi D = 1.',
      ),
    },
    {
      solved: s7,
      activeKeys: ['0-0', '2-0', '2-1', '1-2'],
      litKeys: [],
      hold: 0,
      result: true,
      caption: t(`Read the corners A, B, C, D = 2, 2, 1, 1 → ${AG_ANSWER}.`, `Baca pojoknya A, B, C, D = 2, 2, 1, 1 → ${AG_ANSWER}.`),
    },
  ]

  return { answer: AG_ANSWER, steps, finalIndex: steps.length - 1 }
}
