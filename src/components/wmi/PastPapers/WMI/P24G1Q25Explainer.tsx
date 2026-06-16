import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q25RobotMaze, Q25_MIN_PATH } from './P24G1Q25Illustration'
import { buildP24G1Q25Steps } from './p24G1Q25Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#F59E0B'

export default function P24G1Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    `Explainer: tracing the cheapest left/right/down route cell by cell, the digits add up to ${story.minSum}. No route is smaller. Answer ${story.answerLetter}.`,
    `Penjelasan: menelusuri rute kiri/kanan/turun termurah sel demi sel, angkanya berjumlah ${story.minSum}. Tidak ada yang lebih kecil. Jawaban ${story.answerLetter}.`,
  )

  const accent = beat.result ? GREEN : beat.phase === 'intro' ? BLUE : ORANGE

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q25RobotMaze litPath={Q25_MIN_PATH} litCount={beat.litCount} />

        {/* Running total chip. */}
        {beat.phase !== 'intro' && (
          <div
            className="flex items-center gap-2 font-display text-2xl font-black tabular-nums"
            style={{ color: accent }}
          >
            <span>{t('sum', 'jumlah')}</span>
            <span>=</span>
            <span>{beat.runningSum}</span>
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'walk'
                ? { background: '#FFF1E6', borderColor: ORANGE, color: '#9a4a12' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
