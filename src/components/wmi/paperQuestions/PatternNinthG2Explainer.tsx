import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  FOODS,
  ANSWER_FOOD,
  FoodGlyph,
  StarMarker,
  foodX,
  starX,
  ROW_Y,
  ROW_VIEW_W,
  ROW_VIEW_H,
} from './PatternNinthG2Illustration'
import { buildPatternNinthG2Steps } from './patternNinthG2Steps'

const GREEN = '#10B981'
const PURPLE = '#341857'

/** Answer options A/B/C/D as drawn in the original figure. D is the answer (🍡). */
const OPTIONS: { label: 'A' | 'B' | 'C' | 'D'; emoji: string }[] = [
  { label: 'A', emoji: '🍣' },
  { label: 'B', emoji: '🍤' },
  { label: 'C', emoji: '🍥' },
  { label: 'D', emoji: ANSWER_FOOD }, // 🍡
]

export default function PatternNinthG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPatternNinthG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  /** Left index of each picture that has already been counted (for the numerals). */
  const counted = beat.count // how many pictures, starting at the ★, are counted so far

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hitung 9 gambar dari ★ bergerak ke kiri — gambar ke-9 adalah 🍡, jawaban D.'
      : 'Explainer: count 9 pictures from the ★ moving left — the 9th picture is 🍡, answer D.'

  return (
    <div className="mx-auto w-full max-w-[600px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The row of 13 food pictures with the ★ at the right end. */}
        <svg viewBox={`0 0 ${ROW_VIEW_W} ${ROW_VIEW_H}`} width="100%" style={{ maxWidth: ROW_VIEW_W }} aria-hidden="true">
          {FOODS.map((emoji, i) => {
            // n = how many steps from the ★ this picture sits (1 = rightmost food).
            const n = FOODS.length - i
            const isCounted = beat.phase !== 'show' && n <= counted
            const isActive = i === beat.activeIndex
            const lit = beat.phase === 'show' ? true : isCounted
            return (
              <g key={i}>
                {isActive && (
                  <circle cx={foodX(i)} cy={ROW_Y} r={20} fill="none" stroke={GREEN} strokeWidth={2.5} />
                )}
                <FoodGlyph emoji={emoji} cx={foodX(i)} cy={ROW_Y} opacity={lit ? 1 : 0.3} />
                {isCounted && (
                  <text x={foodX(i)} y={ROW_Y - 26} textAnchor="middle" fontSize={11} fontWeight="bold" fill={PURPLE}>
                    {n}
                  </text>
                )}
              </g>
            )
          })}
          {/* ★ at the far right end — pulsed at the start. */}
          {beat.phase === 'show' && (
            <circle cx={starX()} cy={ROW_Y} r={20} fill="none" stroke={GREEN} strokeWidth={2.5} />
          )}
          <StarMarker cx={starX()} cy={ROW_Y} />
        </svg>

        {/* Answer options A B C D. */}
        <svg viewBox="0 0 540 70" width="100%" style={{ maxWidth: 420 }} aria-hidden="true">
          {OPTIONS.map((opt, i) => {
            const cx = 80 + i * 130
            const chosen = beat.highlightOption === opt.label
            return (
              <g key={opt.label}>
                {chosen && <circle cx={cx} cy={26} r={22} fill="none" stroke={GREEN} strokeWidth={3} />}
                <FoodGlyph emoji={opt.emoji} cx={cx} cy={26} size={26} />
                <text x={cx} y={62} textAnchor="middle" fontSize={14} fontWeight="bold" fill={chosen ? '#065F46' : PURPLE}>
                  {opt.label}
                </text>
              </g>
            )
          })}
        </svg>

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
