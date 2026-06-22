import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BoxWeights22EC } from './BoxWeights22ECIllustration'
import { buildBoxWeights22ECSteps } from './boxWeights22ECSteps'

// Palette echoes the static crate illustration (qupu tokens).
const INK        = '#1F2937'
const BRAND_BLUE = '#30598A'  // qupu-brand-blue
const SHELL      = '#FFF9F4'  // qupu-shell (panel bg)
const WARM_GREY  = '#E4DACB'  // panel border / tray rim
const GREEN      = '#10B981'
const GREEN_DARK = '#065F46'
const RED        = '#EF4444'
const RED_DARK   = '#991B1B'
const ORANGE     = '#f0853a'  // qupu-brand-orange

export default function BoxWeights22ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBoxWeights22ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    'Boxes 1 and 4 contain apples: 7 kg + 2 kg = 9 kg. Banana boxes total 27 kg = 3 × 9 kg. Answer E.',
    'Kotak 1 dan 4 berisi apel: 7 kg + 2 kg = 9 kg. Kotak pisang berjumlah 27 kg = 3 × 9 kg. Jawaban E.',
  )

  // Caption background styling based on phase.
  const captionStyle = (() => {
    if (beat.result) {
      return { background: '#D1FAE5', borderColor: GREEN, color: GREEN_DARK }
    }
    if (beat.testOk && beat.phase === 'tryE') {
      return { background: '#D1FAE5', borderColor: GREEN, color: GREEN_DARK }
    }
    if (beat.testLine && !beat.testOk) {
      return { background: '#FEE2E2', borderColor: RED, color: RED_DARK }
    }
    if (beat.phase === 'ratio') {
      return { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
    }
    return { background: '#FFFFFF', borderColor: BRAND_BLUE, color: INK }
  })()

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[280px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: WARM_GREY }}
      >
        {/* ── info line: total / ratio / test ────────────────────────────── */}
        <div className="flex min-h-[28px] w-full items-center justify-center gap-2">
          {beat.phase === 'total' && beat.totalLine && (
            <motion.span
              key="total"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="font-display text-sm font-extrabold tabular-nums"
              style={{ color: BRAND_BLUE }}
            >
              {beat.totalLine}
            </motion.span>
          )}

          {beat.phase === 'ratio' && beat.ratioLine && (
            <motion.span
              key="ratio"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="font-display text-xs font-extrabold"
              style={{ color: BRAND_BLUE }}
            >
              {beat.ratioLine}
            </motion.span>
          )}

          {beat.testLine && (
            <motion.span
              key={`test-${beat.phase}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="font-display text-sm font-extrabold tabular-nums"
              style={{ color: beat.testOk ? GREEN_DARK : RED_DARK }}
            >
              {beat.testLine}
            </motion.span>
          )}

          {beat.result && (
            <motion.span
              key="result"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 20 }}
              className="font-display text-base font-black"
              style={{ color: GREEN_DARK }}
            >
              {T('Boxes 1 & 4 = 9 kg ✓', 'Kotak 1 & 4 = 9 kg ✓')}
            </motion.span>
          )}

          {beat.phase === 'goal' && (
            <span className="font-display text-sm font-extrabold" style={{ color: INK }}>
              {T('Which boxes hold apples?', 'Kotak mana yang berisi apel?')}
            </span>
          )}
        </div>

        {/* ── the five crates ─────────────────────────────────────────────── */}
        <BoxWeights22EC litBoxes={beat.litBoxes} />

        {/* ── apple-weight chip (visible from ratio onward) ───────────────── */}
        {beat.phase !== 'goal' && beat.phase !== 'total' && (
          <motion.div
            key="chip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 rounded-xl border-2 px-3 py-1.5"
            style={{ background: '#FFF2DF', borderColor: ORANGE }}
          >
            <span className="font-display text-xs font-extrabold" style={{ color: INK }}>
              {T('Apple total:', 'Total apel:')}
            </span>
            <span className="font-display text-lg font-black tabular-nums" style={{ color: ORANGE }}>
              9 kg
            </span>
          </motion.div>
        )}

        {/* ── caption ──────────────────────────────────────────────────────── */}
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
