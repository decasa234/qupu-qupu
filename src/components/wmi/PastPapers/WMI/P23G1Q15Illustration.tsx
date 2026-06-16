// P23G1Q15Illustration.tsx
// WMI-23P1A-Q15 (2023 Semifinal Grade 1, Paper A).
//
// Redrawn from db/seed/wmi/figures/2023-semifinal-g1-a-q15.jpg:
//   A two-row table — a cream header row of three SHAPE glyphs (circle, square,
//   triangle) over a value row. The scan shows circle = 6, the square cell blank,
//   and a blue STAR in the triangle cell.
//
// The body says the SAME group of items is sorted two ways: once by shape (the
// chart in the scan) and once by fruit (a second chart), each with one starred
// cell, and asks for the DIFFERENCE between the two starred values.
//
// Self-consistent reconstruction (total = 12 items both ways):
//   by SHAPE :  circle 6,  square 2,  triangle = STAR   -> star = 12-6-2 = 4
//   by FRUIT :  apple 5,   banana 3,  cherry   = STAR   -> star = 12-5-3 = 4
// The two starred values are 4 and 4, so the difference is 0 (answer D). The
// total is the same because it is the SAME set of items counted two ways — that
// is the whole idea the explainer teaches.
//
// The static figure shows ONLY the problem: the two charts with their known
// cells and the two starred cells. It never reveals the star values or the
// difference. Pure render — no Math.random / Date / hooks. SSR-safe.

import React from 'react'

// ── verified data ────────────────────────────────────────────────────────────
export const TOTAL_ITEMS = 12
// by-shape chart (matches the scan: circle known = 6, square known = 2, triangle = star)
export const SHAPE_CIRCLE = 6
export const SHAPE_SQUARE = 2
export const SHAPE_STAR = TOTAL_ITEMS - SHAPE_CIRCLE - SHAPE_SQUARE // 4 (triangle)
// by-fruit chart
export const FRUIT_APPLE = 5
export const FRUIT_BANANA = 3
export const FRUIT_STAR = TOTAL_ITEMS - FRUIT_APPLE - FRUIT_BANANA // 4 (cherry)
export const STAR_DIFFERENCE = Math.abs(SHAPE_STAR - FRUIT_STAR) // 0

// ── palette ──────────────────────────────────────────────────────────────────
const INK = '#2B2B2B'
const HEADER_FILL = '#FBE7C9'
const STAR_BLUE = '#2BA3E0'
const GRID = '#3A3027'

// ── shape glyphs (header icons) ───────────────────────────────────────────────
function ShapeGlyph({ kind, cx, cy, r }: { kind: 'circle' | 'square' | 'triangle'; cx: number; cy: number; r: number }) {
  if (kind === 'circle') return <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={3} />
  if (kind === 'square')
    return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={3} fill="none" stroke={INK} strokeWidth={3} />
  return (
    <polygon
      points={`${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`}
      fill="none"
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  )
}

// ── fruit glyphs (header icons for the 2nd chart) — single-codepoint emoji ─────
const FRUIT_EMOJI: Record<string, string> = { apple: '\u{1F34E}', banana: '\u{1F34C}', cherry: '\u{1F352}' }

// ── a five-pointed star ───────────────────────────────────────────────────────
export function StarGlyph({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.42
    const a = (Math.PI / 180) * (-90 + i * 36)
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={STAR_BLUE} />
}

// ── one 1x3 chart (header row + value row) ────────────────────────────────────
type CellValue = { kind: 'number'; n: number } | { kind: 'star' } | { kind: 'blank' }

export interface ChartProps {
  ox: number
  oy: number
  headers: React.ReactNode[]
  /** value cells, left→right; each is a number / star / blank in the PROBLEM. */
  values: CellValue[]
  /** when true, fill blanks + the star cell with their solved numbers (explainer only). */
  solved?: boolean
  /** the solved star value to show when solved. */
  starValue?: number
  /** ring the star cell (explainer focus). */
  highlightStar?: boolean
}

const CELL = 78
const HEAD_H = 70
const VAL_H = 78

export function SortChart({ ox, oy, headers, values, solved = false, starValue, highlightStar = false }: ChartProps) {
  const cols = headers.length
  const w = cols * CELL
  return (
    <g>
      {/* header row */}
      <rect x={ox} y={oy} width={w} height={HEAD_H} fill={HEADER_FILL} stroke={GRID} strokeWidth={2.5} />
      {headers.map((h, i) => (
        <g key={`h${i}`} transform={`translate(${ox + i * CELL + CELL / 2}, ${oy + HEAD_H / 2})`}>
          {h}
        </g>
      ))}
      {/* value row */}
      <rect x={ox} y={oy + HEAD_H} width={w} height={VAL_H} fill="#FFFFFF" stroke={GRID} strokeWidth={2.5} />
      {/* vertical separators */}
      {Array.from({ length: cols - 1 }, (_, i) => (
        <line
          key={`sep${i}`}
          x1={ox + (i + 1) * CELL}
          y1={oy}
          x2={ox + (i + 1) * CELL}
          y2={oy + HEAD_H + VAL_H}
          stroke={GRID}
          strokeWidth={2.5}
        />
      ))}
      {/* values */}
      {values.map((v, i) => {
        const cx = ox + i * CELL + CELL / 2
        const cy = oy + HEAD_H + VAL_H / 2
        if (v.kind === 'star') {
          return (
            <g key={`v${i}`}>
              {highlightStar && <rect x={ox + i * CELL + 3} y={oy + HEAD_H + 3} width={CELL - 6} height={VAL_H - 6} fill="#FFF6D8" />}
              {solved && starValue !== undefined ? (
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={38} fontWeight={900} fill={STAR_BLUE}>
                  {starValue}
                </text>
              ) : (
                <StarGlyph cx={cx} cy={cy} r={20} />
              )}
            </g>
          )
        }
        if (v.kind === 'blank') {
          // empty cell in the problem; when solved its number is supplied as a
          // 'number' cell instead, so a blank here always renders nothing.
          return null
        }
        return (
          <text key={`v${i}`} x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={38} fontWeight={900} fill={INK}>
            {v.n}
          </text>
        )
      })}
    </g>
  )
}

// ── scene ─────────────────────────────────────────────────────────────────────
export const Q15_VIEW_W = 560
export const Q15_VIEW_H = 380

export interface Q15SceneProps {
  /** reveal the square's known count + the solved star values (explainer). */
  solved?: boolean
  /** ring the two star cells (explainer focus). */
  highlightStars?: boolean
}

function shapeHeaders(): React.ReactNode[] {
  return [
    <ShapeGlyph key="c" kind="circle" cx={0} cy={0} r={20} />,
    <ShapeGlyph key="s" kind="square" cx={0} cy={0} r={18} />,
    <ShapeGlyph key="t" kind="triangle" cx={0} cy={2} r={20} />,
  ]
}

function fruitHeaders(): React.ReactNode[] {
  return (['apple', 'banana', 'cherry'] as const).map((f) => (
    <text key={f} x={0} y={0} textAnchor="middle" dominantBaseline="central" fontSize={34}>
      {FRUIT_EMOJI[f]}
    </text>
  ))
}

export function Q15Scene({ solved = false, highlightStars = false }: Q15SceneProps) {
  const chartW = 3 * CELL // 234
  const ox = (Q15_VIEW_W - chartW) / 2

  const shapeValues: CellValue[] = [
    { kind: 'number', n: SHAPE_CIRCLE },
    solved ? { kind: 'number', n: SHAPE_SQUARE } : { kind: 'blank' },
    { kind: 'star' },
  ]
  const fruitValues: CellValue[] = [
    { kind: 'number', n: FRUIT_APPLE },
    solved ? { kind: 'number', n: FRUIT_BANANA } : { kind: 'blank' },
    { kind: 'star' },
  ]

  return (
    <svg
      viewBox={`0 0 ${Q15_VIEW_W} ${Q15_VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 460 }}
      aria-hidden="true"
    >
      {/* label: by shape */}
      <text x={Q15_VIEW_W / 2} y={26} textAnchor="middle" fontSize={18} fontWeight={800} fill="#30598A">
        {solved ? 'by shape — total 12' : 'by shape'}
      </text>
      <SortChart ox={ox} oy={40} headers={shapeHeaders()} values={shapeValues} solved={solved} starValue={SHAPE_STAR} highlightStar={highlightStars} />

      {/* label: by fruit */}
      <text x={Q15_VIEW_W / 2} y={236} textAnchor="middle" fontSize={18} fontWeight={800} fill="#30598A">
        {solved ? 'by fruit — total 12' : 'by fruit'}
      </text>
      <SortChart ox={ox} oy={250} headers={fruitHeaders()} values={fruitValues} solved={solved} starValue={FRUIT_STAR} highlightStar={highlightStars} />
    </svg>
  )
}

export default function P23G1Q15Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Dua tabel untuk kelompok benda yang sama. Tabel atas (menurut bentuk): lingkaran 6, persegi kosong, segitiga ditandai bintang. Tabel bawah (menurut buah): apel 5, pisang kosong, ceri ditandai bintang. Cari selisih kedua nilai berbintang."
    >
      <Q15Scene />
    </div>
  )
}
