// WMI-23F3A-Q13 (2023 Grade 3 Final) — triangular-lattice area by counting.
//
// "A big equilateral triangle is split into small equilateral triangles, each of
//  area 6 cm². Quadrilateral ABCD is shaded. Find its area."  Answer: C = 72.
//
// METHOD (count, don't assert — one idea per beat). The shaded quadrilateral is
// made of small triangles from the lattice. Its area = (how many small triangles
// it covers) × 6 cm². So we COUNT the small triangles inside ABCD, building a
// running tally a few at a time (DotSquares style), reach 12, then multiply:
//     12 × 6 = 72 cm²  → choice C.
//
// The 12-triangle count and the per-piece area come from the illustration's
// lattice/clipping (the figure owns the exact geometry); this builder only paces
// the running tally up to that total and then multiplies. Pure function of lang —
// no Math.random, no Date. SSR-safe and deterministic.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  SMALL_TRIANGLE_CM2,
  ANSWER_TRIANGLE_COUNT,
  ANSWER_CM2,
} from './TriGridQuad23G3Illustration'

// Single source of truth: the count + per-triangle area come from the
// illustration's verified lattice/area proof, never re-asserted here.
/** Small-triangle area, in cm² (each lattice triangle). */
export const SMALL_AREA = SMALL_TRIANGLE_CM2 // 6
/** How many small triangles the shaded quadrilateral ABCD covers. */
export const TRI_COUNT = ANSWER_TRIANGLE_COUNT // 12
/** Final area in cm² = TRI_COUNT × SMALL_AREA. */
export const ANSWER_AREA = ANSWER_CM2 // 72
/** Which multiple-choice label the answer area lands on. */
export const ANSWER_CHOICE = 'C'

export interface TriQuadStep {
  /** Running count of small triangles tallied so far (0 on the goal beat). */
  count: number
  /** Show the illustrator's per-triangle tally overlay on this beat. */
  showCount: boolean
  /** True only on the final 12 × 6 = 72 beat. */
  result: boolean
  caption: string
  hold: number
}

export interface TriQuadStoryboard {
  answerArea: number
  triCount: number
  smallArea: number
  steps: TriQuadStep[]
  finalIndex: number
}

export function buildTriGridQuad23G3Steps(lang: Lang): TriQuadStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriQuadStep[] = []

  // 1) Goal beat — name the plan: area = (triangles inside) × 6.
  steps.push({
    count: 0,
    showCount: false,
    result: false,
    hold: 2800,
    caption: t(
      "ABCD is built from the little triangles. Its area = (how many fit inside) × 6 cm². So let's count them!",
      'ABCD tersusun dari segitiga-segitiga kecil. Luasnya = (berapa yang muat di dalam) × 6 cm². Ayo hitung!',
    ),
  })

  // 2) Count-up beats — reveal the small triangles a few at a time, tally climbing
  //    to 12. The first chunk lingers a touch so the "counting" idea reads; later
  //    chunks tick faster as the running total climbs.
  const CHUNKS = [3, 3, 3, 3] // 3+3+3+3 = 12, four count-up beats
  let running = 0
  CHUNKS.forEach((add, i) => {
    running += add
    const first = i === 0
    steps.push({
      count: running,
      showCount: true,
      result: false,
      hold: first ? 2200 : 1700,
      caption: first
        ? t(
            `Colour them in: 1, 2, 3 small triangles so far — running total ${running}.`,
            `Warnai: 1, 2, 3 segitiga kecil dulu — total sementara ${running}.`,
          )
        : running < TRI_COUNT
          ? t(
              `Keep going — ${add} more light up. Running total ${running}.`,
              `Lanjut — ${add} lagi menyala. Total sementara ${running}.`,
            )
          : t(
              `The last ${add} fit in. Every small triangle counted: ${running} in all!`,
              `${add} terakhir muat. Semua segitiga kecil terhitung: ${running} semuanya!`,
            ),
    })
  })

  // 3) Final beat — multiply count × area to land on 72 → C.
  steps.push({
    count: TRI_COUNT,
    showCount: true,
    result: true,
    hold: 0,
    caption: t(
      `${TRI_COUNT} small triangles × ${SMALL_AREA} cm² each = ${ANSWER_AREA} cm². Answer ${ANSWER_CHOICE}.`,
      `${TRI_COUNT} segitiga kecil × ${SMALL_AREA} cm² = ${ANSWER_AREA} cm². Jawaban ${ANSWER_CHOICE}.`,
    ),
  })

  return {
    answerArea: ANSWER_AREA,
    triCount: TRI_COUNT,
    smallArea: SMALL_AREA,
    steps,
    finalIndex: steps.length - 1,
  }
}
