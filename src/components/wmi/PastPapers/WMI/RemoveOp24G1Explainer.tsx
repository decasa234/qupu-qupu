import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { RemoveOp24G1 } from './RemoveOp24G1Illustration'
import { buildRemoveOp24Steps } from './removeOp24G1Steps'

// WMI-24F1A-Q23 — post-answer animation. Try-and-eliminate from the left:
//   • join 9,8 → 98 makes the whole expression 106, a 3-digit number → ✗
//   • join 8,7 → 87 → 9 + 87 + 6 − 5 − 4 + 3 + 2 − 1 = 97, a 2-digit number ✓
//   • check the next merges (7,6 → 88; 6,5 → 89): valid but smaller, so 97 wins.
// The figure is the RemoveOp24G1 primitive driven by `removeOpIndex`; only the
// WINNER beat prints "= 97" (the primitive's result line is buggy elsewhere — see
// removeOp24G1Steps.ts — so every other arithmetic value lives in the caption).

// qupu tokens echoed as hex so the SVG + badges read as the same scene.
const BLUE = '#30598A' // fill-qupu-brand-blue
const ORANGE = '#f0853a' // stroke-qupu-brand-orange
const GREEN = '#10B981'
const RED = '#DC2626'

export default function RemoveOp24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRemoveOp24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Verdict badge text + colour for the current try.
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  let badge: { text: string; color: string; bg: string } | null = null
  if (beat.win) {
    badge = { text: t(`= ${story.answer} ✓ biggest`, `= ${story.answer} ✓ terbesar`), color: '#065F46', bg: '#D1FAE5' }
  } else if (beat.phase === 'try' && beat.total !== null) {
    if (beat.twoDigit) {
      badge = {
        text: t(`= ${beat.total} ✓ (2-digit)`, `= ${beat.total} ✓ (2 angka)`),
        color: BLUE,
        bg: '#E1EFFB',
      }
    } else {
      badge = {
        text: t(`= ${beat.total} ✗ (3-digit)`, `= ${beat.total} ✗ (3 angka)`),
        color: RED,
        bg: '#FEE2E2',
      }
    }
  }

  const aria = t(
    `Pull out the plus between 8 and 7 so they join into 87: 9 + 87 + 6 − 5 − 4 + 3 + 2 − 1 = ${story.answer}, the largest 2-digit result.`,
    `Cabut tanda tambah di antara 8 dan 7 sehingga menyatu menjadi 87: 9 + 87 + 6 − 5 − 4 + 3 + 2 − 1 = ${story.answer}, hasil 2 angka terbesar.`,
  )

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        {/* The expression row, with the lifted operator + merge animating in. A
            fresh key per beat lets framer-motion re-run the lift each try. */}
        <motion.div
          key={index}
          className="w-full"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          <RemoveOp24G1 removeOpIndex={beat.removeOpIndex} showResult={beat.showResult} />
        </motion.div>

        {/* Verdict badge — pops for each try so the keep/reject reads. */}
        {badge && (
          <motion.div
            key={`badge-${index}`}
            className="rounded-full border-2 px-3 py-1 font-display text-sm font-black tabular-nums"
            style={{ background: badge.bg, borderColor: badge.color, color: badge.color }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            {badge.text}
          </motion.div>
        )}

        {/* Caption box — house style: blue for steps, green for the winner. */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>

      {/* Hidden style anchor so the orange token is referenced (mirrors the figure
          stroke) even though the SVG owns the actual stroke. */}
      <span aria-hidden className="hidden" style={{ color: ORANGE }} />
    </div>
  )
}
