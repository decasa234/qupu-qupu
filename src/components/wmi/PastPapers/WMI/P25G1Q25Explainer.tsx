import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AnimalGlyph, P25G1Q25Diagram } from './P25G1Q25Illustration'
import { buildP25G1Q25Steps } from './p25G1Q25Steps'

// WMI-25P1A-Q25 post-answer explainer. Re-uses the static figure's stacked
// equations (P25G1Q25Diagram) and its AnimalGlyph primitive, and adds a small
// "what each animal is worth" panel that fills in beat by beat — Lion = 11,
// Cow = 3 — before landing on Lion + Cow + Cow = 17 (answer A).

const BRAND_BLUE = '#30598A'
const ORANGE = '#f0853a'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_SOFT = '#D1FAE5'

/** A value chip for one animal: glyph + its known value (or "?" while unknown). */
function ValueChip({
  kind,
  value,
  T,
}: {
  kind: 'lion' | 'cow'
  value: number | null
  T: (en: string, id: string) => string
}) {
  const known = value != null
  return (
    <div
      className="flex items-center gap-2 rounded-xl border-2 px-3 py-1.5"
      style={{ background: known ? GREEN_SOFT : '#FFF4EA', borderColor: known ? GREEN : ORANGE }}
    >
      <svg viewBox="0 0 48 48" width={36} height={36} aria-hidden="true">
        <AnimalGlyph kind={kind} cx={24} cy={24} s={0.78} />
      </svg>
      <span className="font-display text-base font-extrabold" style={{ color: BRAND_BLUE }}>
        =
      </span>
      <motion.span
        key={known ? 'v' : 'q'}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="font-display text-2xl font-black tabular-nums"
        style={{ color: known ? GREEN_INK : ORANGE }}
      >
        {known ? value : '?'}
      </motion.span>
      <span className="font-display text-[10px] font-bold" style={{ color: BRAND_BLUE }}>
        {T(kind === 'lion' ? 'Lion' : 'Cow', kind === 'lion' ? 'Singa' : 'Sapi')}
      </span>
    </div>
  )
}

export default function P25G1Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: the 25 clue is the 14 clue with one extra Lion, so Lion = 25 - 14 = ${story.lion}. Then Cow = 14 - ${story.lion} = ${story.cow}. So Lion + Cow + Cow = ${story.lion} + ${story.cow} + ${story.cow} = ${story.answer}.`,
    `Strategi: petunjuk 25 adalah petunjuk 14 dengan satu Singa tambahan, jadi Singa = 25 - 14 = ${story.lion}. Lalu Sapi = 14 - ${story.lion} = ${story.cow}. Jadi Singa + Sapi + Sapi = ${story.lion} + ${story.cow} + ${story.cow} = ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* The two given equations + the asked row — same scene as the figure. */}
        <P25G1Q25Diagram revealAnswer={beat.revealAnswer} />

        {/* the "what each animal is worth" panel, filling in beat by beat */}
        <div className="flex items-center justify-center gap-3">
          <ValueChip kind="lion" value={beat.showLion} T={T} />
          <ValueChip kind="cow" value={beat.showCow} T={T} />
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
