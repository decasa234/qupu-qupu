import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShadedTreeFigure, ST_TOTAL } from './ShadedTreeG3Illustration'

// WMI-19F3A-Q11 — count the shaded tree row by row: whole squares plus slanted
// halves that pair into wholes: 2 + 3 + 4 + 1 = 10 cm².

const GREEN = '#10B981'

export default function ShadedTreeG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { row: null as number | null, counted: 0, hold: 2300, result: false, caption: t('Each small square is 1 cm². Count the tree row by row.', 'Tiap persegi kecil 1 cm². Hitung pohonnya baris demi baris.') },
      { row: 0, counted: 1, hold: 2500, result: false, caption: t('Row 1: one whole square + two slanted halves = 2.', 'Baris 1: satu persegi utuh + dua setengah miring = 2.') },
      { row: 1, counted: 2, hold: 2500, result: false, caption: t('Row 2: one whole + slanted pieces that pair into 2 wholes = 3.', 'Baris 2: satu utuh + potongan miring yang berpasangan jadi 2 utuh = 3.') },
      { row: 2, counted: 3, hold: 2500, result: false, caption: t('Row 3: one whole + slanted pieces pairing into 3 wholes = 4.', 'Baris 3: satu utuh + potongan miring berpasangan jadi 3 utuh = 4.') },
      { row: 3, counted: 4, hold: 2300, result: false, caption: t('Row 4: just the trunk — 1 whole square.', 'Baris 4: hanya batangnya — 1 persegi utuh.') },
      { row: null, counted: 4, hold: 0, result: true, caption: t(`Total: 2 + 3 + 4 + 1 = ${ST_TOTAL} cm² (B).`, `Total: 2 + 3 + 4 + 1 = ${ST_TOTAL} cm² (B).`) },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('Counting rows two, three, four and one gives ten square centimetres.', 'Menghitung baris dua, tiga, empat, dan satu memberi sepuluh sentimeter persegi.')

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <ShadedTreeFigure activeRow={beat.row} countedRows={beat.counted} />
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
