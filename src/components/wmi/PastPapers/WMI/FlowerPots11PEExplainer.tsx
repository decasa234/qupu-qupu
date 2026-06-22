import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FlowerPots11PE } from './FlowerPots11PEIllustration'
import { buildFlowerPots11PESteps } from './flowerPots11PESteps'

// ── Palette (warm brand tokens) ──────────────────────────────────────────────
const SHELL      = '#FFF9F4'  // qupu-shell panel background
const BORDER     = '#E4DACB'  // warm grey border
const BRAND_BLUE = '#30598A'  // qupu-brand-blue — labels / captions
const ORANGE     = '#F59E0B'  // bought-count highlight
const GREEN      = '#10B981'  // result accent
const GREEN_INK  = '#065F46'  // result text
const INK        = '#1F2937'

// ── BoughtChip — running tally of flowers bought so far ─────────────────────
function BoughtChip({ bought, lang }: { bought: number; lang: 'en' | 'id' }) {
  const label = lang === 'id' ? 'Dibeli sejauh ini:' : 'Bought so far:'
  return (
    <div
      className="flex items-center gap-2 rounded-xl border-2 px-4 py-1.5"
      style={{ background: bought > 0 ? '#FFF2DF' : SHELL, borderColor: bought > 0 ? ORANGE : BORDER }}
    >
      <span className="font-display text-[11px] font-extrabold" style={{ color: BRAND_BLUE }}>
        {label}
      </span>
      <motion.span
        key={`bought-${bought}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="font-display text-xl font-black tabular-nums"
        style={{ color: bought === 0 ? BORDER : ORANGE }}
      >
        {bought}
      </motion.span>
    </div>
  )
}

// ── Main explainer ───────────────────────────────────────────────────────────
export default function FlowerPots11PEExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildFlowerPots11PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    'Strategy: Pot 1 needs 3 orange added, Pot 2 needs 3 white added. 3 + 3 = 6 flowers bought. Answer: C.',
    'Strategi: Pot 1 perlu ditambah 3 bunga oranye, Pot 2 perlu ditambah 3 bunga putih. 3 + 3 = 6 bunga dibeli. Jawaban: C.',
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: BORDER }}
      >
        {/* phase ribbon */}
        <div className="flex h-7 items-center">
          <span
            className="font-display text-sm font-extrabold"
            style={{ color: beat.result ? GREEN_INK : BRAND_BLUE }}
          >
            {beat.phase === 'goal'       && T('Setup', 'Kondisi Awal')}
            {beat.phase === 'checkPot1'  && T('Inspect Pot 1', 'Periksa Pot 1')}
            {beat.phase === 'checkPot2'  && T('Inspect Pot 2', 'Periksa Pot 2')}
            {beat.phase === 'addOrange'  && T('Buy orange flowers', 'Beli bunga oranye')}
            {beat.phase === 'addWhite'   && T('Buy white flowers', 'Beli bunga putih')}
            {beat.phase === 'result'     && T('Done!', 'Selesai!')}
          </span>
        </div>

        {/* the two pots — bind the built primitive */}
        <FlowerPots11PE
          addedOrangePot1={beat.addedOrangePot1}
          addedWhitePot2={beat.addedWhitePot2}
          activePot={beat.activePot}
        />

        {/* running tally chip */}
        <BoughtChip bought={beat.bought} lang={lang} />

        {/* result badge */}
        {beat.result && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            className="rounded-2xl border-2 px-5 py-1"
            style={{ background: '#D1FAE5', borderColor: GREEN }}
          >
            <span
              className="font-display text-2xl font-black tabular-nums"
              style={{ color: GREEN_INK }}
            >
              {T('Answer: C = 6', 'Jawaban: C = 6')}
            </span>
          </motion.div>
        )}

        {/* caption box */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
