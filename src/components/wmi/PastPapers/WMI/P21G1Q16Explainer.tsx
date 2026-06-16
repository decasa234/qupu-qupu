import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ANSWER_FRUIT,
  BracketCell,
  CYCLE,
  FruitGlyph,
  MARK_POS,
  OPTIONS,
  ROW_LEN,
} from './P21G1Q16Illustration'
import { buildP21G1Q16Steps } from './p21G1Q16Steps'

// WMI-21P1A-Q16 — post-answer explainer. Reuses the illustration's FruitGlyph /
// CYCLE / OPTIONS so the animated row is literally the same fruits. It reveals
// the repeating cycle, counts 10 from the right onto the bracket cell, fills the
// bracket with the cycle fruit (cherry), then crowns option C.

const INK = '#1F2937'
const GREEN = '#10B981'
const BLUE = '#30598A'

const VIEW_W = 392
const VIEW_H = 196

const ROW_Y = 46
const ROW_X0 = 24
const ROW_STEP = 30

const OPT_Y = 158
const OPT_X0 = 64
const OPT_STEP = 84

export default function P21G1Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP21G1Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? `Penjelasan: lanjutkan pola berulang; sel ke-10 dari kanan berisi ${story.answerFruitEmoji}, yaitu pilihan (${story.answerLabel}).`
      : `Explainer: continue the repeating pattern; the 10th cell from the right holds ${story.answerFruitEmoji}, which is option (${story.answerLabel}).`

  // 1-indexed positions counted from the right (the rightmost is 1).
  const countedFromRight = beat.countFromRight

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* cycle bracket under the first three fruits */}
          {beat.showCycle && (
            <g>
              <path
                d={`M ${ROW_X0 - 12} ${ROW_Y + 16} v 6 h ${2 * ROW_STEP + 24} v -6`}
                fill="none"
                stroke={BLUE}
                strokeWidth={2}
              />
              <text x={ROW_X0 + ROW_STEP} y={ROW_Y + 36} textAnchor="middle" fontSize={11} fontWeight={800} fill={BLUE} className="font-display">
                {lang === 'id' ? 'pola berulang' : 'repeats'}
              </text>
            </g>
          )}

          {/* the repeating row */}
          {Array.from({ length: ROW_LEN }).map((_, i) => {
            const pos = i + 1 // from left
            const fromRight = ROW_LEN - pos + 1
            const cx = ROW_X0 + i * ROW_STEP
            const isMark = pos === MARK_POS
            const isCounted = countedFromRight > 0 && fromRight <= countedFromRight
            const isTenth = fromRight === 10

            if (isMark) {
              const filled = beat.fillBracket
              return (
                <g key={pos}>
                  <rect
                    x={cx - 13}
                    y={ROW_Y - 15}
                    width={26}
                    height={30}
                    rx={5}
                    fill={filled ? 'rgba(16,185,129,0.14)' : 'none'}
                    stroke={isTenth && isCounted ? GREEN : BLUE}
                    strokeWidth={2.2}
                    strokeDasharray={filled ? undefined : '3 3'}
                  />
                  {filled ? (
                    <FruitGlyph fruit={ANSWER_FRUIT} cx={cx} cy={ROW_Y} />
                  ) : (
                    <BracketCell cx={cx} cy={ROW_Y} color={isTenth && isCounted ? GREEN : BLUE} />
                  )}
                  <text x={cx} y={ROW_Y - 26} textAnchor="middle" dominantBaseline="central" fontSize={13} aria-hidden="true">
                    ⭐
                  </text>
                  {isCounted && isTenth && (
                    <text x={cx} y={ROW_Y + 28} textAnchor="middle" fontSize={11} fontWeight={900} fill={GREEN} className="font-display">
                      10
                    </text>
                  )}
                </g>
              )
            }

            return (
              <g key={pos} opacity={countedFromRight > 0 && !isCounted ? 0.45 : 1}>
                <FruitGlyph fruit={CYCLE[i % CYCLE.length]} cx={cx} cy={ROW_Y} />
                {isCounted && (
                  <text x={cx} y={ROW_Y + 26} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94A3B8" className="font-display">
                    {fromRight}
                  </text>
                )}
              </g>
            )
          })}

          {/* count direction arrow (right → left) */}
          {countedFromRight > 0 && (
            <text
              x={ROW_X0 + (ROW_LEN - 1) * ROW_STEP + 2}
              y={ROW_Y}
              textAnchor="start"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={900}
              fill="#6B7280"
              className="font-display"
            >
              →
            </text>
          )}

          {/* the four options */}
          {(Object.keys(OPTIONS) as Array<'A' | 'B' | 'C' | 'D'>).map((label, i) => {
            const cx = OPT_X0 + i * OPT_STEP
            const isAns = beat.showOption && label === story.answerLabel
            return (
              <g key={label}>
                {isAns && <circle cx={cx + 8} cy={OPT_Y} r={20} fill="rgba(16,185,129,0.14)" stroke={GREEN} strokeWidth={2.5} />}
                <text
                  x={cx - 22}
                  y={OPT_Y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight={900}
                  fill={isAns ? GREEN : INK}
                  className="font-display"
                >
                  {`(${label})`}
                </text>
                <FruitGlyph fruit={OPTIONS[label]} cx={cx + 8} cy={OPT_Y} />
              </g>
            )
          })}
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
