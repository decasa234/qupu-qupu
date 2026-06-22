import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CandleRow, type CandleName } from './Candles1ECIllustration'
import {
  buildCandles1ECSteps,
  CANDLES_1_EC_ANSWER,
  CANDLES_1_EC_CHOICE,
} from './candles1ECSteps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const AMBER = '#F59E0B'

export default function Candles1ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCandles1ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lima lilin A–E dinyalakan bersamaan. Lilin yang berhenti lebih awal membakar lebih sedikit lilin sehingga lebih tinggi. Lilin D paling tinggi, jadi D berhenti pertama. Jawaban ${CANDLES_1_EC_CHOICE}.`
      : `Explainer: five candles A–E lit at the same time. The candle that stopped burning earliest burned less wax and is taller. Candle D is tallest, so D stopped first. Answer ${CANDLES_1_EC_CHOICE}.`

  const highlightSet = new Set<CandleName>(beat.highlight)

  const phaseLabel = beat.result
    ? T('First to stop!', 'Pertama berhenti!')
    : beat.phase === 'intro'
      ? T('The candles', 'Lilin-lilin')
      : beat.phase === 'rule'
        ? T('Key rule', 'Aturan kunci')
        : beat.phase === 'trap'
          ? T('Trap: candle E', 'Jebakan: lilin E')
          : T('Winner: candle D', 'Pemenang: lilin D')

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Phase label */}
        <div
          className="font-display text-xs font-extrabold uppercase tracking-wide"
          style={{ color: BLUE }}
        >
          {phaseLabel}
        </div>

        {/* Candle figure — updates per beat */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <CandleRow
            heights={beat.heights}
            highlight={highlightSet}
            winner={beat.winner}
          />
        </motion.div>

        {/* Highlighted candle chips */}
        {beat.highlight.length > 0 && !beat.result ? (
          <motion.div
            key={`chips-${beat.phase}`}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            {beat.highlight.map((name, i) => (
              <motion.div
                key={name}
                className="flex h-8 items-center justify-center rounded-lg px-3 font-display text-sm font-extrabold text-white"
                style={{ background: AMBER }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * i, type: 'spring', stiffness: 300, damping: 18 }}
              >
                {T(`Candle ${name}`, `Lilin ${name}`)}
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {/* Result answer chip */}
        {beat.result ? (
          <motion.div
            key="result-chip"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            <span
              className="flex h-9 items-center justify-center rounded-lg px-4 font-display text-base font-extrabold"
              style={{ background: GREEN, color: '#fff' }}
            >
              {T(`Candle D = stopped FIRST`, `Lilin D = berhenti PERTAMA`)}
            </span>
          </motion.div>
        ) : null}

        {/* Caption box */}
        <div
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

export { CANDLES_1_EC_ANSWER }
