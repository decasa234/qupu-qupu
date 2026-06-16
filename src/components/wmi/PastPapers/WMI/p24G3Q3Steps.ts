/**
 * Deterministic storyboard for WMI-24P3A-Q3 (bus seat map).
 *
 * Method: count the students (9 × 3 = 27), count the seats drawn on the plan
 * (31), then subtract → 31 − 27 = 4 empty seats (answer C).
 *
 * Filling beats seat the 27 students into the first 27 chairs so the 4 leftover
 * chairs at the end stay dark — the empty seats the question asks for.
 */
import type { Lang } from '../concepts/explainers/makeTenSteps'
import { EMPTY_SEATS, STUDENTS, TOTAL_SEATS } from './P24G3Q3Illustration'

export type P24G3Q3Phase = 'show' | 'students' | 'seats' | 'seat' | 'result'

export interface P24G3Q3Step {
  phase: P24G3Q3Phase
  filledSeats: number
  showTotal: boolean
  caption: string
  hold: number
  result: boolean
}

export interface P24G3Q3Storyboard {
  students: number
  totalSeats: number
  empty: number
  steps: P24G3Q3Step[]
  finalIndex: number
}

export function buildP24G3Q3Steps(lang: Lang): P24G3Q3Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: P24G3Q3Step[] = [
    {
      phase: 'show',
      filledSeats: 0,
      showTotal: false,
      hold: 1700,
      result: false,
      caption: t('Jansen’s class has 9 × 3 students riding the bus.', 'Kelas Jansen punya 9 × 3 siswa naik bus.'),
    },
    {
      phase: 'students',
      filledSeats: 0,
      showTotal: false,
      hold: 1900,
      result: false,
      caption: t(`9 × 3 = ${STUDENTS} students need a seat.`, `9 × 3 = ${STUDENTS} siswa butuh kursi.`),
    },
    {
      phase: 'seats',
      filledSeats: 0,
      showTotal: true,
      hold: 2000,
      result: false,
      caption: t(`Count the chairs drawn: 8 + 8 + 1 + 7 + 7 = ${TOTAL_SEATS} seats.`, `Hitung kursi yang digambar: 8 + 8 + 1 + 7 + 7 = ${TOTAL_SEATS} kursi.`),
    },
    {
      phase: 'seat',
      filledSeats: STUDENTS,
      showTotal: true,
      hold: 2100,
      result: false,
      caption: t(`Seat all ${STUDENTS} students (blue). A few chairs stay empty.`, `Dudukkan semua ${STUDENTS} siswa (biru). Beberapa kursi tetap kosong.`),
    },
    {
      phase: 'result',
      filledSeats: STUDENTS,
      showTotal: true,
      hold: 0,
      result: true,
      caption: t(`${TOTAL_SEATS} − ${STUDENTS} = ${EMPTY_SEATS} empty seats — answer C.`, `${TOTAL_SEATS} − ${STUDENTS} = ${EMPTY_SEATS} kursi kosong — jawaban C.`),
    },
  ]

  return { students: STUDENTS, totalSeats: TOTAL_SEATS, empty: EMPTY_SEATS, steps, finalIndex: steps.length - 1 }
}
