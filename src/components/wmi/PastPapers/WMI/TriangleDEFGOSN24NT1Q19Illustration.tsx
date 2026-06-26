// TriangleDEFGOSN24NT1Q19Illustration — OSN-24-SD-NAS-TEORI1-Q19
//
// Triangle ABC with:
//   D = midpoint of AB,  E = midpoint of BC
//   F, G on AC such that CF = FG = GA  (trisection from C to A)
// Area(ABC) = 12 cm²;  find area(DEFG) = 5 cm²
//
// No primitive covers arbitrary triangle + interior quadrilateral — fresh SVG.
// Co-exports TriangleDEFGFigure so the Explainer can reuse the geometry with
// different region highlights without re-deriving coordinates.

import type { JSX } from 'react'

type Pt = [number, number]

// ── Vertex coordinates (viewBox 0 0 340 268) ─────────────────────────────────
const A: Pt = [52, 240]
const B: Pt = [288, 240]
const C: Pt = [170, 20]

const lerp = (p: Pt, q: Pt, t: number): Pt => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
]

const D: Pt = lerp(A, B, 0.5)     // midpoint AB  → (170, 240)
const E: Pt = lerp(B, C, 0.5)     // midpoint BC  → (229, 130)
const G: Pt = lerp(A, C, 1 / 3)   // AG = AC/3   → (90, 167)
const F: Pt = lerp(A, C, 2 / 3)   // AF = 2AC/3  → (131, 93)

function pts(...coords: Pt[]) {
  return coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

// ── Shared figure (used by both Illustration and Explainer) ──────────────────

export type HighlightRegion = 'bde' | 'cef' | 'agd' | 'defg' | null

interface FigureProps {
  highlight?: HighlightRegion
  showAreaLabel?: boolean
}

export function TriangleDEFGFigure({ highlight = null, showAreaLabel = false }: FigureProps): JSX.Element {
  return (
    <svg viewBox="0 0 340 268" width="100%" style={{ maxWidth: 340 }} aria-hidden="true">
      {/* Outer triangle — salmon fill */}
      <polygon points={pts(A, B, C)} fill="#FDE8D8" />

      {/* Sub-region highlight fills (appear under the DEFG polygon) */}
      {highlight === 'bde' && (
        <polygon points={pts(B, D, E)} fill="#BFDBFE" />
      )}
      {highlight === 'cef' && (
        <polygon points={pts(C, E, F)} fill="#BBF7D0" />
      )}
      {highlight === 'agd' && (
        <polygon points={pts(A, G, D)} fill="#EDE9FE" />
      )}

      {/* DEFG quadrilateral */}
      <polygon
        points={pts(D, E, F, G)}
        fill={highlight === 'defg' ? '#818CF8' : '#C7D2FE'}
        stroke="#3730A3"
        strokeWidth={highlight === 'defg' ? 2.5 : 1.5}
        opacity={highlight === 'defg' ? 0.9 : 0.75}
      />

      {/* Outer triangle stroke (on top so it overlays fills) */}
      <polygon points={pts(A, B, C)} fill="none" stroke="#C2410C" strokeWidth="2" />

      {/* Area label inside outer triangle */}
      {showAreaLabel && (
        <text
          x="180"
          y="215"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          fill="#C2410C"
        >
          12 cm²
        </text>
      )}

      {/* Vertex dots + labels */}
      {(
        [
          [A, 'A', -14,  12],
          [B, 'B',  14,  12],
          [C, 'C',   0, -10],
          [D, 'D',   0,  15],
          [E, 'E',  14,   2],
          [F, 'F', -14,  -2],
          [G, 'G', -14,   4],
        ] as [Pt, string, number, number][]
      ).map(([pt, label, dx, dy]) => (
        <g key={label}>
          <circle cx={pt[0]} cy={pt[1]} r={4} fill="#1E3A5F" />
          <text
            x={pt[0] + dx}
            y={pt[1] + dy}
            textAnchor="middle"
            fontSize="13"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
            fill="#1E3A5F"
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  )
}

// Default export — the static stem illustration (shows problem, not answer)
export default function TriangleDEFGOSN24NT1Q19Illustration(): JSX.Element {
  return <TriangleDEFGFigure highlight={null} showAreaLabel />
}
