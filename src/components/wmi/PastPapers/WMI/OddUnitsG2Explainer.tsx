import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildOddUnitsG2Steps, ODD_PAIRS, POSSIBLE_UNITS, IMPOSSIBLE_UNIT } from './oddUnitsG2Steps'

const GREEN = '#10B981'
const BLUE = '#2563EB'
const RED = '#DC2626'
const INK = '#1F2937'

const VIEW_W = 360
const VIEW_H = 244
const ROW_Y0 = 24
const ROW_H = 28
const DIVIDER_Y = 158
const SUMMARY_Y = 182
const IMPOSSIBLE_Y = 216

export default function OddUnitsG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildOddUnitsG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: satuan hasil kali dua bilangan ganjil berurutan bisa 3, 5, atau 9 — tidak pernah 7.'
      : 'Explainer: the units digit of two successive odd numbers multiplied can be 3, 5, or 9 — never 7.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Five last-digit multiplication rows, revealed one at a time. */}
          {ODD_PAIRS.map((p, i) => {
            const shown = i < beat.revealRows
            const y = ROW_Y0 + i * ROW_H
            return (
              <g key={i} opacity={shown ? 1 : 0.16}>
                <text x={16} y={y} dominantBaseline="central" fontSize={16} fontWeight={700} fill={INK} className="font-display">
                  {`${p.a} × ${p.b} = ${p.prod}`}
                </text>
                <text x={150} y={y} dominantBaseline="central" fontSize={13} fill="#64748B">
                  {lang === 'id' ? 'satuan' : 'ends in'}
                </text>
                <circle cx={232} cy={y} r={13} fill={shown ? '#DBEAFE' : '#F1F5F9'} stroke={BLUE} strokeWidth={shown ? 2 : 1} />
                <text x={232} y={y} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={BLUE} className="font-display">
                  {p.unit}
                </text>
              </g>
            )
          })}

          <line x1={14} y1={DIVIDER_Y} x2={VIEW_W - 14} y2={DIVIDER_Y} stroke="#CBD5E1" strokeWidth={1.5} />

          {/* Collected possible last digits. */}
          <text x={16} y={SUMMARY_Y} dominantBaseline="central" fontSize={14} fontWeight={700} fill={INK}>
            {lang === 'id' ? 'Mungkin:' : 'Possible:'}
          </text>
          {POSSIBLE_UNITS.map((u, i) => {
            const on = beat.units.includes(u)
            const x = 120 + i * 40
            return (
              <g key={u} opacity={on ? 1 : 0.2}>
                <rect x={x - 14} y={SUMMARY_Y - 14} width={28} height={28} rx={6} fill={on ? '#D1FAE5' : '#FFFFFF'} stroke={GREEN} strokeWidth={2} />
                <text x={x} y={SUMMARY_Y} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill="#065F46" className="font-display">
                  {u}
                </text>
              </g>
            )
          })}

          {/* The impossible 7, revealed at the end. */}
          {beat.showImpossible && (
            <g>
              <text x={16} y={IMPOSSIBLE_Y} dominantBaseline="central" fontSize={14} fontWeight={700} fill={RED}>
                {lang === 'id' ? 'Tidak pernah:' : 'Never:'}
              </text>
              <rect x={120 - 14} y={IMPOSSIBLE_Y - 14} width={28} height={28} rx={6} fill="#FEE2E2" stroke={RED} strokeWidth={2} />
              <text x={120} y={IMPOSSIBLE_Y} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill={RED} className="font-display">
                {IMPOSSIBLE_UNIT}
              </text>
              <line x1={120 - 15} y1={IMPOSSIBLE_Y + 15} x2={120 + 15} y2={IMPOSSIBLE_Y - 15} stroke={RED} strokeWidth={2.5} strokeLinecap="round" />
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
