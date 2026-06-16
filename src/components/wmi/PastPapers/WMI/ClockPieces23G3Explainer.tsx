import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ClockPieces23G3 } from './ClockPieces23G3Illustration'
import { buildClockPiecesSteps, ANSWER, PIECE_SUM } from './clockPieces23G3Steps'

// WMI-23F3A-Q11 — a clock face (1–12) cut into 4 sector pieces. Two pieces each
// sum to 26; find the difference between the OTHER two piece sums (answer D=12).
//
// We DEDUCE it beat by beat, never jumping to the answer:
//   1) the whole clock 1–12 adds to 78;
//   2) confirm the top given piece 11+12+1+2 = 26;
//   3) confirm the bottom given piece 5+6+7+8 = 26 → the two givens make 52;
//   4) so the other two together = 78 − 52 = 26, namely {3,4}=7 and {9,10}=19;
//   5) difference = 19 − 7 = 12 → D.
// Each beat lights the piece(s) it is summing on the shared ClockPieces23G3
// figure (and flips on showSums for the final stage), so the animation reads as
// the static clock coming alive.

const INK = '#30598A' // fill-qupu-brand-blue — goal / given arithmetic
const GIVEN = '#30598A' // the 26-pieces (blue)
const ORANGE = '#f0853a' // fill-qupu-orange — the leftover unknown pair
const ORANGE_INK = '#9A3412'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const SHELL = '#FFF9F4' // qupu-shell panel
const PEACH = '#FFD3B1'

export default function ClockPieces23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildClockPiecesSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = T(
    `Strategy: the clock 1–12 adds to ${story.total}. The two given pieces make 26 each (52 together), so the other two together make ${story.total} − 52 = 26, namely 7 and 19. Their difference is ${ANSWER} — choice D.`,
    `Strategi: jam 1–12 berjumlah ${story.total}. Dua potong yang diketahui masing-masing 26 (bersama 52), jadi dua potong lainnya bersama = ${story.total} − 52 = 26, yaitu 7 dan 19. Selisihnya ${ANSWER} — pilihan D.`,
  )

  // Tone → colours for the arithmetic chip and caption box.
  const chipColor =
    beat.tone === 'leftover' ? ORANGE_INK : beat.tone === 'win' ? GREEN_INK : INK

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[320px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* one-line goal legend, always present */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          <span aria-hidden>🕛</span>
          {T('Two pieces make 26 — find the other two', 'Dua potong jadi 26 — cari dua lainnya')}
        </div>

        {/* running-arithmetic chip for this beat */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {beat.math && (
              <motion.div
                key={beat.math}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-xl font-black tabular-nums"
                style={{ color: chipColor }}
              >
                {beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* the clock figure coming alive — shared illustrator primitive */}
        <div className="flex items-center justify-center">
          <ClockPieces23G3 highlightPieces={beat.highlight} showSums={beat.showSums} />
        </div>

        {/* piece-sum tally on the final stage (right=7, left=19 → difference) */}
        <AnimatePresence initial={false}>
          {beat.showSums && (
            <motion.div
              key="tally"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 font-display text-base font-black tabular-nums"
            >
              <span style={{ color: ORANGE }}>{`{9,10} = ${PIECE_SUM.left}`}</span>
              <span style={{ color: '#9aa3b2' }}>−</span>
              <span style={{ color: ORANGE }}>{`{3,4} = ${PIECE_SUM.right}`}</span>
              {beat.result && (
                <>
                  <span style={{ color: '#9aa3b2' }}>=</span>
                  <span style={{ color: GREEN_INK }}>{ANSWER}</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* caption box */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : beat.tone === 'leftover'
                ? { background: '#FFF7ED', borderColor: ORANGE, color: ORANGE_INK }
                : { background: '#E1EFFB', borderColor: GIVEN, color: GIVEN }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
