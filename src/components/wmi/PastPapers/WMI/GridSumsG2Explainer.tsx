import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridSums18Figure } from './puzzles20G2Illustrations'
import type { ShapeKind } from './puzzles20G2Illustrations'

// WMI-20F2A-Q18 — row/column sums grid: circle=21, pentagon=8, square=13 → ◻×⬠=104.
// Strategy: subtract the two circle-heavy rows to isolate pentagon, then
// back-substitute to get square, then verify circle. Reveal one value per beat.

const GREEN = '#10B981'
const BLUE = '#30598A'

interface Beat {
  values: Partial<Record<ShapeKind, number>>
  hold: number
  result: boolean
  caption: string
  highlight: string // short equation shown above the grid
}

export default function GridSumsG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo((): Beat[] => [
    {
      values: {},
      hold: 2400,
      result: false,
      caption: t(
        'Each border number is the sum of its row or column. We need to find each shape\'s value!',
        'Setiap angka di pinggir adalah jumlah baris atau kolomnya. Kita cari nilai tiap bentuk!',
      ),
      highlight: t('Row sums: 50, 29, 34  ·  Column sums: 42, 37, 34', 'Jumlah baris: 50, 29, 34  ·  Jumlah kolom: 42, 37, 34'),
    },
    {
      values: {},
      hold: 2800,
      result: false,
      caption: t(
        'Row 1: ◯+◯+⬠ = 50  and  Row 3: ◻+⬠+◻ uses square. But rows 1 & 3 share ⬠. Subtract row 3 from row 1: (2◯+⬠) − (◻+⬠+◻) needs both unknowns.',
        'Baris 1: ◯+◯+⬠ = 50  dan  Baris 3: ◻+⬠+◻. Coba pakai baris 1 & 2 yang sama-sama punya ⬠.',
      ),
      highlight: t('Row 1: 2◯+⬠=50    Row 2: 2⬠+◻=29', 'Baris 1: 2◯+⬠=50    Baris 2: 2⬠+◻=29'),
    },
    {
      values: {},
      hold: 2800,
      result: false,
      caption: t(
        'Col 2: ◯+⬠+⬠ = 37. So ◯+2⬠ = 37. And row 1 gives 2◯+⬠ = 50. Subtract: (2◯+⬠)−(◯+2⬠) = 50−37 → ◯−⬠ = 13.',
        'Kolom 2: ◯+⬠+⬠ = 37, jadi ◯+2⬠ = 37. Baris 1: 2◯+⬠ = 50. Kurangkan: ◯−⬠ = 13.',
      ),
      highlight: t('2◯+⬠=50  minus  ◯+2⬠=37  →  ◯−⬠=13', '2◯+⬠=50  dikurangi  ◯+2⬠=37  →  ◯−⬠=13'),
    },
    {
      values: { p: 8 },
      hold: 2600,
      result: false,
      caption: t(
        'Row 2: ⬠+⬠+◻ = 29. Col 3: ⬠+◻+◻ = 34. Subtract: ⬠−◻ = 29−34 = −5. Combined with ◯−⬠=13 and 2◯+⬠=50: pentagon ⬠ = 8!',
        'Baris 2: 2⬠+◻ = 29. Kolom 3: ⬠+2◻ = 34. Kurangkan: ⬠−◻ = −5. Gabungkan dengan sistem persamaan → ⬠ = 8!',
      ),
      highlight: t('⬠ = 8  ✓', '⬠ = 8  ✓'),
    },
    {
      values: { p: 8, s: 13 },
      hold: 2400,
      result: false,
      caption: t(
        'Now row 2: ⬠+⬠+◻ = 29 → 8+8+◻ = 29 → ◻ = 29−16 = 13!',
        'Sekarang baris 2: ⬠+⬠+◻ = 29 → 8+8+◻ = 29 → ◻ = 29−16 = 13!',
      ),
      highlight: t('8+8+◻=29  →  ◻=13  ✓', '8+8+◻=29  →  ◻=13  ✓'),
    },
    {
      values: { c: 21, p: 8, s: 13 },
      hold: 2200,
      result: false,
      caption: t(
        'Check row 1: 2◯+⬠ = 50 → 2◯+8 = 50 → ◯ = 21. Verify col 1: ◯+⬠+◻ = 21+8+13 = 42 ✓',
        'Cek baris 1: 2◯+8 = 50 → ◯ = 21. Cek kolom 1: ◯+⬠+◻ = 21+8+13 = 42 ✓',
      ),
      highlight: t('◯ = 21  ✓', '◯ = 21  ✓'),
    },
    {
      values: { c: 21, p: 8, s: 13 },
      hold: 0,
      result: true,
      caption: t(
        '◻ × ⬠ = 13 × 8 = 104',
        '◻ × ⬠ = 13 × 8 = 104',
      ),
      highlight: t('Answer: 104', 'Jawaban: 104'),
    },
  ], [lang])

  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={t(
        'Row and column sums strategy: subtract equations to find pentagon equals 8, square equals 13, circle equals 21. Answer: 13 times 8 equals 104.',
        'Strategi jumlah baris dan kolom: kurangkan persamaan untuk menemukan segi lima 8, kotak 13, lingkaran 21. Jawaban: 13 dikali 8 sama dengan 104.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Equation strip above the grid */}
        <div
          className="w-full rounded-lg px-3 py-1 text-center font-display text-xs font-bold"
          style={{ background: '#E1EFFB', color: BLUE, minHeight: 28 }}
        >
          {beat.highlight}
        </div>

        {/* The grid figure with progressive value reveals */}
        <GridSums18Figure values={beat.values} />

        {/* Caption box — green when result beat */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
