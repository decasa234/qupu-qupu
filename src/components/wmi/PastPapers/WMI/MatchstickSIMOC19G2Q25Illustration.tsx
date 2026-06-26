// SIMOC-19-G2-Q25 — Static illustration: "869" in seven-segment matchstick style.
// Shows the PROBLEM ONLY (not the answer).
// Pure SVG, no hooks, no random, no Date, SSR-safe.
//
// Named exports (re-used by the explainer):
//   DIGIT_W, DIGIT_H, DIGIT_GAP, SEG_INSET
//   MATCH_COLOR, MATCH_REMOVED_COLOR, MATCH_ADDED_COLOR, MATCH_SW, DOT_R
//   SEG_LINES, DIGIT_SEG_IDS, SEG_CORNER_IDS, SEG_CORNERS_POS
//   DigitSegs, ILL_SVG_W, ILL_SVG_H

// ── Layout constants ──────────────────────────────────────────────────────────

/** Width of one seven-segment digit bounding box. */
export const DIGIT_W = 40
/** Height of one seven-segment digit bounding box. */
export const DIGIT_H = 60
/** Horizontal gap between consecutive digits. */
export const DIGIT_GAP = 22
/** Segment line endpoint inset from the corner junction. */
export const SEG_INSET = 4

export const MATCH_COLOR = '#374151'
export const MATCH_REMOVED_COLOR = '#EF4444'
export const MATCH_ADDED_COLOR = '#10B981'
export const MATCH_SW = 4.5
export const DOT_R = 3.5

// ── Seven-segment geometry ────────────────────────────────────────────────────

const MY = DIGIT_H / 2  // y-coord of the middle bar (= 30)

/**
 * All 7 segment lines in local digit coordinates [x1, y1, x2, y2].
 * Array index = segment ID (0–6).
 */
export const SEG_LINES: ReadonlyArray<readonly [number, number, number, number]> = [
  [SEG_INSET,    0,              DIGIT_W - SEG_INSET, 0              ], // 0 top
  [0,            SEG_INSET,      0,                   MY - SEG_INSET ], // 1 top-left
  [DIGIT_W,      SEG_INSET,      DIGIT_W,             MY - SEG_INSET ], // 2 top-right
  [SEG_INSET,    MY,             DIGIT_W - SEG_INSET, MY             ], // 3 middle
  [0,            MY + SEG_INSET, 0,                   DIGIT_H - SEG_INSET], // 4 bottom-left
  [DIGIT_W,      MY + SEG_INSET, DIGIT_W,             DIGIT_H - SEG_INSET], // 5 bottom-right
  [SEG_INSET,    DIGIT_H,        DIGIT_W - SEG_INSET, DIGIT_H        ], // 6 bottom
]

/**
 * The 6 corner/junction positions in local coords.
 * Array index = corner ID (0–5).
 */
export const SEG_CORNERS_POS: ReadonlyArray<readonly [number, number]> = [
  [0,       0       ], // 0 top-left
  [DIGIT_W, 0       ], // 1 top-right
  [0,       MY      ], // 2 mid-left
  [DIGIT_W, MY      ], // 3 mid-right
  [0,       DIGIT_H ], // 4 bottom-left
  [DIGIT_W, DIGIT_H ], // 5 bottom-right
]

/**
 * For each segment (index = segment ID 0–6), the two corner IDs it connects.
 * Used to determine which dot markers to place.
 */
export const SEG_CORNER_IDS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], // 0 top        → top-left   ↔ top-right
  [0, 2], // 1 top-left   → top-left   ↔ mid-left
  [1, 3], // 2 top-right  → top-right  ↔ mid-right
  [2, 3], // 3 middle     → mid-left   ↔ mid-right
  [2, 4], // 4 bot-left   → mid-left   ↔ bot-left
  [3, 5], // 5 bot-right  → mid-right  ↔ bot-right
  [4, 5], // 6 bottom     → bot-left   ↔ bot-right
]

/** Active segment IDs per digit 0–9 (standard seven-segment display). */
export const DIGIT_SEG_IDS: Readonly<Record<number, readonly number[]>> = {
  0: [0, 1, 2, 4, 5, 6],    // 6 segs — no middle
  1: [2, 5],                  // 2 segs
  2: [0, 2, 3, 4, 6],        // 5 segs
  3: [0, 2, 3, 5, 6],        // 5 segs
  4: [1, 2, 3, 5],            // 4 segs
  5: [0, 1, 3, 5, 6],        // 5 segs
  6: [0, 1, 3, 4, 5, 6],    // 6 segs — no top-right
  7: [0, 2, 5],               // 3 segs
  8: [0, 1, 2, 3, 4, 5, 6], // 7 segs — all
  9: [0, 1, 2, 3, 5, 6],    // 6 segs — no bot-left
}

// ── DigitSegs primitive ───────────────────────────────────────────────────────

/**
 * Renders one seven-segment matchstick digit as raw SVG elements (lines + dots).
 * Place inside a parent `<svg>` or `<g>`; offset the digit by (dx, dy).
 *
 * @param dimSegIds  Segment IDs in DIGIT_SEG_IDS[digit] to draw in red (being removed).
 * @param addSegIds  Extra segment IDs NOT in digit's set to draw in green (being added).
 */
export function DigitSegs({
  digit,
  dx,
  dy,
  color = MATCH_COLOR,
  sw = MATCH_SW,
  dotR = DOT_R,
  dimSegIds,
  addSegIds,
}: {
  digit: number
  dx: number
  dy: number
  color?: string
  sw?: number
  dotR?: number
  dimSegIds?: readonly number[]
  addSegIds?: readonly number[]
}) {
  const active = new Set(DIGIT_SEG_IDS[digit] ?? [])
  const dimmed = new Set(dimSegIds ?? [])
  const added = new Set(addSegIds ?? [])

  // All segments to render: active + extra added (not duplicating)
  const allSegs = [
    ...Array.from(active),
    ...Array.from(added).filter(s => !active.has(s)),
  ]

  // Unique corner indices used by all rendered segments (for dot markers)
  const usedCorners = new Set<number>()
  for (const sid of allSegs) {
    const pair = SEG_CORNER_IDS[sid]
    if (pair) { usedCorners.add(pair[0]); usedCorners.add(pair[1]) }
  }

  return (
    <>
      {/* Segment lines */}
      {allSegs.map(sid => {
        const seg = SEG_LINES[sid]
        if (!seg) return null
        const [x1, y1, x2, y2] = seg
        const segColor = dimmed.has(sid)
          ? MATCH_REMOVED_COLOR
          : added.has(sid) && !active.has(sid)
          ? MATCH_ADDED_COLOR
          : color
        return (
          <line
            key={`s${sid}`}
            x1={dx + x1} y1={dy + y1}
            x2={dx + x2} y2={dy + y2}
            stroke={segColor}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        )
      })}

      {/* Junction dot markers */}
      {Array.from(usedCorners).map(ci => {
        const pos = SEG_CORNERS_POS[ci]
        if (!pos) return null
        const [cx, cy] = pos
        // Dot is red only if every active segment touching it is dimmed
        const touchingActive = SEG_CORNER_IDS
          .map((pair, sid) => (pair[0] === ci || pair[1] === ci) && active.has(sid) ? sid : -1)
          .filter(sid => sid >= 0)
        const dotColor =
          touchingActive.length > 0 && touchingActive.every(sid => dimmed.has(sid))
            ? MATCH_REMOVED_COLOR
            : color
        return <circle key={`d${ci}`} cx={dx + cx} cy={dy + cy} r={dotR} fill={dotColor} />
      })}
    </>
  )
}

// ── Static illustration ───────────────────────────────────────────────────────

const ILL_PAD_X = 20
const ILL_PAD_Y = 16

/** Total SVG width for the illustration (3 digits). */
export const ILL_SVG_W = 3 * DIGIT_W + 2 * DIGIT_GAP + 2 * ILL_PAD_X  // 204

/** Total SVG height for the illustration. */
export const ILL_SVG_H = DIGIT_H + 2 * ILL_PAD_Y  // 92

/**
 * Default export: SIMOC-19-G2-Q25 illustration.
 * Shows number "869" in matchstick seven-segment style — the PROBLEM state only.
 */
export default function MatchstickSIMOC19G2Q25Illustration() {
  return (
    <svg
      viewBox={`0 0 ${ILL_SVG_W} ${ILL_SVG_H}`}
      width={ILL_SVG_W}
      height={ILL_SVG_H}
      role="img"
      aria-label="Angka 869 dalam gaya korek api tujuh-segmen menggunakan 19 korek"
      style={{ display: 'block', margin: '0 auto' }}
    >
      <DigitSegs digit={8} dx={ILL_PAD_X}                                dy={ILL_PAD_Y} />
      <DigitSegs digit={6} dx={ILL_PAD_X + DIGIT_W + DIGIT_GAP}          dy={ILL_PAD_Y} />
      <DigitSegs digit={9} dx={ILL_PAD_X + 2 * (DIGIT_W + DIGIT_GAP)}    dy={ILL_PAD_Y} />
    </svg>
  )
}
