// In-card figure for WMI-22P3A-Q24 (2022 WMI Semifinal Grade 3, Paper A, Q24).
//
// Reconstructed from db/seed/wmi/figures/2022-semifinal-g3-a-q24.jpg:
// three white rectangular blocks stand side-by-side on a blue base band. Each
// block is labelled "75" (its area). An arc-bracket over each block gives its
// width: 8, 6, 7. A bracket down the right side gives the height of the RIGHT
// column — the width-7 block plus the band under it: 13. A red ★ sits in the
// blue base band.
//
// The blocks are equal area (75) but different widths, so they have different
// heights (the middle one is even taller than 13; the scan is not to scale).
// The figure shows ONLY the problem (the labels 75, the widths 8/6/7, the
// right-column height 13, the ★). It does NOT reveal ★ = 48.
//
// Method (used by the explainer): the right column (block width 7 + band) is
//   7 × 13 = 91; the block uses 75, so the band strip under it is 91 − 75 = 16.
// The band spans 8 + 6 + 7 = 21 = 3 × 7 — three such strips → ★ = 3 × 16 = 48.

const INK = '#1F2937'
const BLOCK_FILL = '#FFFFFF'
const BLUE_BAND = '#A9C2E0'
const BLUE_EDGE = '#5C7CA6'
const STAR = '#E23A2E'

// --- problem data ------------------------------------------------------------
export const BLOCK_AREA = 75
export const WIDTHS = [8, 6, 7] as const
export const TOTAL_WIDTH = WIDTHS.reduce((a, b) => a + b, 0) // 21
export const FULL_HEIGHT = 13 // height of the RIGHT column (width-7 block + band)
export const RIGHT_WIDTH = WIDTHS[2]                              // 7
export const RIGHT_COL_AREA = RIGHT_WIDTH * FULL_HEIGHT           // 7 × 13 = 91
export const BAND_UNDER_RIGHT = RIGHT_COL_AREA - BLOCK_AREA       // 91 − 75 = 16
export const STAR_AREA = (TOTAL_WIDTH / RIGHT_WIDTH) * BAND_UNDER_RIGHT // 3 × 16 = 48 — NOT shown

// --- geometry ----------------------------------------------------------------
const PX = 5.4               // px per width-unit
const BAND_H = 26            // px height of the blue base band (drawn, not to scale)
// Drawn block heights (taller = appears more, just to mirror the scan; the real
// heights differ because area is constant and widths differ). Middle tallest.
const BLOCK_PX_H = [150, 200, 174]

const PAD_L = 16
const PAD_T = 44   // room for the top width arcs + labels
const PAD_R = 56   // room for the right "13" bracket
const PAD_B = 16

const widthsPx = WIDTHS.map((w) => w * PX)
const maxBlockH = Math.max(...BLOCK_PX_H)

const figW = widthsPx.reduce((a, b) => a + b, 0)
export const Q24_VIEW_W = PAD_L + figW + PAD_R
export const Q24_VIEW_H = PAD_T + maxBlockH + BAND_H + PAD_B

const OX = PAD_L
// baseline (top of the blue band) and bottom of the figure
const bandTop = PAD_T + maxBlockH
const bandBottom = bandTop + BAND_H

function blockX(i: number) {
  let x = OX
  for (let k = 0; k < i; k++) x += widthsPx[k]
  return x
}

// arc-bracket over a block, with its width label
function WidthArc({ x, w, label }: { x: number; w: number; label: string }) {
  const y = PAD_T - 6
  const mid = x + w / 2
  return (
    <g>
      <path d={`M ${x + 3} ${y} Q ${mid} ${y - 22} ${x + w - 3} ${y}`} fill="none" stroke={INK} strokeWidth={1.4} />
      <text x={mid} y={y - 22} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={INK}>
        {label}
      </text>
    </g>
  )
}

export interface BlocksFigureProps {
  /** Outline the RIGHT column (the width-7 block + the band strip under it). */
  highlightRight?: boolean
  /** Label the band strip under the right block (e.g. "16") — explainer only. */
  rightStripLabel?: string
  /** Label inside the blue band (e.g. "48") — explainer only. */
  bandLabel?: string
}

export function BlocksFigure({ highlightRight = false, rightStripLabel, bandLabel }: BlocksFigureProps) {
  const rightX = blockX(2)
  const rightTop = bandTop - BLOCK_PX_H[2]
  return (
    <svg
      viewBox={`0 0 ${Q24_VIEW_W} ${Q24_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* optional right-column outline (block + the band strip beneath it) */}
      {highlightRight && (
        <rect
          x={rightX}
          y={rightTop}
          width={widthsPx[2]}
          height={BLOCK_PX_H[2] + BAND_H}
          fill="none"
          stroke="#2f6df0"
          strokeWidth={2.4}
          strokeDasharray="6 4"
        />
      )}

      {/* blue base band spanning the whole width */}
      <rect x={OX} y={bandTop} width={figW} height={BAND_H} fill={BLUE_BAND} stroke={BLUE_EDGE} strokeWidth={1.6} />

      {/* three blocks, each sitting on the band */}
      {WIDTHS.map((w, i) => {
        const x = blockX(i)
        const h = BLOCK_PX_H[i]
        const top = bandTop - h
        return (
          <g key={i}>
            <rect x={x} y={top} width={widthsPx[i]} height={h} fill={BLOCK_FILL} stroke={INK} strokeWidth={1.8} />
            <text x={x + widthsPx[i] / 2} y={top + h / 2} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={INK}>
              {BLOCK_AREA}
            </text>
            <WidthArc x={x} w={widthsPx[i]} label={`${w}`} />
          </g>
        )
      })}

      {/* ★ in the band */}
      <text x={OX + figW / 2} y={bandTop + BAND_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={STAR}>
        ★
      </text>
      {bandLabel && (
        <text x={OX + figW / 2 + 34} y={bandTop + BAND_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#065F46">
          {bandLabel}
        </text>
      )}
      {rightStripLabel && (
        <text x={rightX + widthsPx[2] / 2} y={bandTop + BAND_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill="#065F46">
          {rightStripLabel}
        </text>
      )}

      {/* right-side "13" bracket — spans the RIGHT column only (block + band),
          exactly as in the scan */}
      {(() => {
        const bx = OX + figW + 14
        return (
          <g>
            <path d={`M ${bx} ${rightTop} Q ${bx + 16} ${(rightTop + bandBottom) / 2} ${bx} ${bandBottom}`} fill="none" stroke={INK} strokeWidth={1.4} />
            <text x={bx + 24} y={(rightTop + bandBottom) / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={INK}>
              {FULL_HEIGHT}
            </text>
          </g>
        )
      })()}
    </svg>
  )
}

export default function P22G3Q24Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three white blocks stand on a blue base band. Each block is labelled 75 and has a width marked on top: 8, 6 and 7. On the right, the width-7 block plus the band under it stand 13 tall. A red star sits in the blue band. Find the value of the star."
    >
      <BlocksFigure />
    </div>
  )
}
