// WMI-23F2A-Q5 (2023 Grade-2 Final) — reconstructed from
// db/seed/wmi/figures/2023-final-g2-a-q5.jpg
//
// "As shown, which two of the five lines are of the same length?"
// Five labelled zig-zag paths A–E drawn on a unit grid. Answer: C and D.
//
// Segment counts extracted pixel-exactly from the scan (9-row unit grid; every
// unit edge of each path sampled against the ink):
//   A:  D1, R1, D2, L3, D2, R2, D4                → 15 segments
//   B:  D1, R1, D2, L2, D2, L1, D2, R1, D2        → 14 segments
//   C:  D1, L3, D3, R3, D1, L1, D1, L1, D3        → 17 segments
//   D:  D2, L1, D1, R2, D2, L2, D2, R2, D1, L1, D1 → 17 segments  ← C = D ✓
//   E:  D2, L2, D1, R3, D4, L2, D2                → 16 segments
//
// This component draws ONLY the setup (labelled paths on a grid). It never
// reveals which two are equal — that is the animator/explainer's job.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// ── design tokens ──────────────────────────────────────────────────────────
const INK        = '#1F2937'  // path stroke (qupu-brand-dark)
const GRID_LINE  = '#cdc5bc'  // light grid (qupu-cream-dark)
const LABEL_FILL = '#1F2937'  // label text

// ── geometry ───────────────────────────────────────────────────────────────
const CELL     = 20           // px per grid unit
const PAD      = 18           // outer SVG padding
const ZONE_W   = 7            // grid-unit width of each path's column zone
const GRID_H   = 9            // total grid rows visible (matches the scan)
const N_ZONES  = 5            // paths A–E

const VIEW_W = PAD * 2 + N_ZONES * ZONE_W * CELL
const VIEW_H = PAD * 2 + GRID_H * CELL + 26  // 26 px below grid for labels

// ── path data ──────────────────────────────────────────────────────────────

/**
 * A path definition: label + ordered grid vertices.
 * All edges are axis-aligned unit steps; segment count = points.length − 1.
 * Coordinates are relative to each path's zone origin (col 0 = left edge of zone).
 */
export interface PathDef {
  label: string
  /** [col, row] vertices, 0-based, in drawing order. */
  points: ReadonlyArray<readonly [number, number]>
}

/**
 * Five paths reconstructed from the 2023-final-g2-a-q5.jpg scan.
 *
 * Unit-segment counts (sum of |dx|+|dy| across all consecutive vertex pairs):
 *   A = 15  (D1+R1+D2+L3+D2+R2+D4 = 1+1+2+3+2+2+4)
 *   B = 14  (D1+R1+D2+L2+D2+L1+D2+R1+D2 = 1+1+2+2+2+1+2+1+2)
 *   C = 17  (D1+L3+D3+R3+D1+L1+D1+L1+D3 = 1+3+3+3+1+1+1+1+3)
 *   D = 17  (D2+L1+D1+R2+D2+L2+D2+R2+D1+L1+D1 = 2+1+1+2+2+2+2+2+1+1+1)  ← C = D ✓
 *   E = 16  (D2+L2+D1+R3+D4+L2+D2 = 2+2+1+3+4+2+2)
 */
export const PATHS23G2: Readonly<PathDef[]> = [
  {
    // A  15 segments — D1, R1, D2, L3, D2, R2, D4
    label: 'A',
    points: [
      [4, 0],
      [4, 1],
      [5, 1],
      [5, 3],
      [2, 3],
      [2, 5],
      [4, 5],
      [4, 9],
    ],
  },
  {
    // B  14 segments — D1, R1, D2, L2, D2, L1, D2, R1, D2
    label: 'B',
    points: [
      [4, 0],
      [4, 1],
      [5, 1],
      [5, 3],
      [3, 3],
      [3, 5],
      [2, 5],
      [2, 7],
      [3, 7],
      [3, 9],
    ],
  },
  {
    // C  17 segments — D1, L3, D3, R3, D1, L1, D1, L1, D3
    label: 'C',
    points: [
      [5, 0],
      [5, 1],
      [2, 1],
      [2, 4],
      [5, 4],
      [5, 5],
      [4, 5],
      [4, 6],
      [3, 6],
      [3, 9],
    ],
  },
  {
    // D  17 segments — D2, L1, D1, R2, D2, L2, D2, R2, D1, L1, D1
    label: 'D',
    points: [
      [3, 0],
      [3, 2],
      [2, 2],
      [2, 3],
      [4, 3],
      [4, 5],
      [2, 5],
      [2, 7],
      [4, 7],
      [4, 8],
      [3, 8],
      [3, 9],
    ],
  },
  {
    // E  16 segments — D2, L2, D1, R3, D4, L2, D2
    label: 'E',
    points: [
      [3, 0],
      [3, 2],
      [1, 2],
      [1, 3],
      [4, 3],
      [4, 7],
      [2, 7],
      [2, 9],
    ],
  },
] as const

/** Segment count for a path = points.length − 1. */
export function segmentCount(path: PathDef): number {
  return path.points.length - 1
}

// ── SVG coordinate helpers ──────────────────────────────────────────────────

function svgX(zoneIdx: number, col: number): number {
  return PAD + zoneIdx * ZONE_W * CELL + col * CELL
}
function svgY(row: number): number {
  return PAD + row * CELL
}

// ── LinePath23G2 primitive ──────────────────────────────────────────────────

export interface LinePath23G2Props {
  /** 0-based zone index: 0 = A … 4 = E. */
  zoneIndex: number
  path: PathDef
  /** Stroke colour (defaults to INK). */
  stroke?: string
  /** Stroke width in px (defaults to 3). */
  strokeWidth?: number
  /** If true, render the label below the zone. */
  showLabel?: boolean
}

/**
 * Renders a single path as a polyline in the shared SVG coordinate space.
 * The explainer can reuse this to highlight or measure individual paths.
 */
export function LinePath23G2({
  zoneIndex,
  path,
  stroke = INK,
  strokeWidth = 3,
  showLabel = true,
}: LinePath23G2Props) {
  const pointsStr = path.points
    .map(([c, r]) => `${svgX(zoneIndex, c)},${svgY(r)}`)
    .join(' ')

  const labelX = PAD + zoneIndex * ZONE_W * CELL + (ZONE_W / 2) * CELL
  const labelY = PAD + GRID_H * CELL + 16

  return (
    <g>
      <polyline
        points={pointsStr}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showLabel && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={900}
          fill={LABEL_FILL}
        >
          {path.label}
        </text>
      )}
    </g>
  )
}

// ── default export: in-card illustration ────────────────────────────────────

/**
 * In-card illustration for WMI-23F2A-Q5.
 * Draws the five labelled zig-zag paths on a light unit grid.
 * Does NOT reveal which two paths are equal.
 */
export default function Lines23G2Illustration() {
  const ariaLabel =
    'Kisi satuan dengan lima jalur zig-zag berlabel A, B, C, D, dan E. ' +
    'Dua di antaranya memiliki panjang yang sama. Temukan kedua jalur tersebut.'

  const totalW = N_ZONES * ZONE_W * CELL
  const totalH = GRID_H * CELL

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={Math.min(540, VIEW_W)}
        style={{ display: 'block' }}
      >
        {/* light unit grid — vertical lines */}
        {Array.from({ length: N_ZONES * ZONE_W + 1 }, (_, i) => (
          <line
            key={`gv${i}`}
            x1={PAD + i * CELL}
            y1={PAD}
            x2={PAD + i * CELL}
            y2={PAD + totalH}
            stroke={GRID_LINE}
            strokeWidth={0.75}
          />
        ))}

        {/* light unit grid — horizontal lines */}
        {Array.from({ length: GRID_H + 1 }, (_, j) => (
          <line
            key={`gh${j}`}
            x1={PAD}
            y1={PAD + j * CELL}
            x2={PAD + totalW}
            y2={PAD + j * CELL}
            stroke={GRID_LINE}
            strokeWidth={0.75}
          />
        ))}

        {/* five paths */}
        {PATHS23G2.map((path, i) => (
          <LinePath23G2 key={path.label} zoneIndex={i} path={path} />
        ))}
      </svg>
    </div>
  )
}
