// HKIMO-25-P3H-Q5 — animated explainer for the triangular star pattern.
// Reuses the staircase illustration and animates the formula T(n) = n(n+1)/2.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import TriStarHK25P3Q5Illustration from './TriStarHK25P3Q5Illustration'
import { buildTriStarHK25P3Q5Steps } from './triStarHK25P3Q5Steps'

const GREEN = '#059669'
const BLUE  = '#1E3A5F'

export default function TriStarHK25P3Q5Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const story = useMemo(() => buildTriStarHK25P3Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const capStyle: React.CSSProperties = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EFF6FF', borderColor: BLUE,  color: '#1E3A5F' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: bilangan segitiga T(n)=n(n+1)/2; T(99)=4950, T(30)=465; selisih=4485.'
      : 'Explainer: triangular number T(n)=n(n+1)/2; T(99)=4950, T(30)=465; difference=4485.'

  return (
    <div
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {/* Static illustration (pattern stays visible throughout) */}
      <TriStarHK25P3Q5Illustration />

      {/* Equation pill */}
      {beat.equation && (
        <div
          style={{
            background: isResult ? '#D1FAE5' : '#DBEAFE',
            color: isResult ? '#065F46' : '#1E3A5F',
            borderRadius: 8,
            padding: '6px 14px',
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: '0.01em',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {beat.equation}
        </div>
      )}

      {/* Caption */}
      <div
        style={{
          ...capStyle,
          borderRadius: 8,
          border: `1.5px solid`,
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 600,
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        {beat.caption}
      </div>
    </div>
  )
}
