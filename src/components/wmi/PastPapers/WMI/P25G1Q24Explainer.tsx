import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { P25G1Q24Options, P25G1Q24Sequence } from './P25G1Q24Illustration'
import { buildP25G1Q24Steps } from './p25G1Q24Steps'

// WMI-25P1A-Q24 post-answer explainer. Re-uses the static figure's primitives
// (P25G1Q24Sequence + P25G1Q24Options) and walks the rotation method one idea
// per beat: the shape stays the same L, it turns a quarter-turn clockwise each
// step, so the "?" is the next clockwise turn — which is option D.

const BRAND_BLUE = '#30598A'
const ORANGE = '#f0853a'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_SOFT = '#D1FAE5'

export default function P25G1Q24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP25G1Q24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: the shaded L keeps its shape and turns a quarter-turn clockwise each step, so the "?" is one more clockwise turn — the bottom-left L — which is option ${story.answer}.`,
    `Strategi: bentuk L yang diarsir tetap sama dan berputar seperempat putaran searah jarum jam tiap langkah, jadi "?" adalah satu putaran lagi searah jarum jam — L kiri-bawah — yaitu opsi ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* the sequence — same scene as the figure, with focus + reveal */}
        <P25G1Q24Sequence focus={beat.focus} revealNext={beat.revealNext} />

        {/* a small "turn" chip naming the rule once we reach the rotate beat */}
        {(beat.phase === 'rotate' || beat.phase === 'predict' || beat.phase === 'result') && (
          <div
            className="flex items-center gap-2 rounded-xl border-2 px-3 py-1.5"
            style={{ background: '#FFF4EA', borderColor: ORANGE }}
          >
            <span className="font-display text-lg font-black" style={{ color: ORANGE }}>
              ↻
            </span>
            <span className="font-display text-xs font-extrabold" style={{ color: BRAND_BLUE }}>
              {T('quarter-turn clockwise each step', 'seperempat putaran searah jarum jam tiap langkah')}
            </span>
          </div>
        )}

        {/* the five options — light up D on the result beat */}
        <P25G1Q24Options highlightCorrect={beat.highlightOption} />

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
