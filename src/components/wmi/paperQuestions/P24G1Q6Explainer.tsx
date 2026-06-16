import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Grid3x3 } from './P24G1Q6Illustration'
import { buildP24G1Q6Steps } from './p24G1Q6Steps'

// Palette echoes the static grid figure (qupu tokens + clue tints).
const BLUE = '#30598A' // qupu-brand-blue
const SHELL = '#FFF9F4' // qupu-shell (panel)
const TRAY_SIDE = '#E4DACB' // warm grey (panel border)
const PINK = '#E11D48' // strawberry clue
const APPLE = '#16A34A' // green-apple clue
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

export default function P24G1Q6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: the cell left of the strawberry and the cell below the green apple are the same bottom-middle cell, which holds ${story.answerDigit} — answer ${story.answerLetter}.`,
    `Strategi: kotak di kiri stroberi dan kotak di bawah apel hijau adalah kotak tengah-bawah yang sama, berisi ${story.answerDigit} — jawaban ${story.answerLetter}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: TRAY_SIDE }}
      >
        {/* legend chips */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-display text-[11px] font-extrabold" style={{ color: PINK }}>
            <span className="text-sm">{'\u{1F353}'}</span>
            {T('left of', 'di kiri')}
          </span>
          <span className="flex items-center gap-1.5 font-display text-[11px] font-extrabold" style={{ color: APPLE }}>
            <span className="text-sm">{'\u{1F34F}'}</span>
            {T('below', 'di bawah')}
          </span>
        </div>

        {/* the grid — bind the built primitive, do NOT redraw */}
        <Grid3x3 marks={beat.marks} />

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
