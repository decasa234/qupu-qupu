import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { TriMesh, PICTURE_ORDER } from './P25G3Q22Illustration'
import { buildP25G3Q22Steps } from './p25G3Q22Steps'

const GREEN = '#10B981'
const INK = '#2B2118'
const HILITE = '#2563EB' // blue spotlight stroke

export default function P25G3Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  // Prefer the paper's keyed option letter; fall back to 'E'.
  const answerLetter = (props.correctAnswer && /^[A-E]$/.test(props.correctAnswer) ? props.correctAnswer : 'E') as string
  const story = useMemo(() => buildP25G3Q22Steps(lang, answerLetter), [lang, answerLetter])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: banyak segitiga 1, 2, 5, 12, ..., dan Gambar 6 punya ${story.answer} segitiga (jawaban ${story.answerLetter}).`
      : `Explainer: triangle counts 1, 2, 5, 12, ..., and Picture 6 has ${story.answer} triangles (answer ${story.answerLetter}).`

  // Spotlight a single small mesh (orders 1..4) so the beat focuses on one picture.
  const spotlightK = beat.spotlight >= 1 && beat.spotlight <= 4 ? PICTURE_ORDER[beat.spotlight] : null

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* A small focus mesh (when a single picture is spotlighted) */}
        <div style={{ minHeight: 120 }} className="flex items-center justify-center">
          {spotlightK != null ? (
            <svg
              viewBox="-12 -78 175 156"
              width="100%"
              style={{ maxWidth: 175, display: 'block' }}
              aria-hidden="true"
            >
              <TriMesh k={spotlightK} stroke={beat.spotlight === 4 ? HILITE : INK} strokeWidth={2} />
            </svg>
          ) : beat.spotlight === 6 ? (
            <svg viewBox="0 0 120 120" width="100%" style={{ maxWidth: 120, display: 'block' }} aria-hidden="true">
              <circle cx={60} cy={60} r={50} fill="#D1FAE5" stroke={GREEN} strokeWidth={2.4} />
              <text x={60} y={60} textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={900} fill="#065F46">
                {story.answer}
              </text>
            </svg>
          ) : (
            <div className="font-display text-2xl font-extrabold" style={{ color: '#30598A' }}>
              1 · 2 · 5 · 12 · …
            </div>
          )}
        </div>

        {/* running count table */}
        {beat.revealed.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {beat.revealed.map(({ pic, count }) => {
              const isAnswer = pic === 6
              return (
                <div
                  key={pic}
                  className="rounded-lg border-2 px-2.5 py-1 text-center font-display text-xs font-bold"
                  style={
                    isAnswer
                      ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                      : { background: '#F3F4F6', borderColor: '#9CA3AF', color: '#374151' }
                  }
                >
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{lang === 'id' ? `Gbr ${pic}` : `Pic ${pic}`}</div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{count}</div>
                </div>
              )
            })}
          </div>
        )}

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
