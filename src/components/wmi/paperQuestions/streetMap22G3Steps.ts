/**
 * WMI-22F3A-Q4 — Street-map longest trail storyboard.
 *
 * The 9-edge Eulerian-style trail T→0→1→3→2→T→5→3→4→M is walked one edge
 * per beat, with a growing highlighted-edge list and a running street count.
 * The final beat shows 9 × 130 = 1170 m (answer C) and notes that 10 would
 * require a repeated street.
 *
 * Pure function — deterministic, SSR-safe, no Math.random, no Date.
 */

export type Lang = 'en' | 'id'

export interface StreetMap22G3Step {
  /** The highlighted edges to render on this beat (grows monotonically). */
  highlightedEdges: Array<[string, string]>
  /** Street count on this beat (0 on the intro beats, 1–9 on the trail beats). */
  streetCount: number
  /** Running distance in metres (0 on intro beats). */
  distanceM: number
  caption: string
  hold: number
  result: boolean
}

export interface StreetMap22G3Storyboard {
  steps: StreetMap22G3Step[]
  finalIndex: number
  answerM: number
}

/** The verified 9-edge trail: T→0→1→3→2→T→5→3→4→M */
const TRAIL: Array<[string, string]> = [
  ['T', '0'],
  ['0', '1'],
  ['1', '3'],
  ['2', '3'],  // walk backward along 2-3: 3→2 same edge
  ['T', '2'],  // then T→2
  ['T', '5'],
  ['3', '5'],  // then 3→5 (same edge, walk 5→3 direction)
  ['3', '4'],
  ['4', 'M'],
]

/**
 * Node sequence labels used in per-beat captions.
 * Beat i adds edge TRAIL[i], arriving at node TRAIL_NODES[i+1].
 */
const TRAIL_NODES = ['T', '0', '1', '3', '2', 'T', '5', '3', '4', 'M']

const STREET_LEN = 130  // metres per street

export function buildStreetMap22G3Steps(lang: Lang): StreetMap22G3Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StreetMap22G3Step[] = []

  // ── Beat 0: show the map; shortest route is 2 streets = 260 m ─────────────
  steps.push({
    highlightedEdges: [],
    streetCount: 0,
    distanceM: 0,
    caption: t(
      'Tom → Mary: the shortest route uses just 2 streets = 260 m (e.g. T→5→M).',
      'Tom → Mary: rute terpendek hanya 2 jalan = 260 m (mis. T→5→M).',
    ),
    hold: 2400,
    result: false,
  })

  // ── Beat 1: explain the goal ───────────────────────────────────────────────
  steps.push({
    highlightedEdges: [],
    streetCount: 0,
    distanceM: 0,
    caption: t(
      'Goal: walk as long as possible without using any street twice. (You may pass a house again — just not the same street.)',
      'Tujuan: berjalan sejauh mungkin tanpa melewati jalan yang sama dua kali. (Boleh melewati rumah lagi — asal bukan jalan yang sama.)',
    ),
    hold: 2800,
    result: false,
  })

  // ── Beats 2–10: one new street per beat ───────────────────────────────────
  const growing: Array<[string, string]> = []

  for (let i = 0; i < TRAIL.length; i++) {
    growing.push(TRAIL[i])
    const streetCount = i + 1
    const distanceM = streetCount * STREET_LEN
    const from = TRAIL_NODES[i]
    const to = TRAIL_NODES[i + 1]

    const isLast = i === TRAIL.length - 1

    let caption: string
    if (isLast) {
      caption = t(
        `Street ${streetCount}: ${from}→${to}. That's ${streetCount} streets = ${streetCount} × 130 = ${distanceM} m — answer C!`,
        `Jalan ke-${streetCount}: ${from}→${to}. Sudah ${streetCount} jalan = ${streetCount} × 130 = ${distanceM} m — jawaban C!`,
      )
    } else {
      caption = t(
        `Street ${streetCount}: ${from}→${to}. Running total: ${streetCount} × 130 = ${distanceM} m.`,
        `Jalan ke-${streetCount}: ${from}→${to}. Total sejauh ini: ${streetCount} × 130 = ${distanceM} m.`,
      )
    }

    steps.push({
      highlightedEdges: [...growing],
      streetCount,
      distanceM,
      caption,
      // Over-budget / intermediate beats hold a bit longer; final beat holds 0.
      hold: isLast ? 0 : i < 3 ? 2100 : 1800,
      result: isLast,
    })
  }

  // ── Final note beat: cannot reach 10 streets ─────────────────────────────
  // The last trail beat (index 10, hold:0) IS the result beat.
  // We append one extra note beat so the animation ends cleanly on the "why
  // not 10" insight, but it still carries result:true and hold:0.
  steps.push({
    highlightedEdges: [...growing],
    streetCount: 9,
    distanceM: 9 * STREET_LEN,
    caption: t(
      '9 streets = 1170 m ✓. Could we fit 10? No — every path from here would repeat a street.',
      '9 jalan = 1170 m ✓. Bisakah 10? Tidak — semua jalan dari sini akan mengulang jalan yang sudah dilewati.',
    ),
    hold: 0,
    result: true,
  })

  return {
    steps,
    finalIndex: steps.length - 1,
    answerM: 9 * STREET_LEN,
  }
}
