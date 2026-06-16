import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { AppleBoxes25G1 } from './AppleBoxes25G1Illustration'
import { buildAppleBoxes25G1Steps } from './appleBoxes25G1Steps'

// Palette echoes the static apple-tray illustration (qupu tokens).
const INK = '#1F2937'
const BRAND_BLUE = '#30598A' // qupu-brand-blue — count highlight
const ORANGE = '#f0853a' // qupu-brand-orange — apple body
const SHELL = '#FFF9F4' // qupu-shell (panel)
const TRAY_SIDE = '#E4DACB' // tray rim / warm grey (panel border)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

// A small "find" chip: shows a target box's apple value once counted, or a
// placeholder while we're still hunting for it.
function FindChip({
  label,
  value,
  active,
  found,
}: {
  label: string
  value: number | null
  active: boolean
  found: boolean
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-1.5"
      style={{
        background: found ? '#FFF2DF' : SHELL,
        borderColor: found ? ORANGE : active ? BRAND_BLUE : TRAY_SIDE,
      }}
    >
      <span className="font-display text-[11px] font-extrabold" style={{ color: BRAND_BLUE }}>
        {label}
      </span>
      <motion.span
        key={`${label}-${value}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="font-display text-xl font-black tabular-nums"
        style={{ color: value == null ? TRAY_SIDE : ORANGE }}
      >
        {value == null ? '?' : value}
      </motion.span>
    </div>
  )
}

export default function AppleBoxes25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildAppleBoxes25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: count 4 boxes from the left to box 4 (${story.leftValue} apples) and 4 boxes from the right to box 3 (${story.rightValue} apples), then add — the answer is ${story.answer}.`,
    `Strategi: hitung 4 kotak dari kiri ke kotak 4 (${story.leftValue} apel) dan 4 kotak dari kanan ke kotak 3 (${story.rightValue} apel), lalu jumlahkan — jawabannya ${story.answer}.`,
  )

  const counting = beat.phase === 'countLeft' || beat.phase === 'countRight'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[260px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: TRAY_SIDE }}
      >
        {/* counting ribbon — the ordinal as the finger walks 1·2·3·4 */}
        <div className="flex h-7 items-center gap-2">
          {counting && beat.countN != null ? (
            <>
              <span className="font-display text-sm font-extrabold" style={{ color: BRAND_BLUE }}>
                {beat.direction === 'left'
                  ? T('From the left:', 'Dari kiri:')
                  : T('From the right:', 'Dari kanan:')}
              </span>
              <motion.span
                key={`${beat.direction}-${beat.countN}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                className="font-display text-2xl font-black tabular-nums"
                style={{ color: beat.countN === 4 ? ORANGE : BRAND_BLUE }}
              >
                {beat.countN}
              </motion.span>
            </>
          ) : (
            <span className="font-display text-sm font-extrabold" style={{ color: INK }}>
              {beat.phase === 'goal'
                ? T('6 boxes of apples', '6 kotak apel')
                : T('Both boxes found!', 'Kedua kotak ketemu!')}
            </span>
          )}
        </div>

        {/* the row of six trays — bind the built primitive, do NOT redraw */}
        <AppleBoxes25G1 litBoxes={beat.litBoxes} />

        {/* the two finds, then their sum */}
        <div className="flex items-center gap-3">
          <FindChip
            label={T('Box 4 (left)', 'Kotak 4 (kiri)')}
            value={beat.leftValue}
            active={beat.phase === 'countLeft'}
            found={beat.leftValue != null}
          />
          <span className="font-display text-2xl font-black" style={{ color: INK }}>
            +
          </span>
          <FindChip
            label={T('Box 3 (right)', 'Kotak 3 (kanan)')}
            value={beat.rightValue}
            active={beat.phase === 'countRight'}
            found={beat.rightValue != null}
          />
          {beat.sum != null && (
            <>
              <span className="font-display text-2xl font-black" style={{ color: INK }}>
                =
              </span>
              <motion.span
                key={`sum-${beat.sum}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                className="font-display text-3xl font-black tabular-nums"
                style={{ color: GREEN_INK }}
              >
                {beat.sum}
              </motion.span>
            </>
          )}
        </div>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : counting
                ? { background: '#FFFFFF', borderColor: BRAND_BLUE, color: BRAND_BLUE }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
