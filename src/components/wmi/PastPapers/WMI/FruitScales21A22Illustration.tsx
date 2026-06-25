// SEAMO-21-A-Q22 — Three balanced scales with fruit on the left pan and a gram
// weight label on the right pan.  All three beams are level (balanced).
//
//  Scale 1: Apple + Pear + Banana = 170 g
//  Scale 2: Pear  + Apple         = 130 g
//  Scale 3: Apple + Banana        = 100 g
//
//  Solving: from (1)−(2) → Banana = 40 g; from (3) → Apple = 60 g; (2) → Pear = 70 g.
//  The stem shows only the PROBLEM — the 60 g answer for apple is NOT revealed.
//
//  Primitive used: BalanceScale (./primitives/BalanceScale).
//  Glyphs: Apple, Banana from ./primitives/glyphs; Pear drawn inline (no glyphs entry).
//  Pure render — no framer-motion, no hooks, SSR-safe.

import React from 'react'
import { BalanceScale } from './primitives/BalanceScale'
import { Apple, Banana } from './primitives/glyphs'

// ── Inline Pear glyph (green/yellow, same scale contract as glyphs.tsx) ─────

function Pear({ cx = 0, cy = 0, r = 16 }: { cx?: number; cy?: number; r?: number }) {
  const s = r / 14
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* lower round body */}
      <ellipse cx={0} cy={4} rx={10} ry={12} fill="#A8C23A" stroke="#6B8E23" strokeWidth={1.2} />
      {/* upper narrow neck */}
      <ellipse cx={0} cy={-8} rx={5.5} ry={7} fill="#C5D96B" stroke="#6B8E23" strokeWidth={1} />
      {/* shine */}
      <ellipse cx={-3} cy={0} rx={2.2} ry={3.5} fill="#FFFFFF" opacity={0.4} />
      {/* stem */}
      <rect x={-1.2} y={-16} width={2.4} height={5} rx={1.2} fill="#5C4033" />
      {/* tiny leaf */}
      <ellipse cx={3.5} cy={-14} rx={3.5} ry={1.8} fill="#4CA14E" transform="rotate(-20 3.5 -14)" />
    </g>
  )
}

// ── Weight-label box (the boxed "N g" on the right pan) ──────────────────────

function GramBox({ grams, cx = 0, cy = 0 }: { grams: number; cx?: number; cy?: number }) {
  return (
    <g>
      <rect
        x={cx - 28}
        y={cy - 17}
        width={56}
        height={32}
        rx={5}
        fill="#FFFFFF"
        stroke="#374151"
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill="#1F2937"
      >
        {grams} g
      </text>
    </g>
  )
}

// ── Fruit row helper — a row of fruit centred on (0,0) in pan coordinates ───

const FRUIT_R = 14
const FRUIT_GAP = 4

function fruitOffsets(n: number): number[] {
  const step = FRUIT_R * 2 + FRUIT_GAP
  const totalW = n * step - FRUIT_GAP
  const startX = -totalW / 2 + FRUIT_R
  return Array.from({ length: n }, (_, i) => startX + i * step)
}

// In BalanceScale's pan coordinate system, (0,0) = tray top-centre.
// Fruit should sit ABOVE the tray: cy = −FRUIT_R so the bottom of the glyph is at y=0.

function Scale1Left() {
  const xs = fruitOffsets(3)
  return (
    <g>
      <Apple  cx={xs[0]} cy={-FRUIT_R} r={FRUIT_R} />
      <Pear   cx={xs[1]} cy={-FRUIT_R} r={FRUIT_R} />
      <Banana cx={xs[2]} cy={-FRUIT_R} r={FRUIT_R} />
    </g>
  )
}

function Scale2Left() {
  const xs = fruitOffsets(2)
  return (
    <g>
      <Pear  cx={xs[0]} cy={-FRUIT_R} r={FRUIT_R} />
      <Apple cx={xs[1]} cy={-FRUIT_R} r={FRUIT_R} />
    </g>
  )
}

function Scale3Left() {
  const xs = fruitOffsets(2)
  return (
    <g>
      <Apple  cx={xs[0]} cy={-FRUIT_R} r={FRUIT_R} />
      <Banana cx={xs[1]} cy={-FRUIT_R} r={FRUIT_R} />
    </g>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * SEAMO-21-A-Q22 stem illustration.
 * Three level balance scales showing the three fruit-weight equations;
 * the answer (apple = 60 g) is not revealed.
 */
export default function FruitScales21A22Illustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-2"
      role="img"
      aria-label={
        'Tiga timbangan seimbang. ' +
        'Timbangan 1: apel + pir + pisang = 170 g. ' +
        'Timbangan 2: pir + apel = 130 g. ' +
        'Timbangan 3: apel + pisang = 100 g.'
      }
    >
      {/* Scale 1: Apple + Pear + Banana  =  170 g */}
      <div className="w-full" style={{ maxWidth: 340 }}>
        <BalanceScale
          tilt={0}
          panW={110}
          left={<Scale1Left />}
          right={<GramBox grams={170} />}
        />
      </div>

      {/* Scale 2: Pear + Apple  =  130 g */}
      <div className="w-full" style={{ maxWidth: 340 }}>
        <BalanceScale
          tilt={0}
          panW={90}
          left={<Scale2Left />}
          right={<GramBox grams={130} />}
        />
      </div>

      {/* Scale 3: Apple + Banana  =  100 g */}
      <div className="w-full" style={{ maxWidth: 340 }}>
        <BalanceScale
          tilt={0}
          panW={90}
          left={<Scale3Left />}
          right={<GramBox grams={100} />}
        />
      </div>
    </div>
  )
}
