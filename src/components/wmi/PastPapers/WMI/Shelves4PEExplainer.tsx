import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  SHELF_Y,
  TOY_XS,
  SHELF_LEFT,
  SHELF_RIGHT,
  PLANK_H,
  SHELF_ROWS,
  ShelfPlank,
  BrownBear,
  WhiteRabbit,
  PandaGlyph,
  HorseGlyph,
  DuckGlyph,
  TurtleGlyph,
  RobotGlyph,
  ToyCart,
  DogGlyph,
  LionGlyph,
  COLOR,
} from './Shelves4PEIllustration'
import { buildShelves4PESteps } from './shelves4PESteps'

// IKMC-21-PE-Q4 — post-answer animation.
// Reuses all toy primitives from Shelves4PEIllustration.
//
// Animation beats (see shelves4PESteps.ts):
//   0. intro          — static scene; read the three forbidden items.
//   1. forbid-bear    — red X over shelves 1 & 2 (have brown bears).
//   2. forbid-rabbit  — red X over shelves 1 & 5 (have rabbits).
//   3. forbid-turtle  — red X over shelves 3 & 5 (have turtles).
//   4. result         — green glow on shelf 4; "Answer D".

const GREEN  = '#10B981'
const RED    = '#DC2626'
const BLUE   = '#2563EB'
const VIOLET = '#7C3AED'

const FIG_W = Math.min(360, SVG_W)

// ── toy renderer map (same order as SHELF_ROWS toys array) ────────────────────

type ToyId = 'brown-bear' | 'rabbit' | 'panda' | 'horse' | 'duck' | 'turtle' | 'robot' | 'cart' | 'dog' | 'lion'

function ToyGlyph({ id, cx, botY }: { id: ToyId; cx: number; botY: number }) {
  switch (id) {
    case 'brown-bear': return <BrownBear cx={cx} botY={botY} />
    case 'rabbit':     return <WhiteRabbit cx={cx} botY={botY} />
    case 'panda':      return <PandaGlyph cx={cx} botY={botY} />
    case 'horse':      return <HorseGlyph cx={cx} botY={botY} />
    case 'duck':       return <DuckGlyph cx={cx} botY={botY} />
    case 'turtle':     return <TurtleGlyph cx={cx} botY={botY} />
    case 'robot':      return <RobotGlyph cx={cx} botY={botY} />
    case 'cart':       return <ToyCart cx={cx} botY={botY} />
    case 'dog':        return <DogGlyph cx={cx} botY={botY} />
    case 'lion':       return <LionGlyph cx={cx} botY={botY} />
  }
}

// ── Cross overlay for one shelf row ───────────────────────────────────────────

function CrossOverlay({ shelfIndex }: { shelfIndex: number }) {
  const shelfY = SHELF_Y[shelfIndex]
  const topY = shelfY - PLANK_H - 46   // approx top of toy row
  const botY = shelfY - PLANK_H
  const pad = 4
  return (
    <g opacity={0.82}>
      {/* semi-transparent red fill */}
      <rect
        x={SHELF_LEFT + pad}
        y={topY}
        width={SHELF_RIGHT - SHELF_LEFT - pad * 2}
        height={botY - topY}
        fill={RED}
        opacity={0.18}
        rx={4}
      />
      {/* X lines */}
      <line
        x1={SHELF_LEFT + pad + 6}
        y1={topY + 4}
        x2={SHELF_RIGHT - pad - 6}
        y2={botY - 2}
        stroke={RED}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <line
        x1={SHELF_RIGHT - pad - 6}
        y1={topY + 4}
        x2={SHELF_LEFT + pad + 6}
        y2={botY - 2}
        stroke={RED}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </g>
  )
}

// ── Green glow ring around a shelf row ────────────────────────────────────────

function GlowRing({ shelfIndex }: { shelfIndex: number }) {
  const shelfY = SHELF_Y[shelfIndex]
  const topY = shelfY - PLANK_H - 50
  const botY = shelfY
  const pad = -4
  return (
    <rect
      x={SHELF_LEFT + pad}
      y={topY}
      width={SHELF_RIGHT - SHELF_LEFT - pad * 2}
      height={botY - topY}
      rx={6}
      fill="none"
      stroke={GREEN}
      strokeWidth={3.5}
      strokeDasharray="8 4"
    />
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Shelves4PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildShelves4PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: '#1E40AF' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: eliminasi rak yang punya beruang coklat (rak 1 & 2), kelinci (rak 1 & 5), kura-kura (rak 3 & 5). Hanya rak 4 yang aman — jawaban D.'
      : 'Explainer: cross out shelves with brown bears (1 & 2), rabbits (1 & 5), turtles (3 & 5). Only shelf 4 is safe — answer D.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.WALL} />

          {/* shelves + toys */}
          {SHELF_ROWS.map((row, i) => {
            const shelfY = SHELF_Y[i]
            return (
              <g key={row.label}>
                {row.toys.map((toyId, j) => (
                  <ToyGlyph
                    key={j}
                    id={toyId as ToyId}
                    cx={TOY_XS[j]}
                    botY={shelfY - PLANK_H}
                  />
                ))}
                <ShelfPlank y={shelfY} label={row.label} />
              </g>
            )
          })}

          {/* animated cross overlays */}
          <AnimatePresence>
            {beat.crossedShelves.map((si) => (
              <motion.g
                key={`cross-${si}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              >
                <CrossOverlay shelfIndex={si} />
              </motion.g>
            ))}
          </AnimatePresence>

          {/* green glow on correct shelf */}
          <AnimatePresence>
            {beat.glowShelf >= 0 && (
              <motion.g
                key="glow"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              >
                <GlowRing shelfIndex={beat.glowShelf} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* answer badge */}
          <AnimatePresence>
            {isResult && (
              <motion.g
                key="answer-badge"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              >
                <rect x={SVG_W / 2 - 30} y={4} width={60} height={24} rx={12} fill={GREEN} />
                <text
                  x={SVG_W / 2}
                  y={16}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={900}
                  fill="white"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {lang === 'id' ? 'Rak 4 = D' : 'Shelf 4 = D'}
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* forbidden-item reminder (beats 0-3) */}
          {!isResult && (
            <text
              x={SVG_W / 2}
              y={14}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={9}
              fontWeight={700}
              fill={VIOLET}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {lang === 'id'
                ? '✗ kura-kura  ✗ kelinci  ✗ beruang coklat'
                : '✗ turtles  ✗ rabbits  ✗ brown bears'}
            </text>
          )}
        </svg>

        {/* equation row */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : RED }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
