import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// WMI-19F3A-Q8 — bar model. The smaller number is ONE block of 19; the larger
// is SEVEN blocks of 19 plus 15. Subtracting lines the bars up: one 19-block
// cancels, leaving 6 blocks of 19 plus 15 = 129. The difference is SEEN.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const AMBER = '#D97706'
const INK = '#1F2937'
const VIEW_W = 392
const VIEW_H = 190

const SCALE = 2.1
const BLOCK_W = 19 * SCALE // one "19" block
const EXTRA_W = 15 * SCALE // the "+15" chip
const BAR_H = 30
const X0 = 28
const SMALL_Y = 38
const LARGE_Y = 92
const BRACE_Y = 132

export default function TwoNumbersBarG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { large: false, cancel: false, total: false, hold: 2200, result: false, caption: t('The smaller number is ONE block of 19.', 'Bilangan kecil adalah SATU balok 19.') },
      { large: true, cancel: false, total: false, hold: 2600, result: false, caption: t('The larger number is 7 blocks of 19, plus 15 more.', 'Bilangan besar adalah 7 balok 19, ditambah 15 lagi.') },
      { large: true, cancel: true, total: false, hold: 2600, result: false, caption: t('Difference = larger − smaller: ONE block of 19 cancels out.', 'Selisih = besar − kecil: SATU balok 19 saling menghapus.') },
      { large: true, cancel: true, total: true, hold: 2500, result: false, caption: t('Left over: 6 blocks of 19 plus 15 → 6 × 19 = 114, and 114 + 15 = 129.', 'Tersisa: 6 balok 19 plus 15 → 6 × 19 = 114, dan 114 + 15 = 129.') },
      { large: true, cancel: true, total: true, hold: 0, result: true, caption: t('The difference is 129 (C).', 'Selisihnya 129 (C).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('Seven blocks of 19 plus 15, minus one block of 19, leaves 129.', 'Tujuh balok 19 plus 15, dikurangi satu balok 19, menyisakan 129.')
  const braceX0 = X0 + BLOCK_W
  const braceX1 = X0 + 7 * BLOCK_W + EXTRA_W

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* smaller number: one block */}
          <text x={X0 - 6} y={SMALL_Y - 10} fontSize={11} fontWeight={700} fill="#64748B">{t('smaller: 19', 'kecil: 19')}</text>
          <g opacity={beat.cancel ? 0.3 : 1}>
            <rect x={X0} y={SMALL_Y} width={BLOCK_W} height={BAR_H} rx={4} fill="#E2E8F0" stroke={INK} strokeWidth={2} />
            <text x={X0 + BLOCK_W / 2} y={SMALL_Y + BAR_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={INK} className="font-display">19</text>
            {beat.cancel && <line x1={X0 + 3} y1={SMALL_Y + BAR_H - 3} x2={X0 + BLOCK_W - 3} y2={SMALL_Y + 3} stroke="#DC2626" strokeWidth={2.5} strokeLinecap="round" />}
          </g>

          {/* larger number: 7 blocks + 15 */}
          {beat.large && (
            <g>
              <text x={X0 - 6} y={LARGE_Y - 10} fontSize={11} fontWeight={700} fill="#64748B">{t('larger: 7 × 19 + 15', 'besar: 7 × 19 + 15')}</text>
              {Array.from({ length: 7 }).map((_, i) => {
                const cancelled = i === 0 && beat.cancel
                return (
                  <g key={i} opacity={cancelled ? 0.3 : 1}>
                    <rect x={X0 + i * BLOCK_W} y={LARGE_Y} width={BLOCK_W} height={BAR_H} rx={4} fill="#DBEAFE" stroke={BLUE} strokeWidth={2} />
                    <text x={X0 + i * BLOCK_W + BLOCK_W / 2} y={LARGE_Y + BAR_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#1E3A8A" className="font-display">19</text>
                    {cancelled && <line x1={X0 + 3} y1={LARGE_Y + BAR_H - 3} x2={X0 + BLOCK_W - 3} y2={LARGE_Y + 3} stroke="#DC2626" strokeWidth={2.5} strokeLinecap="round" />}
                  </g>
                )
              })}
              <rect x={X0 + 7 * BLOCK_W} y={LARGE_Y} width={EXTRA_W} height={BAR_H} rx={4} fill="#FEF3C7" stroke={AMBER} strokeWidth={2} />
              <text x={X0 + 7 * BLOCK_W + EXTRA_W / 2} y={LARGE_Y + BAR_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#92400E" className="font-display">15</text>
            </g>
          )}

          {/* difference brace under the remaining 6 blocks + 15 */}
          {beat.total && (
            <g>
              <path d={`M ${braceX0} ${BRACE_Y} h ${braceX1 - braceX0}`} stroke={beat.result ? GREEN : INK} strokeWidth={2.5} fill="none" />
              <line x1={braceX0} y1={BRACE_Y - 5} x2={braceX0} y2={BRACE_Y + 5} stroke={beat.result ? GREEN : INK} strokeWidth={2.5} />
              <line x1={braceX1} y1={BRACE_Y - 5} x2={braceX1} y2={BRACE_Y + 5} stroke={beat.result ? GREEN : INK} strokeWidth={2.5} />
              <text x={(braceX0 + braceX1) / 2} y={BRACE_Y + 22} textAnchor="middle" fontSize={15} fontWeight={900} fill={beat.result ? GREEN : INK} className="font-display">
                6 × 19 + 15 = 129
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
