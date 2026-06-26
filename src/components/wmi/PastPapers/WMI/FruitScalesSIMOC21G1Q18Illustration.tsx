// SIMOC-21-G1-Q18 — Three balanced fruit scales.
//
// From figure (2021.imgs/015.jpg):
//   Scale 1: 1 jeruk + 1 apel kuning + 1 delima merah = 4 delima merah
//   Scale 2: 1 apel kuning + 1 pir hijau + 1 delima merah = 1 delima oranye + 4 delima merah
//   Scale 3: 2 pir hijau = 3 delima merah
//
// Given delima_oranye=1, delima_merah=2 → pir_hijau=3 → apel_kuning=4 (answer).
//
// Uses BalanceScale primitive. Fruit glyphs drawn inline.
// SSR-safe: no hooks, no framer-motion, no Date, no Math.random.

import React from 'react'
import { BalanceScale } from './primitives/BalanceScale'

// ── Fruit glyphs ─────────────────────────────────────────────────────────────
// All glyphs are centred at (cx, cy). Origin convention in pan context:
//   (0, 0) = tray top-centre; cy = -r keeps the fruit bottom on the tray.

function Jeruk({ cx = 0, cy = 0, r = 12 }: { cx?: number; cy?: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#F59E0B" stroke="#D97706" strokeWidth={1.2} />
      <ellipse cx={cx - r * 0.28} cy={cy - r * 0.32} rx={r * 0.22} ry={r * 0.3} fill="#FDE68A" opacity={0.7} />
      <circle cx={cx} cy={cy + r * 0.35} r={r * 0.1} fill="#D97706" opacity={0.7} />
      <rect x={cx - 1.5} y={cy - r - 5} width={3} height={5} rx={1} fill="#65A30D" />
    </g>
  )
}

function ApelKuning({ cx = 0, cy = 0, r = 12 }: { cx?: number; cy?: number; r?: number }) {
  const s = r / 12
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      <circle cx={-4} cy={1} r={10} fill="#FBBF24" />
      <circle cx={4} cy={1} r={10} fill="#FBBF24" />
      <ellipse cx={0} cy={3} rx={10} ry={9} fill="#FDE68A" />
      <ellipse cx={-4} cy={-3} rx={2.2} ry={2.8} fill="#FFFFFF" opacity={0.55} />
      <rect x={-1.5} y={-13} width={3} height={5} rx={1} fill="#6B4226" />
      <ellipse cx={4} cy={-11} rx={3.5} ry={1.7} fill="#65A30D" transform="rotate(-28 4 -11)" />
    </g>
  )
}

function PomBase({
  cx = 0,
  cy = 0,
  r = 12,
  fill,
  crownFill,
}: {
  cx?: number
  cy?: number
  r?: number
  fill: string
  crownFill: string
}) {
  const h = r * 0.55
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.22} ry={r * 0.28} fill="#FFFFFF" opacity={0.3} />
      {/* three-point crown */}
      <polygon
        points={`${cx - r * 0.5},${cy - r} ${cx - r * 0.68},${cy - r - h * 0.7} ${cx - r * 0.32},${cy - r}`}
        fill={crownFill}
      />
      <polygon
        points={`${cx - r * 0.1},${cy - r} ${cx},${cy - r - h} ${cx + r * 0.1},${cy - r}`}
        fill={crownFill}
      />
      <polygon
        points={`${cx + r * 0.32},${cy - r} ${cx + r * 0.68},${cy - r - h * 0.7} ${cx + r * 0.5},${cy - r}`}
        fill={crownFill}
      />
    </g>
  )
}

function DelimaMerah({ cx = 0, cy = 0, r = 12 }: { cx?: number; cy?: number; r?: number }) {
  return <PomBase cx={cx} cy={cy} r={r} fill="#DC2626" crownFill="#991B1B" />
}

function DelimaOranye({ cx = 0, cy = 0, r = 12 }: { cx?: number; cy?: number; r?: number }) {
  return <PomBase cx={cx} cy={cy} r={r} fill="#F97316" crownFill="#C2410C" />
}

function PirHijau({ cx = 0, cy = 0, r = 12 }: { cx?: number; cy?: number; r?: number }) {
  // Teardrop pear: wide lower ellipse + smaller upper circle
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r * 0.72} ry={r} fill="#65A30D" />
      <ellipse cx={cx} cy={cy - r * 0.52} rx={r * 0.46} ry={r * 0.47} fill="#84CC16" />
      <ellipse
        cx={cx - r * 0.25}
        cy={cy - r * 0.42}
        rx={r * 0.17}
        ry={r * 0.24}
        fill="#FFFFFF"
        opacity={0.42}
      />
      <rect x={cx - 1.5} y={cy - r - 5} width={3} height={5} rx={1} fill="#6B4226" />
    </g>
  )
}

// ── Pan content components ────────────────────────────────────────────────────
// All placed in pan-space: (0,0) = tray top-centre; negative Y = above tray.

// Scale 1 Left: Jeruk + ApelKuning + DelimaMerah, row of 3 (step=28)
function S1Left() {
  return (
    <>
      <Jeruk cx={-28} cy={-12} r={12} />
      <ApelKuning cx={0} cy={-12} r={12} />
      <DelimaMerah cx={28} cy={-12} r={12} />
    </>
  )
}

// Scale 1 Right: 4 DelimaMerah in 2×2 grid (r=11, gap≈2)
function S1Right() {
  const r = 11
  const half = r + 2 // 13
  const topY = -(3 * r + 3) // -36
  return (
    <>
      <DelimaMerah cx={-half} cy={topY} r={r} />
      <DelimaMerah cx={half} cy={topY} r={r} />
      <DelimaMerah cx={-half} cy={-r} r={r} />
      <DelimaMerah cx={half} cy={-r} r={r} />
    </>
  )
}

// Scale 2 Left: ApelKuning + PirHijau + DelimaMerah, row of 3
function S2Left() {
  return (
    <>
      <ApelKuning cx={-28} cy={-12} r={12} />
      <PirHijau cx={0} cy={-12} r={12} />
      <DelimaMerah cx={28} cy={-12} r={12} />
    </>
  )
}

// Scale 2 Right: bottom row 3 red (step=24) + top row 1 orange + 1 red (r=11)
function S2Right() {
  const r = 11
  const step = r * 2 + 2 // 24
  const botY = -r        // -11
  const topY = -(3 * r + 2) // -35
  return (
    <>
      <DelimaMerah cx={-step} cy={botY} r={r} />
      <DelimaMerah cx={0} cy={botY} r={r} />
      <DelimaMerah cx={step} cy={botY} r={r} />
      <DelimaOranye cx={-(r + 1)} cy={topY} r={r} />
      <DelimaMerah cx={r + 1} cy={topY} r={r} />
    </>
  )
}

// Scale 3 Left: 2 PirHijau (r=13, half=17)
function S3Left() {
  return (
    <>
      <PirHijau cx={-17} cy={-13} r={13} />
      <PirHijau cx={17} cy={-13} r={13} />
    </>
  )
}

// Scale 3 Right: 3 DelimaMerah (r=12, step=28)
function S3Right() {
  return (
    <>
      <DelimaMerah cx={-28} cy={-12} r={12} />
      <DelimaMerah cx={0} cy={-12} r={12} />
      <DelimaMerah cx={28} cy={-12} r={12} />
    </>
  )
}

// ── Shared diagram (used by both illustration and explainer) ──────────────────

export interface FruitScalesSIMOC21G1Q18DiagramProps {
  /** 0 = all active; 1/2/3 = highlight that scale, dim the others */
  activeScale?: 0 | 1 | 2 | 3
}

export function FruitScalesSIMOC21G1Q18Diagram({
  activeScale = 0,
}: FruitScalesSIMOC21G1Q18DiagramProps) {
  const dimOpacity = (n: 1 | 2 | 3): number =>
    activeScale !== 0 && activeScale !== n ? 0.28 : 1

  return (
    <div className="space-y-1" role="presentation">
      <div style={{ opacity: dimOpacity(1) }}>
        <BalanceScale tilt={0} panW={100} left={<S1Left />} right={<S1Right />} />
      </div>
      <div style={{ opacity: dimOpacity(2) }}>
        <BalanceScale tilt={0} panW={100} left={<S2Left />} right={<S2Right />} />
      </div>
      <div style={{ opacity: dimOpacity(3) }}>
        <BalanceScale tilt={0} panW={90} left={<S3Left />} right={<S3Right />} />
      </div>
    </div>
  )
}

// ── Default export: standalone stem illustration ──────────────────────────────

export default function FruitScalesSIMOC21G1Q18Illustration() {
  return (
    <div
      className="my-4"
      role="img"
      aria-label={
        'Tiga timbangan seimbang. ' +
        'Timbangan 1: jeruk + apel kuning + delima merah = 4 delima merah. ' +
        'Timbangan 2: apel kuning + pir hijau + delima merah = delima oranye + 4 delima merah. ' +
        'Timbangan 3: 2 pir hijau = 3 delima merah.'
      }
    >
      <FruitScalesSIMOC21G1Q18Diagram activeScale={0} />
    </div>
  )
}
