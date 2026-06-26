/**
 * HexTileOSN20KQ5Illustration — OSN-20-SD-KAB-Q5
 *
 * "Bilangan 9, 10, 11, 12, 13, 14, dan 15 diletakkan di ubin segienam
 *  (9 di pusat). Jumlah tiga bilangan segaris selalu sama. Jumlah itu adalah ⋯"
 * Answer: 34  (9 + 25; opposite pairs each sum to 75÷3 = 25)
 *
 * Source: docs/reference/ocr-res/osn/kabupaten/sd/2020.imgs/005.jpg
 * Seven flat-top hexagonal tiles in a flower arrangement; 3 diameter lines.
 *
 * No existing primitive covers hexagonal-tile flowers → bespoke SVG.
 * HexTileScene is co-exported so the explainer can reuse it.
 */

import React from 'react'

// ─── Hex geometry ──────────────────────────────────────────────────────────────
const R = 30                      // circumradius (center to vertex) px
const D = R * Math.sqrt(3)        // center-to-center distance ≈ 51.96

/** Flat-top hexagon: vertices at 0°, 60°, 120°, 180°, 240°, 300°. */
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

// For flat-top hexes, neighbors are at 30°, 90°, 150°, 210°, 270°, 330°
// (SVG y-down: 90° = bottom, 270° = top)
const OUTER_ANGLES = [30, 90, 150, 210, 270, 330]
const OUTER_CENTERS = OUTER_ANGLES.map((deg) => {
  const rad = (deg * Math.PI) / 180
  return { x: D * Math.cos(rad), y: D * Math.sin(rad) }
})
// Positions:
//  0 = 30°  (lower-right)   1 = 90°  (bottom)    2 = 150° (lower-left)
//  3 = 210° (upper-left)    4 = 270° (top)        5 = 330° (upper-right)

// Valid outer-number arrangement: opposite pairs each sum to 25
// Pair A: (10, 15) at indices 0 & 3  → 10 + 15 = 25
// Pair B: (11, 14) at indices 1 & 4  → 11 + 14 = 25
// Pair C: (12, 13) at indices 2 & 5  → 12 + 13 = 25
const OUTER_NUMBERS: number[] = [10, 11, 12, 15, 14, 13]

// Three diameter lines: each [indexA, indexB] are opposite positions
const DIAMETER_PAIRS: [number, number][] = [[0, 3], [1, 4], [2, 5]]

const PAIR_COLORS = ['#FDE68A', '#BBF7D0', '#BFDBFE'] // amber, mint-green, sky-blue

// ─── Shared scene (also used by the explainer) ─────────────────────────────────
export interface HexTileSceneProps {
  /** Show numbers 10–15 on the outer tiles (valid arrangement). */
  showNumbers?: boolean
  /** Shade each opposite pair in a distinct colour. */
  highlightPairs?: boolean
  /** Turn diameter lines solid-green (answer revealed). */
  showLineSum?: boolean
}

export function HexTileScene({
  showNumbers = false,
  highlightPairs = false,
  showLineSum = false,
}: HexTileSceneProps) {
  function outerFill(i: number): string {
    if (highlightPairs) {
      const pi = DIAMETER_PAIRS.findIndex(([a, b]) => a === i || b === i)
      return pi >= 0 ? PAIR_COLORS[pi] : '#E0F2FE'
    }
    return '#E0F2FE'
  }

  return (
    <svg
      viewBox="-85 -88 170 176"
      width="100%"
      style={{ display: 'block', maxWidth: 260, margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Diameter lines */}
      {DIAMETER_PAIRS.map(([a, b], i) => (
        <line
          key={`dl-${i}`}
          x1={OUTER_CENTERS[a].x.toFixed(2)}
          y1={OUTER_CENTERS[a].y.toFixed(2)}
          x2={OUTER_CENTERS[b].x.toFixed(2)}
          y2={OUTER_CENTERS[b].y.toFixed(2)}
          stroke={showLineSum ? '#10B981' : '#CBD5E1'}
          strokeWidth={showLineSum ? 2.5 : 1.5}
          strokeDasharray={showLineSum ? undefined : '5 3'}
          strokeLinecap="round"
        />
      ))}

      {/* Outer hexes */}
      {OUTER_CENTERS.map((c, i) => (
        <g key={`oh-${i}`}>
          <polygon
            points={hexPoints(c.x, c.y, R)}
            fill={outerFill(i)}
            stroke="#64748B"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          {showNumbers && (
            <text
              x={c.x.toFixed(2)}
              y={c.y.toFixed(2)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontWeight="700"
              fill="#1E293B"
              fontFamily="system-ui, sans-serif"
            >
              {OUTER_NUMBERS[i]}
            </text>
          )}
        </g>
      ))}

      {/* Center hex — 9 is always shown */}
      <polygon
        points={hexPoints(0, 0, R)}
        fill="#FEF3C7"
        stroke="#D97706"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight="800"
        fill="#92400E"
        fontFamily="system-ui, sans-serif"
      >
        9
      </text>
    </svg>
  )
}

// ─── Default export: stem illustration ─────────────────────────────────────────
export default function HexTileOSN20KQ5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Tujuh ubin segienam: 9 di tengah, enam ubin luar untuk bilangan 10–15. ' +
        'Tiga garis diameter menunjukkan posisi tiga ubin segaris.'
      }
    >
      <HexTileScene />
    </div>
  )
}
