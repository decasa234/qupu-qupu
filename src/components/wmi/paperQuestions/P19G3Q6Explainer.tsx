// Post-answer explainer for WMI-19P3A-Q6 (trapezoid perimeter).
//
// Beat by beat: perimeter = sum of all sides → add the three known sides
// (29 + 26 + 26 = 81) → subtract from 104 → "?" = 23 — answer C. Reuses the
// Q6Trapezoid primitive from the illustration so it is the same figure alive.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q6Trapezoid } from './P19G3Q6Illustration'
import { buildP19G3Q6Steps } from './p19G3Q6Steps'

const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

export default function P19G3Q6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP19G3Q6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Perimeter 104 is the sum of all sides. The three known sides add to ${story.knownSum}, so the bottom side is 104 minus ${story.knownSum}, which is ${story.answer}. Answer C.`,
    `Keliling 104 adalah jumlah semua sisi. Tiga sisi yang diketahui berjumlah ${story.knownSum}, jadi sisi bawah adalah 104 dikurangi ${story.knownSum}, yaitu ${story.answer}. Jawaban C.`,
  )

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: '#F4F8FF', borderColor: '#C9DDF7' }}
      >
        <div
          className="flex w-full max-w-[300px] items-center justify-center rounded-xl px-3 py-1.5 font-display text-sm font-extrabold"
          style={{ background: BRAND_BLUE, color: '#FFFFFF' }}
        >
          {t('Perimeter = 104 → find ?', 'Keliling = 104 → cari ?')}
        </div>

        <Q6Trapezoid showBottom={beat.showBottom} highlight={beat.highlight} />

        <div className="flex min-h-[2rem] items-center justify-center">
          {beat.equation && (
            <span
              className="font-display text-xl font-black tabular-nums"
              style={{ color: beat.result ? GREEN_INK : BRAND_BLUE }}
            >
              {beat.equation}
            </span>
          )}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
