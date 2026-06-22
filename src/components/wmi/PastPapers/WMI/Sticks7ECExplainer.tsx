/**
 * IKMC-19-EC-Q7 — post-answer explainer.
 *
 * Shows each shape A–E with its stick count, eliminating those ≤ 10 and
 * landing on D (12 sticks) as the answer.
 *
 * Reuses Sticks7ECOption from Sticks7ECIllustration for shape rendering.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Sticks7ECOption } from './Sticks7ECIllustration'
import { buildSticks7ECSteps, STEM_COUNT } from './sticks7ECSteps'

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED = '#EF4444'
const RED_BG = '#FEE2E2'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

export default function Sticks7ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSticks7ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Pia punya 10 tongkat. Bentuk D membutuhkan 12 tongkat — lebih dari 10. Jawaban: D.`
      : `Explainer: Pia has 10 sticks. Shape D needs 12 sticks — more than 10. Answer: D.`

  const isAnswer = beat.exceeds
  const hasChoice = !!beat.choice

  const chipBg = isAnswer ? RED_BG : BLUE_BG
  const chipBorder = isAnswer ? RED : BLUE
  const chipText = isAnswer ? '#991B1B' : '#1E3A5F'

  const captionBg = beat.result ? GREEN_BG : BLUE_BG
  const captionBorder = beat.result ? GREEN : BLUE
  const captionText = beat.result ? GREEN_TEXT : '#1E3A5F'

  const syntheticChoice = beat.choice ? { label: beat.choice, text: `(${beat.choice})` } : null

  return (
    <div className="mx-auto w-full max-w-sm" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Stem count reference */}
        <div className="text-sm font-bold" style={{ color: '#6B7280' }}>
          {lang === 'id' ? `Pia punya ${STEM_COUNT} tongkat` : `Pia has ${STEM_COUNT} sticks`}
        </div>

        {/* Shape display + count chip */}
        <div className="flex min-h-[80px] flex-col items-center justify-center gap-2">
          {hasChoice && syntheticChoice && (
            <>
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-extrabold" style={{ color: '#1F2937' }}>
                  {beat.choice}:
                </span>
                <Sticks7ECOption choice={syntheticChoice} />
              </div>
              {beat.count !== null && (
                <div
                  className="rounded-xl border-2 px-4 py-1 font-display text-sm font-extrabold"
                  style={{ background: chipBg, borderColor: chipBorder, color: chipText }}
                >
                  {beat.count} {lang === 'id' ? 'tongkat' : 'sticks'}
                  {beat.exceeds
                    ? lang === 'id'
                      ? ' > 10 ✗'
                      : ' > 10 ✗'
                    : lang === 'id'
                      ? ' ≤ 10 ✓'
                      : ' ≤ 10 ✓'}
                </div>
              )}
            </>
          )}
          {!hasChoice && (
            <div className="text-4xl font-extrabold" style={{ color: '#D1D5DB' }}>
              ?
            </div>
          )}
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={{ background: captionBg, borderColor: captionBorder, color: captionText }}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
