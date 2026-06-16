import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FractionFigure, FRACTIONS } from './FractionThirdG3Option'

// WMI-19F3A-Q2 — which picture shades exactly 1/3? Count shaded/total for each
// figure in turn; only B gives 2/6 = 1/3.

const GREEN = '#10B981'
const RED = '#DC2626'
const INK = '#1F2937'

export default function FractionThirdG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { reveal: 0, hold: 2300, result: false, caption: t('For each picture, count: shaded parts out of equal parts.', 'Untuk tiap gambar, hitung: bagian diarsir dari bagian sama besar.') },
      { reveal: 1, hold: 2300, result: false, caption: t('A: 4 of 8 → 4/8 = 1/2 — too much. ✗', 'A: 4 dari 8 → 4/8 = 1/2 — terlalu banyak. ✗') },
      { reveal: 2, hold: 2300, result: false, caption: t('B: 2 of 6 → 2/6 = 1/3. ✓', 'B: 2 dari 6 → 2/6 = 1/3. ✓') },
      { reveal: 3, hold: 2300, result: false, caption: t('C: 3 of 6 → 3/6 = 1/2 — too much. ✗', 'C: 3 dari 6 → 3/6 = 1/2 — terlalu banyak. ✗') },
      { reveal: 4, hold: 2300, result: false, caption: t('D: 1 of 4 → 1/4 — too little. ✗', 'D: 1 dari 4 → 1/4 — terlalu sedikit. ✗') },
      { reveal: 4, hold: 0, result: true, caption: t('Only B shades exactly 1/3.', 'Hanya B yang mengarsir tepat 1/3.') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const verdict = (label: string) => (label === 'B' ? '= 1/3 ✓' : label === 'D' ? '= 1/4 ✗' : '= 1/2 ✗')
  const aria = t('Only picture B shades two of six parts, which is one third.', 'Hanya gambar B yang mengarsir dua dari enam bagian, yaitu sepertiga.')

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 440 120" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {FRACTIONS.map((f, i) => {
            const on = i < beat.reveal || beat.result
            const good = f.label === 'B'
            return (
              <g key={f.label} transform={`translate(${i * 110}, 0)`} opacity={on ? 1 : 0.25}>
                <g transform="translate(5, 6)">
                  <FractionFigure label={f.label} />
                </g>
                <text x={55} y={88} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} className="font-display">
                  {f.label}: {f.shaded}/{f.total}
                </text>
                {on && (
                  <text x={55} y={106} textAnchor="middle" fontSize={12} fontWeight={900} fill={good ? GREEN : RED} className="font-display">
                    {verdict(f.label)}
                  </text>
                )}
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
