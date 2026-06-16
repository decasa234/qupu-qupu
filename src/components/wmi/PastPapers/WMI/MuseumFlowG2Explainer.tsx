import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'

// WMI-19F2A-Q3 — 92 people inside; 34 leave; (___) come in; now 87. Kid-visual:
// a museum building whose door lets a "34" crowd walk out and a "?" crowd walk
// in; the inside counter updates and the ? is computed as 87 − 58 = 29.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const RED = '#DC2626'
const INK = '#1F2937'
const VIEW_W = 380
const VIEW_H = 190

function Person({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y - 8} r={4} fill={color} />
      <path d={`M ${x - 5} ${y + 6} q 0 -10 5 -10 q 5 0 5 10 z`} fill={color} />
    </g>
  )
}

function Crowd({ x, y, label, color, fill }: { x: number; y: number; label: string; color: string; fill: string }) {
  return (
    <g>
      <rect x={x} y={y} width={72} height={46} rx={10} fill={fill} stroke={color} strokeWidth={2} />
      <Person x={x + 16} y={y + 20} color={color} />
      <Person x={x + 28} y={y + 24} color={color} />
      <Person x={x + 40} y={y + 20} color={color} />
      <text x={x + 56} y={y + 23} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={color} className="font-display">
        {label}
      </text>
    </g>
  )
}

export default function MuseumFlowG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { inside: 92, out: false, inn: false, reveal: false, hold: 2100, result: false, caption: t('92 people are inside the museum.', '92 orang ada di dalam museum.') },
      { inside: 58, out: true, inn: false, reveal: false, hold: 2500, result: false, caption: t('34 people walk OUT: 92 − 34 = 58 stay inside.', '34 orang keluar: 92 − 34 = 58 yang tersisa di dalam.') },
      { inside: 87, out: true, inn: true, reveal: false, hold: 2500, result: false, caption: t('Then some people walk IN — now there are 87 inside.', 'Lalu beberapa orang masuk — sekarang ada 87 di dalam.') },
      { inside: 87, out: true, inn: true, reveal: true, hold: 2300, result: false, caption: t('From 58 up to 87: the group that came in is 87 − 58 = 29.', 'Dari 58 menjadi 87: rombongan yang masuk adalah 87 − 58 = 29.') },
      { inside: 87, out: true, inn: true, reveal: true, hold: 0, result: true, caption: t('29 people came in (D).', '29 orang yang datang (D).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('92 minus 34 leaves 58; rising to 87 means 29 came in.', '92 dikurangi 34 menyisakan 58; naik ke 87 berarti 29 yang masuk.')

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* museum building */}
          <polygon points="120,38 260,38 240,18 140,18" fill="#E2E8F0" stroke={INK} strokeWidth={2} />
          <rect x={120} y={38} width={140} height={110} rx={4} fill="#F8FAFC" stroke={INK} strokeWidth={2.5} />
          <rect x={176} y={108} width={28} height={40} rx={3} fill="#CBD5E1" stroke={INK} strokeWidth={1.5} />
          <text x={190} y={76} textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={900} fill={beat.result ? GREEN : INK} className="font-display">
            {beat.inside}
          </text>

          {/* leaving crowd */}
          {beat.out && (
            <g>
              <path d="M 204 128 q 36 0 56 0" fill="none" stroke={RED} strokeWidth={2.5} strokeDasharray="6 4" />
              <polygon points="266,128 256,122 256,134" fill={RED} />
              <Crowd x={278} y={104} label="34" color={RED} fill="#FEE2E2" />
            </g>
          )}

          {/* entering crowd */}
          {beat.inn && (
            <g>
              <path d="M 96 128 q 44 0 78 0" fill="none" stroke={BLUE} strokeWidth={2.5} strokeDasharray="6 4" />
              <polygon points="178,128 168,122 168,134" fill={BLUE} />
              <Crowd x={18} y={104} label={beat.reveal ? '29' : '?'} color={beat.reveal ? GREEN : BLUE} fill={beat.reveal ? '#D1FAE5' : '#DBEAFE'} />
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
