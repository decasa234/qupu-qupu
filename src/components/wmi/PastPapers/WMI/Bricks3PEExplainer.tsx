/**
 * IKMC-22-PE-Q3 — post-answer explainer: how many bricks touch exactly 3 others?
 *
 * Strategy: count each brick's neighbours one by one.
 *   Beat 0 — intro: set up the task.
 *   Beat 1 — B1 (bottom-left): 1 neighbour → ✗.
 *   Beat 2 — B2 (bottom-middle): 3 neighbours (B1, B3, B4-edge) → ✓.
 *   Beat 3 — B3 (bottom-right): 2 neighbours → ✗.
 *   Beat 4 — B4 (middle step): 3 neighbours (B3, B5, B2-edge) → ✓.
 *   Beat 5 — B5 (top step): 1 neighbour → ✗.
 *   Beat 6 — result: 2 bricks (B2 + B4) qualify → answer B.
 *
 * Reuses BrickStaircase from Bricks3PEIllustration.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BrickStaircase } from './Bricks3PEIllustration'
import { buildBricks3PESteps } from './bricks3PESteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE = '#2563EB'
const BLUE_BG = '#EFF6FF'
const GREEN = '#16A34A'
const GREEN_BG = '#DCFCE7'
const GREEN_TEXT = '#14532D'
const RED = '#DC2626'
const RED_BG = '#FEE2E2'
const RED_TEXT = '#7F1D1D'
const INK = '#1F2937'
const GRAY = '#D1D5DB'

// ---------------------------------------------------------------------------
// Brick label constants — which brick is which in the staircase (0-based)
// ---------------------------------------------------------------------------
const BRICK_LABELS = ['B1', 'B2', 'B3', 'B4', 'B5']
// Neighbour counts: index matches voxel 0-4
const NEIGHBOUR_COUNTS = [1, 3, 2, 3, 1]

// ---------------------------------------------------------------------------
// BrickPanel — one labelled brick card with status badge
// ---------------------------------------------------------------------------

interface BrickPanelProps {
  brickIdx: number
  active: boolean
  passes: boolean | null
  showCount: boolean
}

function BrickPanel({ brickIdx, active, passes, showCount }: BrickPanelProps) {
  const label = BRICK_LABELS[brickIdx]
  const count = NEIGHBOUR_COUNTS[brickIdx]

  let borderColor = GRAY
  if (active && passes === true) borderColor = GREEN
  else if (active && passes === false) borderColor = RED
  else if (active) borderColor = BLUE

  const tagBg = passes === true ? GREEN_BG : RED_BG
  const tagColor = passes === true ? GREEN_TEXT : RED_TEXT
  const tagBorder = passes === true ? GREEN : RED
  const tagIcon = passes === true ? '✓' : '✗'

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '6px 8px',
        background: '#fff',
        minWidth: 44,
        transition: 'border-color 0.2s',
      }}
    >
      <span
        className="font-display text-xs font-bold"
        style={{ color: active ? (passes === true ? GREEN : passes === false ? RED : BLUE) : INK }}
      >
        {label}
      </span>

      <AnimatePresence>
        {active && showCount && (
          <motion.div
            key={`count-${brickIdx}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="rounded px-1.5 py-0.5 font-display text-[10px] font-bold"
            style={{
              background: tagBg,
              color: tagColor,
              border: `1.5px solid ${tagBorder}`,
            }}
          >
            {count} {tagIcon}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

const BRICK_ORDER = [0, 1, 2, 3, 4] as const

export default function Bricks3PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildBricks3PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : beat.passes === true
      ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
      : beat.passes === false
        ? { background: RED_BG, borderColor: RED, color: RED_TEXT }
        : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Bata 2 (tengah-bawah) dan Bata 4 (langkah tengah) masing-masing menyentuh tepat 3 bata lain. Bata 1 menyentuh 1, Bata 3 menyentuh 2, Bata 5 menyentuh 1. Jawaban: 2 bata — jawaban B.'
      : 'Explainer: Brick 2 (bottom-middle) and Brick 4 (middle step) each touch exactly 3 other bricks. Brick 1 touches 1, Brick 3 touches 2, Brick 5 touches 1. Answer: 2 bricks — answer B.'

  // On result beat, highlight correct bricks (B2=idx 1, B4=idx 3)
  const illustrationHighlights = isResult ? (beat.correctBricks ?? []) : undefined

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Staircase figure — highlights the correct bricks on result beat */}
        <div className="flex justify-center">
          <BrickStaircase width={190} highlights={illustrationHighlights} />
        </div>

        {/* Brick label panels */}
        <div className="flex items-end justify-center gap-1.5 flex-wrap">
          {BRICK_ORDER.map((idx) => {
            const isActive = beat.activeBrick === idx
            return (
              <BrickPanel
                key={idx}
                brickIdx={idx}
                active={isActive || (isResult && (beat.correctBricks ?? []).includes(idx))}
                passes={
                  isResult
                    ? (beat.correctBricks ?? []).includes(idx)
                      ? true
                      : null
                    : isActive
                      ? beat.passes
                      : null
                }
                showCount={isActive || (isResult && (beat.correctBricks ?? []).includes(idx))}
              />
            )
          })}
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
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{
                  background:
                    isResult
                      ? GREEN
                      : beat.passes === true
                        ? GREEN
                        : beat.passes === false
                          ? RED
                          : BLUE,
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
