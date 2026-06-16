// Penguins-and-fish "loop value" figure for WMI-21P1A-Q19 (2021 Semifinal G1 A).
//
// Redrawn from db/seed/wmi/figures/2021-semifinal-g1-a-q19.jpg: penguins and
// fish are scattered across a field. A legend states that a small red round loop
// drawn around a group is worth 2 — i.e. a small loop encircles a group of 2
// animals. The asked shape is a bigger red figure-eight (peanut) loop, worth "?".
//
// Mechanic (revealed only in the explainer): the small loop holds 2 animals; the
// figure-eight is a bigger loop and holds a group of 6 animals, so its value is 6
// (answer B). The static figure shows the scatter + both loop glyphs in the
// legend; it never draws where the figure-eight lands, so the answer is hidden.

const LOOP_RED = '#E23B2E'

const PENG_BODY = '#3F5066'
const PENG_BELLY = '#FFFFFF'
const PENG_COLLAR = '#F08A24'
const PENG_BEAK = '#9AA3AE'
const PENG_EYE = '#F2C200'
const FISH_DARK = '#2E6FBF'
const FISH_LIGHT = '#A9D6F5'
const FISH_LINE = '#2E6FBF'

/** A small standing penguin, ~26 wide, anchored by its centre (cx, cy). */
export function Penguin({ cx, cy, s = 1 }: { cx: number; cy: number; s?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {/* feet */}
      <ellipse cx={-5} cy={17} rx={4} ry={2} fill={PENG_BODY} />
      <ellipse cx={5} cy={17} rx={4} ry={2} fill={PENG_BODY} />
      {/* body */}
      <path d="M 0 -18 C 11 -18 13 -4 12 6 C 11 14 6 16 0 16 C -6 16 -11 14 -12 6 C -13 -4 -11 -18 0 -18 Z" fill={PENG_BODY} />
      {/* belly */}
      <path d="M 0 -7 C 6 -7 8 0 8 6 C 8 12 4 14 0 14 C -4 14 -8 12 -8 6 C -8 0 -6 -7 0 -7 Z" fill={PENG_BELLY} />
      {/* collar */}
      <path d="M -9 -6 C -4 -2 4 -2 9 -6 C 6 -1 -6 -1 -9 -6 Z" fill={PENG_COLLAR} />
      {/* eyes */}
      <circle cx={-4} cy={-11} r={2.4} fill={PENG_EYE} />
      <circle cx={4} cy={-11} r={2.4} fill={PENG_EYE} />
      <circle cx={-4} cy={-11} r={1} fill="#1F2937" />
      <circle cx={4} cy={-11} r={1} fill="#1F2937" />
      {/* beak */}
      <polygon points="-2,-8 2,-8 0,-4" fill={PENG_BEAK} />
    </g>
  )
}

/** A small fish facing left, ~26 wide, anchored by its centre (cx, cy). */
export function Fish({ cx, cy, s = 1 }: { cx: number; cy: number; s?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {/* tail (to the right) */}
      <polygon points="9,0 16,-6 16,6" fill={FISH_LIGHT} stroke={FISH_LINE} strokeWidth={1.2} strokeLinejoin="round" />
      {/* body */}
      <ellipse cx={0} cy={0} rx={11} ry={8} fill={FISH_LIGHT} stroke={FISH_LINE} strokeWidth={1.4} />
      {/* darker top half */}
      <path d="M -11 0 C -8 -8 8 -8 11 0 Z" fill={FISH_DARK} opacity={0.85} />
      {/* eye (head to the left) */}
      <circle cx={-7} cy={-1} r={1.6} fill="#FFFFFF" />
      <circle cx={-7} cy={-1} r={0.9} fill="#1F2937" />
    </g>
  )
}

/** A simple round red loop (the legend "= 2" sample). */
export function RoundLoop({ cx, cy, rx = 16, ry = 13 }: { cx: number; cy: number; rx?: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={LOOP_RED} strokeWidth={3} />
}

/**
 * A red figure-eight (peanut) loop glyph: two fused lobes around (cx, cy), drawn
 * as one closed self-pinching curve. Used in the legend ("= ?"). `scale`/`rot`
 * let the same glyph appear small in the legend.
 */
export function FigureEightLoop({ cx, cy, rot = -20, scale = 1 }: { cx: number; cy: number; rot?: number; scale?: number }) {
  const d =
    'M 0 -34 ' +
    'C 20 -34 22 -14 8 -6 ' +
    'C 22 2 24 28 0 28 ' +
    'C -24 28 -22 2 -8 -6 ' +
    'C -22 -14 -20 -34 0 -34 Z'
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${scale})`}>
      <path d={d} fill="none" stroke={LOOP_RED} strokeWidth={3 / scale} />
    </g>
  )
}

/**
 * A figure-eight built from two overlapping ellipses (left & right lobes). This
 * form wraps a real cluster on the field — containment is exact ellipse math, so
 * the lobes provably enclose the six cluster animals and nothing else.
 */
export function FigureEightOverGroup({
  leftCx,
  rightCx,
  cy,
  rx = 40,
  ry = 62,
}: {
  leftCx: number
  rightCx: number
  cy: number
  rx?: number
  ry?: number
}) {
  return (
    <g fill="none" stroke={LOOP_RED} strokeWidth={3}>
      <ellipse cx={leftCx} cy={cy} rx={rx} ry={ry} />
      <ellipse cx={rightCx} cy={cy} rx={rx} ry={ry} />
    </g>
  )
}

export const P21G1Q19_VIEW_W = 480
export const P21G1Q19_VIEW_H = 340

export type Critter = { kind: 'peng' | 'fish'; x: number; y: number }

// Scatter (relative layout faithful to the scan: 8 penguins + 13 fish) arranged
// so the field reads as "scattered" but two regions are clean targets for the
// loops. Coordinates are in the 480×340 viewBox.
//   • indices 0,8       → the DEMO pair the round loop encircles (2 animals)
//   • indices 5,6,7,17,18,19 → the CLUSTER the figure-eight encircles (6 animals)
export const SCENE: Critter[] = [
  // 0  demo-pair penguin (top-left)
  { kind: 'peng', x: 60, y: 110 },
  // 1..4 scattered penguins (decoys)
  { kind: 'peng', x: 188, y: 120 },
  { kind: 'peng', x: 250, y: 188 },
  { kind: 'peng', x: 120, y: 240 },
  { kind: 'peng', x: 246, y: 268 },
  // 5,6,7 cluster penguins (lower-right): left lobe top & bottom, right lobe mid
  { kind: 'peng', x: 372, y: 162 },
  { kind: 'peng', x: 372, y: 258 },
  { kind: 'peng', x: 446, y: 210 },
  // 8  demo-pair fish (next to penguin 0)
  { kind: 'fish', x: 104, y: 116 },
  // 9..16 scattered fish (decoys)
  { kind: 'fish', x: 150, y: 80 },
  { kind: 'fish', x: 214, y: 78 },
  { kind: 'fish', x: 60, y: 178 },
  { kind: 'fish', x: 176, y: 196 },
  { kind: 'fish', x: 110, y: 296 },
  { kind: 'fish', x: 214, y: 150 },
  { kind: 'fish', x: 286, y: 110 },
  { kind: 'fish', x: 210, y: 300 },
  // 17,18,19 cluster fish (lower-right, with penguins 5,6,7)
  { kind: 'fish', x: 372, y: 210 },
  { kind: 'fish', x: 446, y: 162 },
  { kind: 'fish', x: 446, y: 258 },
  // 20 lone decoy fish (far right top)
  { kind: 'fish', x: 452, y: 110 },
]

// The demo round loop wraps these 2 animals.
export const DEMO_INDICES = [0, 8]

// The 6 animals the figure-eight encircles (2 penguins + 4 fish — wait: 3+3).
// Cluster = penguins 5,6,7 (3) + fish 17,18,19 (3) = 6 → value 6 (answer B).
export const ENCLOSED_INDICES = [5, 17, 7, 19, 6, 18]

export const P21G1Q19_ANSWER = 6

export interface P21G1Q19SceneProps {
  /** Draw the demo round loop around its 2-animal sample group. */
  showRoundLoop?: boolean
  /** Draw the big figure-eight over the cluster it encircles. */
  showFigureEight?: boolean
  /** Tag the animals inside the figure-eight with running 1..6 counters. */
  countEnclosed?: number
}

// The demo round loop sits over the 2-animal group (indices 0 & 8).
const ROUND_GROUP = { cx: 82, cy: 113, rx: 44, ry: 30 }

// Figure-eight placement over the lower-right 6-animal cluster: two lobes
// centred on the cluster's left column (x=372) and right column (x=446).
const FE_POS = { leftCx: 372, rightCx: 446, cy: 210, rx: 40, ry: 64 }

export function P21G1Q19Scene({ showRoundLoop = false, showFigureEight = false, countEnclosed = 0 }: P21G1Q19SceneProps) {
  return (
    <svg
      viewBox={`0 0 ${P21G1Q19_VIEW_W} ${P21G1Q19_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 480, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SCENE.map((c, i) =>
        c.kind === 'peng' ? <Penguin key={i} cx={c.x} cy={c.y} /> : <Fish key={i} cx={c.x} cy={c.y} />,
      )}

      {showRoundLoop && <RoundLoop cx={ROUND_GROUP.cx} cy={ROUND_GROUP.cy} rx={ROUND_GROUP.rx} ry={ROUND_GROUP.ry} />}
      {showFigureEight && (
        <FigureEightOverGroup leftCx={FE_POS.leftCx} rightCx={FE_POS.rightCx} cy={FE_POS.cy} rx={FE_POS.rx} ry={FE_POS.ry} />
      )}

      {/* running counters on the enclosed animals */}
      {countEnclosed > 0 &&
        ENCLOSED_INDICES.slice(0, countEnclosed).map((idx, k) => {
          const c = SCENE[idx]
          return (
            <g key={`cnt${k}`}>
              <circle cx={c.x + 12} cy={c.y - 16} r={9} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} />
              <text
                x={c.x + 12}
                y={c.y - 16}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={900}
                fill="#92400E"
              >
                {k + 1}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

/**
 * The legend strip: "(round loop) = 2" and "(figure-eight) = ?". Shown above the
 * scene in the static figure so the rule is stated without revealing the answer.
 */
export function P21G1Q19Legend() {
  return (
    <svg viewBox="0 0 300 70" width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <RoundLoop cx={32} cy={35} rx={18} ry={14} />
      <text x={62} y={35} dominantBaseline="central" fontSize={22} fontWeight={900} fill="#1F2937">
        = 2
      </text>
      <g transform="translate(186 0)">
        <FigureEightLoop cx={20} cy={35} rot={-20} />
      </g>
      <text x={232} y={35} dominantBaseline="central" fontSize={22} fontWeight={900} fill="#1F2937">
        = ?
      </text>
    </svg>
  )
}

export default function P21G1Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Penguins and fish scattered on a field. A legend: a small red round loop around a group is worth two; a bigger red figure-eight loop is worth a question mark."
    >
      <div className="flex flex-col items-center gap-2">
        <P21G1Q19Legend />
        <P21G1Q19Scene />
      </div>
    </div>
  )
}
