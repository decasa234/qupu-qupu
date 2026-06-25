import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import StarTriangleHK22P2Q5Illustration from './StarTriangleHK22P2Q5Illustration'
import { buildStarTriangleHK22P2Q5Steps, ANSWER } from './starTriangleHK22P2Q5Steps'

const BLUE = '#30598A'
const GREEN = '#059669'

export default function StarTriangleHK22P2Q5Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildStarTriangleHK22P2Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: setiap kelompok ke-n adalah segitiga bintang; gunakan rumus n(n+1)/2 → kelompok ke-9 = ${ANSWER} bintang.`
      : `Explainer: each group n is a star triangle; use formula n(n+1)/2 → group 9 = ${ANSWER} stars.`

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <StarTriangleHK22P2Q5Illustration
          lang={lang}
          highlightGroups={beat.highlightGroups}
          showCounts={beat.showCounts}
        />
        {/* Formula banner (visible during formula + apply + result beats) */}
        {(beat.phase === 'formula' || beat.phase === 'apply' || beat.phase === 'result') && (
          <div
            className="rounded-lg border-2 px-4 py-1.5 text-center font-mono text-sm font-bold"
            style={{ background: '#EFF6FF', borderColor: BLUE, color: BLUE }}
          >
            {lang === 'id' ? 'Rumus: n × (n + 1) ÷ 2' : 'Formula: n × (n + 1) ÷ 2'}
          </div>
        )}
        {/* Result badge */}
        {beat.phase === 'result' && (
          <div
            className="rounded-lg border-2 px-6 py-2 text-center font-display text-lg font-extrabold"
            style={{ background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }}
          >
            {lang === 'id' ? `9 × 10 ÷ 2 = ${ANSWER} ★` : `9 × 10 ÷ 2 = ${ANSWER} ★`}
          </div>
        )}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
