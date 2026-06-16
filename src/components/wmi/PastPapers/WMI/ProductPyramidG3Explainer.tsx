import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ProductPyramidFigure, PP_M, PP_R, PP_STAR } from './ProductPyramidG3Illustration'

// WMI-19F3A-Q12 — derive ★ from the product rule, one box at a time.

const GREEN = '#10B981'

export default function ProductPyramidG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { m: null as number | null, r: null as number | null, star: null as number | null, active: [] as string[], lit: ['l6', 'b2a', 'b3', 'r2', 'b2b', 'b1'], hold: 2600, result: false, caption: t('Each number = the two numbers below it MULTIPLIED. Check: 6 = 2 × 3 ✓ and 2 = 2 × 1 ✓.', 'Tiap bilangan = dua bilangan di bawahnya DIKALIKAN. Periksa: 6 = 2 × 3 ✓ dan 2 = 2 × 1 ✓.') },
      { m: PP_M, r: null, star: null, active: ['m'], lit: ['l24', 'l6'], hold: 2800, result: false, caption: t('24 sits above 6 and the box: 24 = 6 × box → box = 24 ÷ 6 = 4.', '24 berada di atas 6 dan kotak: 24 = 6 × kotak → kotak = 24 ÷ 6 = 4.') },
      { m: PP_M, r: PP_R, star: null, active: ['r'], lit: ['m', 'r2'], hold: 2600, result: false, caption: t('The right box sits above 4 and 2: it is 4 × 2 = 8.', 'Kotak kanan berada di atas 4 dan 2: nilainya 4 × 2 = 8.') },
      { m: PP_M, r: PP_R, star: PP_STAR, active: ['star'], lit: ['l24', 'r'], hold: 2600, result: false, caption: t('★ sits above 24 and 8: ★ = 24 × 8 = 192.', '★ berada di atas 24 dan 8: ★ = 24 × 8 = 192.') },
      { m: PP_M, r: PP_R, star: PP_STAR, active: ['star'], lit: [], hold: 0, result: true, caption: t('★ = 192 (C).', '★ = 192 (C).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('The middle box is 4, the right box is 8, and the star is 24 times 8, which is 192.', 'Kotak tengah 4, kotak kanan 8, dan bintang 24 kali 8, yaitu 192.')

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <ProductPyramidFigure m={beat.m} r={beat.r} star={beat.star} activeKeys={beat.active} litKeys={beat.lit} />
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
