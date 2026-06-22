/**
 * IKMC-21-PE-Q2 — Kangaroo constellation explainer.
 *
 * Strategy: eliminate then verify.
 * Shows all five constellations; highlights one at a time, crossing out
 * those that break the "all > 3" rule, then verifies B's sum (5+8+7=20).
 *
 * Reuses ConstellationPanel from Constellation2PEIllustration.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ConstellationPanel } from './Constellation2PEIllustration'
import {
  buildConstellation2PESteps,
  type ConstellationBeat,
} from './constellation2PESteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const BLUE = '#2563EB'
const BLUE_BG = '#EFF6FF'
const RED = '#DC2626'
const RED_BG = '#FEE2E2'
const INK = '#1F2937'
const NEUTRAL_BORDER = '#E5E7EB'

// ---------------------------------------------------------------------------
// Star data mirrored here (same as Illustration — keeps explainer self-contained)
// ---------------------------------------------------------------------------

interface StarDef {
  cx: number
  cy: number
  r: number
  n: number
}

const STARS_A: StarDef[] = [
  { cx: 20, cy: 22, r: 13, n: 3 },
  { cx: 66, cy: 16, r: 15, n: 4 },
  { cx: 30, cy: 55, r: 14, n: 7 },
  { cx: 68, cy: 56, r: 13, n: 6 },
]
const STARS_B: StarDef[] = [
  { cx: 22, cy: 24, r: 14, n: 5 },
  { cx: 65, cy: 22, r: 18, n: 8 },
  { cx: 44, cy: 54, r: 15, n: 7 },
]
const STARS_C: StarDef[] = [
  { cx: 14, cy: 16, r: 11, n: 3 },
  { cx: 48, cy: 12, r: 13, n: 7 },
  { cx: 12, cy: 50, r: 10, n: 2 },
  { cx: 48, cy: 50, r: 12, n: 5 },
  { cx: 76, cy: 36, r: 14, n: 8 },
]
const STARS_D: StarDef[] = [
  { cx: 20, cy: 18, r: 14, n: 5 },
  { cx: 62, cy: 14, r: 10, n: 1 },
  { cx: 24, cy: 56, r: 12, n: 4 },
  { cx: 66, cy: 54, r: 17, n: 9 },
]
const STARS_E: StarDef[] = [
  { cx: 16, cy: 18, r: 17, n: 9 },
  { cx: 44, cy: 38, r: 10, n: 2 },
  { cx: 72, cy: 56, r: 17, n: 9 },
]

const OPTION_STARS: Record<string, StarDef[]> = {
  A: STARS_A,
  B: STARS_B,
  C: STARS_C,
  D: STARS_D,
  E: STARS_E,
}

/** Indices of invalid stars (value ≤ 3) per option. */
const BAD_INDICES: Record<string, number[]> = {
  A: [0],       // index 0 = star "3"
  C: [0, 2],    // indices 0 = "3", 2 = "2"
  D: [1],       // index 1 = "1"
  E: [1],       // index 1 = "2"
}

// ---------------------------------------------------------------------------
// ConstellationCard — a labelled panel for one option
// ---------------------------------------------------------------------------

interface ConstellationCardProps {
  label: string
  beat: ConstellationBeat
  isEliminated: boolean
}

function ConstellationCard({ label, beat, isEliminated }: ConstellationCardProps) {
  const stars = OPTION_STARS[label]
  if (!stars) return null

  const isFocus = beat.focusLabel === label
  const isAnswer = label === 'B'

  let borderColor = NEUTRAL_BORDER
  if (isFocus && beat.eliminating) borderColor = RED
  else if (isFocus && beat.isAnswer) borderColor = GREEN
  else if (isFocus) borderColor = BLUE

  const bgColor = isFocus && beat.eliminating
    ? RED_BG
    : isFocus && beat.isAnswer
    ? GREEN_BG
    : '#fff'

  // Stars that have a bad value (≤ 3) and we're currently showing this option's elimination
  const badIdx = (isFocus && beat.eliminating) ? (BAD_INDICES[label] ?? []) : []

  return (
    <motion.div
      layout
      className="flex flex-col items-center"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: bgColor,
        opacity: isEliminated && !isFocus ? 0.38 : 1,
        position: 'relative',
      }}
    >
      <ConstellationPanel
        stars={stars}
        correct={isFocus && isAnswer && !beat.eliminating}
        showBad={isFocus && beat.eliminating}
        badIndices={badIdx}
        width={76}
        height={60}
      />
      <span
        className="mt-0.5 text-center font-display text-xs font-bold"
        style={{
          color: isFocus && beat.eliminating
            ? RED
            : isFocus && beat.isAnswer
            ? GREEN_TEXT
            : INK,
        }}
      >
        {label}
      </span>

      {/* Cross-out overlay when eliminated and not in focus */}
      {isEliminated && !isFocus && (
        <svg
          viewBox="0 0 80 72"
          width={80}
          height={72}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <line
            x1={4} y1={4} x2={76} y2={68}
            stroke={RED} strokeWidth={2.5} strokeLinecap="round" opacity={0.55}
          />
          <line
            x1={76} y1={4} x2={4} y2={68}
            stroke={RED} strokeWidth={2.5} strokeLinecap="round" opacity={0.55}
          />
        </svg>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const

export default function Constellation2PEExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const story = useMemo(() => buildConstellation2PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Track which options are now eliminated (all beats up to current)
  const eliminated = useMemo<Set<string>>(() => {
    const set = new Set<string>()
    for (let i = 0; i <= index; i++) {
      const b = story.steps[i]
      if (b.eliminating && b.focusLabel) set.add(b.focusLabel)
    }
    return set
  }, [index, story.steps])

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : beat.eliminating
    ? { background: RED_BG, borderColor: RED, color: '#7F1D1D' }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Eliminasi rasi yang mengandung angka ≤ 3 (A mengandung 3, C mengandung 3&2, D mengandung 1, E mengandung 2). Hanya B tersisa: bintang 5,8,7 — semua >3 dan 5+8+7=20. Jawaban B.'
      : 'Explainer: Eliminate constellations containing a number ≤ 3 (A has 3, C has 3&2, D has 1, E has 2). Only B remains: stars 5, 8, 7 — all >3 and 5+8+7=20. Answer B.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five constellation cards */}
        <div className="flex flex-wrap items-start justify-center gap-2">
          {OPTION_LABELS.map((label) => (
            <ConstellationCard
              key={label}
              label={label}
              beat={beat}
              isEliminated={eliminated.has(label)}
            />
          ))}
        </div>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums"
                style={{
                  background: isResult ? GREEN : beat.eliminating ? RED : BLUE,
                  color: '#fff',
                }}
              >
                {beat.equation}
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
