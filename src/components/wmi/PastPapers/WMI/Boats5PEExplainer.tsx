/**
 * IKMC-23-PE-Q5 — post-answer explainer: "Which boat is mine?"
 *
 * Teaches the two-condition elimination strategy:
 *   Beat 0 — intro: state both conditions.
 *   Beat 1 — apply circles > 1: eliminate C (only 1 circle).
 *   Beat 2 — check A: 1−1=0 ≠ 2, eliminated.
 *   Beat 3 — check B: 3−2=1 ≠ 2, eliminated.
 *   Beat 4 — check D: 1−3=−2 ≠ 2, eliminated.
 *   Beat 5 — result: only E satisfies both → answer E.
 *
 * Reuses BoatSVG from Boats5PEIllustration so the option figures look
 * identical to the choice cards, just with eliminated/highlight overlays.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BoatSVG, BOAT_DATA } from './Boats5PEIllustration'
import { buildBoats5PESteps } from './boats5PESteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED        = '#EF4444'
const RED_BG     = '#FEE2E2'
const BLUE       = '#3B82F6'
const BLUE_BG    = '#EFF6FF'
const BLUE_TEXT  = '#1E40AF'
const INK        = '#1F2937'
const GREY       = '#D1D5DB'

// ---------------------------------------------------------------------------
// BoatPanel — one boat card with eliminated/active/neutral state
// ---------------------------------------------------------------------------

interface BoatPanelProps {
  label: string
  isEliminated: boolean
  isActive: boolean
  isAnswer: boolean
}

function BoatPanel({ label, isEliminated, isActive, isAnswer }: BoatPanelProps) {
  const data = BOAT_DATA[label]
  if (!data) return null

  let borderColor = GREY
  if (isAnswer && isActive) borderColor = GREEN
  else if (isEliminated) borderColor = RED
  else if (isActive) borderColor = BLUE

  const bg = isAnswer && isActive ? GREEN_BG
    : isEliminated ? RED_BG
    : '#FFFFFF'

  return (
    <motion.div
      layout
      className="relative flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: bg,
        minWidth: 62,
        opacity: isEliminated && !isActive ? 0.45 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      <BoatSVG label={label} />

      {/* Option label badge */}
      <span
        className="font-display text-xs font-bold"
        style={{
          color: isAnswer && isActive ? GREEN_TEXT
            : isEliminated ? RED
            : isActive ? BLUE_TEXT
            : INK,
        }}
      >
        {label}
      </span>

      {/* Eliminated X overlay */}
      <AnimatePresence>
        {isEliminated && (
          <motion.div
            key={`x-${label}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              pointerEvents: 'none',
            }}
          >
            <svg width={38} height={38} viewBox="0 0 38 38" style={{ opacity: 0.75 }}>
              <line x1={5} y1={5} x2={33} y2={33} stroke={RED} strokeWidth={3.5} strokeLinecap="round" />
              <line x1={33} y1={5} x2={5} y2={33} stroke={RED} strokeWidth={3.5} strokeLinecap="round" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer tick */}
      <AnimatePresence>
        {isAnswer && isActive && (
          <motion.div
            key={`tick-${label}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="rounded px-1 py-0.5 font-display text-[10px] font-bold"
            style={{ background: GREEN_BG, color: GREEN_TEXT, border: `1.5px solid ${GREEN}` }}
          >
            ✓ E
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

export default function Boats5PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBoats5PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE_TEXT }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: eliminasi dengan dua kondisi — lingkaran>1 (coret C) lalu segitiga−persegi=2 (coret A,B,D). Hanya E memenuhi keduanya. Jawaban E.'
      : 'Explainer: two-condition elimination — circles>1 (cross out C), then triangles−squares=2 (cross out A,B,D). Only E satisfies both. Answer E.'

  const eliminatedSet = new Set(beat.eliminated)

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five boat panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {LABELS.map((lbl) => (
            <BoatPanel
              key={lbl}
              label={lbl}
              isEliminated={eliminatedSet.has(lbl)}
              isActive={beat.active === lbl}
              isAnswer={beat.result && lbl === 'E'}
            />
          ))}
        </div>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.75, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: beat.result ? GREEN : BLUE }}
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
