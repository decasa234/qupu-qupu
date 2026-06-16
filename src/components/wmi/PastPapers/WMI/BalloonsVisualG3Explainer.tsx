import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'

// WMI-19F3A-Q20 — balloons as BARS. R+B = 121, B+Y = 104, Y+R = 129.
// The three pair-bars rearrange into two identical R+B+Y rows (354 counts every
// colour twice), one row is 354 ÷ 2 = 177, and removing the given B+Y = 104
// leaves red = 73. All widths are drawn from these quantities.

const R = 73
const B = 48
const Y = 56
const RB = R + B // 121
const BY = B + Y // 104
const YR = Y + R // 129
const SUM = RB + BY + YR // 354
const ALL = SUM / 2 // 177

const C = { R: '#DC2626', B: '#2563EB', Y: '#D97706' }
const GREEN = '#10B981'
const S = 1.3 // px per balloon
const BAR_H = 26
const X0 = 8

function Seg({ x, w, color, label, y }: { x: number; w: number; color: string; label: string; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={BAR_H} rx={4} fill={color} opacity={0.85} />
      <text x={x + w / 2} y={y + BAR_H / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff">{label}</text>
    </g>
  )
}

export default function BalloonsVisualG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { view: 'pairs' as 'pairs' | 'tworows' | 'onerow' | 'minus' | 'done', hold: 3000, result: false, caption: t('Three clues, drawn as bars: red+blue = 121, blue+yellow = 104, yellow+red = 129.', 'Tiga petunjuk, digambar sebagai batang: merah+biru = 121, biru+kuning = 104, kuning+merah = 129.') },
      { view: 'tworows' as const, hold: 3400, result: false, caption: t('Slide the six pieces together: 121 + 104 + 129 = 354 — look, it is red+blue+yellow TWICE!', 'Geser keenam potongan jadi satu: 121 + 104 + 129 = 354 — lihat, itu merah+biru+kuning DUA KALI!') },
      { view: 'onerow' as const, hold: 3000, result: false, caption: t('So one full set is 354 ÷ 2 = 177 balloons in total.', 'Jadi satu set penuh adalah 354 ÷ 2 = 177 balon seluruhnya.') },
      { view: 'minus' as const, hold: 3200, result: false, caption: t('Blue + yellow together is the given 104 — peel it off: red = 177 − 104.', 'Biru + kuning bersama adalah 104 yang diketahui — lepaskan: merah = 177 − 104.') },
      { view: 'done' as const, hold: 0, result: true, caption: t('Red = 73. Check: blue = 121 − 73 = 48, yellow = 104 − 48 = 56, and 56 + 73 = 129 ✓.', 'Merah = 73. Periksa: biru = 121 − 73 = 48, kuning = 104 − 48 = 56, dan 56 + 73 = 129 ✓.') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const rowY = (i: number) => 14 + i * (BAR_H + 18)
  const merah = t('red', 'merah')

  const pairBars = (
    <g>
      <Seg x={X0} y={rowY(0)} w={R * S} color={C.R} label={`${t('R', 'M')}`} />
      <Seg x={X0 + R * S} y={rowY(0)} w={B * S} color={C.B} label="B" />
      <text x={X0 + RB * S + 8} y={rowY(0) + BAR_H / 2 + 5} fontSize={14} fontWeight={800} fill="#1F2937">{RB}</text>
      <Seg x={X0} y={rowY(1)} w={B * S} color={C.B} label="B" />
      <Seg x={X0 + B * S} y={rowY(1)} w={Y * S} color={C.Y} label={`${t('Y', 'K')}`} />
      <text x={X0 + BY * S + 8} y={rowY(1) + BAR_H / 2 + 5} fontSize={14} fontWeight={800} fill="#1F2937">{BY}</text>
      <Seg x={X0} y={rowY(2)} w={Y * S} color={C.Y} label={`${t('Y', 'K')}`} />
      <Seg x={X0 + Y * S} y={rowY(2)} w={R * S} color={C.R} label={`${t('R', 'M')}`} />
      <text x={X0 + YR * S + 8} y={rowY(2) + BAR_H / 2 + 5} fontSize={14} fontWeight={800} fill="#1F2937">{YR}</text>
    </g>
  )

  const fullRow = (y: number, dimBY = false, hideBY = false) => (
    <g>
      <Seg x={X0} y={y} w={R * S} color={C.R} label={`${t('R', 'M')}`} />
      {!hideBY && (
        <g opacity={dimBY ? 0.3 : 1}>
          <Seg x={X0 + R * S} y={y} w={B * S} color={C.B} label="B" />
          <Seg x={X0 + (R + B) * S} y={y} w={Y * S} color={C.Y} label={`${t('Y', 'K')}`} />
        </g>
      )}
    </g>
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={t('Adding the three pair totals counts every colour twice: 354 halves to 177, and removing blue plus yellow leaves 73 red balloons.', 'Menjumlahkan tiga total pasangan menghitung tiap warna dua kali: 354 dibagi dua jadi 177, dan melepas biru plus kuning menyisakan 73 balon merah.')}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 300 145" width="100%" style={{ maxWidth: 310, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {beat.view === 'pairs' && pairBars}
          {beat.view === 'tworows' && (
            <g>
              {fullRow(rowY(0))}
              {fullRow(rowY(1))}
              <text x={X0 + ALL * S + 8} y={rowY(0) + BAR_H + 4} fontSize={14} fontWeight={800} fill="#1F2937">354</text>
              <text x={X0} y={rowY(2) + BAR_H - 4} fontSize={13} fontWeight={700} fill="#475569">{t('two of every colour!', 'tiap warna ada dua!')}</text>
            </g>
          )}
          {beat.view === 'onerow' && (
            <g>
              {fullRow(rowY(1))}
              <text x={X0 + ALL * S + 8} y={rowY(1) + BAR_H / 2 + 5} fontSize={14} fontWeight={800} fill="#1F2937">{ALL}</text>
            </g>
          )}
          {(beat.view === 'minus' || beat.view === 'done') && (
            <g>
              {fullRow(rowY(1), beat.view === 'minus', beat.view === 'done')}
              {beat.view === 'minus' && (
                <g>
                  <path d={`M ${X0 + R * S} ${rowY(1) - 6} L ${X0 + ALL * S} ${rowY(1) - 6}`} stroke="#475569" strokeWidth={2} />
                  <text x={X0 + (R + (B + Y) / 2) * S} y={rowY(1) - 12} textAnchor="middle" fontSize={13} fontWeight={700} fill="#475569">{BY}</text>
                </g>
              )}
              <text x={X0 + R * S + 8} y={rowY(1) + BAR_H / 2 + 5} fontSize={14} fontWeight={800} fill={C.R}>
                {beat.view === 'done' ? `${R} ${merah}` : '?'}
              </text>
            </g>
          )}
        </svg>
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
