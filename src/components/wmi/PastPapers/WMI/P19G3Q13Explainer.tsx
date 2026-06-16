// Post-answer explainer for WMI-19P3A-Q13 (C-shaped perimeter).
//
// Beat by beat: walk the whole boundary (top + right run = 27, notch wall +
// lower run = 14, bottom + left = 27), add them: 27 + 14 + 27 = 68 cm — answer
// C. Reuses the Q13Figure primitive from the illustration with edge highlights.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Q13Figure } from './P19G3Q13Illustration'
import { buildP19G3Q13Steps } from './p19G3Q13Steps'

const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

export default function P19G3Q13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP19G3Q13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Walk the whole boundary of the C shape, including in and out of the notch, and add every edge. The total is ${story.perimeter} cm. Answer C.`,
    `Telusuri seluruh tepi bangun C, termasuk masuk dan keluar takikan, lalu jumlahkan setiap sisi. Totalnya ${story.perimeter} cm. Jawaban C.`,
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: '#F4F8FF', borderColor: '#C9DDF7' }}
      >
        <div
          className="flex w-full max-w-[320px] items-center justify-center rounded-xl px-3 py-1.5 font-display text-sm font-extrabold"
          style={{ background: BRAND_BLUE, color: '#FFFFFF' }}
        >
          {t('Add every edge around the C', 'Jumlahkan setiap tepi bangun C')}
        </div>

        <Q13Figure highlight={beat.highlight} />

        <div className="flex min-h-[2.5rem] flex-col items-center justify-center gap-0.5">
          {beat.equation && (
            <span
              className="font-display text-lg font-black tabular-nums"
              style={{ color: beat.result ? GREEN_INK : BRAND_BLUE }}
            >
              {beat.equation}
            </span>
          )}
          {beat.runningSum !== null && !beat.result && (
            <span className="font-display text-xs font-bold tabular-nums" style={{ color: '#6B7280' }}>
              {t(`so far: ${beat.runningSum}`, `sejauh ini: ${beat.runningSum}`)}
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
