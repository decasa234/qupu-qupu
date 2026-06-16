import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MatchSquares23G1 } from './MatchSquares23G1Illustration'
import { buildMatch23G3Steps, type BlockView } from './match23G3Steps'

// WMI-23F3A-Q22 (2023 Grade 3 Final) — same x matchsticks build a 1×a, 2×b AND
// 4×c block of squares, x < 100. Find largest + smallest x (answer 89). The
// 4-row block grows fastest (9 sticks/column) so we walk its totals x = 9c+4 =
// 13, 22, 31, … and test each against the 1×a and 2×b blocks. Only 22 and 67
// clear all three under 100 (the next, 112, is over budget). The animation walks
// every candidate, keeps 22 then 67, then sums them. Kept blocks reuse the
// MatchSquares23G1 primitive (config + cols + showCount) so it reads as the
// static figure coming alive. Rejections linger; the sum beat lands last (hold 0).

const STICK = '#C8956C' // matchstick tan, echoing the primitive
const ORANGE = '#f0853a' // fill-qupu-orange — the count accent
const GREEN = '#10B981'
const RED = '#DC2626'

// Stable key per block so AnimatePresence can pop/replace them as the set grows.
function blockKey(b: BlockView): string {
  return `${b.config}-${b.cols}`
}

export default function Match23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildMatch23G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: walk the 4-row totals 13, 22, 31, … and test each against the 1×a and 2×b blocks. Only 22 (1×7, 2×4, 4×2) and 67 (1×22, 2×13, 4×7) work under 100; the next, 112, is over budget. Largest + smallest = ${story.largest} + ${story.smallest} = ${story.answer}.`,
    `Penjelasan: telusuri total 4 baris 13, 22, 31, … dan uji tiap-tiap terhadap blok 1×a dan 2×b. Hanya 22 (1×7, 2×4, 4×2) dan 67 (1×22, 2×13, 4×7) yang cocok di bawah 100; berikutnya, 112, lewat batas. Terbesar + terkecil = ${story.largest} + ${story.smallest} = ${story.answer}.`,
  )

  const candidateColor = beat.reject ? RED : beat.result ? GREEN : ORANGE

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line legend: the stick-count rule, always visible */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          <span aria-hidden className="inline-block h-1 w-4 rounded-full" style={{ background: STICK }} />
          {t('Same x sticks, all three, x < 100', 'Batang x sama, ketiganya, x < 100')}
        </div>

        {/* running tally of kept totals (the valid x found so far) */}
        <div className="flex min-h-[1.9rem] items-center gap-1.5">
          <span className="font-display text-[11px] font-bold text-slate-500">
            {t('found:', 'ditemukan:')}
          </span>
          <AnimatePresence initial={false}>
            {beat.found.length === 0 ? (
              <motion.span
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display text-[11px] font-bold text-slate-400"
              >
                —
              </motion.span>
            ) : (
              beat.found.map((x) => (
                <motion.span
                  key={x}
                  layout
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  className="rounded-full px-2 py-0.5 font-display text-xs font-black tabular-nums text-white"
                  style={{ background: GREEN }}
                >
                  {x}
                </motion.span>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* the candidate total being tested (driven by the 4-row block), or the
            final sum on the sum beat */}
        {beat.isSum ? (
          <motion.div
            key="sum"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="font-display text-xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            {`${story.largest} + ${story.smallest} = ${story.answer}`}
          </motion.div>
        ) : (
          beat.candidate != null && (
            <motion.div
              key={beat.candidate + (beat.reject ? '-x' : '') + (beat.result ? '-ok' : '')}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              className="font-display text-lg font-black tabular-nums"
              style={{ color: candidateColor }}
            >
              {beat.c != null
                ? `x = 9×${beat.c} + 4 = ${beat.candidate}`
                : `x = ${beat.candidate}`}
            </motion.div>
          )
        )}

        {/* solved blocks for this beat, drawn by the shared primitive. On the
            intro and sum beats (no per-block view) show the three generic rows so
            the figure is always present. */}
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
            beat.isSum
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.result
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
