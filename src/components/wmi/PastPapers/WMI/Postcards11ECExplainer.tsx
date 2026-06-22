// IKMC-22-EC-Q11 — post-answer explainer for the five-postcards logic puzzle.
//
// Reuses CardASunset, CardBKangaroos, CardCLeafInsects, CardDDucks, CardEDog
// primitives from Postcards11ECIllustration for visual consistency.
//
// Animation beats:
//   0. intro    — show all 5 cards; state the task.
//   1. lexi     — clue 4 highlights E (dog) → Lexi.
//   2. heather  — clue 5 highlights B (kangaroos) → Heather.
//   3. cara     — clue 2 highlights D (sun) → Cara.
//   4. paula    — clue 3 highlights C (2 creatures) → Paula.
//   5. mike     — clue 1 highlights A (no ducks, only card left) → Mike (answer).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CardASunset,
  CardBKangaroos,
  CardCLeafInsects,
  CardDDucks,
  CardEDog,
  CARD_W,
  CARD_H,
} from './Postcards11ECIllustration'
import { buildPostcards11ECSteps } from './postcards11ECSteps'

// ── Colours ───────────────────────────────────────────────────────────────────

const GREEN = '#10B981'
const BLUE = '#2563EB'
const AMBER = '#F59E0B'
const GRAY_DIM = 0.28

// ── Layout ─────────────────────────────────────────────────────────────────────

const PAD = 6
const LABEL_H = 14
const BADGE_H = 16
const CELL_W = CARD_W + PAD
const CELL_H = CARD_H + LABEL_H + PAD
const COLS = 3
const ROW2_X_OFFSET = CELL_W / 2

const SVG_W = CELL_W * COLS + PAD
const SVG_H = 2 * CELL_H + PAD * 2

// ── Card primitives map ───────────────────────────────────────────────────────

type CardRenderer = (props: { x: number; y: number }) => React.JSX.Element

const CARD_RENDERERS: Record<string, CardRenderer> = {
  A: CardASunset,
  B: CardBKangaroos,
  C: CardCLeafInsects,
  D: CardDDucks,
  E: CardEDog,
}

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

// Grid positions for each card label
function cardPos(label: string): { x: number; y: number } {
  const idx = LABELS.indexOf(label as typeof LABELS[number])
  if (idx < 3) {
    return { x: PAD + idx * CELL_W, y: PAD }
  }
  return { x: PAD + ROW2_X_OFFSET + (idx - 3) * CELL_W, y: PAD + CELL_H }
}

// ── Glow ring around a card ───────────────────────────────────────────────────

function CardGlow({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <rect
      x={x - 3}
      y={y - 3}
      width={CARD_W + 6}
      height={CARD_H + 6}
      rx={7}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray="6 3"
      opacity={0.9}
    />
  )
}

// ── Friend name badge below a card ────────────────────────────────────────────

function FriendBadge({ x, y, name, color }: { x: number; y: number; name: string; color: string }) {
  const badgeW = Math.min(CARD_W, name.length * 7 + 12)
  return (
    <g>
      <rect
        x={x + CARD_W / 2 - badgeW / 2}
        y={y}
        width={badgeW}
        height={BADGE_H}
        rx={BADGE_H / 2}
        fill={color}
      />
      <text
        x={x + CARD_W / 2}
        y={y + BADGE_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={800}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {name}
      </text>
    </g>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function Postcards11ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildPostcards11ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EFF6FF', borderColor: BLUE, color: '#1E40AF' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Lexi mendapat kartu E (anjing), Heather mendapat B (kanguru), Cara mendapat D (matahari), Paula mendapat C (2 makhluk), Mike mendapat A (matahari terbenam, tanpa bebek) — Jawaban A.'
      : 'Explainer: Lexi gets E (dog), Heather gets B (kangaroos), Cara gets D (sun), Paula gets C (2 creatures), Mike gets A (sunset, no ducks) — Answer A.'

  // Build a set of assigned cards so far for quick lookup
  const assignedMap = new Map(beat.assignments.map((a) => [a.card, a.friend]))

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(380, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {LABELS.map((label) => {
            const { x, y } = cardPos(label)
            const Renderer = CARD_RENDERERS[label]
            const isHighlighted = beat.highlightCard === label
            const isEliminated = beat.eliminated.includes(label) && !isResult && label !== beat.highlightCard
            const friendName = assignedMap.get(label)
            const badgeColor = isResult && label === 'A' ? GREEN : AMBER

            return (
              <g key={label}>
                {/* dim overlay for eliminated (already assigned) cards */}
                {isEliminated && (
                  <rect
                    x={x}
                    y={y}
                    width={CARD_W}
                    height={CARD_H}
                    rx={4}
                    fill="white"
                    opacity={1 - GRAY_DIM}
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                <Renderer x={x} y={y} />

                {/* dim overlay (on top of card, below glow) */}
                {isEliminated && (
                  <rect
                    x={x}
                    y={y}
                    width={CARD_W}
                    height={CARD_H}
                    rx={4}
                    fill="#9CA3AF"
                    opacity={GRAY_DIM}
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* glow ring */}
                <AnimatePresence>
                  {isHighlighted && (
                    <motion.g
                      key={`glow-${label}`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                    >
                      <CardGlow x={x} y={y} color={isResult ? GREEN : AMBER} />
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* result: all cards get green glow */}
                {isResult && label !== 'A' && (
                  <CardGlow x={x} y={y} color={BLUE} />
                )}
                {isResult && label === 'A' && (
                  <CardGlow x={x} y={y} color={GREEN} />
                )}

                {/* card label */}
                <text
                  x={x + CARD_W / 2}
                  y={y + CARD_H + 10}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={800}
                  fill={isHighlighted ? AMBER : '#4B5563'}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {label}
                </text>

                {/* friend name badge */}
                <AnimatePresence>
                  {friendName && (
                    <motion.g
                      key={`badge-${label}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    >
                      <FriendBadge
                        x={x}
                        y={y + CARD_H + LABEL_H - 2}
                        name={friendName}
                        color={label === 'A' && isResult ? GREEN : badgeColor}
                      />
                    </motion.g>
                  )}
                </AnimatePresence>
              </g>
            )
          })}
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
                className="rounded-full px-4 py-1 font-display text-sm font-black text-white"
                style={{ background: isResult ? GREEN : BLUE }}
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
