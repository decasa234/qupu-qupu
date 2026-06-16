import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { CHAIR_SIZES, TOTAL_SEATS_25G1, STANDERS_25G1 } from './ChildrenChairs25G1Illustration'

// WMI-25F1A-Q10 (2025 G1 final). 16 children stand above a row of 7 chairs of
// mixed sizes, left → right: single, single, single, double, double, single,
// triple — capacities [1, 1, 1, 2, 2, 1, 3]. "When all the chairs are filled,
// how many children have no seat?" Answer: 5.
//
// The method, one idea per beat: count the SEATS, not the children. Walk the
// chairs left → right adding each chair's size to a running seat total
// (1 → 2 → 3 → 5 → 7 → 8 → 11), FILLING the seats as we go so the figure shows
// every seat taken when the count reaches 11. Then there are 16 children but
// only 11 seats, so 16 − 11 = 5 children have no seat. The storyboard never
// jumps to the answer — it builds the seat count chair by chair, then does the
// single subtraction at the end.
//
// `seated` is passed straight to the ChildrenChairs25G1 primitive (fills seats
// left → right, clamped 0..11) — we never redraw the scene.

export const CHILD_COUNT = 16
export const CHAIRS = CHAIR_SIZES // [1, 1, 1, 2, 2, 1, 3]
export const TOTAL_SEATS = TOTAL_SEATS_25G1 // 11
export const ANSWER = STANDERS_25G1 // 16 − 11 = 5

export type ChairPhase = 'goal' | 'addChair' | 'subtract' | 'result'

export interface ChairStep {
  phase: ChairPhase
  /** How many seats are filled this beat (passed straight to the primitive). */
  seated: number
  /** 0-based index of the chair being added this beat, or null. */
  chairIndex: number | null
  /** That chair's capacity (seats added this beat), or null. */
  chairSeats: number | null
  /** Running seat total after this beat. */
  running: number
  /** True only on the final subtraction/result beats — show the 16 − 11 line. */
  showSubtract: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ChairStoryboard {
  childCount: number
  totalSeats: number
  answer: number
  steps: ChairStep[]
  finalIndex: number
}

// English ordinal words for the chairs (kid-first: "1st, 2nd, ...").
const ORD_EN = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th']
const ORD_ID = ['ke-1', 'ke-2', 'ke-3', 'ke-4', 'ke-5', 'ke-6', 'ke-7']

export function buildChildrenChairs25G1Steps(lang: Lang): ChairStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ChairStep[] = []

  // --- Beat 0: state the goal. No seats filled yet (all 16 stand). ---
  steps.push({
    phase: 'goal',
    seated: 0,
    chairIndex: null,
    chairSeats: null,
    running: 0,
    showSubtract: false,
    hold: 2100,
    result: false,
    caption: t(
      'All chairs get filled. Count the seats first — add up each chair.',
      'Semua kursi terisi. Hitung dulu tempat duduknya — jumlahkan tiap kursi.',
    ),
  })

  // --- Walk the chairs left → right, adding each chair's size. ---
  let running = 0
  CHAIRS.forEach((size, i) => {
    running += size
    const seatWord = (n: number) =>
      lang === 'id' ? `${n} tempat` : `${n} seat${n === 1 ? '' : 's'}`
    steps.push({
      phase: 'addChair',
      seated: running, // fill the seats counted so far
      chairIndex: i,
      chairSeats: size,
      running,
      showSubtract: false,
      hold: 1800,
      result: false,
      caption: t(
        `${ORD_EN[i]} chair has ${seatWord(size)}. Seats so far: ${running}.`,
        `Kursi ${ORD_ID[i]} ada ${seatWord(size)}. Tempat sejauh ini: ${running}.`,
      ),
    })
  })

  // --- All seats filled: state the seat total. ---
  steps.push({
    phase: 'addChair',
    seated: TOTAL_SEATS,
    chairIndex: null,
    chairSeats: null,
    running: TOTAL_SEATS,
    showSubtract: false,
    hold: 2100,
    result: false,
    caption: t(
      `All chairs are full — that's ${TOTAL_SEATS} seats for ${CHILD_COUNT} children.`,
      `Semua kursi penuh — jadi ${TOTAL_SEATS} tempat untuk ${CHILD_COUNT} anak.`,
    ),
  })

  // --- Subtract: 16 children − 11 seats. Seats stay full, standers visible. ---
  steps.push({
    phase: 'subtract',
    seated: TOTAL_SEATS,
    chairIndex: null,
    chairSeats: null,
    running: TOTAL_SEATS,
    showSubtract: true,
    hold: 2100,
    result: false,
    caption: t(
      `${CHILD_COUNT} children − ${TOTAL_SEATS} seats = how many stand?`,
      `${CHILD_COUNT} anak − ${TOTAL_SEATS} tempat = berapa yang berdiri?`,
    ),
  })

  // --- Result: 5 children have no seat. ---
  steps.push({
    phase: 'result',
    seated: TOTAL_SEATS,
    chairIndex: null,
    chairSeats: null,
    running: TOTAL_SEATS,
    showSubtract: true,
    hold: 0,
    result: true,
    caption: t(
      `${CHILD_COUNT} − ${TOTAL_SEATS} = ${ANSWER} children have no seat.`,
      `${CHILD_COUNT} − ${TOTAL_SEATS} = ${ANSWER} anak tidak kebagian kursi.`,
    ),
  })

  return {
    childCount: CHILD_COUNT,
    totalSeats: TOTAL_SEATS,
    answer: ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
