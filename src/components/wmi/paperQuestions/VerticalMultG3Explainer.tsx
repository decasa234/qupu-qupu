import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { VerticalMultFigure, VM_PRODUCT } from './VerticalMultG3Illustration'

// WMI-19F3A-Q22 — derive every hidden digit:
//   top × 9 is 3-digit with middle 1 → top ∈ 100…111 → only 102 × 9 = 918;
//   the product starts with 2 → tens digit 2 (19 → 1938 ✗, 29 → 2958 ✓, 39 → 3978 ✗);
//   102 × 2 = 204 (middle 0 ✓); product 2958.

const GREEN = '#10B981'

export default function VerticalMultG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { reveal: [] as number[], focus: null as number | null, hold: 2400, result: false, caption: t('Top × 9 makes the first row; top × the hidden tens makes the second row.', 'Atas × 9 menghasilkan baris pertama; atas × puluhan tersembunyi menghasilkan baris kedua.') },
      { reveal: [], focus: 2, hold: 2800, result: false, caption: t('Row ◻1◻ = top × 9 is only 3 digits → top is 100…111 (112 × 9 already has 4 digits).', 'Baris ◻1◻ = atas × 9 hanya 3 angka → atas 100…111 (112 × 9 sudah 4 angka).') },
      { reveal: [], focus: 2, hold: 2400, result: false, caption: t('Try 100: 100 × 9 = 900 — middle digit 0, not 1 ✗.', 'Coba 100: 100 × 9 = 900 — angka tengahnya 0, bukan 1 ✗.') },
      { reveal: [], focus: 2, hold: 2400, result: false, caption: t('Try 101: 101 × 9 = 909 — middle digit 0 again ✗.', 'Coba 101: 101 × 9 = 909 — tengahnya 0 lagi ✗.') },
      { reveal: [0, 2], focus: 0, hold: 2800, result: false, caption: t('Try 102: 102 × 9 = 918 — middle digit 1 ✓!', 'Coba 102: 102 × 9 = 918 — angka tengahnya 1 ✓!') },
      { reveal: [0, 2], focus: 0, hold: 2800, result: false, caption: t('And 103…111? They give 927, 936, … 999 — the middle climbs 2,3,…9, never 1. So the top number = 102.', 'Lalu 103…111? Hasilnya 927, 936, … 999 — tengahnya naik 2,3,…9, tak pernah 1. Jadi bilangan atas = 102.') },
      { reveal: [0, 2], focus: 1, hold: 2600, result: false, caption: t('Next clue: the final answer starts with 2. The hidden tens digit could be 1, 2, or 3 — try each!', 'Petunjuk berikut: jawaban akhirnya berawalan 2. Angka puluhan tersembunyi bisa 1, 2, atau 3 — coba satu-satu!') },
      { reveal: [0, 2], focus: 1, hold: 2400, result: false, caption: t('Tens = 1: 102 × 19 = 1938 — starts with 1 ✗.', 'Puluhan = 1: 102 × 19 = 1938 — berawalan 1 ✗.') },
      { reveal: [0, 1, 2], focus: 1, hold: 2400, result: false, caption: t('Tens = 2: 102 × 29 = 2958 — starts with 2 ✓!', 'Puluhan = 2: 102 × 29 = 2958 — berawalan 2 ✓!') },
      { reveal: [0, 1, 2], focus: 1, hold: 2400, result: false, caption: t('Tens = 3: 102 × 39 = 3978 — starts with 3 ✗. So the tens digit is 2.', 'Puluhan = 3: 102 × 39 = 3978 — berawalan 3 ✗. Jadi angka puluhannya 2.') },
      { reveal: [0, 1, 2, 3], focus: 3, hold: 2400, result: false, caption: t('Check the second row: 102 × 2 = 204 — middle 0 ✓.', 'Periksa baris kedua: 102 × 2 = 204 — tengahnya 0 ✓.') },
      { reveal: [0, 1, 2, 3, 4], focus: 4, hold: 2400, result: false, caption: t('Add: 918 + 2040 = 2958.', 'Jumlahkan: 918 + 2040 = 2958.') },
      { reveal: [0, 1, 2, 3, 4], focus: null, hold: 0, result: true, caption: t(`The product is ${VM_PRODUCT}.`, `Hasil kalinya ${VM_PRODUCT}.`) },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('Only 102 times 9 gives a middle digit of 1, and only a tens digit of 2 starts the product with 2: 102 times 29 is 2958.', 'Hanya 102 kali 9 yang tengahnya 1, dan hanya puluhan 2 yang membuat hasil berawalan 2: 102 kali 29 adalah 2958.')

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <VerticalMultFigure revealRows={beat.reveal} focusRow={beat.focus} />
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
