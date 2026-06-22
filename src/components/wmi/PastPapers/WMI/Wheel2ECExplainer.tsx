// IKMC-22-EC-Q2 — "Four of the following are a picture of the Great Wheel at
// the Luna park. Which one is the different one?"  Answer: E.
//
// Animation beats (see wheel2ECSteps):
//   0. intro    — show all five wheels; state the task.
//   1. rule     — explain the alternating pattern rule.
//   2. check-A  — spotlight A: strictly alternating ✓
//   3. check-B  — spotlight B: strictly alternating ✓
//   4. check-C  — spotlight C: strictly alternating ✓
//   5. check-D  — spotlight D: strictly alternating ✓
//   6. spot-E   — spotlight E: TWO yellows adjacent at the top ✗
//   7. result   — E is the odd one out.
//
// Reuses WheelDiagram and OPTION_E_COLORS from Wheel2ECIllustration.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { WheelDiagram, standardColors, OPTION_E_COLORS } from './Wheel2ECIllustration'
import { buildWheel2ECSteps } from './wheel2ECSteps'

// ── palette ──────────────────────────────────────────────────────────────────
const GREEN    = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const RED      = '#DC2626'
const RED_BG   = '#FEE2E2'
const RED_INK  = '#991B1B'
const BLUE_INK = '#30598A'
const BLUE_BG  = '#E1EFFB'

// ── option color maps (duplicated locally to keep explainer self-contained) ──
const OPTION_COLORS = {
  A: standardColors(1),
  B: standardColors(0),
  C: standardColors(3),
  D: standardColors(2),
  E: OPTION_E_COLORS,
} as const

type OptionKey = keyof typeof OPTION_COLORS

// ── sub-components ────────────────────────────────────────────────────────────

/**
 * OptionCard — one Ferris wheel with a label, with optional highlight ring
 * and verdict badge.
 */
function OptionCard({
  label,
  active,
  verdict,
}: {
  label: OptionKey
  active: boolean
  verdict: 'none' | 'ok' | 'fail'
}) {
  const ringColor =
    verdict === 'ok'
      ? GREEN
      : verdict === 'fail'
        ? RED
        : active
          ? BLUE_INK
          : 'transparent'

  const bgColor =
    verdict === 'ok'
      ? GREEN_BG
      : verdict === 'fail'
        ? RED_BG
        : active
          ? BLUE_BG
          : 'transparent'

  return (
    <motion.div
      key={label}
      layout
      animate={{
        scale: active || verdict !== 'none' ? 1 : 0.88,
        opacity: active || verdict !== 'none' ? 1 : 0.45,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="flex flex-col items-center gap-1 rounded-xl p-1.5"
      style={{
        border: `2.5px solid ${ringColor}`,
        background: bgColor,
        minWidth: 64,
      }}
    >
      <WheelDiagram colors={OPTION_COLORS[label]} width={56} />
      <div className="flex items-center gap-1">
        <span
          className="font-display text-xs font-black"
          style={{ color: verdict === 'fail' ? RED_INK : verdict === 'ok' ? GREEN_INK : BLUE_INK }}
        >
          {label}
        </span>
        <AnimatePresence>
          {verdict === 'ok' && (
            <motion.span
              key="ok"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              aria-hidden="true"
              style={{ color: GREEN, fontSize: 12, fontWeight: 900 }}
            >
              ✓
            </motion.span>
          )}
          {verdict === 'fail' && (
            <motion.span
              key="fail"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              aria-hidden="true"
              style={{ color: RED, fontSize: 12, fontWeight: 900 }}
            >
              ✗
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── main explainer ─────────────────────────────────────────────────────────────

export default function Wheel2ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildWheel2ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const ariaLabel = t(
    'Explainer: check each Ferris wheel picture. A through D are the same wheel in different rotation states, all with strictly alternating blue and yellow gondolas. Picture E has two yellow gondolas next to each other at the top, breaking the alternating rule. Answer: E.',
    'Penjelasan: cek setiap gambar Kincir Besar. A hingga D adalah kincir yang sama dalam berbagai posisi putaran, semua dengan gondola biru dan kuning bergantian dengan sempurna. Gambar E memiliki dua gondola kuning berdampingan di bagian atas, melanggar aturan bergantian. Jawaban: E.',
  )

  const labels: OptionKey[] = ['A', 'B', 'C', 'D', 'E']

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* five option cards in a row */}
        <div className="flex flex-wrap items-center justify-center gap-2" aria-hidden="true">
          {labels.map((label) => {
            const isActive = beat.highlight === label
            const verdict =
              isActive && beat.showCheck
                ? 'ok'
                : isActive && beat.showCross
                  ? 'fail'
                  : // on the result beat, all ✓ options persist as ok and E stays fail
                    isResult && label !== 'E'
                    ? 'ok'
                    : isResult && label === 'E'
                      ? 'fail'
                      : 'none'

            return (
              <OptionCard
                key={label}
                label={label}
                active={isActive}
                verdict={verdict}
              />
            )
          })}
        </div>

        {/* pattern rule chip — shown from beat 1 onward */}
        <AnimatePresence>
          {index >= 1 && (
            <motion.div
              key="rule-chip"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              className="flex items-center gap-2 rounded-full border-2 px-3 py-1 font-display text-xs font-extrabold"
              style={{
                background: isResult ? GREEN_BG : BLUE_BG,
                borderColor: isResult ? GREEN : BLUE_INK,
                color: isResult ? GREEN_INK : BLUE_INK,
              }}
              aria-hidden="true"
            >
              {/* colour-dot pair showing the alternating rule */}
              <span
                style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#3B9AE1', border: '1.5px solid #1F2937' }}
              />
              <span
                style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#F5C842', border: '1.5px solid #1F2937' }}
              />
              <span>
                {t('alternates all the way round', 'bergantian mengelilingi seluruh roda')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* caption box */}
        <div
          className="min-h-[3.5rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
