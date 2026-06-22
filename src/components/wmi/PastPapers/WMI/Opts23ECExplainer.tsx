import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildOpts23ECSteps } from './opts23ECSteps'
import { Opts23ECOption } from './Opts23ECIllustration'

// IKMC-23-EC-Q23 — post-answer beat-by-beat animation.
//
// Shows each L-shaped option being checked against the grid rule.
// Beat 0: intro (grid rule)
// Beat 1–5: check each option A–E
// Beat 6: result — highlight C in green

// ── Colour tokens ─────────────────────────────────────────────────────────────

const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_FG  = '#065F46'
const RED       = '#DC2626'
const RED_BG    = '#FEE2E2'

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function Opts23ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildOpts23ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult  = beat.result
  const isAnswer  = beat.isAnswer
  const isInvalid = beat.optionLabel !== null && !isAnswer && !isResult

  // Caption style
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_FG }
    : isAnswer
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_FG }
    : isInvalid
    ? { background: RED_BG, borderColor: RED, color: '#991B1B' }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  // Equation pill colour
  const equationBg = isResult
    ? GREEN
    : isAnswer
    ? GREEN
    : isInvalid
    ? RED
    : BLUE

  // Highlight ring around the option SVG
  const optionHighlight = isResult
    ? GREEN
    : isAnswer
    ? GREEN
    : isInvalid
    ? RED
    : BLUE

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Periksa setiap pilihan menggunakan aturan grid: kanan +1, bawah +10. Hanya C yang memiliki langkah yang valid (22→32→33→43). Jawaban C.'
      : 'Explainer: Check each option using the grid rule: right +1, down +10. Only C has valid steps (22→32→33→43). Answer C.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* option panel — show the current option's L-piece with a highlight ring */}
        <div
          style={{
            minHeight: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <AnimatePresence mode="wait">
            {beat.optionLabel && (
              <motion.div
                key={`opt-${beat.optionLabel}-${isResult ? 'result' : beat.phase}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {/* option label */}
                <span
                  className="font-display text-xs font-black"
                  style={{ color: optionHighlight }}
                >
                  {lang === 'id'
                    ? `Pilihan ${beat.optionLabel}`
                    : `Option ${beat.optionLabel}`}
                </span>

                {/* the L-piece SVG wrapped in a highlight ring */}
                <div
                  style={{
                    borderRadius: 6,
                    border: `2.5px solid ${optionHighlight}`,
                    padding: 4,
                    background: isAnswer || isResult ? GREEN_BG : undefined,
                  }}
                >
                  <Opts23ECOption
                    choice={{ label: beat.optionLabel, text: beat.optionLabel }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
