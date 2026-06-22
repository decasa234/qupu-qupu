// BagBalls16A25Explainer.tsx
//
// Post-answer animated explainer for SEAMO-16-A-Q25:
//   "5 blue, 4 orange, 2 yellow balls in a bag. Blindfolded, draw until
//    guaranteed 4 of the same colour. Answer: 9 balls."
//
// Worst-case (pigeonhole) animation:
//   Beat 0. Setup   — show the full bag; state the problem.
//   Beat 1. Target  — explain the goal: guarantee 4 same colour.
//   Beat 2. Worst 8 — draw 3 blue + 3 orange + 2 yellow = 8; no colour at 4 yet.
//   Beat 3. Ball 9  — 9th must be blue or orange → guaranteed 4.
//   Beat 4. Result  — answer = 9 (green).
//
// Reuses BagShape, Ball, ballCenter, ALL_BALLS from BagBalls16A25Illustration.
// Pure render — animation via framer-motion. SSR-safe static fallback.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BagShape,
  Ball,
  ballCenter,
  ALL_BALLS,
  BLUE_FILL,
  ORANGE_FILL,
  YELLOW_FILL,
  SVG_W,
  SVG_H,
  BALL_COUNTS,
} from './BagBalls16A25Illustration'
import { buildBagBalls16A25Steps } from './bagBalls16A25Steps'

// ── Colour tokens ─────────────────────────────────────────────────────────────

const GREEN     = '#16A34A'
const GREEN_BG  = '#DCFCE7'
const GREEN_TXT = '#14532D'
const BLUE_TOK  = '#2563EB'
const BLUE_BG   = '#EFF6FF'
const AMBER     = '#D97706'
const AMBER_BG  = '#FEF3C7'
const AMBER_TXT = '#78350F'

// ── Draw-state for the bag figure ─────────────────────────────────────────────

/**
 * Given `drawn` counts, mark which balls are "drawn out" (dimmed in bag).
 * Balls are ordered: blue first, then orange, then yellow (matching ALL_BALLS).
 */
function computeDimSet(drawn: { blue: number; orange: number; yellow: number } | undefined): Set<number> {
  if (!drawn) return new Set()
  const dim = new Set<number>()
  // blue: indices 0..4
  for (let i = 0; i < drawn.blue; i++) dim.add(i)
  // orange: indices 5..8
  for (let i = 0; i < drawn.orange; i++) dim.add(BALL_COUNTS.blue + i)
  // yellow: indices 9..10
  for (let i = 0; i < drawn.yellow; i++) dim.add(BALL_COUNTS.blue + BALL_COUNTS.orange + i)
  return dim
}

// ── DrawnRow: row of coloured balls representing drawn set ────────────────────

function DrawnRow({ drawn }: { drawn: { blue: number; orange: number; yellow: number } }) {
  const ballData: Array<{ fill: string; key: string }> = [
    ...Array(drawn.blue).fill(null).map((_, i) => ({ fill: BLUE_FILL, key: `b${i}` })),
    ...Array(drawn.orange).fill(null).map((_, i) => ({ fill: ORANGE_FILL, key: `o${i}` })),
    ...Array(drawn.yellow).fill(null).map((_, i) => ({ fill: YELLOW_FILL, key: `y${i}` })),
  ]

  const W = 22
  const total = ballData.length
  const rowW = total * W + (total - 1) * 4
  const padH = 26

  return (
    <svg
      viewBox={`0 0 ${Math.max(rowW + 12, 60)} ${padH}`}
      width={Math.max(rowW + 12, 60)}
      height={padH}
      aria-hidden="true"
    >
      {ballData.map(({ fill, key }, i) => (
        <Ball key={key} cx={6 + i * (W + 4) + W / 2} cy={padH / 2} fill={fill} r={9} />
      ))}
    </svg>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function BagBalls16A25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBagBalls16A25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const dimSet = computeDimSet(beat.drawn)

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : beat.phase === 'worstcase' || beat.phase === 'ball9'
      ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_TXT }
      : { background: BLUE_BG, borderColor: BLUE_TOK, color: BLUE_TOK }

  const chipColor = beat.result ? GREEN : beat.phase === 'worstcase' || beat.phase === 'ball9' ? AMBER : BLUE_TOK

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kasus terburuk — ambil 3 biru + 3 oranye + 2 kuning = 8 bola, belum ada 4 warna sama. Bola ke-9 pasti biru atau oranye, memberikan 4 bola warna itu. Jawaban: 9.'
      : 'Explainer: worst case — draw 3 blue + 3 orange + 2 yellow = 8 balls, no colour has 4 yet. The 9th ball must be blue or orange, giving 4 of that colour. Answer: 9.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Bag figure — balls dim as they are "drawn out" */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: SVG_W, display: 'block' }}
          aria-hidden="true"
        >
          <BagShape />
          {ALL_BALLS.map((ball, i) => {
            const { cx, cy } = ballCenter(i)
            return (
              <Ball key={i} cx={cx} cy={cy} fill={ball.fill} dim={dimSet.has(i)} />
            )
          })}
        </svg>

        {/* Drawn balls row — only shown when beat.drawn is set */}
        <AnimatePresence>
          {beat.drawn && (
            <motion.div
              key={`drawn-${beat.phase}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="font-display text-xs font-bold text-slate-400">
                {lang === 'id' ? 'Sudah diambil:' : 'Drawn so far:'}
              </span>
              <DrawnRow drawn={beat.drawn} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.chip !== '' && (
              <motion.span
                key={beat.chip}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
                style={{ background: chipColor }}
              >
                {beat.chip}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
