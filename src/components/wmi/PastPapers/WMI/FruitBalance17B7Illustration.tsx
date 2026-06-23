// SEAMO-17-B-Q7 — Balance-scale fruit puzzle.
//
// Given:
//   Scale 1 (balanced): 1 mango = 2 apples
//   Scale 2 (balanced): 3 apples = 5 peaches
//   Scale 3 (query):    3 mangoes = ? peaches
//
// Answer: B (10 peaches)
//
// Three balanced scales are drawn vertically. Fruit glyphs are drawn inline
// (Mango, Apple, Peach) because only Apple exists in the global glyph kit.
// The BalanceScale primitive supplies the beam/pivot/pan geometry.
//
// SSR-safe: no hooks, no Date, no framer-motion, no Math.random.

import React from 'react'
import { BalanceScale } from './primitives/BalanceScale'

// ── Fruit palette ─────────────────────────────────────────────────────────────

/** Yellow-green mango centred at (cx, cy) with radius r. */
function Mango({ cx = 0, cy = 0, r = 15 }: { cx?: number; cy?: number; r?: number }) {
  const s = r / 15
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* body — kidney-shaped: two overlapping ovals */}
      <ellipse cx={-3} cy={2} rx={10} ry={13} fill="#F5A623" />
      <ellipse cx={4} cy={0} rx={9} ry={12} fill="#E8940D" />
      {/* green blush */}
      <ellipse cx={-5} cy={-4} rx={5} ry={7} fill="#6DB33F" opacity={0.55} />
      {/* shine */}
      <ellipse cx={-5} cy={-6} rx={2.5} ry={3.5} fill="#FFFFFF" opacity={0.45} />
      {/* stem */}
      <rect x={-1} y={-15} width={2} height={5} rx={1} fill="#5C3D11" />
      {/* leaf */}
      <ellipse cx={5} cy={-14} rx={4.5} ry={2} fill="#4CA14E" transform="rotate(-30 5 -14)" />
    </g>
  )
}

/** Red apple centred at (cx, cy) with radius r. */
function Apple({ cx = 0, cy = 0, r = 14 }: { cx?: number; cy?: number; r?: number }) {
  const s = r / 14
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      <circle cx={-5} cy={0} r={11} fill="#E63946" />
      <circle cx={5} cy={0} r={11} fill="#E63946" />
      <ellipse cx={0} cy={2} rx={11} ry={10} fill="#E63946" />
      <ellipse cx={-5} cy={-4} rx={2.5} ry={3.5} fill="#FFFFFF" opacity={0.5} />
      <rect x={-1.2} y={-14} width={2.4} height={6} rx={1.2} fill="#6B4226" />
      <ellipse cx={4.5} cy={-11} rx={4} ry={2} fill="#4CA14E" transform="rotate(-28 4.5 -11)" />
    </g>
  )
}

/** Orange peach centred at (cx, cy) with radius r. */
function Peach({ cx = 0, cy = 0, r = 13 }: { cx?: number; cy?: number; r?: number }) {
  const s = r / 13
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* two-lobe body */}
      <circle cx={-4} cy={0} r={10} fill="#FFAB76" />
      <circle cx={4} cy={0} r={10} fill="#FFAB76" />
      <ellipse cx={0} cy={2} rx={10} ry={9} fill="#FFAB76" />
      {/* crease line */}
      <path d="M 0 -10 Q 0 4 0 10" fill="none" stroke="#F07740" strokeWidth={1.2} opacity={0.6} />
      {/* shine */}
      <ellipse cx={-4} cy={-4} rx={2} ry={3} fill="#FFFFFF" opacity={0.4} />
      {/* stem + leaf */}
      <rect x={-1} y={-13} width={2} height={5} rx={1} fill="#6B4226" />
      <ellipse cx={4} cy={-12} rx={4} ry={1.8} fill="#4CA14E" transform="rotate(-25 4 -12)" />
    </g>
  )
}

// ── Pan content helpers ───────────────────────────────────────────────────────

/** Place n fruit glyphs in a single horizontal row centred at (0,0)-pan-top. */
function FruitRow({
  n,
  Fruit,
  r = 14,
}: {
  n: number
  Fruit: React.FC<{ cx?: number; cy?: number; r?: number }>
  r?: number
}) {
  const gap = 4
  const step = r * 2 + gap
  const totalW = n * step - gap
  const startX = -totalW / 2 + r
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Fruit key={i} cx={startX + i * step} cy={-r - 2} r={r} />
      ))}
    </>
  )
}

/** Right-pan label for Scale 3 query ("? peaches"). */
function QueryLabel() {
  return (
    <text
      x={0}
      y={-22}
      textAnchor="middle"
      fontSize={18}
      fontWeight={800}
      fill="#374151"
      fontFamily="inherit"
    >
      ? peaches
    </text>
  )
}

// ── Main illustration ─────────────────────────────────────────────────────────

/**
 * Stem figure for SEAMO-17-B-Q7.
 * Three stacked balanced scales with fruit glyphs matching the original paper.
 *
 * VISUALS entry (paste into registry.ts):
 *   'SEAMO-17-B-Q7': { illustration: () => import('./FruitBalance17B7Illustration') },
 */
export default function FruitBalance17B7Illustration() {
  return (
    <div
      className="my-4 space-y-2"
      role="img"
      aria-label={
        'Tiga timbangan seimbang. ' +
        'Timbangan 1: 1 mangga = 2 apel. ' +
        'Timbangan 2: 3 apel = 5 persik. ' +
        'Timbangan 3: 3 mangga = ? persik.'
      }
    >
      {/* Scale 1: 1 mango = 2 apples */}
      <BalanceScale
        tilt={0}
        panW={100}
        left={<FruitRow n={1} Fruit={Mango} r={16} />}
        right={<FruitRow n={2} Fruit={Apple} r={14} />}
      />

      {/* Scale 2: 3 apples = 5 peaches */}
      <BalanceScale
        tilt={0}
        panW={120}
        left={<FruitRow n={3} Fruit={Apple} r={14} />}
        right={<FruitRow n={5} Fruit={Peach} r={12} />}
      />

      {/* Scale 3: 3 mangoes = ? peaches */}
      <BalanceScale
        tilt={0}
        panW={110}
        left={<FruitRow n={3} Fruit={Mango} r={14} />}
        right={<QueryLabel />}
      />
    </div>
  )
}
