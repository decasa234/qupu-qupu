import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FruitTable23 } from './P23G2Q24Illustration'
import { buildP23G2Q24Steps } from './p23G2Q24Steps'

// WMI-23P2A-Q24 — fruit product table. The genuine technique is to COMPARE two
// rows so the fruits they share cancel, exposing a single fruit-to-fruit ratio
// (row2÷row1 → 🍒 vs 🍌; row2÷row3 → 🍎 = 2×🍌). Scale by 🍌 = 8 and add 🍎 + 🍒.
// The animation mirrors the static figure (same FruitTable23 primitive),
// outlines each compared pair of rows, and lands on the seed's answer option.

const BLUE = '#30598A'
const GREEN = '#10B981'

export default function P23G2Q24Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answerLetter = (props.correctAnswer || 'D').trim().charAt(0).toUpperCase() || 'D'
  const story = useMemo(() => buildP23G2Q24Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: compare rows so shared fruits cancel, get the apple and cherry from banana = 8, and add them — answer ${story.answerLetter}.`,
    `Penjelasan: bandingkan baris agar buah yang sama saling hapus, dapatkan apel dan ceri dari pisang = 8, lalu jumlahkan — jawaban ${story.answerLetter}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line strategy banner, always visible */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t('Compare rows → shared fruits cancel', 'Bandingkan baris → buah sama saling hapus')}
        </div>

        <FruitTable23 markRows={beat.markRows} reveal={beat.reveal} />

        {/* answer chip on the final beat */}
        {beat.result && (
          <div
            className="flex items-center gap-2 font-display"
            aria-hidden="true"
          >
            <span
              className="rounded-md px-3 py-1 text-lg font-black"
              style={{ background: '#D1FAE5', color: '#065F46' }}
            >
              {story.answerLetter}
            </span>
          </div>
        )}

        <div
          className="min-h-[2.75rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
