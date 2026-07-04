import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AnimalRow } from './P24G2Q4Illustration'
import { buildP24G2Q4Steps } from './p24G2Q4Steps'

// Palette echoes the static animal-row figure (qupu tokens).
const BLUE = '#30598A' // qupu-brand-blue — "from the left"
const ORANGE = '#E07320' // qupu-brand-orange — "from the right"
const SHELL = '#FFF9F4' // qupu-shell (panel)
const TRAY_SIDE = '#E4DACB' // warm grey (panel border)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

export default function P24G2Q4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'C'
  const story = useMemo(() => buildP24G2Q4Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: count 10 from the left to the leader (${story.leaderEn}) and 7 from the right to the vice leader (${story.viceEn}), then pick the picture option holding both — answer ${story.answerLetter}.`,
    `Strategi: hitung 10 dari kiri ke pemimpin dan 7 dari kanan ke wakil, lalu pilih opsi gambar yang memuat keduanya — jawaban ${story.answerLetter}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: TRAY_SIDE }}
      >
        {/* legend chips */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-display text-[11px] font-extrabold" style={{ color: BLUE }}>
            <span className="inline-block h-3 w-3 rounded-sm border-2" style={{ borderColor: BLUE, background: '#E1EFFB' }} />
            {T('from the left', 'dari kiri')}
          </span>
          <span className="flex items-center gap-1.5 font-display text-[11px] font-extrabold" style={{ color: ORANGE }}>
            <span className="inline-block h-3 w-3 rounded-sm border-2" style={{ borderColor: ORANGE, background: '#FFF2DF' }} />
            {T('from the right', 'dari kanan')}
          </span>
        </div>

        {/* the row — bind the built primitive, do NOT redraw */}
        <AnimalRow litLeft={beat.litLeft} litRight={beat.litRight} showOrdinals={beat.showOrdinals} />

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
