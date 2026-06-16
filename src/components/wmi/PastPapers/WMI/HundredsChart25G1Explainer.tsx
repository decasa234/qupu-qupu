import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import HundredsChart25G1Option from './HundredsChart25G1Option'
import HundredsChart25G1Illustration from './HundredsChart25G1Illustration'
import { buildHundredsChart25G1Steps } from './hundredsChart25G1Steps'

/**
 * Post-answer explainer for WMI-25F1A-Q8 (2025 Grade 1 Final).
 *
 * Teaches the method, not the answer: it first states the hundreds-chart rule
 * (right +1, down +10) over the stem figure, then walks the options one per
 * beat — rendering each real fragment with <HundredsChart25G1Option> and
 * deriving the value the rule forces into the blank. A → 35 ✓, B → 35 ✓,
 * C → 35 ✓, D → 35 ✓ all confirm, then E → 26 ✗ is the one where 35 does NOT
 * belong, so E is the answer. SSR-safe (renders an <svg> fragment every beat),
 * deterministic, bilingual.
 */

// Hex echoes of the fill-qupu-* tokens used by the static figure, so the
// animation reads as the same scene coming alive.
const BLUE = '#30598A' // fill-qupu-brand-blue
const ORANGE = '#f0853a' // fill-qupu-brand-orange
const GREEN = '#10B981'
const RED = '#DC2626'

export default function HundredsChart25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildHundredsChart25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    `Strategy: in a hundreds chart, right adds 1 and down adds 10. The rule gives 35 for options A, B, C and D, but 26 for E — so 35 does not belong in E. The answer is ${story.answer}.`,
    `Strategi: di papan seratus, ke kanan menambah 1 dan ke bawah menambah 10. Aturan ini memberi 35 untuk pilihan A, B, C dan D, tetapi 26 untuk E — jadi 35 tak cocok di E. Jawabannya ${story.answer}.`,
  )

  const showFragment = beat.phase !== 'rule' && beat.label != null
  const accent = beat.result || !beat.ok ? (beat.result ? GREEN : RED) : beat.ok ? GREEN : BLUE

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Rule beat anchors on the stem figure; option beats show the fragment. */}
        <div className="flex min-h-[120px] items-center justify-center">
          {beat.phase === 'rule' ? (
            <HundredsChart25G1Illustration />
          ) : (
            <motion.div
              key={beat.label ?? 'frag'}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="font-display text-xs font-extrabold"
                style={{ color: BLUE }}
              >
                {t('Option', 'Pilihan')} {beat.label}
              </div>
              {showFragment && (
                <HundredsChart25G1Option choice={{ label: beat.label as string, text: '' }} />
              )}
            </motion.div>
          )}
        </div>

        {/* The value the rule forces into the blank, with a verdict glyph. */}
        {beat.resolved != null && (
          <motion.div
            key={`${index}-resolved`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="flex items-center gap-2 font-display text-lg font-black tabular-nums"
            style={{ color: accent }}
          >
            <span>{t('blank', 'kotak')} = {beat.resolved}</span>
            <span aria-hidden="true">{beat.ok ? '✓' : '✗'}</span>
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'check' && !beat.ok
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : beat.phase === 'check'
                  ? { background: '#FFFFFF', borderColor: GREEN, color: '#065F46' }
                  : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>

        {/* A quiet legend of the rule stays under every option check. */}
        {beat.phase !== 'rule' && (
          <div className="font-display text-[11px] font-bold" style={{ color: ORANGE }}>
            {t('right +1   ·   down +10', 'kanan +1   ·   bawah +10')}
          </div>
        )}
      </div>
    </div>
  )
}
