import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  StepPerim21A16Figure,
  SP21_PERIMETER,
  type StepPerimPhase,
} from './StepPerim21A16Illustration'

// SEAMO-21-A-Q16 — staircase perimeter trick:
//   All horizontal pieces slide up → they tile one full top of 7 cm (+ floor 7).
//   All vertical pieces collapse → one left wall of 4 cm (+ matching right total 4).
//   Perimeter = 7 + 7 + 4 + 4 = 22 cm.

const GREEN = '#10B981'

export default function StepPerim21A16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(
    () => [
      {
        phase: null as StepPerimPhase,
        hold: 2000,
        result: false,
        caption: t(
          'All corners are right angles: 4 cm tall on the left, 7 cm wide at the bottom.',
          'Semua sudut siku-siku: tinggi 4 cm di kiri, lebar 7 cm di bawah.',
        ),
      },
      {
        phase: 'flat' as StepPerimPhase,
        hold: 3200,
        result: false,
        caption: t(
          'FLAT edges first: slide every top piece straight up — they tile one full top of 7 cm! With the floor (7 cm), flat total = 7 + 7 = 14 cm.',
          'Sisi DATAR dulu: geser tiap potongan atas ke atas — semuanya membentuk satu sisi atas utuh 7 cm! Dengan lantainya (7 cm), total datar = 7 + 7 = 14 cm.',
        ),
      },
      {
        phase: 'pair' as StepPerimPhase,
        hold: 3200,
        result: false,
        caption: t(
          'STANDING edges come in pairs: the left wall rises 4 cm, and all the step-downs together total 4 cm. So verticals = 4 + 4 = 8 cm.',
          'Sisi TEGAK berpasangan: dinding kiri naik 4 cm, dan semua turunan tangga totalnya juga 4 cm. Jadi tegak = 4 + 4 = 8 cm.',
        ),
      },
      {
        phase: null as StepPerimPhase,
        hold: 2600,
        result: false,
        caption: t(
          'Add them: 14 + 8 = 22 cm.',
          'Jumlahkan: 14 + 8 = 22 cm.',
        ),
      },
      {
        phase: null as StepPerimPhase,
        hold: 0,
        result: true,
        caption: t(
          `The perimeter is ${SP21_PERIMETER} cm (B). (Trap: counting only the 4 labelled outer edges gives 21 or 24.)`,
          `Kelilingnya ${SP21_PERIMETER} cm (B). (Jebakan: hanya menghitung 4 sisi luar berlabel memberi 21 atau 24.)`,
        ),
      },
    ],
    [lang],
  )

  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t(
    'Flat edges total 14 cm, standing edges total 8 cm, perimeter = 22 cm.',
    'Sisi datar total 14 cm, sisi tegak total 8 cm, keliling = 22 cm.',
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <StepPerim21A16Figure phase={beat.phase} />
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
