// Static card illustration for WMI-25F1A-Q6 (2025 G1 final).
//
// "Find the sum of the number of apples in the 4th box from the left and the
//  number of apples in the 4th box from the right."  Answer: 15 (choice E).
//
// The source figure (db/seed/wmi/figures/2025-final-g1-a-q6.jpg) is a row of SIX
// open trays, each holding a different number of apples drawn as a small grid:
//   box 1: 6   box 2: 5   box 3: 7   box 4: 8   box 5: 9   box 6: 4
// With N = 6, the 4th box from the left is box 4 (8 apples) and the 4th box from
// the right is box N-3 = box 3 (7 apples), so the sum is 8 + 7 = 15.
//
// This draws ONLY the setup — the six trays with their apples. It never marks
// which two trays are the targets and never reveals the sum. Post-answer, the
// animator highlights the 4th-from-left and 4th-from-right trays via the
// co-exported primitive `AppleBoxes25G1`'s `litBoxes` prop (0-based indices).
//
// Pure render — no random, no dates, SSR-safe & deterministic. The primitive
// ignores bad `litBoxes` input so previews always render.

const INK = '#1F2937'
const ORANGE = '#f0853a' // qupu-brand-orange — apple body
const ORANGE_DARK = '#c8631f' // apple outline / shading
const LEAF = '#5B8C5A' // apple stem leaf (soft green)
const TRAY_FILL = '#FFF9F4' // qupu-shell — tray floor
const TRAY_SIDE = '#E4DACB' // tray rim / side (warm grey)
const LIT_FILL = '#FFF2DF' // qupu-cream — highlighted tray floor (animator only)
const BLUE = '#30598A' // qupu-brand-blue — highlight outline (animator only)

// Apple counts per box, left → right, read from the source scan.
const BOX_APPLES = [6, 5, 7, 8, 9, 4] as const

// Per-box apple layout: number of columns the grid uses. Rows are filled
// left-to-right, top-to-bottom so the cluster reads like the source trays.
const BOX_COLS = [3, 5, 3, 4, 5, 2] as const

const APPLE_R = 9 // apple radius
const CELL = 24 // grid cell size (apple slot)
const TRAY_PAD = 8 // padding between apples and the tray inner edge
const RIM = 7 // tray rim thickness (the raised side wall)
const BOX_GAP = 14 // horizontal gap between trays
const PAD = 14 // outer svg padding

/** One drawn apple: round body, a short stem, and a small leaf. */
function Apple({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* stem */}
      <line x1={cx} y1={cy - APPLE_R} x2={cx} y2={cy - APPLE_R - 4} stroke={ORANGE_DARK} strokeWidth={2} strokeLinecap="round" />
      {/* leaf */}
      <path
        d={`M ${cx} ${cy - APPLE_R - 2}
            q 6 -4 11 -1
            q -4 5 -11 1 Z`}
        fill={LEAF}
        stroke={LEAF}
        strokeWidth={0.5}
      />
      {/* body */}
      <circle cx={cx} cy={cy} r={APPLE_R} fill={ORANGE} stroke={ORANGE_DARK} strokeWidth={1.6} />
      {/* subtle highlight */}
      <circle cx={cx - 3} cy={cy - 3} r={2.4} fill="#ffffff" opacity={0.35} />
    </g>
  )
}

/** Inner-grid width/height for a box, given its apple count + column layout. */
function boxGrid(count: number, cols: number) {
  const c = Math.min(cols, count)
  const rows = Math.ceil(count / c)
  return { cols: c, rows, innerW: c * CELL, innerH: rows * CELL }
}

/**
 * The row of six apple trays.
 *
 * @param litBoxes  0-based box indices to highlight (animator marks the
 *                  4th-from-left = index 3 and the 4th-from-right = index 2).
 *                  Out-of-range / non-array input is ignored, so with no props
 *                  it renders the bare problem setup.
 *
 * The number of apples per box is fixed (the question's data) and never changes.
 */
export function AppleBoxes25G1({ litBoxes }: { litBoxes?: number[] } = {}) {
  const litSet = new Set(
    (Array.isArray(litBoxes) ? litBoxes : []).filter(
      (i) => Number.isInteger(i) && i >= 0 && i < BOX_APPLES.length,
    ),
  )

  // Pre-compute each box's grid + tray box so we can lay them on a common baseline.
  const grids = BOX_APPLES.map((count, i) => boxGrid(count, BOX_COLS[i]))
  const trayWs = grids.map((g) => g.innerW + TRAY_PAD * 2 + RIM * 2)
  const trayHs = grids.map((g) => g.innerH + TRAY_PAD * 2 + RIM * 2)
  const maxTrayH = Math.max(...trayHs)

  const width = PAD * 2 + trayWs.reduce((a, b) => a + b, 0) + BOX_GAP * (BOX_APPLES.length - 1)
  const height = PAD * 2 + maxTrayH

  // Running x-offset as we place each tray.
  let runX = PAD

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 520, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {BOX_APPLES.map((count, i) => {
        const g = grids[i]
        const trayW = trayWs[i]
        const trayH = trayHs[i]
        const x = runX
        // Bottom-align all trays so they sit on a common shelf line.
        const y = PAD + (maxTrayH - trayH)
        runX += trayW + BOX_GAP

        const lit = litSet.has(i)
        const floorFill = lit ? LIT_FILL : TRAY_FILL
        const rimFill = lit ? '#F5D9BE' : TRAY_SIDE
        const stroke = lit ? BLUE : INK
        const strokeW = lit ? 3 : 2

        // Inner (apple) grid origin.
        const innerX = x + RIM + TRAY_PAD
        const innerY = y + RIM + TRAY_PAD

        return (
          <g key={i}>
            {/* tray outer body (rim) */}
            <rect x={x} y={y} width={trayW} height={trayH} rx={6} fill={rimFill} stroke={stroke} strokeWidth={strokeW} />
            {/* tray floor */}
            <rect
              x={x + RIM}
              y={y + RIM}
              width={trayW - RIM * 2}
              height={trayH - RIM * 2}
              rx={3}
              fill={floorFill}
              stroke={stroke}
              strokeWidth={lit ? 2 : 1.4}
            />
            {/* apples placed in the grid, row by row */}
            {Array.from({ length: count }, (_, k) => {
              const col = k % g.cols
              const row = Math.floor(k / g.cols)
              const cx = innerX + col * CELL + CELL / 2
              const cy = innerY + row * CELL + CELL / 2
              return <Apple key={k} cx={cx} cy={cy} />
            })}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export — the bare row of six apple trays inside the card (no box). */
export default function AppleBoxes25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sebaris enam kotak terbuka berisi apel. Dari kiri ke kanan, banyak apel di tiap kotak adalah ' +
        BOX_APPLES.join(', ') +
        '. Gambar belum menandai kotak ke-4 dari kiri maupun kotak ke-4 dari kanan.'
      }
    >
      <AppleBoxes25G1 />
    </div>
  )
}
