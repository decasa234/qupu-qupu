import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { EqualFractionsFigure, SQUARE_VALUE, CIRCLE_VALUE, EF_ANSWER } from './EqualFractionsG3Illustration'

// WMI-19F3A-Q7 — stacked fractions; derive ◻ and ◯ by scaling 3/4.

const GREEN = '#10B981'

export default function EqualFractionsG3VisualExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { square: null as number | null, circle: null as number | null, focus: null as 'square' | 'circle' | null, scale: null as string | null, hold: 2200, result: false, caption: t('Every fraction in this chain is worth 3/4.', 'Setiap pecahan dalam rantai ini bernilai 3/4.') },
      { square: SQUARE_VALUE, circle: null, focus: 'square' as const, scale: '×8', hold: 2800, result: false, caption: t('Bottom: 4 became 32 — that is × 8. The top must grow × 8 too: ◻ = 3 × 8 = 24.', 'Penyebut: 4 menjadi 32 — itu × 8. Pembilang juga harus × 8: ◻ = 3 × 8 = 24.') },
      { square: SQUARE_VALUE, circle: CIRCLE_VALUE, focus: 'circle' as const, scale: '×5', hold: 2800, result: false, caption: t('Top: 3 became 15 — that is × 5. The bottom must grow × 5 too: ◯ = 4 × 5 = 20.', 'Pembilang: 3 menjadi 15 — itu × 5. Penyebut juga harus × 5: ◯ = 4 × 5 = 20.') },
      { square: SQUARE_VALUE, circle: CIRCLE_VALUE, focus: null, scale: null, hold: 2300, result: false, caption: t('Check: 24/32 = 3/4 ✓ and 15/20 = 3/4 ✓.', 'Periksa: 24/32 = 3/4 ✓ dan 15/20 = 3/4 ✓.') },
      { square: SQUARE_VALUE, circle: CIRCLE_VALUE, focus: null, scale: null, hold: 0, result: true, caption: t(`◻ + ◯ = 24 + 20 = ${EF_ANSWER} (C).`, `◻ + ◯ = 24 + 20 = ${EF_ANSWER} (C).`) },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('Square is 24 and circle is 20, so the sum is 44.', 'Persegi 24 dan lingkaran 20, jadi jumlahnya 44.')

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <EqualFractionsFigure square={beat.square} circle={beat.circle} focus={beat.focus} scaleLabel={beat.scale} />
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
