import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PatternGlyph, PATTERN_CYCLE } from './PatternCycleG3Illustration'

// WMI-19F3A-Q9 — group the repeating row into 4s; group ends land on 4, 8, 12…
// so position 32 (= 8 × 4) is a group END = ★.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const INK = '#1F2937'
const VIEW_W = 380
const VIEW_H = 168

const STEP = 28
const X0 = 26
const ROW_Y = 38
const G2_Y = 124 // the zoomed last group (positions 29–32)

export default function PatternCycleG3VisualExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { groups: false, ends: false, lastGroup: false, star: false, hold: 2300, result: false, caption: t('The same 4 shapes repeat over and over: ◻ ▼ ◯ ★.', 'Empat bangun yang sama berulang terus: ◻ ▼ ◯ ★.') },
      { groups: true, ends: false, lastGroup: false, star: false, hold: 2500, result: false, caption: t('Cut the row into GROUPS of 4.', 'Potong barisan menjadi KELOMPOK berisi 4.') },
      { groups: true, ends: true, lastGroup: false, star: false, hold: 2600, result: false, caption: t('Every group ends with ★ — at positions 4, 8, 12, …', 'Setiap kelompok berakhir dengan ★ — di posisi 4, 8, 12, …') },
      { groups: true, ends: true, lastGroup: true, star: false, hold: 2800, result: false, caption: t('32 = 8 × 4 exactly — so position 32 ENDS the 8th group: shapes 29, 30, 31, 32.', '32 = 8 × 4 tepat — jadi posisi 32 MENUTUP kelompok ke-8: bangun 29, 30, 31, 32.') },
      { groups: true, ends: true, lastGroup: true, star: true, hold: 0, result: true, caption: t('The 32nd shape is ★ (D).', 'Bangun ke-32 adalah ★ (D).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('Groups of four end with the star; 32 is eight groups, so the 32nd shape is the star.', 'Kelompok empat berakhir dengan bintang; 32 adalah delapan kelompok, jadi bangun ke-32 adalah bintang.')
  const lastCells = [29, 30, 31, 32]
  const lastX0 = (VIEW_W - 3 * 44) / 2

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* the visible first 12 shapes + ellipsis */}
          {Array.from({ length: 12 }).map((_, i) => (
            <PatternGlyph key={i} kind={PATTERN_CYCLE[i % 4]} cx={X0 + i * STEP} cy={ROW_Y} />
          ))}
          <text x={X0 + 12 * STEP - 6} y={ROW_Y} dominantBaseline="central" fontSize={18} fontWeight={800} fill={INK}>…</text>

          {/* group brackets under each 4 */}
          {beat.groups &&
            [0, 1, 2].map((g) => {
              const xa = X0 + g * 4 * STEP - 12
              const xb = X0 + (g * 4 + 3) * STEP + 12
              return (
                <g key={g}>
                  <path d={`M ${xa} ${ROW_Y + 20} v 6 h ${xb - xa} v -6`} fill="none" stroke={BLUE} strokeWidth={2} />
                  {beat.ends && (
                    <text x={xb - 12} y={ROW_Y + 42} textAnchor="middle" fontSize={13} fontWeight={900} fill={BLUE} className="font-display">
                      {(g + 1) * 4}
                    </text>
                  )}
                </g>
              )
            })}

          {/* zoom: the 8th group, positions 29–32 */}
          {beat.lastGroup && (
            <g>
              <text x={lastX0 - 14} y={G2_Y} textAnchor="end" dominantBaseline="central" fontSize={12} fontWeight={700} fill="#64748B">
                {t('group 8:', 'kelompok 8:')}
              </text>
              {lastCells.map((n, i) => {
                const cx = lastX0 + i * 44
                const isStar = n === 32
                return (
                  <g key={n}>
                    {isStar && beat.star && <circle cx={cx} cy={G2_Y} r={19} fill="rgba(16,185,129,0.14)" stroke={GREEN} strokeWidth={2.5} />}
                    <PatternGlyph kind={PATTERN_CYCLE[(n - 1) % 4]} cx={cx} cy={G2_Y} r={12} color={isStar && beat.star ? GREEN : INK} />
                    <text x={cx} y={G2_Y - 26} textAnchor="middle" fontSize={12} fontWeight={800} fill={isStar && beat.star ? GREEN : '#64748B'} className="font-display">
                      {n}
                    </text>
                  </g>
                )
              })}
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
