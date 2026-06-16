// Post-answer explainer for WMI-24P3A-Q12 (2024 Grade-3 Semifinal).
//
// Walks the "decode each row, then subtract" method beat by beat:
//   1. Recall the legend (big = 5, small = 1).
//   2. Spotlight Golden kudzu -> 2x5 + 1 = 11.
//   3. Spotlight Heteromeles -> 4 = 4.
//   4. Subtract: 11 - 4 = 7.
//   5. Reveal 7 plants drawn as 7 small stars -> answer B.
//
// Reuses the illustrator's StarRow primitive + PLANT_ROWS so the rows match the
// static figure exactly and the answer row is built from the verified DIFFERENCE.
// SSR-safe + deterministic: no window/document at module top, no Math.random/Date.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DIFFERENCE, HETER_TOTAL, KUDZU_TOTAL, PLANT_ROWS, Q12_VIEW_W, StarRow } from './P24G3Q12Illustration'
import { buildP24G3Q12Steps } from './p24G3Q12Steps'

const INK = '#1F2937'
const GREEN = '#10B981'
const AMBER = '#F59E0B'
const GREEN_STAR = '#34D399'

const ROW_H = 50
const TOP_Y = 14
const LABEL_X = 14
const STARS_X = 150
const VALUE_X = Q12_VIEW_W - 46

export default function P24G3Q12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G3Q12Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const rows = PLANT_ROWS
  const answerRowY = TOP_Y + rows.length * ROW_H + 18
  const height = answerRowY + (beat.showAnswerRow ? ROW_H : 8)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Golden kudzu ${KUDZU_TOTAL}, Heteromeles ${HETER_TOTAL}, selisih ${DIFFERENCE} tanaman = ${DIFFERENCE} bintang kecil, jawaban B.`
      : `Explainer: Golden kudzu ${KUDZU_TOTAL}, Heteromeles ${HETER_TOTAL}, gap ${DIFFERENCE} plants = ${DIFFERENCE} small stars, answer B.`

  const valueTag = (x: number, y: number, value: number, color: string) => (
    <g>
      <rect x={x - 18} y={y - 13} width={40} height={26} rx={8} fill={color} />
      <text x={x + 2} y={y} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#fff">
        {value}
      </text>
    </g>
  )

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${Q12_VIEW_W} ${height}`} width="100%" style={{ maxWidth: Q12_VIEW_W, display: 'block' }} aria-hidden="true">
          {rows.map((r, i) => {
            const cy = TOP_Y + i * ROW_H + ROW_H / 2
            const isFocus = beat.focus === r.key
            const showVal = (r.key === 'kudzu' && beat.showKudzuValue) || (r.key === 'heter' && beat.showHeterValue)
            return (
              <g key={r.key} opacity={beat.focus && !isFocus ? 0.4 : 1}>
                {isFocus && (
                  <rect x={4} y={cy - ROW_H / 2 + 2} width={Q12_VIEW_W - 8} height={ROW_H - 4} rx={10} fill="#FEF3C7" />
                )}
                <text x={LABEL_X} y={cy} dominantBaseline="central" fontSize={13} fontWeight={700} fill={INK}>
                  {lang === 'id' ? r.labelId : r.labelEn}
                </text>
                <StarRow x0={STARS_X} y={cy} big={r.big} small={r.small} />
                {showVal && valueTag(VALUE_X, cy, r.key === 'kudzu' ? KUDZU_TOTAL : HETER_TOTAL, AMBER)}
              </g>
            )
          })}

          {/* Answer row: the difference shown as small stars */}
          {beat.showAnswerRow && (
            <g>
              <line x1={LABEL_X} y1={answerRowY - 6} x2={Q12_VIEW_W - 14} y2={answerRowY - 6} stroke="#CBD5E1" strokeWidth={1.4} />
              <text x={LABEL_X} y={answerRowY + ROW_H / 2} dominantBaseline="central" fontSize={13} fontWeight={800} fill={GREEN}>
                {lang === 'id' ? 'Selisih' : 'Difference'}
              </text>
              <StarRow x0={STARS_X} y={answerRowY + ROW_H / 2} big={0} small={DIFFERENCE} smallFill={GREEN_STAR} />
              {valueTag(VALUE_X, answerRowY + ROW_H / 2, DIFFERENCE, GREEN)}
            </g>
          )}
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
