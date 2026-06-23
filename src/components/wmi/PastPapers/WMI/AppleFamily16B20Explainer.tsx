// AppleFamily16B20Explainer.tsx
//
// Animated explainer for SEAMO-16-B-Q20:
//   Mr Wang's apple basket — two simultaneous equations.
//
// Beat sequence:
//   0  Problem setup (two scenarios, ? apples)
//   1  Eq A: T = 4n + 10
//   2  Eq B: T = 6n − 6
//   3  Set equal: 4n + 10 = 6n − 6
//   4  Solve n = 8
//   5  Solve T = 42
//   6  Verify: 6×8−6 = 42 ✓
//   7  Answer: 42 apples (B)

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AppleFamilyDiagram, C } from './AppleFamily16B20Illustration'
import { buildAppleFamily16B20Steps } from './appleFamily16B20Steps'

export default function AppleFamily16B20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildAppleFamily16B20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dua persamaan T=4n+10 dan T=6n−6 diselesaikan untuk mendapat n=8 anggota keluarga dan T=42 apel (jawaban B).'
      : 'Explainer: two equations T=4n+10 and T=6n−6 solved to find n=8 family members and T=42 apples (answer B).'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Diagram */}
        <AppleFamilyDiagram showAnswer={beat.showAnswer} />

        {/* Equation / expression box */}
        {beat.expr && (
          <div
            className="w-full rounded-xl border-2 px-3 py-1 text-center font-mono text-sm font-bold"
            style={{
              background: beat.result ? '#D1FAE5' : '#EFF6FF',
              borderColor: beat.result ? C.PANEL_A_BOR : '#3B82F6',
              color: beat.result ? C.PANEL_A_LABEL : '#1E40AF',
            }}
          >
            {beat.expr}
          </div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: C.PANEL_A_BOR, color: C.PANEL_A_LABEL }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
