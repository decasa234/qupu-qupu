import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FoldTriangle23G3 } from './FoldTriangle23G3Illustration'
import { buildFoldTriangle23G3Steps, ANSWER, GIVEN, type LedgerRow } from './foldTriangle23G3Steps'

// WMI-23F3A-Q17 (2023 Grade 3 Final) — fold triangle ABC along EF (B→B', C→C').
// Given ∠EAF = 60° and ∠B'EA = 95°, find ∠AFC' (answer 25°).
//
// The animation never asserts the answer — it chases the angles. It re-uses the
// FoldTriangle23G3 primitive (the static green-flap figure coming alive) and,
// beside it, fills in an angle ledger one row per beat: the two givens, then the
// triangle-sum 120°, then ∠AEF = 42.5° from the fold at E, then ∠AFE = 77.5° ⇒
// ∠AFC' = 25° at F. The last beat surfaces the shortcut (∠B'EA + ∠AFC' = 2·∠EAF)
// and asks the figure to mark ∠AFC' = 25° (showAnswer). The winner lands last
// with hold 0; the deduction beats linger so each step reads.

const BLUE = '#30598A' // fill-qupu-brand-blue — neutral / known rows
const ORANGE = '#f0853a' // fill-qupu-brand-orange — the row just derived
const GREEN = '#10B981' // the final answer row

// One ledger row: "∠AEF + ∠AFE  =  120°". Fresh rows glow orange (or green when
// it's the answer); earlier rows settle to calm blue.
function LedgerRowPill({ row, result }: { row: LedgerRow; result: boolean }) {
  const isAnswer = result && row.key === 'afc'
  const accent = isAnswer ? GREEN : row.fresh ? ORANGE : BLUE
  const bg = isAnswer ? '#D1FAE5' : row.fresh ? '#FFF7ED' : '#E1EFFB'
  const valueColor = isAnswer ? '#065F46' : row.fresh ? '#9A3412' : BLUE
  return (
    <motion.div
      layout
      initial={{ scale: 0.6, opacity: 0, y: 6 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="flex w-full items-center justify-between gap-2 rounded-lg border-2 px-2.5 py-1"
      style={{ background: bg, borderColor: accent }}
    >
      <span className="font-display text-xs font-bold" style={{ color: BLUE }}>
        {row.label}
      </span>
      <span className="font-display text-sm font-black tabular-nums" style={{ color: valueColor }}>
        {row.value}
      </span>
    </motion.div>
  )
}

export default function FoldTriangle23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildFoldTriangle23G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: triangle AEF's angles sum to 180°, so ∠AEF + ∠AFE = 120°. The fold makes ∠B'EA = 180 − 2·∠AEF = 95, so ∠AEF = 42.5° and ∠AFE = 77.5°; then ∠AFC' = 180 − 2·77.5 = ${ANSWER}°. Check: ∠B'EA + ∠AFC' = 2·${GIVEN.apex} = 120, so ∠AFC' = ${ANSWER}°.`,
    `Penjelasan: sudut-sudut segitiga AEF berjumlah 180°, jadi ∠AEF + ∠AFE = 120°. Lipatan membuat ∠B'EA = 180 − 2·∠AEF = 95, jadi ∠AEF = 42,5° dan ∠AFE = 77,5°; lalu ∠AFC' = 180 − 2·77,5 = ${ANSWER}°. Cek: ∠B'EA + ∠AFC' = 2·${GIVEN.apex} = 120, jadi ∠AFC' = ${ANSWER}°.`,
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The folded triangle, with ∠AFC' = 25° marked on the final beat. */}
        <motion.div
          key={`fig-${beat.showAnswer ? 'ans' : 'set'}`}
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <FoldTriangle23G3 showAnswer={beat.showAnswer} />
        </motion.div>

        {/* Angle ledger: givens first, then each derived value drops in. */}
        <div className="flex w-full max-w-[260px] flex-col gap-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.ledger.map((row) => (
              <LedgerRowPill key={row.key} row={row} result={beat.result} />
            ))}
          </AnimatePresence>
        </div>

        {/* The one-line equation worked this beat (springs in fresh each time). */}
        {beat.formula && (
          <motion.div
            key={`f-${index}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="font-display text-sm font-black tabular-nums"
            style={{ color: beat.result ? GREEN : ORANGE }}
          >
            {beat.formula}
          </motion.div>
        )}

        {/* Caption: kid-first, bilingual; green when we land the answer. */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
