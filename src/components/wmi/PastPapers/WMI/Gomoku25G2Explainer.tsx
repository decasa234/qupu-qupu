import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import type { Lang } from '../concepts/explainers/makeTenSteps'
import { GomokuBoard25G2 } from './Gomoku25G2Illustration'
import { buildGomoku25G2Steps } from './gomoku25G2Steps'

// WMI-25F2A-Q8 (Grade 2 Final) — Gomoku five-in-a-row, post-answer explainer.
//
// Method shown beat by beat (deduce, don't assert): to WIN, Musa needs five
// black stones in a straight line. We hunt the almost-finished black line and
// light its four diagonal stones — 1-6, 2-5, 3-4, 4-3 — one per beat, each a
// "down-right" step. We then reject a tempting neighbour (5-3, choice A) that
// does NOT extend the four into five, and finally ring the empty END of the
// diagonal, 5-2, as the winning move → C.
//
// Reuses the GomokuBoard25G2 primitive (litStones + target) so the animation is
// the SAME scene from the question figure coming alive. SSR-safe / deterministic.

// qupu colour tokens echoed as hex (matching fill-qupu-* usage elsewhere).
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TX = '#065F46'
const RED = '#DC2626'
const RED_BG = '#FEE2E2'
const RED_TX = '#991B1B'
const ORANGE = '#D97706'

export default function Gomoku25G2Explainer(props: ExplainerProps) {
  const lang: Lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildGomoku25G2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Verdict-box styling: red for the rejected try, green for the win, blue otherwise.
  const verdict = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TX }
    : beat.reject
      ? { background: RED_BG, borderColor: RED, color: RED_TX }
      : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  // Candidate-cell chip: shown whenever a target cell is ringed.
  const chip = beat.target
    ? {
        label: `${beat.target.col}−${beat.target.row}`,
        win: beat.result,
      }
    : null

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={t(
        'Four black stones already form a down-right diagonal at 1-6, 2-5, 3-4 and 4-3. The empty end cell 5-2 completes five in a row, so the winning move is 5-2, choice C.',
        'Empat batu hitam sudah membentuk diagonal turun ke kanan di 1-6, 2-5, 3-4, dan 4-3. Kotak ujung kosong 5-2 melengkapi lima sejajar, jadi langkah pemenang adalah 5-2, pilihan C.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <motion.div
          key={index}
          initial={{ scale: 0.985, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          <GomokuBoard25G2 litStones={beat.litStones} target={beat.target} />
        </motion.div>

        {/* Running tally of stones found on the line + the candidate chip. */}
        <div className="flex items-center gap-2 font-display text-xs font-bold">
          <span style={{ color: BLUE }}>
            {t(
              `black in line: ${beat.litStones.length} / 5`,
              `hitam sejajar: ${beat.litStones.length} / 5`,
            )}
          </span>
          {chip && (
            <motion.span
              key={`chip-${chip.label}-${chip.win ? 'w' : 'x'}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              className="rounded-full px-2 py-0.5"
              style={{
                background: chip.win ? GREEN_BG : RED_BG,
                color: chip.win ? GREEN_TX : RED_TX,
                border: `1.5px solid ${chip.win ? GREEN : ORANGE}`,
              }}
            >
              {chip.win ? `${chip.label} ✓` : `${chip.label} ?`}
            </motion.span>
          )}
        </div>

        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={verdict}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
