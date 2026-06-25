/**
 * SEAMO-21-B-Q3 — Shaded border frame: 9 m × 6 m outer rectangle with a
 * uniform 1 m border on all sides, leaving a 7 m × 4 m white inner rectangle.
 *
 * THE FIGURE (reconstructed from OCR crop 2021.imgs/002.jpg)
 * ==========================================================
 * - Outer rectangle: 9 m wide × 6 m tall (labelled on top edge and right edge).
 * - Inner rectangle: white, 7 m × 4 m (centered; 1 m border all around).
 * - Arrows showing the 1 m border width (horizontal) and 1 m border height (vertical).
 * - Shaded region = border frame (outer minus inner).
 *
 * This is the PROBLEM figure only. The answer (26 m², choice E) is never shown.
 *
 * Key quantities (from seed breakdown):
 *   outer area  = 9 × 6 = 54 m²
 *   inner area  = (9−2) × (6−2) = 7 × 4 = 28 m²
 *   shaded area = 54 − 28 = 26 m²   → E (None of the above)
 *
 * Pure SVG — SSR-safe, no hooks, no motion imports.
 */

import React from 'react'

// ---------------------------------------------------------------------------
// BorderedRectFrame — co-exported primitive for the animator
// ---------------------------------------------------------------------------

export interface BorderedRectFrameProps {
  /** Outer rectangle width in logical units */
  outerW: number
  /** Outer rectangle height in logical units */
  outerH: number
  /** Border thickness in logical units */
  border: number
  /**
   * Animation phase:
   *   'problem'  — show hatch shading, border arrows + labels (default)
   *   'outer'    — highlight outer rectangle in amber
   *   'inner'    — highlight inner rectangle in amber
   *   'shaded'   — highlight the border frame in green
   */
  phase?: 'problem' | 'outer' | 'inner' | 'shaded'
}

// Drawing constants — all in SVG user units.
// We map 1 logical metre → SCALE px so the whole figure is ~280 wide.
const SCALE = 28      // px per logical metre
const PAD   = 30      // padding around the outer rect for labels + arrows

export function BorderedRectFrame({
  outerW,
  outerH,
  border,
  phase = 'problem',
}: BorderedRectFrameProps) {
  const ow = outerW * SCALE
  const oh = outerH * SCALE
  const b  = border * SCALE
  const iw = ow - 2 * b    // inner width in px
  const ih = oh - 2 * b    // inner height in px

  const viewW = ow + PAD * 2
  const viewH = oh + PAD * 2

  // The outer rect starts at (PAD, PAD).
  const ox = PAD
  const oy = PAD
  // Inner rect starts at (PAD+b, PAD+b).
  const ix = ox + b
  const iy = oy + b

  // Hatch-pattern id (unique to this component to avoid SVG id collisions)
  const hatchId = 'bordered-rect-hatch'

  // Fill colours by phase
  const outerFill  = phase === 'outer'  ? '#FFD3B1' : 'transparent'  // amber highlight
  const innerFill  = phase === 'inner'  ? '#FFD3B1' : '#ffffff'
  const shadeFill  = phase === 'shaded' ? '#D1FAE5' : `url(#${hatchId})`  // green or hatch

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      width={Math.min(300, viewW)}
      height={(Math.min(300, viewW) / viewW) * viewH}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        {/* Diagonal hatch for the shaded border region (matches the scan) */}
        <pattern
          id={hatchId}
          patternUnits="userSpaceOnUse"
          width={8}
          height={8}
        >
          <path
            d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4"
            stroke="#9CA3AF"
            strokeWidth={1.2}
          />
        </pattern>
        {/* Clip path = outer rect, so hatch never bleeds outside */}
        <clipPath id="outer-clip">
          <rect x={ox} y={oy} width={ow} height={oh} />
        </clipPath>
      </defs>

      {/* ---- Shaded border frame (outer rect filled with hatch/green) ---- */}
      {/* Draw outer rect with hatch, then punch the inner white rect on top */}
      <rect
        x={ox}
        y={oy}
        width={ow}
        height={oh}
        fill={outerFill !== 'transparent' ? outerFill : shadeFill}
        stroke="#1F2937"
        strokeWidth={1.8}
        clipPath="url(#outer-clip)"
      />

      {/* ---- Inner white rectangle ---- */}
      <rect
        x={ix}
        y={iy}
        width={iw}
        height={ih}
        fill={innerFill}
        stroke="#1F2937"
        strokeWidth={1.6}
      />

      {/* ---- Outer dimension labels ---- */}
      {/* Top edge: "9 m" */}
      <text
        x={ox + ow / 2}
        y={oy - 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={700}
        fill="#1F2937"
      >
        {outerW} m
      </text>
      {/* Right edge: "6 m" */}
      <text
        x={ox + ow + 12}
        y={oy + oh / 2}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={700}
        fill="#1F2937"
      >
        {outerH} m
      </text>

      {/* ---- Border-width arrow annotations (1 m × 2) ---- */}
      {/* Horizontal arrow inside left border: ← 1 m → */}
      {/* Arrow line from ix (inner left) to ox (outer left) */}
      <line
        x1={ox + 2}
        y1={iy + ih / 2}
        x2={ix - 2}
        y2={iy + ih / 2}
        stroke="#1F2937"
        strokeWidth={1.4}
        markerEnd="url(#arr)"
        markerStart="url(#arr)"
      />
      <text
        x={ox + b / 2}
        y={iy + ih / 2 - 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fill="#1F2937"
      >
        {border} m
      </text>

      {/* Vertical arrow inside bottom border: ↓ 1 m ↑ */}
      <line
        x1={ix + iw / 2}
        y1={iy + ih + 2}
        x2={ix + iw / 2}
        y2={oy + oh - 2}
        stroke="#1F2937"
        strokeWidth={1.4}
        markerEnd="url(#arr)"
        markerStart="url(#arr)"
      />
      <text
        x={ix + iw / 2 + 14}
        y={iy + ih + b / 2}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fill="#1F2937"
      >
        {border} m
      </text>

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arr"
          markerWidth={6}
          markerHeight={6}
          refX={3}
          refY={3}
          orient="auto-start-reverse"
        >
          <path d="M0,0 L6,3 L0,6 z" fill="#1F2937" />
        </marker>
      </defs>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — stem illustration (shows problem only, never the answer)
// ---------------------------------------------------------------------------

export default function BorderedRect21B3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sebuah persegi panjang luar berukuran 9 m × 6 m dengan tepi seragam selebar 1 m ' +
        'di semua sisi meninggalkan persegi panjang putih di dalam. Tentukan luas daerah yang diarsir.'
      }
    >
      <BorderedRectFrame outerW={9} outerH={6} border={1} phase="problem" />
    </div>
  )
}
