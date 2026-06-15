import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  SEGMENT_PATHS,
  SEGMENT_LENGTHS,
  SEGMENT_IDS,
  pathLength,
  type SegmentId,
} from './Segments24G1Illustration'

// WMI-24F1A-Q3 (2024 Grade 1 Final) — multiple-choice answer = B, i.e. the true
// statement "A < B".
//
// "What is true about the lengths of the three black line segments A, B, C?"
// Each segment is a zig-zag polyline on a dotted unit grid; its length is the
// number of unit edges it traverses (the shared 2-cell diagonal counts as 2).
//
// LENGTHS (read straight from the illustration, never asserted here):
//   A = 8 · B = 9 · C = 8   →   A = C < B
//
// The animation teaches the method by *measuring each segment in front of the
// kid*, one segment per beat group:
//   1. State the goal.
//   2. Trace A vertex-by-vertex, the running unit count climbing → A = 8.
//   3. Trace B the same way → B = 9.
//   4. Trace C the same way → C = 8.
//   5. Line the three counts up (A=8, B=9, C=8) and compare. 8 < 9, and A = C,
//      so "A = B", "A < C", "B < C", "B = C" are all false; only "A < B" is true.
//   6. Result: the true statement is "A < B" → choice B.
//
// Nothing is asserted: every count comes from SEGMENT_LENGTHS / pathLength on the
// recovered SEGMENT_PATHS, so the storyboard can never drift from the figure.

export type SegPhase = 'goal' | 'trace' | 'compare' | 'result'

export interface SegmentsStep {
  phase: SegPhase
  /** Segment currently being traced / lit (trace + per-segment compare); null on goal. */
  active: SegmentId | null
  /**
   * How many vertices of the active segment's polyline are revealed so far
   * (0 = nothing yet, full path length count = whole segment shown). Drives the
   * growing orange trace overlay. Only meaningful in the `trace` phase.
   */
  vertices: number
  /** Running unit-edge count to print beside the trace (trace phase). */
  running: number
  /** When true the compare row shows all three settled counts (A=8, B=9, C=8). */
  showCounts: boolean
  /** Reveal the per-segment unit-count badges on the figure. */
  revealLengths: boolean
  caption: string
  result: boolean
  /** How long to hold this beat, in ms (winner holds = 0). */
  hold: number
}

export interface SegmentsStoryboard {
  steps: SegmentsStep[]
  finalIndex: number
  lengths: Readonly<Record<SegmentId, number>>
  /** The correct multiple-choice letter / true statement. */
  answer: string
  answerStatement: string
}

/**
 * Cumulative unit-edge count after revealing the first `v` polyline vertices
 * (v = 0 → 0, v = 1 → first point only → 0, etc.). Diagonals contribute their
 * full diagonal-step run, matching pathLength.
 */
function runningTo(pts: ReadonlyArray<readonly [number, number]>, v: number): number {
  return pathLength(pts.slice(0, Math.max(1, v)))
}

export function buildSegments24G1Steps(lang: Lang): SegmentsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const lengths = SEGMENT_LENGTHS
  // A = C < B, so the lone true statement is "A < B" — choice B.
  const answer = 'B'
  const answerStatement = 'A < B'

  const steps: SegmentsStep[] = []

  // 1) Goal.
  steps.push({
    phase: 'goal',
    active: null,
    vertices: 0,
    running: 0,
    showCounts: false,
    revealLengths: false,
    caption: t(
      'Each black line walks along the dots. To compare A, B and C, we measure how many unit steps each one takes.',
      'Tiap garis hitam berjalan di titik-titik. Untuk membandingkan A, B, dan C, kita hitung berapa langkah satuan tiap garis.',
    ),
    result: false,
    hold: 2600,
  })

  // 2) Trace each segment, vertex by vertex, count climbing.
  SEGMENT_IDS.forEach((id) => {
    const pts = SEGMENT_PATHS[id]
    const len = lengths[id]

    // Walk from the first edge (2 vertices) to the whole path.
    for (let v = 2; v <= pts.length; v++) {
      const running = runningTo(pts, v)
      const done = v === pts.length
      steps.push({
        phase: 'trace',
        active: id,
        vertices: v,
        running,
        showCounts: false,
        revealLengths: false,
        caption: done
          ? t(
              `Segment ${id} takes ${len} unit steps in all, so ${id} = ${len}.`,
              `Garis ${id} memakai ${len} langkah satuan, jadi ${id} = ${len}.`,
            )
          : t(
              `Trace ${id}, counting each step… ${running} so far.`,
              `Telusuri ${id}, hitung tiap langkah… ${running} sejauh ini.`,
            ),
        result: false,
        hold: done ? 2200 : 1300,
      })
    }
  })

  // 3) Compare the three settled counts.
  steps.push({
    phase: 'compare',
    active: null,
    vertices: 0,
    running: 0,
    showCounts: true,
    revealLengths: true,
    caption: t(
      `Line them up: A = ${lengths.A}, B = ${lengths.B}, C = ${lengths.C}. A and C are the same; B is the longest.`,
      `Sejajarkan: A = ${lengths.A}, B = ${lengths.B}, C = ${lengths.C}. A dan C sama; B paling panjang.`,
    ),
    result: false,
    hold: 2800,
  })

  // 4) Knock out the false statements, keep the true one.
  steps.push({
    phase: 'compare',
    active: 'B',
    vertices: 0,
    running: 0,
    showCounts: true,
    revealLengths: true,
    caption: t(
      `${lengths.A} < ${lengths.B}, so "A < B" is true. (A = C, so "A < C" and "B = C" are false.)`,
      `${lengths.A} < ${lengths.B}, jadi "A < B" benar. (A = C, jadi "A < C" dan "B = C" salah.)`,
    ),
    result: false,
    hold: 2600,
  })

  // 5) Result: the true statement is "A < B" → choice B.
  steps.push({
    phase: 'result',
    active: 'B',
    vertices: 0,
    running: 0,
    showCounts: true,
    revealLengths: true,
    caption: t(
      `The true statement is "${answerStatement}" — that's choice ${answer}.`,
      `Pernyataan yang benar adalah "${answerStatement}" — itu pilihan ${answer}.`,
    ),
    result: true,
    hold: 0,
  })

  return {
    steps,
    finalIndex: steps.length - 1,
    lengths,
    answer,
    answerStatement,
  }
}
