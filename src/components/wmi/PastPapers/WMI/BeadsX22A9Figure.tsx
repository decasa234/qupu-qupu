/**
 * SEAMOX-22-A-Q9 — Shared SVG for the growing square-ring bead figures.
 *
 * Four panels (2×2 grid):
 *   Fig 1 — 1 bead  (1×1)
 *   Fig 2 — 8 beads (3×3 outer ring)
 *   Fig 3 — 16 beads (5×5 outer ring)
 *   Fig 4 — 24 beads (7×7 outer ring)
 *
 * Pure SVG, SSR-safe: no hooks, no framer-motion.
 */

// ── geometry ──────────────────────────────────────────────────────────────────
const BEAD_R = 9    // circle radius (px)
const CELL   = 20   // center-to-center bead spacing (px)
const P_W    = 160  // panel width (px)
const P_H    = 155  // panel bead-area height (px)
const L_H    = 22   // label row height below bead area (px)
const PAD    = 10   // outer SVG padding (px)
const GAP    = 12   // gap between adjacent panels (px)

export const VW = PAD + P_W + GAP + P_W + PAD            // 352
export const VH = PAD + P_H + L_H + GAP + P_H + L_H + PAD // 386

// ── figure definitions ────────────────────────────────────────────────────────
export interface FigInfo {
  n: number       // grid size (ring of n×n)
  count: number   // bead count = outer ring size
  labelEn: string
  labelId: string
  px: number      // panel top-left x
  py: number      // panel top-left y
}

export const FIGS: FigInfo[] = [
  { n: 1, count: 1,  labelEn: 'Fig 1', labelId: 'Gambar 1', px: PAD,           py: PAD },
  { n: 3, count: 8,  labelEn: 'Fig 2', labelId: 'Gambar 2', px: PAD + P_W + GAP, py: PAD },
  { n: 5, count: 16, labelEn: 'Fig 3', labelId: 'Gambar 3', px: PAD,           py: PAD + P_H + L_H + GAP },
  { n: 7, count: 24, labelEn: 'Fig 4', labelId: 'Gambar 4', px: PAD + P_W + GAP, py: PAD + P_H + L_H + GAP },
]

/** Row/col positions for the outer ring of an n×n bead square. */
function ringPos(n: number): Array<[number, number]> {
  if (n === 1) return [[0, 0]]
  const pts: Array<[number, number]> = []
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (r === 0 || r === n - 1 || c === 0 || c === n - 1)
        pts.push([r, c])
  return pts
}

// ── component ─────────────────────────────────────────────────────────────────
export interface BeadsX22A9SVGProps {
  lang?: 'en' | 'id'
  /** Panel index (0–3) to highlight; null = no highlight. */
  highlightFig?: number | null
}

export function BeadsX22A9SVG({ lang = 'en', highlightFig = null }: BeadsX22A9SVGProps) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {FIGS.map((fig, fi) => {
        const isHL   = highlightFig === fi
        // Centre of the bead area within the panel
        const cx0    = fig.px + P_W / 2
        const cy0    = fig.py + P_H / 2
        const label  = lang === 'id' ? fig.labelId : fig.labelEn

        return (
          <g key={fi}>
            {/* Panel background (covers bead area + label row) */}
            <rect
              x={fig.px} y={fig.py}
              width={P_W} height={P_H + L_H}
              rx={8}
              fill={isHL ? '#FEF3C7' : '#F0F9FF'}
              stroke={isHL ? '#F59E0B' : '#BAE6FD'}
              strokeWidth={isHL ? 3 : 1.5}
            />

            {/* Bead circles — outer ring of fig.n × fig.n */}
            {ringPos(fig.n).map(([r, c], bi) => (
              <circle
                key={bi}
                cx={cx0 + (c - (fig.n - 1) / 2) * CELL}
                cy={cy0 + (r - (fig.n - 1) / 2) * CELL}
                r={BEAD_R}
                fill={isHL ? '#FCD34D' : '#3B82F6'}
                stroke={isHL ? '#92400E' : '#1E40AF'}
                strokeWidth={1.5}
              />
            ))}

            {/* Figure label */}
            <text
              x={fig.px + P_W / 2}
              y={fig.py + P_H + L_H - 5}
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              fontSize={13}
              fontWeight="bold"
              fill={isHL ? '#92400E' : '#1E3A5F'}
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
