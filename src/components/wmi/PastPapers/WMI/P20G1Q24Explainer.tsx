import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q24Diagram, Q24_ANSWER, Q24_DICE, Q24_PAIR_SUM, Q24_TOP_TOTAL } from './P20G1Q24Illustration'
import { buildP20G1Q24Steps } from './p20G1Q24Steps'

const GREEN = '#10B981'
const BLUE = '#2f6df0'
const MUTED = '#9aa3b2'
const PURPLE = '#341857'

const ALL_PAIRS = Q24_DICE * Q24_PAIR_SUM // 28

function Chip({ value, color, border, bg }: { value: number | string; color: string; border: string; bg: string }) {
  return (
    <span
      className="inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border-2 px-2 font-display text-2xl font-extrabold"
      style={{ color, borderColor: border, background: bg }}
    >
      {value}
    </span>
  )
}

export default function P20G1Q24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G1Q24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const phase = beat.phase

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: atas + bawah = 4 × ${Q24_PAIR_SUM} = ${ALL_PAIRS}; kurangi sisi atas ${Q24_TOP_TOTAL} → ${Q24_ANSWER} (jawaban A).`
      : `Explainer: up + down = 4 × ${Q24_PAIR_SUM} = ${ALL_PAIRS}; subtract the up faces ${Q24_TOP_TOTAL} → ${Q24_ANSWER} (answer A).`

  const showArithmetic = phase === 'subtract' || phase === 'result'

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        {!showArithmetic ? (
          <Q24Diagram />
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex items-center gap-2">
              <Chip value={ALL_PAIRS} color={BLUE} border={BLUE} bg="#EFF6FF" />
              <span className="font-display text-2xl font-extrabold" style={{ color: MUTED }}>
                −
              </span>
              <Chip value={Q24_TOP_TOTAL} color={PURPLE} border={MUTED} bg="#F5F3FF" />
              <span className="font-display text-2xl font-extrabold" style={{ color: MUTED }}>
                =
              </span>
              {phase === 'result' ? (
                <Chip value={Q24_ANSWER} color="#065F46" border={GREEN} bg="#D1FAE5" />
              ) : (
                <Chip value="?" color={MUTED} border={MUTED} bg="#FFFFFF" />
              )}
            </div>
            <span className="font-display text-xs font-bold" style={{ color: MUTED }}>
              {lang === 'id' ? '(atas + bawah)  −  (atas)  =  (bawah)' : '(up + down)  −  (up)  =  (down)'}
            </span>
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
