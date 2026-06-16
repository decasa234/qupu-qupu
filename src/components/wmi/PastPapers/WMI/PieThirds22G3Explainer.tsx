// Post-answer animation for WMI-22F3A-Q2 — "In how many of the five circles
// is exactly 1/3 shaded?"  Answer C = 3.
//
// Strategy shown: inspect each circle, reduce its fraction, compare to 1/3,
// keep a running tally.  One beat per circle + intro + conclusion.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PieDiagram } from './PieThirds22G3Illustration'
import { buildPieThirdsSteps } from './pieThirds22G3Steps'

// Colour tokens echoing the illustration palette
const PIE_PINK   = '#F9C4CB'
const PIE_STROKE = '#1F2937'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_DARK = '#065F46'
const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'
const RED        = '#EF4444'
const RED_BG     = '#FEE2E2'
const RED_DARK   = '#991B1B'
const GREY_BG    = '#F3F4F6'
const GREY_STROKE= '#9CA3AF'

// Per-circle data — must match illustration file exactly.
const CIRCLES = [
  { segments: 3,  shadedIndices: [0] },
  { segments: 10, shadedIndices: [0, 2, 4, 6] },
  { segments: 6,  shadedIndices: [3, 4] },
  { segments: 12, shadedIndices: [6, 7, 8, 9] },
  { segments: 12, shadedIndices: [0, 2, 4, 6, 8] },
]

const PASSES = [true, false, true, true, false]

const R   = 40   // pie radius in SVG units
const VB  = 92   // square viewBox per pie card

// Small self-contained pie card (no extra layout helpers needed)
function PieCard({
  index,
  active,
  done,
  passes,
}: {
  index: number
  active: boolean
  done: boolean
  passes: boolean | null  // null = not yet checked
}) {
  const c = CIRCLES[index]

  let ringColor = GREY_STROKE
  let bg = GREY_BG
  if (active) {
    ringColor = passes === true ? GREEN : passes === false ? RED : BLUE
    bg = passes === true ? GREEN_BG : passes === false ? RED_BG : BLUE_BG
  } else if (done) {
    ringColor = passes === true ? GREEN : RED
    bg = passes === true ? GREEN_BG : RED_BG
  }

  return (
    <motion.div
      layout
      animate={{ scale: active ? 1.08 : 1, opacity: done || active ? 1 : 0.45 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      style={{
        border: `2px solid ${ringColor}`,
        background: bg,
        borderRadius: 12,
        padding: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        width={64}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <PieDiagram
          segments={c.segments}
          shadedIndices={c.shadedIndices}
          r={R}
          cx={VB / 2}
          cy={VB / 2}
          stroke={PIE_STROKE}
          strokeWidth={2}
        />
      </svg>
      {/* Tick / cross badge */}
      {(active || done) && passes !== null && (
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: passes ? GREEN_DARK : RED_DARK,
            lineHeight: 1,
          }}
        >
          {passes ? '✓' : '✗'}
        </span>
      )}
    </motion.div>
  )
}

export default function PieThirds22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildPieThirdsSteps(lang), [lang])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.steps.length - 1]

  // Determine which circles have been evaluated and which is active.
  // Beat 0 = intro (circleIndex null), beats 1-5 = circles 0-4, beat 6 = result.
  const activeCircle: number | null = beat.circleIndex
  // A circle is "done" if its beat has already passed (beat index > circle beat).
  const doneBefore = (ci: number) => index > ci + 1  // circle ci is on beat ci+1

  const aria = t(
    'Checking each circle: 1/3, 2/5, 1/3, 1/3, 5/12 — three circles show 1/3. Answer C.',
    'Memeriksa tiap lingkaran: 1/3, 2/5, 1/3, 1/3, 5/12 — tiga lingkaran menunjukkan 1/3. Jawaban C.',
  )

  const captionStyle = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_DARK }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  // Running tally display
  const tallyValue = beat.tally

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">

        {/* Five pie cards in a flex row, wrapping if needed */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            justifyContent: 'center',
          }}
        >
          {CIRCLES.map((_, ci) => {
            const isActive = activeCircle === ci
            const isDone   = doneBefore(ci)
            // passes value: if not yet reached → null, if active → from beat, if done → from PASSES
            const passesVal: boolean | null =
              isActive ? beat.passes :
              isDone   ? PASSES[ci] :
              null
            return (
              <PieCard
                key={ci}
                index={ci}
                active={isActive}
                done={isDone}
                passes={passesVal}
              />
            )
          })}
        </div>

        {/* Fraction arithmetic label for the active circle */}
        <AnimatePresence mode="wait">
          {beat.fraction && (
            <motion.div
              key={beat.fraction}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              style={{
                fontFamily: 'inherit',
                fontSize: 16,
                fontWeight: 800,
                color: beat.passes ? GREEN_DARK : RED_DARK,
                background: beat.passes ? GREEN_BG : RED_BG,
                border: `1.5px solid ${beat.passes ? GREEN : RED}`,
                borderRadius: 8,
                padding: '2px 12px',
              }}
            >
              {beat.fraction}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Running tally badge */}
        {tallyValue !== undefined && (
          <motion.div
            layout
            animate={{ scale: beat.result ? 1.12 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: beat.result ? GREEN_BG : BLUE_BG,
              border: `1.5px solid ${beat.result ? GREEN : BLUE}`,
              borderRadius: 8,
              padding: '2px 12px',
              fontSize: 14,
              fontWeight: 700,
              color: beat.result ? GREEN_DARK : BLUE,
            }}
          >
            {/* Three small tally pies */}
            {[0, 1, 2].map((i) => {
              const filled = i < tallyValue
              return (
                <svg
                  key={i}
                  width={16}
                  height={16}
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                  style={{ display: 'inline-block' }}
                >
                  <circle
                    cx={16}
                    cy={16}
                    r={14}
                    fill={filled ? PIE_PINK : '#fff'}
                    stroke={filled ? (beat.result ? GREEN : BLUE) : GREY_STROKE}
                    strokeWidth={2}
                  />
                </svg>
              )
            })}
            <span>
              {t(`= ${tallyValue} of 5`, `= ${tallyValue} dari 5`)}
            </span>
          </motion.div>
        )}

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
