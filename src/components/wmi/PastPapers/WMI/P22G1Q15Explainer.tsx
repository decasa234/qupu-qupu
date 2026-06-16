import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q15Strip } from './P22G1Q15Illustration'
import { buildP22G1Q15Steps } from './p22G1Q15Steps'

// WMI-22P1A-Q15 — post-answer animation. Teaches the orbit rule (a fixed centre
// triangle + one triangle stepping counter-clockwise) and lands on figure B by
// revealing the missing 4th panel in the SAME strip primitive as the static
// figure. SSR-safe, deterministic (no Math.random / Date).

const GREEN = '#10B981'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function P22G1Q15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLetter = props.correctAnswer || 'B'
  const story = useMemo(() => buildP22G1Q15Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? `Penjelasan: satu segitiga tetap di tengah, satu lagi bergerak mengelilingi pusat; gambar berikutnya adalah ${answerLetter}.`
      : `Explainer: one triangle stays in the centre, the other orbits it; the next figure is ${answerLetter}.`

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <Q15Strip answerPanel={beat.answerPanel} />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
