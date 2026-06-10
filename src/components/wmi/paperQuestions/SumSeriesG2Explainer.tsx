import { useMemo, type ComponentType } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { buildSumSeriesSteps, NUMBERS, MIDDLE_INDEX } from './sumSeriesG2Steps'

// "Give and take" levelling explainer for five evenly spaced numbers. Shared by
// G2 Q16 (168…128 → 148 × 5) and G1 Q16 (68…28 → 48 × 5) via the factory below.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const INK = '#1F2937'
const VIEW_W = 360
const VIEW_H = 150
const BOX_W = 52
const GAP = 10
const BOX_Y = 56
const BOX_H = 40

export function makeSumSeriesExplainer(numbers: number[]): ComponentType<ExplainerProps> {
  const mid = numbers[MIDDLE_INDEX]
  const count = numbers.length
  const total = mid * count
  const totalW = count * BOX_W + (count - 1) * GAP
  const x0 = (VIEW_W - totalW) / 2
  const cx = (i: number) => x0 + i * (BOX_W + GAP) + BOX_W / 2
  const dOuter = Math.abs(numbers[0] - mid)
  const dInner = Math.abs(numbers[1] - mid)

  return function SumSeriesExplainer(props: ExplainerProps) {
    const lang = props.lang ?? 'en'
    const story = useMemo(() => buildSumSeriesSteps(lang, numbers), [lang])
    const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
    const beat = story.steps[index] ?? story.steps[story.finalIndex]

    const value = (i: number) => {
      if (i === MIDDLE_INDEX) return mid
      if (i === 0 || i === 4) return beat.give20 || beat.leveled ? mid : numbers[i]
      return beat.give10 || beat.leveled ? mid : numbers[i]
    }
    const level = (i: number) =>
      i === MIDDLE_INDEX ||
      ((i === 0 || i === 4) && (beat.give20 || beat.leveled)) ||
      ((i === 1 || i === 3) && (beat.give10 || beat.leveled))

    const ariaLabel =
      lang === 'id'
        ? `Penjelasan: angka di atas dan di bawah ${mid} saling menutup, jadi kelimanya menjadi ${mid}; jumlah = ${mid} × ${count} = ${total}.`
        : `Explainer: the amounts above and below ${mid} cancel out, so all five become ${mid}; sum = ${mid} × ${count} = ${total}.`

    return (
      <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
        <div className="flex flex-col items-center gap-3">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
            {/* give arcs while levelling */}
            {beat.give20 && !beat.leveled && (
              <g>
                <path d={`M ${cx(0)} ${BOX_Y} Q ${VIEW_W / 2} -24 ${cx(4)} ${BOX_Y}`} fill="none" stroke={GREEN} strokeWidth={2} />
                <text x={VIEW_W / 2} y={18} textAnchor="middle" fontSize={13} fontWeight={800} fill={GREEN} className="font-display">{dOuter}</text>
              </g>
            )}
            {beat.give10 && !beat.leveled && (
              <g>
                <path d={`M ${cx(1)} ${BOX_Y} Q ${VIEW_W / 2} 12 ${cx(3)} ${BOX_Y}`} fill="none" stroke={GREEN} strokeWidth={2} />
                <text x={VIEW_W / 2} y={42} textAnchor="middle" fontSize={13} fontWeight={800} fill={GREEN} className="font-display">{dInner}</text>
              </g>
            )}

            {numbers.map((_, i) => {
              const x = x0 + i * (BOX_W + GAP)
              const lv = level(i)
              return (
                <g key={i}>
                  <rect x={x} y={BOX_Y} width={BOX_W} height={BOX_H} rx={6} fill={lv ? '#D1FAE5' : '#FFFFFF'} stroke={lv ? GREEN : '#CBD5E1'} strokeWidth={lv ? 3 : 2} />
                  <text x={x + BOX_W / 2} y={BOX_Y + BOX_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={800} fill={lv ? '#065F46' : INK} className="font-display">
                    {value(i)}
                  </text>
                </g>
              )
            })}

            {beat.showProduct && (
              <text x={VIEW_W / 2} y={120} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={beat.showTotal ? GREEN : BLUE} className="font-display">
                {beat.showTotal ? `${mid} × ${count} = ${total}` : `${mid} × ${count}`}
              </text>
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
}

/** WMI-19F1A-Q16 — 68 + 58 + 48 + 38 + 28 = 48 × 5 = 240. */
export const SumSeriesG1Explainer = makeSumSeriesExplainer([68, 58, 48, 38, 28])

/** WMI-19F2A-Q16 — 168 + 158 + 148 + 138 + 128 = 148 × 5 = 740. */
export default makeSumSeriesExplainer(NUMBERS)
