// Post-answer explainer for WMI-19P3A-Q11 (block-pattern matrix).
//
// The four answer choices were images in the original paper, so this explainer
// derives the rule (the block count drops by one across every row) and names
// the correct option letter. Row 3 runs 6 → 5 → 4, so "?" has 4 blocks, which
// is choice D. Reuses the Q11Matrix primitive with count badges + a reveal.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q11Matrix } from './P19G3Q11Illustration'
import { buildP19G3Q11Steps } from './p19G3Q11Steps'

const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

export default function P19G3Q11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP19G3Q11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Across each row the number of black squares decreases by one. Row three runs 6, 5, then 4, so the missing panel has ${story.answerCount} squares, which is choice D. Answer D.`,
    `Di tiap baris jumlah kotak hitam berkurang satu. Baris ketiga: 6, 5, lalu 4, jadi panel kosong punya ${story.answerCount} kotak, yaitu pilihan D. Jawaban D.`,
  )

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: '#F4F8FF', borderColor: '#C9DDF7' }}
      >
        <div
          className="flex w-full max-w-[320px] items-center justify-center rounded-xl px-3 py-1.5 font-display text-sm font-extrabold"
          style={{ background: BRAND_BLUE, color: '#FFFFFF' }}
        >
          {t('Count the squares in each row', 'Hitung kotak di tiap baris')}
        </div>

        <Q11Matrix
          highlightPanel={beat.highlightPanel}
          showCounts={beat.showCounts}
          revealAnswer={beat.revealAnswer}
        />

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
