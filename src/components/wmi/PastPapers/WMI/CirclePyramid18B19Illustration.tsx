/**
 * CirclePyramid18B19Illustration — SEAMO-18-B-Q19
 *
 * "In the diagram below, the topmost layer has 60 circles.
 *  How many circles are there altogether?"
 * Answer: C (1830) — sum of 1+2+…+60 = 60×61÷2 = 1830.
 *
 * Source image: docs/reference/ocr-res/seamo/contest/paper-b/2018.imgs/009.jpg
 *
 * The diagram shows an inverted triangle (apex at bottom) with:
 *   • Top row: 60 circles (shown as a partial row with "…" dashes)
 *   • Several rows of dashes indicating many hidden rows
 *   • Bottom rows: the last few rows (5, 4, 3, 2, 1) drawn in full
 *
 * Classification: stem figure (appears in the question body, not as answer options).
 * No imported primitive covers this shape — drawn in plain SVG.
 *
 * SSR-safe: pure render, no hooks, no Math.random, no Date.
 */

import React from 'react'

// ── Layout constants ──────────────────────────────────────────────────────────

/** How many circles to show at the top of the visible row (abbreviated). */
const TOP_SHOWN = 3
/** How many circles to show at the right of the top row (abbreviated). */
const TOP_SHOWN_RIGHT = 4
/** Circle radius in SVG px. */
const R = 10
/** Gap between circle centres. */
const GAP = R * 2 + 2

/** The actual total for reference (not rendered). */
export const TOTAL_CIRCLES = 1830
/** Number of rows. */
export const NUM_ROWS = 60

const SVG_W = 280
const SVG_H = 310

// ── Row helpers ───────────────────────────────────────────────────────────────

/** Return cx values for n circles centred horizontally. */
function rowCenters(n: number, cx: number): number[] {
  const totalWidth = (n - 1) * GAP
  const left = cx - totalWidth / 2
  return Array.from({ length: n }, (_, i) => left + i * GAP)
}

/** Render a full row of n circles at vertical position cy. */
function FullRow({ n, cy, cx, fill, stroke }: {
  n: number
  cy: number
  cx: number
  fill: string
  stroke: string
}) {
  const centers = rowCenters(n, cx)
  return (
    <>
      {centers.map((x, i) => (
        <circle key={i} cx={x} cy={cy} r={R} fill={fill} stroke={stroke} strokeWidth={1.5} />
      ))}
    </>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * CirclePyramid18B19Illustration
 *
 * Renders the abbreviated inverted-triangle diagram from SEAMO 2018 Paper B Q19.
 * Shows: the bounding triangle, the abbreviated top row (3 circles … 4 circles),
 * dashed lines representing hidden middle rows, and the full bottom 5 rows
 * (5, 4, 3, 2, 1 circles).
 */
export default function CirclePyramid18B19Illustration({ params }: { params?: unknown }) {
  void params

  const cx = SVG_W / 2

  // Triangle bounding lines — inverted triangle
  // Top corners at y=20, apex at bottom centre
  const topY = 28
  const apexY = SVG_H - 12
  const halfTopWidth = SVG_W / 2 - 12

  // The visible "bottom" rows (rows 5 down to 1 from the apex)
  // Apex row = 1 circle, next = 2, ..., up to 5 circles
  const bottomRowCount = 5
  // Place them so row-1 apex is at apexY - R and rows go upward
  const bottomStartY = apexY - R - 4  // top of row-1 circle centre
  const rowStep = GAP + 4

  // Fill / stroke colours (match the image: white fill, dark outline)
  const circleFill = '#ffffff'
  const circleStroke = '#555555'

  // The abbreviated top row sits just below topY
  const topRowY = topY + R + 4

  // Dashed lines between top row and bottom group
  const dashStartY = topRowY + GAP + 8
  const dashEndY = bottomStartY - bottomRowCount * (rowStep) - 8
  const numDashes = 4

  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Segitiga terbalik (puncak di bawah) yang berisi lingkaran-lingkaran. ' +
        'Baris paling atas memiliki 60 lingkaran (ditampilkan sebagian). ' +
        'Baris-baris berikutnya berkurang satu per satu hingga 1 lingkaran di puncak bawah. ' +
        'Total lingkaran = 1 + 2 + … + 60 = 1830.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* ── Bounding inverted triangle ── */}
        <line
          x1={cx - halfTopWidth} y1={topY}
          x2={cx}               y2={apexY}
          stroke="#333" strokeWidth={2} strokeLinejoin="round"
        />
        <line
          x1={cx + halfTopWidth} y1={topY}
          x2={cx}               y2={apexY}
          stroke="#333" strokeWidth={2} strokeLinejoin="round"
        />

        {/* ── Abbreviated top row: 3 circles … 4 circles ── */}
        {/* Left cluster */}
        {rowCenters(TOP_SHOWN, cx - halfTopWidth / 2 + R).map((x, i) => (
          <circle
            key={`tl${i}`}
            cx={x} cy={topRowY} r={R}
            fill={circleFill} stroke={circleStroke} strokeWidth={1.5}
          />
        ))}

        {/* Dashes in the middle of the top row */}
        <line
          x1={cx - 26} y1={topRowY}
          x2={cx + 26} y2={topRowY}
          stroke={circleStroke} strokeWidth={1.5}
          strokeDasharray="5,4"
        />

        {/* Right cluster */}
        {rowCenters(TOP_SHOWN_RIGHT, cx + halfTopWidth / 2 - R * 2).map((x, i) => (
          <circle
            key={`tr${i}`}
            cx={x} cy={topRowY} r={R}
            fill={circleFill} stroke={circleStroke} strokeWidth={1.5}
          />
        ))}

        {/* ── Dashed lines representing hidden rows ── */}
        {Array.from({ length: numDashes }, (_, i) => {
          const y = dashStartY + ((dashEndY - dashStartY) / (numDashes - 1)) * i
          return (
            <line
              key={`d${i}`}
              x1={cx - halfTopWidth * 0.72 + i * 10}
              y1={y}
              x2={cx + halfTopWidth * 0.72 - i * 10}
              y2={y}
              stroke="#999" strokeWidth={1.2}
              strokeDasharray="6,5"
            />
          )
        })}

        {/* ── Fully drawn bottom rows (row 5 down to row 1) ── */}
        {Array.from({ length: bottomRowCount }, (_, i) => {
          // i=0 → bottom (row 5 circles, y at bottomStartY)
          // i=4 → top of this group (row 1 circle)
          const rowNum = bottomRowCount - i   // 5, 4, 3, 2, 1
          const y = bottomStartY - i * rowStep
          return (
            <FullRow
              key={`br${i}`}
              n={rowNum}
              cy={y}
              cx={cx}
              fill={circleFill}
              stroke={circleStroke}
            />
          )
        })}

        {/* ── Label: "60" at top left of top row (optional context) ── */}
        <text
          x={cx - halfTopWidth + 2}
          y={topY - 4}
          fontSize={11}
          fill="#555"
          fontFamily="sans-serif"
          textAnchor="start"
        >
          60 lingkaran
        </text>
      </svg>
    </div>
  )
}
