// Grid-paths lattice illustration for SEAMO-20-B-Q22.
// Source: docs/reference/ocr-res/seamo/contest/paper-b/2020.imgs/020.jpg
//
// A 4×4 grid of square cells → 5×5 lattice (intersections 0..4 on each axis).
//   A  at lattice (col=0, row=0) — top-left
//   X  at lattice (col=3, row=3) — filled dot, bold "X" label
//   B  at lattice (col=4, row=4) — bottom-right, label "B"
//
// Problem: moving only → or ↓, count paths A → B passing through X.
// Answer: C(6,3) × C(2,1) = 20 × 2 = 40.
//
// Figure shows the PROBLEM ONLY — no path counts, no answer.
// SSR-safe, pure SVG, no hooks, no framer-motion.

import React from 'react'

// ── layout constants (exported so the explainer can bind) ─────────────────────
export const CELL = 52          // px per cell
export const COLS = 4           // number of cells horizontally
export const ROWS = 4           // number of cells vertically
export const PAD  = 24          // padding around the grid

// key lattice nodes
export const A_NODE: [number, number] = [0, 0]   // [col, row]
export const X_NODE: [number, number] = [3, 3]
export const B_NODE: [number, number] = [4, 4]

/** Convert lattice (col, row) → SVG (x, y). */
export function pt(col: number, row: number): [number, number] {
  return [PAD + col * CELL, PAD + row * CELL]
}

const SVG_W = PAD * 2 + COLS * CELL
const SVG_H = PAD * 2 + ROWS * CELL

// ── colours ───────────────────────────────────────────────────────────────────
const GRID_STROKE = '#9CA3AF'
const INK         = '#1F2937'
const X_FILL      = '#1F2937'   // filled dot for X
const A_TEXT      = '#1F2937'
const B_TEXT      = '#1F2937'

// ── sub-components ────────────────────────────────────────────────────────────

function GridLines() {
  const lines: React.ReactNode[] = []
  for (let c = 0; c <= COLS; c++) {
    const [x, y0] = pt(c, 0)
    const [, y1]  = pt(c, ROWS)
    lines.push(<line key={`v${c}`} x1={x} y1={y0} x2={x} y2={y1} stroke={GRID_STROKE} strokeWidth={1.5} />)
  }
  for (let r = 0; r <= ROWS; r++) {
    const [x0, y] = pt(0, r)
    const [x1]    = pt(COLS, r)
    lines.push(<line key={`h${r}`} x1={x0} y1={y} x2={x1} y2={y} stroke={GRID_STROKE} strokeWidth={1.5} />)
  }
  return <g>{lines}</g>
}

function ALabel() {
  const [ax, ay] = pt(...A_NODE)
  return (
    <g>
      <circle cx={ax} cy={ay} r={5} fill={INK} />
      <text
        x={ax - 10}
        y={ay - 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={700}
        fill={A_TEXT}
      >
        A
      </text>
    </g>
  )
}

function XMarker() {
  const [xx, xy] = pt(...X_NODE)
  return (
    <g>
      <circle cx={xx} cy={xy} r={6} fill={X_FILL} />
      <text
        x={xx + 14}
        y={xy}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={700}
        fill={INK}
        fontStyle="italic"
      >
        X
      </text>
    </g>
  )
}

function BLabel() {
  const [bx, by] = pt(...B_NODE)
  return (
    <text
      x={bx + 10}
      y={by + 10}
      textAnchor="start"
      dominantBaseline="hanging"
      fontSize={18}
      fontWeight={700}
      fill={B_TEXT}
    >
      B
    </text>
  )
}

// ── main export ───────────────────────────────────────────────────────────────

/**
 * GridPaths20B22Illustration
 *
 * Static, problem-only figure for SEAMO-20-B-Q22.
 * Shows a 4×4 lattice grid with A (top-left), X (filled dot at col=3,row=3),
 * and B (bottom-right). Never reveals the path count (answer = 40).
 */
export default function GridPaths20B22Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kisi 4×4 petak persegi dengan label A di pojok kiri atas, ' +
        'titik X di pertemuan kolom 3 baris 3 dari pojok kiri atas, ' +
        'dan label B di pojok kanan bawah.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(280, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <GridLines />
        <ALabel />
        <XMarker />
        <BLabel />
      </svg>
    </div>
  )
}
