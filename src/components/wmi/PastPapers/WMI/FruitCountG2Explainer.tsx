import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// WMI-20F2A-Q8 — count one FRUIT TYPE at a time, row by row, with a running
// counter. Layout transcribed from the scan (rows of 12, 12, 10):
//   apples 7+2+3 = 12, oranges 3+6+1 = 10, bananas 2+4+6 = 12 → option D.

const GREEN = '#10B981'
type F = 'a' | 'o' | 'b' // apple, orange, banana

export const FRUIT_ROWS: F[][] = [
  ['a', 'o', 'a', 'a', 'b', 'o', 'o', 'a', 'a', 'a', 'a', 'b'],
  ['o', 'o', 'a', 'b', 'b', 'o', 'o', 'a', 'o', 'o', 'b', 'b'],
  ['b', 'b', 'b', 'a', 'o', 'a', 'a', 'b', 'b', 'b'],
]
const GLYPH: Record<F, string> = { a: '🍎', o: '🍊', b: '🍌' }
const NAME: Record<F, [string, string]> = { a: ['apples', 'apel'], o: ['oranges', 'jeruk'], b: ['bananas', 'pisang'] }
const rowCount = (f: F, r: number) => FRUIT_ROWS[r].filter((x) => x === f).length
const total = (f: F) => FRUIT_ROWS.flat().filter((x) => x === f).length

export default function FruitCountG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => {
    const out: Array<{ f: F | null; uptoRow: number; hold: number; result: boolean; caption: string }> = [
      { f: null, uptoRow: -1, hold: 2600, result: false, caption: t('Count ONE fruit at a time so nothing is missed — apples first!', 'Hitung SATU jenis buah dulu supaya tak ada yang terlewat — apel duluan!') },
    ]
    for (const f of ['a', 'o', 'b'] as F[]) {
      let run = 0
      for (let r = 0; r < 3; r++) {
        run += rowCount(f, r)
        out.push({
          f,
          uptoRow: r,
          hold: 1800,
          result: false,
          caption: t(
            `${GLYPH[f]} row ${r + 1}: ${rowCount(f, r)} — total ${run}`,
            `${GLYPH[f]} baris ${r + 1}: ${rowCount(f, r)} — total ${run}`,
          ),
        })
      }
    }
    out.push({ f: null, uptoRow: 2, hold: 3000, result: false, caption: t(`Counts: apples ${total('a')}, oranges ${total('o')}, bananas ${total('b')}. A says 11 oranges ✗, B says 13 apples ✗, C says 13 bananas ✗.`, `Hasil: apel ${total('a')}, jeruk ${total('o')}, pisang ${total('b')}. A bilang jeruk 11 ✗, B bilang apel 13 ✗, C bilang pisang 13 ✗.`) })
    out.push({ f: null, uptoRow: 2, hold: 0, result: true, caption: t(`Apple 12, orange 10, banana 12 → D.`, `Apel 12, jeruk 10, pisang 12 → D.`) })
    return out
  }, [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Counting type by type gives twelve apples, ten oranges and twelve bananas.', 'Menghitung jenis demi jenis memberi dua belas apel, sepuluh jeruk, dan dua belas pisang.')}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 420 110" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
          <rect x={0} y={0} width={420} height={110} rx={10} fill="#E7F0DC" />
          {FRUIT_ROWS.map((row, r) =>
            row.map((f, c) => {
              const counted = beat.f != null && f === beat.f && r <= beat.uptoRow
              const dimmed = beat.f != null && f !== beat.f
              return (
                <text key={`${r}-${c}`} x={20 + c * 33} y={24 + r * 33} textAnchor="middle" dominantBaseline="central" fontSize={22} opacity={dimmed ? 0.22 : 1}>
                  {GLYPH[f]}
                  {counted && <tspan />}
                </text>
              )
            }),
          )}
          {/* ring the rows already counted for the active fruit */}
          {beat.f != null && beat.uptoRow >= 0 && (
            <rect x={4} y={8} width={412} height={33 * (beat.uptoRow + 1) - 2} rx={8} fill="none" stroke="#D97706" strokeWidth={2} strokeDasharray="7 5" />
          )}
        </svg>
        {beat.f != null && (
          <div className="font-display text-xs font-bold text-qupu-brand-blue">
            {t(`counting ${NAME[beat.f][0]}`, `menghitung ${NAME[beat.f][1]}`)}
          </div>
        )}
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
