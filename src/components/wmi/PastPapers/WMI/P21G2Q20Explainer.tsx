import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Umbrella, ORIGINAL } from './P21G2Q20Illustration'
import { OPTIONS, buildP21G2Q20Steps } from './p21G2Q20Steps'

const GREEN = '#10B981'

/**
 * WMI-21P2A-Q20 — beat-by-beat: state the wedge-order rule, show that A/B/C are
 * rotations of the original, and that D puts the two yellow wedges side by side
 * (impossible by rotation) — so D is the different umbrella (answer D). Reuses
 * the <Umbrella> primitive from the illustration.
 */
export default function P21G2Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answerLabel = props.correctAnswer || 'D'
  const story = useMemo(() => buildP21G2Q20Steps(lang, answerLabel), [lang, answerLabel])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Which option labels are currently lit. checkBC lights both B and C.
  const litSet = new Set<string>()
  if (beat.highlight === 'B') {
    litSet.add('B')
    litSet.add('C')
  } else if (beat.highlight && beat.highlight !== '*') {
    litSet.add(beat.highlight)
  }

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: A, B, C adalah rotasi payung asli; D urutannya berbeda — jawaban ${answerLabel}.`
      : `Explainer: A, B and C are rotations of the original umbrella; D's order differs — answer ${answerLabel}.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* the original, for reference */}
        <div className="flex flex-col items-center">
          <div style={{ maxWidth: 96, width: '100%' }}>
            <Umbrella colors={ORIGINAL} size={96} />
          </div>
          <span className="mt-0.5 text-[11px] font-bold text-slate-500">
            {lang === 'id' ? 'asli' : 'original'}
          </span>
        </div>

        {/* the four options */}
        <div className="grid grid-cols-4 gap-2">
          {OPTIONS.map((opt) => {
            const lit = litSet.has(opt.label)
            return (
              <div key={opt.label} className="flex flex-col items-center" style={{ opacity: litSet.size && !lit ? 0.35 : 1 }}>
                <div style={{ maxWidth: 80, width: '100%' }}>
                  <Umbrella colors={opt.colors} rotate={opt.rotate} size={80} lit={lit} />
                </div>
                <span className="mt-0.5 text-[11px] font-extrabold text-slate-600">{opt.label}</span>
              </div>
            )
          })}
        </div>

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
