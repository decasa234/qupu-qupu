// Post-answer explainer for WMI-19P3A-Q5 (repeating-symbol pattern).
//
// Beat by beat: name the loop ○ × △ △, count along it to the "?" box (box 11 =
// slot 3 of the loop), and land on △ — answer C. Reuses the Q5Strip primitive
// from the illustration so the explainer is the same picture coming alive.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Q5Strip, Q5_QMARK_INDEX, Q5_ANSWER_GLYPH, GlyphMark } from './P19G3Q5Illustration'
import { buildP19G3Q5Steps } from './p19G3Q5Steps'

const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

/** Small inline rendering of the loop ○ × △ △ as a legend. */
function LoopLegend() {
  const cell = 30
  const glyphs = ['circle', 'cross', 'triangle', 'triangle'] as const
  const w = cell * glyphs.length
  return (
    <svg viewBox={`0 0 ${w} ${cell}`} width={w} height={cell} aria-hidden="true">
      {glyphs.map((g, i) => (
        <g key={i}>
          <rect x={i * cell} y={0} width={cell} height={cell} fill="#FFFFFF" stroke="#1F2937" strokeWidth={1.2} />
          <GlyphMark glyph={g} cx={i * cell + cell / 2} cy={cell / 2} size={16} />
        </g>
      ))}
    </svg>
  )
}

export default function P19G3Q5Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP19G3Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'The symbols repeat in the loop circle, cross, triangle, triangle. The question-mark box is slot three of the loop, which is a triangle, so the answer is C.',
    'Simbol berulang dalam putaran lingkaran, silang, segitiga, segitiga. Kotak tanda tanya adalah slot ketiga, yaitu segitiga, jadi jawabannya C.',
  )

  const showLegend = beat.phase !== 'show'

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-4"
        style={{ background: '#F4F8FF', borderColor: '#C9DDF7' }}
      >
        <div className="w-full overflow-x-auto">
          <Q5Strip
            highlightIndex={beat.highlightIndex}
            revealAt={beat.reveal ? { index: Q5_QMARK_INDEX, glyph: Q5_ANSWER_GLYPH } : null}
          />
        </div>

        <div className="flex min-h-[34px] items-center justify-center gap-2">
          {showLegend && (
            <>
              <span className="font-display text-xs font-bold" style={{ color: BRAND_BLUE }}>
                {t('loop:', 'putaran:')}
              </span>
              <LoopLegend />
            </>
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
