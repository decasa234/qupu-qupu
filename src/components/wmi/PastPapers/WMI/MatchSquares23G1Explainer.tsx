import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { MatchSquares23G1, ANSWER } from './MatchSquares23G1Illustration'
import { buildMatchSquaresSteps, type BlockView } from './matchSquares23G1Steps'

// WMI-23F1A-Q23 — smallest x of matchsticks that builds a 1×a, 2×b AND 4×c block
// of squares (answer 22). Try-and-eliminate: the 4-row block is the most
// restrictive, so we walk its totals x = 9c+4 = 13, 22, … and for each candidate
// ask whether the SAME x can also form a 1×a and a 2×b block. 13 dies on the 2×b
// test; 22 clears all three. Each beat shows the solved blocks (reusing the
// MatchSquares23G1 primitive with config + cols + showCount) so the animation
// reads as the static figure coming alive. Rejections linger; the winner lands
// last with hold 0.

const STICK = '#C8956C' // matchstick tan, echoing the primitive
const ORANGE = '#f0853a' // fill-qupu-orange — the count accent
const GREEN = '#10B981'
const RED = '#DC2626'

// Stable key per block so AnimatePresence can pop/replace them as the set grows.
function blockKey(b: BlockView): string {
  return `${b.config}-${b.cols}`
}

export default function MatchSquares23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildMatchSquaresSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: the 4-row block is the most restrictive, so test its totals 13, 22, … 13 fails the 2-row check, 22 builds 1×7, 2×4 and 4×2 — the smallest x is ${ANSWER}.`,
    `Penjelasan: blok 4 baris paling membatasi, jadi uji totalnya 13, 22, … 13 gagal di cek 2 baris, 22 membuat 1×7, 2×4, dan 4×2 — x terkecil adalah ${ANSWER}.`,
  )

  const candidateColor = beat.result ? GREEN : beat.reject ? RED : ORANGE

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line legend: the stick-count rule, always visible */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          <span aria-hidden className="inline-block h-1 w-4 rounded-full" style={{ background: STICK }} />
          {t('Same x sticks must build all three', 'Batang x sama harus membuat ketiganya')}
        </div>

        {/* candidate total being tested (the 4-row block drives it) */}
        {beat.candidate != null && (
          <motion.div
            key={beat.candidate + (beat.reject ? '-x' : '') + (beat.result ? '-ok' : '')}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="font-display text-lg font-black tabular-nums"
            style={{ color: candidateColor }}
          >
            {beat.c != null
              ? t(`x = 9×${beat.c} + 4 = ${beat.candidate}`, `x = 9×${beat.c} + 4 = ${beat.candidate}`)
              : `x = ${beat.candidate}`}
          </motion.div>
        )}

        {/* solved blocks for this beat, drawn by the shared primitive. Before any
            candidate survives, show the three generic labelled rows so the figure
            is always present. */}
        <div className="flex min-h-[3.5rem] flex-col items-center gap-1">
          {beat.blocks.length === 0 && <MatchSquares23G1 />}
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.blocks.map((b) => (
              <motion.div
                key={blockKey(b)}
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <MatchSquares23G1 config={b.config} cols={b.cols} showCount />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.reject
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : beat.candidate != null
                  ? { background: '#FFF7ED', borderColor: ORANGE, color: '#9A3412' }
                  : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
