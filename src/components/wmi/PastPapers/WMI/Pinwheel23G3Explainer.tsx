import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Pinwheel23G3 } from './Pinwheel23G3Illustration'
import {
  buildPinwheelSteps,
  ANSWER,
  L,
  W,
  WHOLE_AREA,
  WHOLE_PERIMETER,
  type DimPhase,
} from './pinwheel23G3Steps'

// WMI-23F3A-Q19 — 4 identical rectangles pinwheel around a square hole. The
// whole figure has perimeter 48 cm and area 90 cm²; find one rectangle's
// perimeter (19.5 cm). DEDUCE, beat by beat: name L (long) and W (short); the
// outer boundary is a square of side L+W and the hole a square of side L−W, so
// the whole perimeter is 4(L+W)+4(L−W) — the W's CANCEL, leaving 8L = 48 ⇒ L=6;
// then the area 4·L·W = 90 ⇒ W = 22.5÷6 = 3.75; finally one rectangle =
// 2(6+3.75) = 19.5. The figure (shared Pinwheel23G3 primitive) lights its
// dimensions via showDims on the working beats so the animation reads as the
// static scene coming alive. The winner lands last with hold 0.

const BLUE = '#30598A' // fill-qupu-blue — neutral working ink
const ORANGE = '#f0853a' // fill-qupu-orange — the active step accent
const GREEN = '#10B981' // fill-qupu-green — the solved value / answer

/** The figure reveals its L/W labels on every beat after the goal. */
function dimsShown(phase: DimPhase): boolean {
  return phase !== 'none'
}

/** A small "what we know so far" ledger that fills in as beats advance. */
function num(n: number): string {
  return Number(n.toFixed(2)).toString()
}

interface LedgerRow {
  key: string
  label: string
  value: string
  /** First beat (index) at which this row is known. */
  from: number
}

export default function Pinwheel23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildPinwheelSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Ledger rows appear as the matching beat is reached (long at beat 2, short at
  // beat 3, the answer at beat 4). Built from lang so captions/labels stay bilingual.
  const ledger: LedgerRow[] = useMemo(
    () => [
      { key: 'L', label: t('Long side L', 'Sisi panjang L'), value: `${num(L)} cm`, from: 2 },
      { key: 'W', label: t('Short side W', 'Sisi pendek W'), value: `${num(W)} cm`, from: 3 },
      {
        key: 'P',
        label: t('One rectangle', 'Satu persegi panjang'),
        value: `2(${num(L)} + ${num(W)}) = ${num(ANSWER)} cm`,
        from: 4,
      },
    ],
    [lang],
  )

  const ariaLabel = t(
    `Explainer: name the rectangle's long side L and short side W. The outer square has side L+W and the hole side L−W, so the whole perimeter 4(L+W)+4(L−W) = 8L = ${WHOLE_PERIMETER}, giving L = ${num(L)}. The area 4·L·W = ${WHOLE_AREA} gives W = ${num(W)}. One rectangle's perimeter = 2(${num(L)} + ${num(W)}) = ${num(ANSWER)} cm.`,
    `Penjelasan: sebut sisi panjang L dan sisi pendek W. Persegi luar bersisi L+W dan lubang bersisi L−W, jadi keliling seluruhnya 4(L+W)+4(L−W) = 8L = ${WHOLE_PERIMETER}, sehingga L = ${num(L)}. Luas 4·L·W = ${WHOLE_AREA} memberi W = ${num(W)}. Keliling satu persegi panjang = 2(${num(L)} + ${num(W)}) = ${num(ANSWER)} cm.`,
  )

  const accent = beat.result ? GREEN : ORANGE

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line goal, always visible */}
        <div className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1 text-center font-display text-xs font-bold text-sky-800">
          <span aria-hidden className="inline-block h-3 w-3 rounded-[3px]" style={{ background: ORANGE }} />
          {t(
            `Whole edge ${WHOLE_PERIMETER} cm · area ${WHOLE_AREA} cm² → one rectangle's edge?`,
            `Tepi ${WHOLE_PERIMETER} cm · luas ${WHOLE_AREA} cm² → tepi satu persegi panjang?`,
          )}
        </div>

        {/* the pinwheel figure, lighting its L/W dimensions on the working beats */}
        <motion.div
          key={beat.phase}
          initial={{ scale: 0.92, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        >
          <Pinwheel23G3 showDims={dimsShown(beat.phase)} />
        </motion.div>

        {/* deduction ledger — rows pop in as each value is found */}
        <div className="flex min-h-[1.5rem] w-full flex-wrap items-center justify-center gap-1.5">
          <AnimatePresence initial={false}>
            {ledger
              .filter((row) => index >= row.from)
              .map((row) => {
                const isAnswer = row.key === 'P'
                return (
                  <motion.div
                    key={row.key}
                    layout
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    className="rounded-full px-2.5 py-1 font-display text-xs font-bold tabular-nums"
                    style={{
                      background: isAnswer ? '#D1FAE5' : '#EFF6FC',
                      color: isAnswer ? '#065F46' : BLUE,
                      border: `1.5px solid ${isAnswer ? GREEN : '#BBD4EC'}`,
                    }}
                  >
                    <span className="opacity-70">{row.label}</span> = {row.value}
                  </motion.div>
                )
              })}
          </AnimatePresence>
        </div>

        {/* caption box: blue while working, green on the answer */}
        <div
          className="min-h-[3.5rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: accent, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
