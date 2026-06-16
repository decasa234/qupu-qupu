import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'

// WMI-19F1A-Q9 — elevator from floor 12, up 6 floors. Kid-visual: a building
// shaft with labelled floors; the car rides up while the floors are counted
// 13, 14, … 18 — the answer is reached by counting, not asserted.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const INK = '#1F2937'
const VIEW_W = 240
const VIEW_H = 240

const FLOORS = [12, 13, 14, 15, 16, 17, 18]
const SHAFT_X = 96
const SHAFT_W = 56
const TOP_Y = 26
const FLOOR_H = 26
const floorY = (f: number) => TOP_Y + (FLOORS[FLOORS.length - 1] - f) * FLOOR_H

export default function ElevatorRideG1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { at: 12, counted: 0, hold: 2200, result: false, caption: t('You start on floor 12.', 'Kamu mulai di lantai 12.') },
      { at: 15, counted: 3, hold: 2300, result: false, caption: t('Ride UP, counting the floors: 13, 14, 15 …', 'Naik ke ATAS sambil menghitung lantai: 13, 14, 15 …') },
      { at: 18, counted: 6, hold: 2300, result: false, caption: t('… 16, 17, 18 — that is 6 floors up.', '… 16, 17, 18 — itu 6 lantai ke atas.') },
      { at: 18, counted: 6, hold: 0, result: true, caption: t('12 + 6 = 18 — you are on floor 18 (B).', '12 + 6 = 18 — kamu di lantai 18 (B).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('Riding up 6 floors from floor 12 reaches floor 18.', 'Naik 6 lantai dari lantai 12 sampai di lantai 18.')

  return (
    <div className="mx-auto w-full max-w-[280px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 280, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* building outline */}
          <rect x={SHAFT_X - 14} y={TOP_Y - 12} width={SHAFT_W + 28} height={FLOORS.length * FLOOR_H + 18} rx={8} fill="#F8FAFC" stroke={INK} strokeWidth={2} />

          {/* floors */}
          {FLOORS.map((f) => {
            const y = floorY(f)
            const counted = f > 12 && f <= 12 + beat.counted
            return (
              <g key={f}>
                <line x1={SHAFT_X - 6} y1={y + FLOOR_H - 4} x2={SHAFT_X + SHAFT_W + 6} y2={y + FLOOR_H - 4} stroke="#CBD5E1" strokeWidth={1.5} />
                <text
                  x={SHAFT_X - 22}
                  y={y + FLOOR_H / 2 + 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight={counted || f === 12 ? 900 : 700}
                  fill={counted ? BLUE : f === 12 ? INK : '#94A3B8'}
                  className="font-display"
                >
                  {f}
                </text>
                {counted && (
                  <text x={SHAFT_X + SHAFT_W + 14} y={y + FLOOR_H / 2 + 2} dominantBaseline="central" fontSize={12} fontWeight={800} fill={BLUE} className="font-display">
                    +{f - 12}
                  </text>
                )}
              </g>
            )
          })}

          {/* elevator car */}
          <g>
            <rect x={SHAFT_X + 6} y={floorY(beat.at) + 2} width={SHAFT_W - 12} height={FLOOR_H - 8} rx={5} fill={beat.result ? '#D1FAE5' : '#DBEAFE'} stroke={beat.result ? GREEN : BLUE} strokeWidth={2.5} />
            <text
              x={SHAFT_X + SHAFT_W / 2}
              y={floorY(beat.at) + FLOOR_H / 2 - 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              fontWeight={900}
              fill={beat.result ? '#065F46' : '#1E3A8A'}
              className="font-display"
            >
              {beat.at}
            </text>
          </g>
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
