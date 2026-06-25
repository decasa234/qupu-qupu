// RectCircleSeqX20A17Illustration.tsx
//
// Stem illustration for SEAMOX-20-A-Q17:
//   "In which figure are there 32 circles?"
//
// The paper (2020.imgs/014.jpg, 015.jpg, 016.jpg) shows three growing figures:
//   Fig 1: 1 rectangle — 4(1+1) = 8 circles
//   Fig 2: 2 rectangles joined — 4(2+1) = 12 circles
//   Fig 3: 3 rectangles joined — 4(3+1) = 16 circles
//
// Pattern: at each vertical divider column (there are n+1 for figure n),
// 4 small open circles are placed in a 2×2 cluster (2 on the top edge, 2 on
// the bottom edge). This matches the source images exactly.
// Formula: circles(n) = 4(n+1). Solve 4(n+1) = 32 → n+1 = 8 → n = 7. Answer: Fig. 7.
//
// Co-exported primitive: RectCircleSeqPanel (renders one figure n panel).
// Default export: static problem illustration (Fig 1, Fig 2, Fig 3 in a row).
//
// Pure SVG — SSR-safe. No hooks, no framer-motion.

import React from 'react'

// ── palette ───────────────────────────────────────────────────────────────────
const INK     = '#1F2937'   // rectangle stroke + circle stroke
const WHITE   = '#FFFFFF'   // rectangle fill
const CIRCLE_FILL = '#FFFFFF'  // open circles (white fill, dark outline)
const LABEL_COLOR = '#6B7280'  // "Fig 1", "Fig 2", "Fig 3" labels

// ── geometry ─────────────────────────────────────────────────────────────────
/** Width of one rectangle cell in px */
const CELL_W = 44
/** Height of one rectangle cell in px */
const CELL_H = 36
/** Radius of each small circle marker */
const CR = 4.5
/** Horizontal offset of each circle pair from the divider line */
const CX_OFF = 6
/** Vertical offset of circles from the top/bottom edge of the rectangle */
const CY_OFF = 6
/** Padding around each panel (for circles that extend outside the rect) */
const PANEL_PAD = 18
/** Vertical gap between the panel content and the figure label */
const LABEL_GAP = 8
/** Font size of the figure label */
const LABEL_SIZE = 11

// ── RectCircleSeqPanel ───────────────────────────────────────────────────────
//
// Renders figure n as an SVG <g> at local origin (0,0).
//
// Circle placement:
//   At each vertical divider i = 0..n (left edge, internal junctions, right edge):
//     x_div = i * CELL_W   (in panel local coords, shifted right by PANEL_PAD)
//     top pair:    (x_div - CX_OFF, -CY_OFF)  and  (x_div + CX_OFF, -CY_OFF)
//     bottom pair: (x_div - CX_OFF, CELL_H + CY_OFF) and (x_div + CX_OFF, CELL_H + CY_OFF)
//
// Total circles = 4 × (n + 1).

export interface RectCircleSeqPanelProps {
  /** Figure index n (1-based: 1 = one rectangle). */
  n: number
  /**
   * Highlight phase for the explainer:
   *   'none'     — default; show all circles in white fill
   *   'count'    — tint circles amber to draw attention to counting
   *   'formula'  — highlight circles for a specific divider column
   */
  highlight?: 'none' | 'count'
  /** Column index (0..n) to highlight when highlight='formula' */
  highlightCol?: number
}

export function RectCircleSeqPanel({
  n,
  highlight = 'none',
  highlightCol,
}: RectCircleSeqPanelProps) {
  const totalW = n * CELL_W
  const panelW = totalW + 2 * PANEL_PAD
  const panelH = CELL_H + 2 * PANEL_PAD + LABEL_SIZE + LABEL_GAP

  // Local x of the rectangle left edge
  const rectX = PANEL_PAD
  // Local y of the rectangle top edge
  const rectY = PANEL_PAD

  // Build list of all circle centres (panel-local coords)
  const circles: Array<{ cx: number; cy: number; col: number }> = []
  for (let i = 0; i <= n; i++) {
    const xDiv = rectX + i * CELL_W
    // top pair
    circles.push({ cx: xDiv - CX_OFF, cy: rectY - CY_OFF, col: i })
    circles.push({ cx: xDiv + CX_OFF, cy: rectY - CY_OFF, col: i })
    // bottom pair
    circles.push({ cx: xDiv - CX_OFF, cy: rectY + CELL_H + CY_OFF, col: i })
    circles.push({ cx: xDiv + CX_OFF, cy: rectY + CELL_H + CY_OFF, col: i })
  }

  return (
    <g>
      {/* Rectangle chain: n cells */}
      <rect
        x={rectX}
        y={rectY}
        width={totalW}
        height={CELL_H}
        fill={WHITE}
        stroke={INK}
        strokeWidth={1.8}
      />
      {/* Internal dividers */}
      {Array.from({ length: n - 1 }).map((_, i) => {
        const xDiv = rectX + (i + 1) * CELL_W
        return (
          <line
            key={`div${i}`}
            x1={xDiv}
            y1={rectY}
            x2={xDiv}
            y2={rectY + CELL_H}
            stroke={INK}
            strokeWidth={1.8}
          />
        )
      })}

      {/* Circle markers */}
      {circles.map(({ cx, cy, col }, idx) => {
        const isHL = highlight === 'count'
          || (highlightCol !== undefined && col === highlightCol)
        return (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={CR}
            fill={isHL ? '#FDE68A' : CIRCLE_FILL}
            stroke={INK}
            strokeWidth={1.4}
          />
        )
      })}

      {/* Figure label */}
      <text
        x={panelW / 2}
        y={rectY + CELL_H + CY_OFF + CR + LABEL_GAP + LABEL_SIZE}
        textAnchor="middle"
        fontSize={LABEL_SIZE}
        fontWeight={700}
        fill={LABEL_COLOR}
      >
        {`Fig ${n}`}
      </text>

      {/* Invisible spacer rect for viewBox sizing */}
      <rect x={0} y={0} width={panelW} height={panelH} fill="none" stroke="none" />
    </g>
  )
}

/** Returns the total [width, height] of a panel for figure n (for layout). */
export function panelSize(n: number): [number, number] {
  const panelW = n * CELL_W + 2 * PANEL_PAD
  const panelH = CELL_H + 2 * PANEL_PAD + LABEL_SIZE + LABEL_GAP
  return [panelW, panelH]
}

// ── layout: 3 figures in a horizontal row ─────────────────────────────────────

const PANEL_GAP = 20

// Pre-compute panel widths for figures 1, 2, 3
const FIGURES = [1, 2, 3]

const PANEL_WIDTHS = FIGURES.map((n) => panelSize(n)[0])
const PANEL_HEIGHT = panelSize(3)[1]  // all panels share the same height

const VB_W =
  PANEL_WIDTHS.reduce((a, b) => a + b, 0) + PANEL_GAP * (FIGURES.length - 1)
const VB_H = PANEL_HEIGHT

// X offsets for each panel
const PANEL_X_OFFSETS: number[] = []
{
  let x = 0
  for (const w of PANEL_WIDTHS) {
    PANEL_X_OFFSETS.push(x)
    x += w + PANEL_GAP
  }
}

// ── default export ────────────────────────────────────────────────────────────

/**
 * RectCircleSeqX20A17Illustration
 *
 * Problem-only figure for SEAMOX-20-A-Q17.
 * Shows Fig 1, Fig 2, Fig 3 of the growing rectangle-chain pattern.
 * Students find the pattern 4(n+1) circles and solve for 32 circles → n = 7.
 */
export default function RectCircleSeqX20A17Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tiga gambar persegi panjang berantai dengan lingkaran kecil di setiap garis pembatas: ' +
        'Gambar 1 (1 persegi panjang, 8 lingkaran), ' +
        'Gambar 2 (2 persegi panjang, 12 lingkaran), ' +
        'Gambar 3 (3 persegi panjang, 16 lingkaran). ' +
        'Pada gambar ke berapa terdapat 32 lingkaran?'
      }
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        style={{ maxWidth: VB_W * 2.5, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={VB_W} height={VB_H} fill={WHITE} />
        {FIGURES.map((n, i) => (
          <g key={n} transform={`translate(${PANEL_X_OFFSETS[i]},0)`}>
            <RectCircleSeqPanel n={n} />
          </g>
        ))}
      </svg>
    </div>
  )
}
