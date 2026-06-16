// Mystery-solid / three-views picture for WMI-21P2A-Q23 (2021 semifinal Grade 2).
//
// Faithful redraw of db/seed/wmi/figures/2021-semifinal-g2-a-q23.jpg:
// a dashed transparent cube with a "?" inside, surrounded by three bees. Each
// bee floats in a coloured thought bubble that shows the flat shape (made of
// unit squares) it sees from its direction, with a coloured arrow pointing at
// the cube:
//   - TOP bee (blue, down-arrow)  = the TOP view (looking down from above)
//   - RIGHT bee (green, left-arrow) = the SIDE view (looking from the right)
//   - LEFT bee (pink, up-arrow)    = the FRONT view (looking from the front)
//
// The candidate solids (options A–D) were SEPARATE images and are intentionally
// NOT drawn here: the static figure shows only the stem. Answer is A.

// ---------------------------------------------------------------------------
// View-shape cell layouts. Each is a list of [row, col] unit-square cells,
// row 0 = top row, col 0 = left column. Redrawn cell-by-cell from the scan.
// ---------------------------------------------------------------------------

/** TOP view (blue bubble): 2-row P-shape — top row 2 cells, bottom row 3 cells. */
export const TOP_VIEW_CELLS: Array<[number, number]> = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
  [1, 2],
]

/** SIDE view (green bubble): an L / staircase — a 2×2 block with one cell on top. */
export const SIDE_VIEW_CELLS: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [2, 0],
  [2, 1],
]

/** FRONT view (pink bubble): a 3-step ascending staircase (1, 2, 3 cells). */
export const FRONT_VIEW_CELLS: Array<[number, number]> = [
  [0, 2],
  [1, 1],
  [1, 2],
  [2, 0],
  [2, 1],
  [2, 2],
]

export type ViewKey = 'top' | 'side' | 'front'
export type Highlight = 'none' | ViewKey

// Per-view palette (bubble fill, accent for arrow + highlight).
const PALETTE: Record<ViewKey, { bubble: string; accent: string; cell: string; cellStroke: string }> = {
  top: { bubble: '#DCEBFB', accent: '#2F80ED', cell: '#FFFFFF', cellStroke: '#2F80ED' },
  side: { bubble: '#E3F4E2', accent: '#22A35A', cell: '#FFFFFF', cellStroke: '#22A35A' },
  front: { bubble: '#FBE3EE', accent: '#E0608E', cell: '#FFF7FB', cellStroke: '#E0608E' },
}

const CELL = 16 // unit-square edge in the thought bubble

/** Draws a flat shape made of unit squares, top-left aligned at (x, y). */
function ViewShape({
  x,
  y,
  cells,
  cell = CELL,
  fill,
  stroke,
}: {
  x: number
  y: number
  cells: Array<[number, number]>
  cell?: number
  fill: string
  stroke: string
}) {
  return (
    <g>
      {cells.map(([r, c], i) => (
        <rect
          key={i}
          x={x + c * cell}
          y={y + r * cell}
          width={cell}
          height={cell}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
      ))}
    </g>
  )
}

/** Bounding extent (cols, rows) of a cell list, for centering inside a bubble. */
function extent(cells: Array<[number, number]>): { cols: number; rows: number } {
  let maxR = 0
  let maxC = 0
  for (const [r, c] of cells) {
    if (r > maxR) maxR = r
    if (c > maxC) maxC = c
  }
  return { cols: maxC + 1, rows: maxR + 1 }
}

/**
 * A simple drawn bee: striped yellow/black oval body with two pale wings and a
 * tiny face. SVG shapes only (no multi-codepoint emoji). Faces `dir` toward the
 * cube. `dir` only nudges the wing/antenna side; the body is symmetric.
 */
function Bee({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* wings */}
      <ellipse cx={-4} cy={-12} rx={9} ry={6} fill="#EAF3FB" stroke="#9DB7CC" strokeWidth={1.5} transform="rotate(-22 -4 -12)" />
      <ellipse cx={9} cy={-12} rx={9} ry={6} fill="#EAF3FB" stroke="#9DB7CC" strokeWidth={1.5} transform="rotate(22 9 -12)" />
      {/* body */}
      <ellipse cx={0} cy={0} rx={18} ry={13} fill="#F5C518" stroke="#3A2E12" strokeWidth={2} />
      {/* stripes */}
      <path d="M -6 -11.5 L -6 11.5" stroke="#3A2E12" strokeWidth={4} strokeLinecap="round" />
      <path d="M 6 -11 L 6 11" stroke="#3A2E12" strokeWidth={4} strokeLinecap="round" />
      {/* head */}
      <circle cx={-17} cy={-2} r={8} fill="#F5C518" stroke="#3A2E12" strokeWidth={2} />
      {/* antennae */}
      <path d="M -20 -8 Q -23 -14 -26 -15" fill="none" stroke="#3A2E12" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={-26} cy={-15} r={1.6} fill="#3A2E12" />
      {/* eyes */}
      <circle cx={-19} cy={-3} r={1.7} fill="#3A2E12" />
      <circle cx={-14} cy={-3} r={1.7} fill="#3A2E12" />
    </g>
  )
}

/** A rounded thought bubble with a small two-dot trail toward (tailX, tailY). */
function ThoughtBubble({
  cx,
  cy,
  rx,
  ry,
  fill,
  stroke,
  tailX,
  tailY,
  children,
}: {
  cx: number
  cy: number
  rx: number
  ry: number
  fill: string
  stroke: string
  tailX: number
  tailY: number
  children?: React.ReactNode
}) {
  // Two trailing bubbles from the cloud edge toward the bee.
  const dx = tailX - cx
  const dy = tailY - cy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len
  const uy = dy / len
  const b1x = cx + ux * (rx + 8)
  const b1y = cy + uy * (ry + 8)
  const b2x = cx + ux * (rx + 20)
  const b2y = cy + uy * (ry + 20)
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={2.5} />
      <circle cx={b1x} cy={b1y} r={6} fill={fill} stroke={stroke} strokeWidth={2} />
      <circle cx={b2x} cy={b2y} r={3.5} fill={fill} stroke={stroke} strokeWidth={2} />
      {children}
    </g>
  )
}

/** Renders one view's shape centered inside its bubble. */
function BubbleView({
  cx,
  cy,
  view,
  active,
}: {
  cx: number
  cy: number
  view: ViewKey
  active: boolean
}) {
  const cells = view === 'top' ? TOP_VIEW_CELLS : view === 'side' ? SIDE_VIEW_CELLS : FRONT_VIEW_CELLS
  const pal = PALETTE[view]
  const { cols, rows } = extent(cells)
  const w = cols * CELL
  const h = rows * CELL
  const x = cx - w / 2
  const y = cy - h / 2
  return (
    <g>
      {active && (
        <rect
          x={x - 7}
          y={y - 7}
          width={w + 14}
          height={h + 14}
          rx={6}
          fill="none"
          stroke={pal.accent}
          strokeWidth={3.5}
          strokeDasharray="5 4"
          opacity={0.95}
        />
      )}
      <ViewShape x={x} y={y} cells={cells} fill={pal.cell} stroke={pal.cellStroke} />
    </g>
  )
}

/** A thick coloured block arrow from (x,y) of given length in a cardinal dir. */
function BlockArrow({
  x,
  y,
  dir,
  length,
  color,
}: {
  x: number
  y: number
  dir: 'down' | 'up' | 'left'
  length: number
  color: string
}) {
  const shaft = 16 // half-width of shaft
  const head = 28 // half-width of head
  const headLen = 26
  let d = ''
  if (dir === 'down') {
    const yTip = y + length
    d = [
      `M ${x - shaft} ${y}`,
      `L ${x + shaft} ${y}`,
      `L ${x + shaft} ${yTip - headLen}`,
      `L ${x + head} ${yTip - headLen}`,
      `L ${x} ${yTip}`,
      `L ${x - head} ${yTip - headLen}`,
      `L ${x - shaft} ${yTip - headLen}`,
      'Z',
    ].join(' ')
  } else if (dir === 'up') {
    const yTip = y - length
    d = [
      `M ${x - shaft} ${y}`,
      `L ${x + shaft} ${y}`,
      `L ${x + shaft} ${yTip + headLen}`,
      `L ${x + head} ${yTip + headLen}`,
      `L ${x} ${yTip}`,
      `L ${x - head} ${yTip + headLen}`,
      `L ${x - shaft} ${yTip + headLen}`,
      'Z',
    ].join(' ')
  } else {
    // left
    const xTip = x - length
    d = [
      `M ${x} ${y - shaft}`,
      `L ${x} ${y + shaft}`,
      `L ${xTip + headLen} ${y + shaft}`,
      `L ${xTip + headLen} ${y + head}`,
      `L ${xTip} ${y}`,
      `L ${xTip + headLen} ${y - head}`,
      `L ${xTip + headLen} ${y - shaft}`,
      'Z',
    ].join(' ')
  }
  return <path d={d} fill={color} />
}

export const Q23_VIEW_W = 460
export const Q23_VIEW_H = 460

export interface BeeViewsQ23Props {
  /** Which view to spotlight ('none' = plain stem). */
  highlight?: Highlight
  /** Reveal the small "A" answer badge (used only on the explainer's result beat). */
  showAnswer?: boolean
}

/**
 * Reusable primitive: the dashed mystery cube with "?" plus the three bees and
 * their three thought-bubble views. The illustration and explainer both use it.
 */
export function BeeViewsQ23({ highlight = 'none', showAnswer = false }: BeeViewsQ23Props) {
  // Dashed isometric-ish cube centred in the canvas.
  const cubeX = 150
  const cubeY = 170
  const cubeS = 130 // front-face edge
  const depth = 58 // back-offset

  const fx = cubeX
  const fy = cubeY
  // front face corners
  const fTL: [number, number] = [fx, fy]
  const fTR: [number, number] = [fx + cubeS, fy]
  const fBR: [number, number] = [fx + cubeS, fy + cubeS]
  const fBL: [number, number] = [fx, fy + cubeS]
  // back face corners
  const bTL: [number, number] = [fx + depth, fy - depth]
  const bTR: [number, number] = [fx + cubeS + depth, fy - depth]
  const bBR: [number, number] = [fx + cubeS + depth, fy + cubeS - depth]
  const bBL: [number, number] = [fx + depth, fy + cubeS - depth]

  const dash = '7 6'
  const line = (a: [number, number], b: [number, number], key: string, faint = false) => (
    <line
      key={key}
      x1={a[0]}
      y1={a[1]}
      x2={b[0]}
      y2={b[1]}
      stroke={faint ? '#9CA3AF' : '#1F2937'}
      strokeWidth={faint ? 2 : 3}
      strokeDasharray={dash}
      strokeLinecap="round"
    />
  )

  const cubeCx = (fx + cubeS / 2 + depth / 2)
  const cubeCy = (fy + cubeS / 2 - depth / 2)

  return (
    <svg
      viewBox={`0 0 ${Q23_VIEW_W} ${Q23_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q23_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ---- dashed transparent cube ---- */}
      {/* back face (faint) */}
      {line(bTL, bTR, 'b1', true)}
      {line(bTR, bBR, 'b2', true)}
      {line(bBR, bBL, 'b3', true)}
      {line(bBL, bTL, 'b4', true)}
      {/* connectors */}
      {line(fTL, bTL, 'c1', true)}
      {line(fTR, bTR, 'c2', true)}
      {line(fBR, bBR, 'c3', true)}
      {line(fBL, bBL, 'c4', true)}
      {/* front face (bold) */}
      {line(fTL, fTR, 'f1')}
      {line(fTR, fBR, 'f2')}
      {line(fBR, fBL, 'f3')}
      {line(fBL, fTL, 'f4')}

      {/* "?" inside the cube */}
      <text
        x={cubeCx}
        y={cubeCy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={72}
        fontWeight={900}
        fill="#1F2937"
      >
        ?
      </text>

      {/* ---- TOP bee: blue bubble + down-arrow ---- */}
      <BlockArrow x={cubeCx} y={fy - depth - 18} dir="down" length={50} color={PALETTE.top.accent} />
      <ThoughtBubble
        cx={120}
        cy={66}
        rx={70}
        ry={50}
        fill={PALETTE.top.bubble}
        stroke={PALETTE.top.accent}
        tailX={196}
        tailY={108}
      >
        <BubbleView cx={120} cy={66} view="top" active={highlight === 'top'} />
      </ThoughtBubble>
      <Bee x={236} y={104} scale={1} />

      {/* ---- RIGHT bee: green bubble + left-arrow ---- */}
      <BlockArrow x={fx + cubeS + depth + 24} y={cubeCy} dir="left" length={52} color={PALETTE.side.accent} />
      <ThoughtBubble
        cx={400}
        cy={120}
        rx={56}
        ry={52}
        fill={PALETTE.side.bubble}
        stroke={PALETTE.side.accent}
        tailX={392}
        tailY={196}
      >
        <BubbleView cx={400} cy={120} view="side" active={highlight === 'side'} />
      </ThoughtBubble>
      <Bee x={406} y={236} scale={1} />

      {/* ---- LEFT/FRONT bee: pink bubble + up-arrow ---- */}
      <BlockArrow x={fx + 6} y={fy + cubeS + 22} dir="up" length={52} color={PALETTE.front.accent} />
      <ThoughtBubble
        cx={92}
        cy={326}
        rx={64}
        ry={58}
        fill={PALETTE.front.bubble}
        stroke={PALETTE.front.accent}
        tailX={120}
        tailY={388}
      >
        <BubbleView cx={92} cy={326} view="front" active={highlight === 'front'} />
      </ThoughtBubble>
      <Bee x={120} y={414} scale={1} />

      {/* ---- answer badge (explainer result beat only) ---- */}
      {showAnswer && (
        <g>
          <circle cx={cubeCx} cy={fy + cubeS + 26} r={26} fill="#D1FAE5" stroke="#059669" strokeWidth={3} />
          <text
            x={cubeCx}
            y={fy + cubeS + 26}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={28}
            fontWeight={900}
            fill="#065F46"
          >
            A
          </text>
          <path
            d={`M ${cubeCx - 13} ${fy + cubeS + 50} l 7 7 l 13 -16`}
            fill="none"
            stroke="#059669"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`translate(0 -2)`}
          />
        </g>
      )}
    </svg>
  )
}

export default function P21G2Q23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A hidden solid shown as a dashed cube with a question mark. Three bees each see a flat shape made of unit squares from a different direction: the top view, the right-side view and the front view."
    >
      <BeeViewsQ23 />
    </div>
  )
}
