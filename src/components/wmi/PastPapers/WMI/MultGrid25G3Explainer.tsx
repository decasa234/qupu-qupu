import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  MultGrid25G3Figure,
  MULT_SOLUTION25G3,
  MULT_Q_VALUE25G3,
} from './MultGrid25G3Illustration'

// WMI-25F3A-Q14 — factor the three known shaded cells to reveal A, B, C, D,
// then compute ? = A × B and finally its digit sum.
//
// Answer: D (digit sum 15)

const GREEN = '#10B981'

// Derive all values from the exported constants — no hardcoding.
const { A, B, C, D } = MULT_SOLUTION25G3
const Q = MULT_Q_VALUE25G3
const Q_TENS = Math.floor(Q / 10)
const Q_UNITS = Q % 10
const DIGIT_SUM = Q_TENS + Q_UNITS

export default function MultGrid25G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => {
    return [
      // Beat 0 — introduce the rule
      {
        whites: {} as Partial<Record<'A' | 'B' | 'C' | 'D', number>>,
        revealQ: false,
        hold: 2800,
        result: false,
        caption: t(
          'Each shaded cell = the product of the two white cells in its row or column. Let\'s find A, B, C, D!',
          'Tiap kotak berbayang = hasil kali dua kotak putih di baris atau kolomnya. Mari cari A, B, C, D!',
        ),
      },
      // Beat 1 — 91 and 56 share the factor 7 → C=7
      {
        whites: { C } as Partial<Record<'A' | 'B' | 'C' | 'D', number>>,
        revealQ: false,
        hold: 2600,
        result: false,
        caption: t(
          `91 = ${C} × ${A} and 56 = ${C} × ${D} — the shared factor is ${C}. So C = ${C}.`,
          `91 = ${C} × ${A} dan 56 = ${C} × ${D} — faktor yang sama adalah ${C}. Jadi C = ${C}.`,
        ),
      },
      // Beat 2 — factor 56 → D=8
      {
        whites: { C, D } as Partial<Record<'A' | 'B' | 'C' | 'D', number>>,
        revealQ: false,
        hold: 2400,
        result: false,
        caption: t(
          `56 = ${C} × ${D} → the bottom-row white cells are ${C} and ${D}. D = ${D}.`,
          `56 = ${C} × ${D} → kotak putih baris bawah adalah ${C} dan ${D}. D = ${D}.`,
        ),
      },
      // Beat 3 — factor 48 → B=6
      {
        whites: { B, C, D } as Partial<Record<'A' | 'B' | 'C' | 'D', number>>,
        revealQ: false,
        hold: 2400,
        result: false,
        caption: t(
          `48 = ${B} × ${D} → the right-column white cells are ${B} and ${D}. B = ${B}.`,
          `48 = ${B} × ${D} → kotak putih kolom kanan adalah ${B} dan ${D}. B = ${B}.`,
        ),
      },
      // Beat 4 — derive A from 91 ÷ C
      {
        whites: { A, B, C, D } as Partial<Record<'A' | 'B' | 'C' | 'D', number>>,
        revealQ: false,
        hold: 2400,
        result: false,
        caption: t(
          `91 = A × ${C} → A = 91 ÷ ${C} = ${A}. All four white cells found!`,
          `91 = A × ${C} → A = 91 ÷ ${C} = ${A}. Semua kotak putih ditemukan!`,
        ),
      },
      // Beat 5 — compute ? = A × B = 78
      {
        whites: { A, B, C, D } as Partial<Record<'A' | 'B' | 'C' | 'D', number>>,
        revealQ: true,
        hold: 2600,
        result: false,
        caption: t(
          `? = A × B = ${A} × ${B} = ${Q}`,
          `? = A × B = ${A} × ${B} = ${Q}`,
        ),
      },
      // Beat 6 — digit sum → answer D (hold: 0 = final)
      {
        whites: { A, B, C, D } as Partial<Record<'A' | 'B' | 'C' | 'D', number>>,
        revealQ: true,
        hold: 0,
        result: true,
        caption: t(
          `Digit sum of ${Q}: ${Q_TENS} + ${Q_UNITS} = ${DIGIT_SUM} → answer D`,
          `Jumlah digit ${Q}: ${Q_TENS} + ${Q_UNITS} = ${DIGIT_SUM} → jawaban D`,
        ),
      },
    ]
  }, [lang])

  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const ariaLabel = t(
    `Factor the known products: 91 = ${A} × ${C}, 56 = ${C} × ${D}, 48 = ${B} × ${D}. Missing value ? = ${A} × ${B} = ${Q}. Digit sum ${Q_TENS} + ${Q_UNITS} = ${DIGIT_SUM}, answer D.`,
    `Faktorkan hasil kali yang diketahui: 91 = ${A} × ${C}, 56 = ${C} × ${D}, 48 = ${B} × ${D}. Nilai yang hilang ? = ${A} × ${B} = ${Q}. Jumlah digit ${Q_TENS} + ${Q_UNITS} = ${DIGIT_SUM}, jawaban D.`,
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <MultGrid25G3Figure whites={beat.whites} revealQ={beat.revealQ} />
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
