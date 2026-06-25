/**
 * SEAMOX-22-A-Q19 Explainer — "Find the missing number."
 *
 * Beat-by-beat walkthrough of the difference-of-squares pattern:
 *   Beat 0: Observe the three circles — what is the rule?
 *   Beat 1: Circle 1 — try 3² − 1² = ?
 *   Beat 2: Circle 1 — confirm: 3² − 1² = 8 ✓
 *   Beat 3: Circle 2 — verify: 5² − 4² = 9 ✓  (pattern locked)
 *   Beat 4: Circle 3 — apply: 13² − 6² = 169 − 36 = ?
 *   Beat 5: Circle 3 — reveal: 133 ✓  (ANSWER)
 *
 * Imports CirclePanel from the illustration for shared circle geometry.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CirclePanel } from './CircleSectorsX22A19Illustration'
import { buildCircleSectorsX22A19Steps, CIRCLES_DATA } from './circleSectorsX22A19Steps'

// ── Palette ───────────────────────────────────────────────────────────────────
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const INK       = '#1F2937'
const AMBER     = '#D97706'
const AMBER_BG  = '#FEF3C7'

// Explainer circle geometry (single large circle, 200 × 200 viewBox)
const EX_R  = 65
const EX_CX = 100
const EX_CY = 100

// ── Main explainer ────────────────────────────────────────────────────────────

export default function CircleSectorsX22A19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const steps = useMemo(() => buildCircleSectorsX22A19Steps(lang), [lang])
  const holds  = useMemo(() => steps.map((s) => s.hold), [steps])
  const index  = useBeatControl(steps.length - 1, { ...props, holds })
  const step   = steps[index] ?? steps[steps.length - 1]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const circleData  = CIRCLES_DATA[step.circleIndex]
  const circleLabel = `${T('Circle', 'Lingkaran')} ${step.circleIndex + 1}`

  // Circle 3 bottom shows "?" until Beat 5 reveals the answer
  const showQuestion    = step.circleIndex === 2 && !step.revealAnswer
  const bottomDisplay   = showQuestion ? '?' : String(circleData.bottom)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: pola selisih kuadrat — bawah = kiri² − kanan². ' +
        'Lingkaran 3: 13² − 6² = 169 − 36 = 133.'
      : 'Explainer: difference-of-squares pattern — bottom = left² − right². ' +
        'Circle 3: 13² − 6² = 169 − 36 = 133.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Circle label pill */}
        <span
          className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide"
          style={{ background: BLUE_BG, color: BLUE }}
        >
          {circleLabel}
        </span>

        {/* Circle diagram — one circle at a time, enlarged for clarity */}
        <motion.div
          key={`circle-${step.circleIndex}-${step.highlightBottom}-${String(step.revealAnswer)}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="flex w-full justify-center"
        >
          <svg
            viewBox="0 0 200 200"
            width={200}
            style={{ maxWidth: 200 }}
            aria-hidden="true"
          >
            <CirclePanel
              cx={EX_CX}
              cy={EX_CY}
              r={EX_R}
              left={circleData.left}
              right={circleData.right}
              bottom={bottomDisplay}
              bottomIsQuestion={showQuestion}
              highlightBottom={step.highlightBottom}
              fontSize={17}
            />
          </svg>
        </motion.div>

        {/* Formula annotation badge */}
        {step.showFormula && step.formulaAnnotation ? (
          <motion.div
            key={`formula-${index}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="rounded-full px-4 py-1 text-sm font-bold"
            style={
              step.result
                ? { background: GREEN, color: '#FFFFFF' }
                : { background: AMBER_BG, border: `2px solid ${AMBER}`, color: AMBER }
            }
          >
            {step.formulaAnnotation}
          </motion.div>
        ) : null}

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="min-h-[44px] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            step.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: INK }
          }
        >
          {step.caption}
        </motion.div>

      </div>
    </div>
  )
}
