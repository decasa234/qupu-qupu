/**
 * SEAMO-22-A-Q23 — "How many chicks have the same weight as ONE rabbit?"
 *
 * Four balance-scale figures (all level / balanced):
 *   Figure 1: 1 rabbit  = 3 squirrels
 *   Figure 2: 1 squirrel = 3 ducks
 *   Figure 3: 1 duck    = 2 chicks
 *   Figure 4: 1 rabbit  = ? chicks  (the question)
 *
 * Chain: rabbit = 3 squirrels = 3×3 ducks = 9×2 chicks = 18 chicks → answer = 18
 *
 * Classification: STEM figure (answer is a number, not picture options).
 *
 * Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.
 * Uses the BalanceScale primitive for consistent beam + pivot geometry.
 */

import React from 'react'
import { BalanceScale } from './primitives/BalanceScale'

// ── Palette ──────────────────────────────────────────────────────────────────
const INK = '#1F2937'
const RABBIT_FUR = '#C0BAB0'   // warm grey
const RABBIT_EAR = '#E8A0A0'   // inner ear pink
const SQUIRREL_FUR = '#C87941' // rust-orange
const SQUIRREL_TAIL = '#A05E28'
const DUCK_BODY = '#E09C14'    // amber-gold
const DUCK_BEAK = '#F97316'    // orange
const CHICK_BODY = '#F9D44A'   // bright yellow
const CHICK_BEAK = '#F97316'
const LABEL_BLUE = '#1E40AF'

// ── Animal glyphs (all as SVG <g>, coordinate origin = bottom-centre) ────────

/**
 * Rabbit silhouette. Height ~50 px above origin, width ~34 px.
 * Origin = bottom-centre of body.
 */
function Rabbit({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* body */}
      <ellipse cx={0} cy={-18} rx={14} ry={17} fill={RABBIT_FUR} />
      {/* head */}
      <circle cx={0} cy={-40} r={10} fill={RABBIT_FUR} />
      {/* left ear */}
      <ellipse cx={-5} cy={-54} rx={3.5} ry={9} fill={RABBIT_FUR} />
      <ellipse cx={-5} cy={-54} rx={1.8} ry={6.5} fill={RABBIT_EAR} />
      {/* right ear */}
      <ellipse cx={5} cy={-56} rx={3.5} ry={9} fill={RABBIT_FUR} />
      <ellipse cx={5} cy={-56} rx={1.8} ry={6.5} fill={RABBIT_EAR} />
      {/* eye */}
      <circle cx={4} cy={-42} r={1.6} fill={INK} />
      {/* tail puff */}
      <circle cx={-13} cy={-12} r={4} fill="#FFFFFF" />
    </g>
  )
}

/**
 * Squirrel silhouette. Height ~56 px above origin, width ~38 px.
 * Origin = bottom-centre.
 */
function Squirrel({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* big fluffy tail (drawn behind body) */}
      <ellipse cx={14} cy={-28} rx={11} ry={20} fill={SQUIRREL_TAIL} transform="rotate(20 14 -28)" />
      <ellipse cx={13} cy={-28} rx={7.5} ry={14} fill="#D4946A" transform="rotate(20 13 -28)" />
      {/* body */}
      <ellipse cx={0} cy={-18} rx={12} ry={15} fill={SQUIRREL_FUR} />
      {/* head */}
      <circle cx={2} cy={-36} r={9} fill={SQUIRREL_FUR} />
      {/* ear puff */}
      <ellipse cx={-3} cy={-44} rx={3} ry={4.5} fill={SQUIRREL_FUR} />
      <ellipse cx={7} cy={-45} rx={3} ry={4.5} fill={SQUIRREL_FUR} />
      {/* eye */}
      <circle cx={6} cy={-37} r={1.5} fill={INK} />
      {/* tiny cheek puff */}
      <ellipse cx={8} cy={-33} rx={3.5} ry={2.5} fill="#E8AD80" opacity={0.7} />
    </g>
  )
}

/**
 * Duck silhouette. Height ~42 px above origin, width ~38 px.
 * Origin = bottom-centre.
 */
function Duck({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* body */}
      <ellipse cx={0} cy={-16} rx={14} ry={13} fill={DUCK_BODY} />
      {/* wing highlight */}
      <ellipse cx={4} cy={-16} rx={8} ry={8} fill="#F0B020" opacity={0.5} />
      {/* head */}
      <circle cx={11} cy={-32} r={8.5} fill={DUCK_BODY} />
      {/* eye */}
      <circle cx={14} cy={-33} r={1.4} fill={INK} />
      {/* beak */}
      <path
        d={`M ${17} ${-30} L ${24} ${-29} L ${17} ${-27} Z`}
        fill={DUCK_BEAK}
      />
      {/* neck */}
      <ellipse cx={7} cy={-24} rx={5} ry={7} fill={DUCK_BODY} />
      {/* tail */}
      <path
        d={`M -12 -14 Q -20 -20 -14 -8 Z`}
        fill="#C08010"
        strokeLinejoin="round"
      />
    </g>
  )
}

/**
 * Chick silhouette. Height ~30 px above origin, width ~24 px.
 * Origin = bottom-centre.
 */
function Chick({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* body */}
      <ellipse cx={0} cy={-12} rx={10} ry={10} fill={CHICK_BODY} />
      {/* head */}
      <circle cx={0} cy={-26} r={7} fill={CHICK_BODY} />
      {/* eye */}
      <circle cx={3} cy={-27} r={1.2} fill={INK} />
      {/* beak */}
      <path
        d={`M 4 -24 L 9 -23 L 4 -22 Z`}
        fill={CHICK_BEAK}
      />
      {/* tuft on top */}
      <path
        d={`M -2 -33 Q 0 -38 2 -33`}
        fill="none"
        stroke={CHICK_BODY}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d={`M -5 -31 Q -4 -36 -1 -31`}
        fill="none"
        stroke={CHICK_BODY}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── Pan content helpers ───────────────────────────────────────────────────────

/** Lay N glyphs side-by-side, centred on x=0 (BalanceScale pan convention). */
function Row({ count, spacing, render }: { count: number; spacing: number; render: (x: number) => React.ReactNode }) {
  const total = (count - 1) * spacing
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = -total / 2 + i * spacing
        return <React.Fragment key={i}>{render(x)}</React.Fragment>
      })}
    </>
  )
}

/** Question-mark placeholder for the unknown chick count. */
function QuestionMark() {
  return (
    <text
      x={0}
      y={-28}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={32}
      fontWeight={900}
      fill={LABEL_BLUE}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      ?
    </text>
  )
}

// ── Figure label ──────────────────────────────────────────────────────────────

function FigLabel({ label }: { label: string }) {
  return (
    <text
      x={0}
      y={0}
      textAnchor="middle"
      fontSize={11}
      fontWeight={700}
      fill={INK}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
      opacity={0.6}
    >
      {label}
    </text>
  )
}

// ── Individual scale panels ───────────────────────────────────────────────────

/** Figure 1: 1 rabbit (left) = 3 squirrels (right) */
function Fig1Scale() {
  return (
    <BalanceScale
      tilt={0}
      panW={100}
      left={<Rabbit y={0} s={0.82} />}
      right={<Row count={3} spacing={28} render={(x) => <Squirrel x={x} y={0} s={0.68} />} />}
    />
  )
}

/** Figure 2: 1 squirrel (left) = 3 ducks (right) */
function Fig2Scale() {
  return (
    <BalanceScale
      tilt={0}
      panW={100}
      left={<Squirrel y={0} s={0.9} />}
      right={<Row count={3} spacing={30} render={(x) => <Duck x={x} y={0} s={0.8} />} />}
    />
  )
}

/** Figure 3: 1 duck (left) = 2 chicks (right) */
function Fig3Scale() {
  return (
    <BalanceScale
      tilt={0}
      panW={80}
      left={<Duck y={0} s={0.9} />}
      right={<Row count={2} spacing={28} render={(x) => <Chick x={x} y={0} s={0.95} />} />}
    />
  )
}

/** Figure 4: 1 rabbit (left) = ? chicks (right) — the question */
function Fig4Scale() {
  return (
    <BalanceScale
      tilt={0}
      panW={80}
      left={<Rabbit y={0} s={0.82} />}
      right={<QuestionMark />}
    />
  )
}

// ── Layout constants ──────────────────────────────────────────────────────────
const CELL_H = 96 // label row height below each scale

// ── Default export: the four-figure problem layout ────────────────────────────

/**
 * SEAMO 2022 Paper A Q23 — balance-scale chain illustration.
 *
 * Renders all four figures in a 2×2 grid (matching the original paper layout).
 * Pure SVG + React, no motion, SSR-safe.
 */
export default function Seamo22A23Illustration() {
  return (
    <div
      className="my-4 rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Four balance scales. Figure 1: one rabbit equals three squirrels. Figure 2: one squirrel equals three ducks. Figure 3: one duck equals two chicks. Figure 4: one rabbit equals a question mark representing the unknown number of chicks."
    >
      <div className="grid grid-cols-2 gap-2">
        {/* Figure 1 */}
        <div className="flex flex-col items-center">
          <Fig1Scale />
          <svg viewBox={`0 0 300 ${CELL_H}`} width="100%" style={{ maxWidth: 300 }} aria-hidden="true">
            <FigLabel label="Gambar 1 / Figure 1" />
          </svg>
        </div>

        {/* Figure 2 */}
        <div className="flex flex-col items-center">
          <Fig2Scale />
          <svg viewBox={`0 0 300 ${CELL_H}`} width="100%" style={{ maxWidth: 300 }} aria-hidden="true">
            <FigLabel label="Gambar 2 / Figure 2" />
          </svg>
        </div>

        {/* Figure 3 */}
        <div className="flex flex-col items-center">
          <Fig3Scale />
          <svg viewBox={`0 0 300 ${CELL_H}`} width="100%" style={{ maxWidth: 300 }} aria-hidden="true">
            <FigLabel label="Gambar 3 / Figure 3" />
          </svg>
        </div>

        {/* Figure 4 */}
        <div className="flex flex-col items-center">
          <Fig4Scale />
          <svg viewBox={`0 0 300 ${CELL_H}`} width="100%" style={{ maxWidth: 300 }} aria-hidden="true">
            <FigLabel label="Gambar 4 / Figure 4" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ── Named sub-exports for the explainer ──────────────────────────────────────

export {
  Rabbit,
  Squirrel,
  Duck,
  Chick,
  Fig1Scale,
  Fig2Scale,
  Fig3Scale,
  Fig4Scale,
  Row,
}
