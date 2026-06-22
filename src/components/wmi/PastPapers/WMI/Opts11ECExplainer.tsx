import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  RulerPrimitive,
  RULER_OPTS,
  RULER_VW,
  RULER_VH,
  HIGHLIGHT_M1,
  HIGHLIGHT_M2,
} from './Opts11ECIllustration'
import { buildOpts11ECSteps } from './opts11ECSteps'

// IKMC-23-EC-Q11 — post-answer beat-by-beat animation.
//
// Shows the ruler being analysed on each beat with highlighted tick marks.
// Beats:
//   0  goal     — no ruler; state the C(4,2)=6 task
//   1  check-D  — Ruler D (10,20); ticks glowing; distances listed
//   2  check-E  — Ruler E (10,40); ticks glowing; distances listed
//   3  result   — Ruler E confirmed; answer E

// ── Colour tokens ─────────────────────────────────────────────────────────────

const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_FG   = '#065F46'
const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'
const RED        = '#DC2626'
const ACCENT     = '#f0853a'

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function Opts11ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildOpts11ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const isCheckD = beat.phase === 'check-D'
  const isCheckE = beat.phase === 'check-E'

  // Accent colour: blue for m1 tick, red for m2 tick — override per check
  const m1Color = isResult ? GREEN : isCheckD ? RED : HIGHLIGHT_M1
  const m2Color = isResult ? GREEN : isCheckD ? RED : HIGHLIGHT_M2

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_FG }
    : isCheckD
    ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  // Pick the equation pill colour
  const equationBg = isResult
    ? GREEN
    : isCheckD
    ? RED
    : isCheckE
    ? BLUE
    : ACCENT

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Penggaris D (10,20) menghasilkan jarak duplikat → ✗. Penggaris E (10,40) menghasilkan 10, 30, 20, 40, 50, 60 — semua enam nilai → ✓. Jawaban E.'
      : 'Explainer: Ruler D (10,20) gives duplicate distances → ✗. Ruler E (10,40) gives 10, 30, 20, 40, 50, 60 — all six values → ✓. Answer E.'

  const data = beat.rulerKey ? RULER_OPTS[beat.rulerKey] : null

  // Label shown above ruler on check beats
  const rulerLabel = beat.rulerKey
    ? lang === 'id'
      ? `Penggaris ${beat.rulerKey}`
      : `Ruler ${beat.rulerKey}`
    : null

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure — ruler SVG (always rendered; content varies by beat) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {rulerLabel && (
            <AnimatePresence mode="wait">
              <motion.span
                key={`label-${beat.rulerKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="font-display text-xs font-black"
                style={{
                  color: isResult ? GREEN : isCheckD ? RED : BLUE,
                }}
              >
                {rulerLabel}
              </motion.span>
            </AnimatePresence>
          )}
          <svg
            viewBox={`0 0 ${RULER_VW} ${RULER_VH}`}
            width={RULER_VW}
            height={RULER_VH}
            aria-hidden="true"
            style={{ display: 'block' }}
          >
            <rect x={0} y={0} width={RULER_VW} height={RULER_VH} fill="white" />
            <AnimatePresence mode="wait">
              {data && (
                <motion.g
                  key={`ruler-${beat.rulerKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <RulerPrimitive
                    m1={data.m1}
                    m2={data.m2}
                    highlightM1={beat.highlightM1}
                    highlightM2={beat.highlightM2}
                    accentColor={isResult ? GREEN : isCheckD ? RED : HIGHLIGHT_M1}
                  />
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>

        {/* equation pill */}
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
                style={{ background: equationBg }}
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
