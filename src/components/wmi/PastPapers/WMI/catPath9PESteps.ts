// IKMC-21-PE-Q9 — step-by-step solution storyboard for the cat-path animation.
//
// The question: Rose the cat starts at point B on a rectangular wall path and
// follows arrows. She walks a total of 20 metres. Where does she end up?
//
// Segment distances (in order of travel):
//   B → C:  4 m
//   C → D:  1 m
//   D → E:  5 m
//   E → A:  2 m
//   A → B:  3 m    (one full circuit = 15 m)
//
// Strategy: accumulate distance, one segment at a time.
//   After  4 m → at C   (B→C)
//   After  5 m → at D   (C→D)
//   After 10 m → at E   (D→E)
//   After 12 m → at A   (E→A)
//   After 15 m → at B   (A→B, full loop)
//   After 19 m → at C   (B→C again)
//   After 20 m → at D   (C→D again) ← ANSWER
//
// Animation beats:
//   0. intro     — show static layout; cat at B; "start: 0 m"
//   1. B → C     — highlight B→C segment; running total: 4 m
//   2. C → D     — highlight C→D segment; running total: 5 m
//   3. D → E     — highlight D→E segment; running total: 10 m
//   4. E → A     — highlight E→A segment; running total: 12 m
//   5. A → B     — highlight A→B segment; running total: 15 m (full loop!)
//   6. B → C     — second pass; running total: 19 m
//   7. C → D     — second pass; running total: 20 m → arrives at D
//   8. result    — all walked segments green; "20 m → D"
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CatPhase9 = 'intro' | 'segment' | 'result'

export type PointName = 'A' | 'B' | 'C' | 'D' | 'E'

/** A directed segment between two named points. */
export interface Segment {
  from: PointName
  to: PointName
  metres: number
}

/** All ordered segments in one full circuit starting from B. */
export const CIRCUIT_SEGMENTS: Segment[] = [
  { from: 'B', to: 'C', metres: 4 },
  { from: 'C', to: 'D', metres: 1 },
  { from: 'D', to: 'E', metres: 5 },
  { from: 'E', to: 'A', metres: 2 },
  { from: 'A', to: 'B', metres: 3 },
]

/** Total metres for one full circuit. */
export const CIRCUIT_TOTAL = CIRCUIT_SEGMENTS.reduce((s, seg) => s + seg.metres, 0) // 15

export interface CatBeat9 {
  phase: CatPhase9
  /** Segments walked so far (shown highlighted). */
  walkedSegments: Segment[]
  /** The segment currently being highlighted (newest). */
  activeSegment: Segment | null
  /** Running total of metres walked. */
  total: number
  /** Position of the cat (point name). */
  catAt: PointName
  /** Equation / label text. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CatStoryboard9 {
  steps: CatBeat9[]
  finalIndex: number
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildCatPath9PESteps(lang: Lang): CatStoryboard9 {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const steps: CatBeat9[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    walkedSegments: [],
    activeSegment: null,
    total: 0,
    catAt: 'B',
    equation: '',
    hold: 2000,
    result: false,
    caption: t(
      'Rose the cat starts at point B. Follow the arrows to add up the distances.',
      'Rose si kucing mulai dari titik B. Ikuti panah untuk menjumlahkan jarak.',
    ),
  })

  // Beats 1–7 — one segment per beat (two passes through B→C→D)
  // We lay out: B→C, C→D, D→E, E→A, A→B, B→C(again), C→D(again)
  const segmentOrder: Segment[] = [
    CIRCUIT_SEGMENTS[0], // B→C  4m
    CIRCUIT_SEGMENTS[1], // C→D  1m
    CIRCUIT_SEGMENTS[2], // D→E  5m
    CIRCUIT_SEGMENTS[3], // E→A  2m
    CIRCUIT_SEGMENTS[4], // A→B  3m
    CIRCUIT_SEGMENTS[0], // B→C  4m (second lap)
    CIRCUIT_SEGMENTS[1], // C→D  1m (second lap → total 20m, end)
  ]

  let runningTotal = 0
  const walkedSoFar: Segment[] = []

  for (let i = 0; i < segmentOrder.length; i++) {
    const seg = segmentOrder[i]
    runningTotal += seg.metres
    walkedSoFar.push(seg)

    const isLast = i === segmentOrder.length - 1
    const isLoop = i === 4 // A→B completes first loop

    const eqText = isLast
      ? t(`${runningTotal} m → D`, `${runningTotal} m → D`)
      : `${t('Total', 'Total')}: ${runningTotal} m`

    const captionText = isLoop
      ? t(
          `A → B: +3 m. Total: 15 m — one full loop, back at B! Keep going.`,
          `A → B: +3 m. Total: 15 m — satu putaran penuh, kembali ke B! Lanjutkan.`,
        )
      : isLast
        ? t(
            `C → D: +1 m. Total: 20 m — Rose arrives at point D. Answer: D.`,
            `C → D: +1 m. Total: 20 m — Rose tiba di titik D. Jawaban: D.`,
          )
        : t(
            `${seg.from} → ${seg.to}: +${seg.metres} m. Total so far: ${runningTotal} m.`,
            `${seg.from} → ${seg.to}: +${seg.metres} m. Total sejauh ini: ${runningTotal} m.`,
          )

    steps.push({
      phase: isLast ? 'result' : 'segment',
      walkedSegments: [...walkedSoFar],
      activeSegment: seg,
      total: runningTotal,
      catAt: seg.to,
      equation: eqText,
      hold: isLast ? 0 : isLoop ? 2800 : 2200,
      result: isLast,
      caption: captionText,
    })
  }

  return { steps, finalIndex: steps.length - 1 }
}
