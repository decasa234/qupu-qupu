import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapesGrid, SHAPE_CELLS, SQUARE_COUNT } from './ShapesSquaresG2Illustration'

// WMI-20F2A-Q3 — check each shape ONE PER BEAT: a square needs 4 sides, all the
// same length, with square corners — tilted ones still count!

const GREEN = '#10B981'

export default function ShapesSquaresG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(() => {
    const reason: Record<string, [string, string]> = {
      triangle: ['a triangle — only 3 sides ✗', 'segitiga — hanya 3 sisi ✗'],
      circle: ['a circle — no sides at all ✗', 'lingkaran — tak punya sisi ✗'],
      rect: ['a rectangle — 4 sides but NOT all equal ✗', 'persegi panjang — 4 sisi tapi TIDAK sama semua ✗'],
      hexagon: ['a hexagon — 6 sides ✗', 'segi enam — 6 sisi ✗'],
      pentagon: ['a pentagon — 5 sides ✗', 'segi lima — 5 sisi ✗'],
      square: ['4 equal sides, square corners — a SQUARE ✓ (even tilted!)', '4 sisi sama, sudut siku — PERSEGI ✓ (walau miring!)'],
      diamond: ['a square standing on its corner — still a SQUARE ✓', 'persegi yang berdiri di sudutnya — tetap PERSEGI ✓'],
    }
    let found = 0
    const out = [
      { upto: -1, active: -1, hold: 2800, result: false, caption: t('A square has 4 EQUAL sides and square corners — tilted squares count too! Check each shape.', 'Persegi punya 4 sisi SAMA dan sudut siku — persegi miring juga dihitung! Periksa tiap bangun.') },
      ...SHAPE_CELLS.map((cell, i) => {
        if (cell.isSquare) found++
        const n = found
        const [en, id] = reason[cell.kind === 'square' || cell.kind === 'diamond' ? cell.kind : cell.kind]
        return {
          upto: i,
          active: i,
          hold: cell.isSquare ? 2600 : 1800,
          result: false,
          caption: cell.isSquare
            ? t(`Shape ${i + 1}: ${en} — ${n} so far.`, `Bangun ${i + 1}: ${id} — sejauh ini ${n}.`)
            : t(`Shape ${i + 1}: ${en}`, `Bangun ${i + 1}: ${id}`),
        }
      }),
      { upto: SHAPE_CELLS.length - 1, active: -1, hold: 0, result: true, caption: t(`Squares found: ${SQUARE_COUNT} (C). The tilted pink and tall purple shapes are rectangles — their sides are not all equal!`, `Persegi yang ditemukan: ${SQUARE_COUNT} (C). Bangun merah muda miring dan ungu tinggi itu persegi panjang — sisinya tidak sama semua!`) },
    ]
    return out
  }, [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Checking all twelve shapes one by one finds exactly three squares.', 'Memeriksa kedua belas bangun satu per satu menemukan tepat tiga persegi.')}>
      <div className="flex flex-col items-center gap-3">
        <ShapesGrid upto={beat.upto} active={beat.active} />
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
