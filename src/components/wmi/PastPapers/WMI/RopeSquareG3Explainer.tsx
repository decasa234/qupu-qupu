import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'

// WMI-19F3A-Q4 — a 192 m rope forms a square with 24 m left over. Kid-visual:
// the rope bar loses its 24 m tail, the 168 m that is used folds into a square,
// and the side is shared out: 168 ÷ 4 = 42.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const AMBER = '#D97706'
const INK = '#1F2937'
const VIEW_W = 380
const VIEW_H = 210

const BAR_X = 26
const BAR_Y = 30
const BAR_W = 328
const BAR_H = 22
const USED_W = (168 / 192) * BAR_W

const SQ = 92
const SQ_X = (VIEW_W - SQ) / 2
const SQ_Y = 92

export default function RopeSquareG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { cut: false, square: false, share: false, hold: 2200, result: false, caption: t('The rope is 192 m long.', 'Talinya sepanjang 192 m.') },
      { cut: true, square: false, share: false, hold: 2400, result: false, caption: t('24 m is LEFT OVER — only 192 − 24 = 168 m makes the square.', '24 m TERSISA — hanya 192 − 24 = 168 m yang membentuk persegi.') },
      { cut: true, square: true, share: false, hold: 2400, result: false, caption: t('Fold the 168 m into a square: 4 equal sides.', 'Lipat 168 m menjadi persegi: 4 sisi sama panjang.') },
      { cut: true, square: true, share: true, hold: 2300, result: false, caption: t('Each side gets 168 ÷ 4 = 42 m.', 'Tiap sisi mendapat 168 ÷ 4 = 42 m.') },
      { cut: true, square: true, share: true, hold: 0, result: true, caption: t('The side length is 42 m (C) — not 192 ÷ 4 = 48, the 24 m was never used!', 'Panjang sisinya 42 m (C) — bukan 192 ÷ 4 = 48, karena 24 m tak terpakai!') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('192 minus the 24 left over is 168, and 168 divided by 4 sides is 42 metres.', '192 dikurangi sisa 24 adalah 168, dan 168 dibagi 4 sisi adalah 42 meter.')

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* rope bar */}
          <rect x={BAR_X} y={BAR_Y} width={beat.cut ? USED_W : BAR_W} height={BAR_H} rx={8} fill="#DBEAFE" stroke={BLUE} strokeWidth={2.5} />
          <text x={BAR_X + USED_W / 2} y={BAR_Y + BAR_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#1E3A8A" className="font-display">
            {beat.cut ? '168 m' : '192 m'}
          </text>
          {beat.cut && (
            <g>
              <rect x={BAR_X + USED_W + 8} y={BAR_Y} width={BAR_W - USED_W - 8} height={BAR_H} rx={8} fill="#FEF3C7" stroke={AMBER} strokeWidth={2} strokeDasharray="5 4" />
              <text x={BAR_X + USED_W + 8 + (BAR_W - USED_W - 8) / 2} y={BAR_Y + BAR_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill="#92400E" className="font-display">
                24 m
              </text>
            </g>
          )}

          {/* the square */}
          {beat.square && (
            <g>
              <rect x={SQ_X} y={SQ_Y} width={SQ} height={SQ} fill="none" stroke={beat.result ? GREEN : BLUE} strokeWidth={3.5} rx={2} />
              {beat.share && (
                <>
                  <text x={SQ_X + SQ / 2} y={SQ_Y - 10} textAnchor="middle" fontSize={14} fontWeight={900} fill={beat.result ? GREEN : INK} className="font-display">42 m</text>
                  <text x={SQ_X + SQ / 2} y={SQ_Y + SQ + 16} textAnchor="middle" fontSize={14} fontWeight={900} fill={beat.result ? GREEN : INK} className="font-display">42 m</text>
                  <text x={SQ_X - 12} y={SQ_Y + SQ / 2} textAnchor="end" dominantBaseline="central" fontSize={14} fontWeight={900} fill={beat.result ? GREEN : INK} className="font-display">42 m</text>
                  <text x={SQ_X + SQ + 12} y={SQ_Y + SQ / 2} dominantBaseline="central" fontSize={14} fontWeight={900} fill={beat.result ? GREEN : INK} className="font-display">42 m</text>
                </>
              )}
              {!beat.share && (
                <text x={SQ_X + SQ / 2} y={SQ_Y + SQ / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#64748B" className="font-display">
                  {t('168 m around', 'keliling 168 m')}
                </text>
              )}
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
