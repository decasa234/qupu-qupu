// In-card figure for WMI-23P3A-Q8 (2023 Grade-3 Semifinal, Paper A, question 8).
//
// Redrawn from db/seed/wmi/figures/2023-semifinal-g3-a-q8.jpg (NOT embedded):
// a two-peak "mountain" outline. Going around the boundary the sides are:
//   bottom 32 m, left outer slope 15 m, left peak's inner slope 3 m (down into
//   the valley), right peak's inner slope x m (up out of the valley), right
//   outer slope 21 m.
// Perimeter = 32 + 15 + 3 + x + 21 = 80  →  71 + x = 80  →  x = 9 m (answer D).
//
// The static figure is PROBLEM-ONLY: it shows the outline with the four known
// side lengths and the unknown side marked "x m" — it never states x = 9.
// Pure render, SSR-safe, deterministic.

export const PERIMETER = 80
export const KNOWN_SIDES = { bottom: 32, leftSlope: 15, valleyLeft: 3, rightSlope: 21 } as const
export const KNOWN_SUM = KNOWN_SIDES.bottom + KNOWN_SIDES.leftSlope + KNOWN_SIDES.valleyLeft + KNOWN_SIDES.rightSlope // 71
export const X_VALUE = PERIMETER - KNOWN_SUM // 9

const FILL = '#F8D3A2' // light tan, matching the scan
const INK = '#2A2A2A'

// ---- pixel layout (outline vertices) ----------------------------------------
// y grows downward. Right peak is the tallest; left peak shorter; valley between.
const PAD = 16
const BASE_Y = 196
const LEFT_X = 30
const RIGHT_X = 380
const LPEAK = { x: 150, y: 60 } // shorter left summit
const VALLEY = { x: 196, y: 96 } // dip between the two peaks
const RPEAK = { x: 262, y: 18 } // taller right summit

const VIEW_W = RIGHT_X + PAD + 24
const VIEW_H = BASE_Y + PAD

const OUTLINE = [
  [LEFT_X, BASE_Y], // bottom-left
  [LPEAK.x, LPEAK.y], // up left slope (15 m)
  [VALLEY.x, VALLEY.y], // down into valley (3 m)
  [RPEAK.x, RPEAK.y], // up to right peak (x m)
  [RIGHT_X, BASE_Y], // down right slope (21 m)
] as const

export type SideKey = 'bottom' | 'leftSlope' | 'valleyLeft' | 'rightSlope' | 'x'

export interface MountainProps {
  /** Side keys to highlight (drawn bold + their label tinted). */
  highlight?: SideKey[]
  /** Reveal x's numeric value on its label (result beat); otherwise shows "x m". */
  revealX?: boolean
}

function mid(a: readonly [number, number] | number[], b: readonly [number, number] | number[]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
}

export function Mountain({ highlight = [], revealX = false }: MountainProps) {
  const on = (k: SideKey) => highlight.includes(k)
  const path = `M ${OUTLINE.map((p) => p.join(' ')).join(' L ')} Z`

  // edge endpoints for per-side bold strokes
  const edges: Record<SideKey, [number[], number[]]> = {
    leftSlope: [OUTLINE[0] as unknown as number[], OUTLINE[1] as unknown as number[]],
    valleyLeft: [OUTLINE[1] as unknown as number[], OUTLINE[2] as unknown as number[]],
    x: [OUTLINE[2] as unknown as number[], OUTLINE[3] as unknown as number[]],
    rightSlope: [OUTLINE[3] as unknown as number[], OUTLINE[4] as unknown as number[]],
    bottom: [OUTLINE[4] as unknown as number[], OUTLINE[0] as unknown as number[]],
  }

  const HL = '#2f6df0'

  // label anchor positions (nudged off each edge so nothing overlaps the fill)
  const [lsx, lsy] = mid(OUTLINE[0], OUTLINE[1])
  const [vlx, vly] = mid(OUTLINE[1], OUTLINE[2])
  const [xmx, xmy] = mid(OUTLINE[2], OUTLINE[3])
  const [rsx, rsy] = mid(OUTLINE[3], OUTLINE[4])
  const [btx, bty] = mid(OUTLINE[4], OUTLINE[0])

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <path d={path} fill={FILL} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />

      {/* per-side bold overlays when highlighted */}
      {(Object.keys(edges) as SideKey[]).map((k) =>
        on(k) ? (
          <line key={k} x1={edges[k][0][0]} y1={edges[k][0][1]} x2={edges[k][1][0]} y2={edges[k][1][1]} stroke={HL} strokeWidth={5} strokeLinecap="round" />
        ) : null,
      )}

      {/* side labels */}
      <text x={lsx - 22} y={lsy} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={on('leftSlope') ? 900 : 700} fill={on('leftSlope') ? HL : INK}>
        15 m
      </text>
      <text x={vlx - 6} y={vly + 4} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={on('valleyLeft') ? 900 : 700} fill={on('valleyLeft') ? HL : INK}>
        3 m
      </text>
      <text x={xmx + 16} y={xmy} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={on('x') ? 900 : 700} fontStyle="italic" fill={on('x') ? HL : INK}>
        {revealX ? `${X_VALUE} m` : 'x m'}
      </text>
      <text x={rsx + 24} y={rsy} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={on('rightSlope') ? 900 : 700} fill={on('rightSlope') ? HL : INK}>
        21 m
      </text>
      <text x={btx} y={bty + 16} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={on('bottom') ? 900 : 700} fill={on('bottom') ? HL : INK}>
        32 m
      </text>
    </svg>
  )
}

export default function P23G3Q8Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A two-peak mountain outline. Sides: bottom 32 m, left slope 15 m, the left peak's inner slope 3 m, the right peak's inner slope marked x m, and the right slope 21 m."
    >
      <Mountain />
    </div>
  )
}
