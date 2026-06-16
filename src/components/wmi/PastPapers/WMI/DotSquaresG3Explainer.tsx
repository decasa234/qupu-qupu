import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { DotSquaresFigure, DS_CLASSES, DS_TOTAL } from './DotSquaresG3Illustration'

// WMI-19F3A-Q19 — the squares appear ONE AT A TIME (showing all of a class at
// once was confusing). Each beat lights the next square bold, keeps the ones
// already counted faint, and ticks a running total. Counts come from the
// enumeration in the illustration, never asserted.

const GREEN = '#10B981'

interface Beat {
  cls: number | null
  upto?: number
  hold: number
  result: boolean
  caption: string
}

const CLASS_LABELS: Record<string, [string, string]> = {
  unit: ['Small straight squares', 'Persegi lurus kecil'],
  two: ['2×2 straight squares', 'Persegi lurus 2×2'],
  bigAxis: ['3×3 and 4×4 straight squares', 'Persegi lurus 3×3 dan 4×4'],
  diamond: ['Small diamonds', 'Belah ketupat kecil'],
  slant3: ['Slanted squares in 3×3 boxes', 'Persegi miring dalam kotak 3×3'],
  slant4: ['Big slanted squares', 'Persegi miring besar'],
}

export default function DotSquaresG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Beat[]>(() => {
    const out: Beat[] = [
      { cls: null, hold: 2600, result: false, caption: t('20 dots — the 5×5 grid is missing its corners and centre. Squares may be straight OR tilted. Watch them appear one by one!', '20 titik — petak 5×5 tanpa pojok dan pusatnya. Persegi boleh lurus ATAU miring. Lihat mereka muncul satu per satu!') },
    ]
    let total = 0
    DS_CLASSES.forEach((c, ci) => {
      const [en, id] = CLASS_LABELS[c.key]
      if (c.squares.length === 0) {
        out.push({ cls: ci, upto: 0, hold: 2800, result: false, caption: t(`${en}: 0 — every one would need a missing corner!`, `${id}: 0 — semuanya butuh pojok yang hilang!`) })
        return
      }
      c.squares.forEach((_, qi) => {
        total++
        out.push({
          cls: ci,
          upto: qi + 1,
          hold: qi === 0 ? 1800 : 1100,
          result: false,
          caption: t(`${en}: ${qi + 1} of ${c.squares.length} — running total ${total}.`, `${id}: ke-${qi + 1} dari ${c.squares.length} — total sementara ${total}.`),
        })
      })
    })
    out.push({ cls: null, hold: 0, result: true, caption: t(`Total: 8 + 5 + 0 + 5 + 8 + 3 = ${DS_TOTAL}.`, `Total: 8 + 5 + 0 + 5 + 8 + 3 = ${DS_TOTAL}.`) })
    return out
  }, [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('Counting straight and tilted squares one at a time gives 29.', 'Menghitung persegi lurus dan miring satu per satu memberi 29.')

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <DotSquaresFigure highlightClass={beat.cls} upto={beat.upto} />
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
