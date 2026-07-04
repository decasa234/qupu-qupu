// Tower of four dice for WMI-20P1A-Q24 (2020 Grade 1 Semifinal).
//
// Source figure (db/seed/wmi/figures/2020-semifinal-g1-a-q24.jpg): four dice
// stacked on a table. Only the top of the whole tower is visible (1 pip); the
// front/right side faces of each die are shown. Opposite faces of a die sum to 7,
// so each die's downward face = 7 − its upward face. The four upward faces add to
// 7 (the visible top of the stack is 1), so the four downward faces add to
// 4 × 7 − 7 = 21  → answer A.
//
// The static figure draws ONLY the problem (the bottom faces stay hidden).

const INK = '#1F2937'

export const Q24_DICE = 4
export const Q24_PAIR_SUM = 7
export const Q24_TOP_TOTAL = 7 // sum of the four upward faces
export const Q24_ANSWER = Q24_DICE * Q24_PAIR_SUM - Q24_TOP_TOTAL // 28 − 7 = 21

// Pip layouts on a unit face [0..1]².
const PIP_UV: Record<number, Array<[number, number]>> = {
  1: [[0.5, 0.5]],
  2: [[0.3, 0.3], [0.7, 0.7]],
  3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
  4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]],
  5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
  6: [[0.3, 0.22], [0.7, 0.22], [0.3, 0.5], [0.7, 0.5], [0.3, 0.78], [0.7, 0.78]],
}

// Faithful visible side faces of each die, top die first (front=left, right=right),
// read off the scan. With standard (right-handed) dice these sides fix each up
// face: tops are 1, 2, 3, 1 — they add to 7.
const FACES = [
  { front: 3, right: 5 },
  { front: 1, right: 4 },
  { front: 6, right: 5 },
  { front: 5, right: 4 },
]

export const Q24_VIEW_W = 260
export const Q24_VIEW_H = 360

const CX = Q24_VIEW_W / 2
const S = 56 // iso half-width of a die
const HSTEP = S * 0.5 // vertical half-step of the iso top face
const BODY = 60 // vertical body height of one die
const TOP_Y = 30 // y of the topmost back corner

function pts(arr: Array<[number, number]>) {
  return arr.map(([x, y]) => `${x},${y}`).join(' ')
}

// bilinear map of (u,v) in [0..1]² onto a quad given its 4 corners
function quadPoint(
  u: number,
  v: number,
  tl: [number, number],
  tr: [number, number],
  bl: [number, number],
  br: [number, number],
): [number, number] {
  const x = tl[0] * (1 - u) * (1 - v) + tr[0] * u * (1 - v) + bl[0] * (1 - u) * v + br[0] * u * v
  const y = tl[1] * (1 - u) * (1 - v) + tr[1] * u * (1 - v) + bl[1] * (1 - u) * v + br[1] * u * v
  return [x, y]
}

/** One die at vertical offset `k` (0 = top). `showTop` draws the top face pips. */
function Die({ k, front, right, showTop }: { k: number; front: number; right: number; showTop: boolean }) {
  const baseY = TOP_Y + k * BODY
  // top-face diamond corners
  const T: [number, number] = [CX, baseY] // back
  const L: [number, number] = [CX - S, baseY + HSTEP]
  const R: [number, number] = [CX + S, baseY + HSTEP]
  const F: [number, number] = [CX, baseY + 2 * HSTEP] // front
  // bottom corners of this die's body
  const Lb: [number, number] = [CX - S, baseY + HSTEP + BODY]
  const Fb: [number, number] = [CX, baseY + 2 * HSTEP + BODY]
  const Rb: [number, number] = [CX + S, baseY + HSTEP + BODY]

  const frontPips = PIP_UV[front] ?? []
  const rightPips = PIP_UV[right] ?? []
  const topPips = PIP_UV[1] ?? []

  return (
    <g>
      {/* left/front face: L F Fb Lb */}
      <polygon points={pts([L, F, Fb, Lb])} fill="#F8FAFC" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      {/* right face: F R Rb Fb */}
      <polygon points={pts([F, R, Rb, Fb])} fill="#EEF2F7" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      {/* top face only on the topmost die: T R F L */}
      {showTop && <polygon points={pts([T, R, F, L])} fill="#FFFFFF" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />}

      {/* front pips (quad L F Fb Lb) */}
      {frontPips.map(([u, v], i) => {
        const [x, y] = quadPoint(u, v, L, F, Lb, Fb)
        return <ellipse key={`f${i}`} cx={x} cy={y} rx={5} ry={5.6} fill={INK} />
      })}
      {/* right pips (quad F R Fb Rb) */}
      {rightPips.map(([u, v], i) => {
        const [x, y] = quadPoint(u, v, F, R, Fb, Rb)
        return <ellipse key={`r${i}`} cx={x} cy={y} rx={5} ry={5.6} fill={INK} />
      })}
      {/* top pips (quad L T F? ) — use diamond corners L→R across u, T→F across v */}
      {showTop &&
        topPips.map(([u, v], i) => {
          const [x, y] = quadPoint(u, v, T, R, L, F)
          return <ellipse key={`t${i}`} cx={x} cy={y} rx={6} ry={3.4} fill={INK} />
        })}
    </g>
  )
}

export interface Q24DiagramProps {
  /** Show a translucent table under the tower. */
  showTable?: boolean
}

export function Q24Diagram({ showTable = true }: Q24DiagramProps) {
  const towerBottom = TOP_Y + 2 * HSTEP + Q24_DICE * BODY
  return (
    <svg
      viewBox={`0 0 ${Q24_VIEW_W} ${Q24_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* table top: a thin iso parallelogram beneath the tower */}
      {showTable && (
        <polygon
          points={pts([
            [CX - 110, towerBottom],
            [CX, towerBottom + 26],
            [CX + 110, towerBottom],
            [CX, towerBottom - 26],
          ])}
          fill="none"
          stroke="#9aa3b2"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      )}
      {/* draw dice bottom-up so upper dice overlap lower ones cleanly */}
      {[...FACES]
        .map((f, k) => ({ ...f, k }))
        .reverse()
        .map(({ front, right, k }) => (
          <Die key={k} k={k} front={front} right={right} showTop={k === 0} />
        ))}
    </svg>
  )
}

export default function P20G1Q24Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A tower of four dice on a table. Only the top of the tower (1 pip) and the side faces are visible; the four downward faces are hidden."
    >
      <Q24Diagram />
    </div>
  )
}
