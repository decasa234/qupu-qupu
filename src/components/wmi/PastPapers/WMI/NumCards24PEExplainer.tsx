// IKMC-22-PE-Q24 — Explainer: minimum swaps to sort [3,4,1,5,2] into [1,2,3,4,5].
// Answer: C (3 swaps).
//
// Animates the optimal 3-swap sequence beat by beat, reusing CardRowPrimitive
// from NumCards24PEIllustration for a consistent visual across stem + explainer.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CardRowPrimitive } from './NumCards24PEIllustration'
import { buildNumCards24PESteps } from './numCards24PESteps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function NumCards24PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildNumCards24PESteps(), [])

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Swap counter badge: count how many swap beats have passed
  const swapsDone = (() => {
    const swapPhases = ['swap1', 'after1', 'swap2', 'after2', 'swap3', 'result'] as const
    // after phase → count
    const phaseCount: Record<string, number> = {
      show: 0, check1: 0, check2: 0,
      swap1: 0, after1: 1,
      swap2: 1, after2: 2,
      swap3: 2, result: 3,
    }
    void swapPhases
    return phaseCount[beat.phase] ?? 0
  })()

  const ariaLabel = t(
    `Explainer: sorting five cards from 3 4 1 5 2 into increasing order. Minimum swaps needed: 3. Answer C.`,
    `Penjelasan: mengurutkan lima kartu dari 3 4 1 5 2 ke urutan menaik. Minimum pertukaran: 3. Jawaban C.`,
  )

  return (
    <div
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Swap counter badge */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {[1, 2, 3].map((n) => {
            const active = n <= swapsDone
            return (
              <div
                key={n}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 font-display text-sm font-black"
                style={
                  active
                    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                    : { background: '#F1F5F9', borderColor: '#CBD5E1', color: '#94A3B8' }
                }
              >
                {n}
              </div>
            )
          })}
          <span
            className="font-display text-xs font-bold"
            style={{ color: '#64748B' }}
          >
            {t('swaps', 'pertukaran')}
          </span>
        </div>

        {/* Card row with swap arc */}
        <div className="w-full rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <CardRowPrimitive
            digits={beat.digits}
            states={beat.states}
            swapArrow={beat.swapArrow}
          />
        </div>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {t(beat.caption.en, beat.caption.id)}
        </div>
      </div>
    </div>
  )
}
