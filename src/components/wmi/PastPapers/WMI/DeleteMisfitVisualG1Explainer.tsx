import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// WMI-19F1A-Q21 — delete one number so 1, 5, 6, 9, 13, 17, 21 form a regular
// sequence. Kid-visual: number stones with jump arcs (+4, +1, +3 …); the bad
// jumps glow red around the 6, the 6 gets crossed out, and the healed +4 arc
// appears — the answer is seen, not asserted.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const RED = '#DC2626'
const INK = '#1F2937'
const VIEW_W = 392
const VIEW_H = 150

const NUMBERS = [1, 5, 6, 9, 13, 17, 21]
const MISFIT_INDEX = 2 // the 6
const BOX_W = 44
const BOX_H = 38
const GAP = 12
const ROW_Y = 62
const x0 = (VIEW_W - (NUMBERS.length * BOX_W + (NUMBERS.length - 1) * GAP)) / 2
const bx = (i: number) => x0 + i * (BOX_W + GAP)
const bcx = (i: number) => bx(i) + BOX_W / 2

function JumpArc({ from, to, label, color }: { from: number; to: number; label: string; color: string }) {
  const xa = bcx(from)
  const xb = bcx(to)
  const midX = (xa + xb) / 2
  return (
    <g>
      <path d={`M ${xa} ${ROW_Y - 6} Q ${midX} ${ROW_Y - 40} ${xb} ${ROW_Y - 6}`} fill="none" stroke={color} strokeWidth={2} />
      <text x={midX} y={ROW_Y - 32} textAnchor="middle" fontSize={12} fontWeight={800} fill={color} className="font-display">
        {label}
      </text>
    </g>
  )
}

export default function DeleteMisfitVisualG1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { arcs: false, crossed: false, healed: false, hold: 2200, result: false, caption: t('Seven numbers — one of them spoils the pattern.', 'Tujuh bilangan — satu di antaranya merusak pola.') },
      { arcs: true, crossed: false, healed: false, hold: 2800, result: false, caption: t('Draw the jumps: +4, then +1 and +3 — the jumps break around the 6!', 'Gambar lompatannya: +4, lalu +1 dan +3 — lompatan rusak di sekitar 6!') },
      { arcs: true, crossed: true, healed: true, hold: 2600, result: false, caption: t('Cross out the 6: now 5 → 9 is +4 too.', 'Coret 6: sekarang 5 → 9 juga +4.') },
      { arcs: true, crossed: true, healed: true, hold: 0, result: true, caption: t('Delete 6 — every jump is +4: 1, 5, 9, 13, 17, 21.', 'Hapus 6 — semua lompatan +4: 1, 5, 9, 13, 17, 21.') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('The number 6 breaks the plus-four jumps, so delete 6.', 'Angka 6 merusak lompatan tambah empat, jadi hapus 6.')

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* jump arcs */}
          {beat.arcs && !beat.healed && (
            <g>
              <JumpArc from={0} to={1} label="+4" color={BLUE} />
              <JumpArc from={1} to={2} label="+1" color={RED} />
              <JumpArc from={2} to={3} label="+3" color={RED} />
              <JumpArc from={3} to={4} label="+4" color={BLUE} />
              <JumpArc from={4} to={5} label="+4" color={BLUE} />
              <JumpArc from={5} to={6} label="+4" color={BLUE} />
            </g>
          )}
          {beat.healed && (
            <g>
              <JumpArc from={0} to={1} label="+4" color={GREEN} />
              <JumpArc from={1} to={3} label="+4" color={GREEN} />
              <JumpArc from={3} to={4} label="+4" color={GREEN} />
              <JumpArc from={4} to={5} label="+4" color={GREEN} />
              <JumpArc from={5} to={6} label="+4" color={GREEN} />
            </g>
          )}

          {/* number stones */}
          {NUMBERS.map((v, i) => {
            const misfit = i === MISFIT_INDEX
            const crossed = misfit && beat.crossed
            return (
              <g key={i} opacity={crossed ? 0.35 : 1}>
                <rect
                  x={bx(i)}
                  y={ROW_Y}
                  width={BOX_W}
                  height={BOX_H}
                  rx={8}
                  fill={crossed ? '#FEE2E2' : beat.result && !misfit ? '#D1FAE5' : '#FFFFFF'}
                  stroke={crossed ? RED : beat.result && !misfit ? GREEN : INK}
                  strokeWidth={crossed || (beat.result && !misfit) ? 2.5 : 2}
                />
                <text x={bcx(i)} y={ROW_Y + BOX_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill={crossed ? '#991B1B' : INK} className="font-display">
                  {v}
                </text>
                {crossed && (
                  <line x1={bx(i) + 5} y1={ROW_Y + BOX_H - 5} x2={bx(i) + BOX_W - 5} y2={ROW_Y + 5} stroke={RED} strokeWidth={3} strokeLinecap="round" />
                )}
              </g>
            )
          })}
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
