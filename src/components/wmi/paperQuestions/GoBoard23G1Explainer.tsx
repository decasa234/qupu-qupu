import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { GoBoard23G1 } from './GoBoard23G1Illustration'
import { buildGoBoard23G1Steps } from './goBoard23G1Steps'

// Echo the qupu tokens the static board + its highlight ring already use, so the
// animation reads as the same scene coming alive. The lit ring itself is drawn by
// the GoBoard23G1 primitive in fill-qupu-brand-orange (#f0853a).
const BLUE = '#30598A' // fill-qupu-brand-blue (accent / intro)
const GREEN = '#10B981' // result / "the extra" accent
const STONE_BLACK = '#262220'
const STONE_WHITE = '#ffffff'

export default function GoBoard23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildGoBoard23G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Light every stone counted so far; the result beat keeps the whole board lit.
  const litStones = useMemo(() => [...beat.whitesSoFar, ...beat.blacksSoFar], [beat])

  const counting = beat.phase === 'extra' || beat.result

  const ariaLabel = t(
    `Explainer: pair each of ${story.whiteTotal} white stones with a black stone, then count the ${story.answer} leftover black stones — ${story.blackTotal} black minus ${story.whiteTotal} white equals ${story.answer} more black stones.`,
    `Penjelasan: pasangkan tiap ${story.whiteTotal} batu putih dengan batu hitam, lalu hitung ${story.answer} batu hitam sisa — ${story.blackTotal} hitam dikurangi ${story.whiteTotal} putih sama dengan ${story.answer} batu hitam lebih banyak.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <GoBoard23G1 litStones={litStones} />

        {/* Tally panel: whites paired vs. extra blacks found. */}
        <div className="flex w-full items-stretch justify-center gap-2">
          <TallyChip
            color={STONE_WHITE}
            border={BLUE}
            label={t('whites paired', 'putih dipasangkan')}
            value={`${beat.whitesSoFar.length} / ${story.whiteTotal}`}
            active={beat.phase === 'pair' || beat.phase === 'intro'}
          />
          <div className="flex items-center font-display text-lg font-black text-qupu-muted">−</div>
          <TallyChip
            color={STONE_BLACK}
            border={GREEN}
            textLight
            label={t('extra blacks', 'hitam berlebih')}
            value={beat.result || beat.phase === 'extra' ? `${beat.extra}` : '?'}
            active={counting}
          />
        </div>

        {/* Running answer counter during the extra-stone reveal + result. */}
        {(beat.phase === 'extra' || beat.result) && (
          <motion.div
            key={`count-${beat.extra}-${beat.result ? 'r' : 'x'}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            {beat.extra}
          </motion.div>
        )}

        {/* Caption box. */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : counting
                ? { background: '#ECFDF5', borderColor: GREEN, color: '#065F46' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}

function TallyChip({
  color,
  border,
  label,
  value,
  active,
  textLight = false,
}: {
  color: string
  border: string
  label: string
  value: string
  active: boolean
  textLight?: boolean
}) {
  return (
    <motion.div
      animate={{ scale: active ? 1 : 0.96, opacity: active ? 1 : 0.7 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="flex flex-1 flex-col items-center gap-1 rounded-xl border-2 px-2 py-1.5"
      style={{ borderColor: border, background: '#FFFFFF' }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-3.5 w-3.5 rounded-full border"
          style={{ background: color, borderColor: '#3a342f' }}
        />
        <span
          className="font-display text-base font-black tabular-nums"
          style={{ color: textLight ? STONE_BLACK : BLUE }}
        >
          {value}
        </span>
      </div>
      <span className="text-center text-[10px] font-bold uppercase tracking-wide text-qupu-muted">{label}</span>
    </motion.div>
  )
}
