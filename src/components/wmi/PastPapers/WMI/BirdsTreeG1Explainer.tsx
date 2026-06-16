import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// WMI-19F1A-Q5 — (___) + 5 = 13 birds. Kid-visual: the tree holds the 13 birds
// of "now"; the 5 newcomers are marked, then flown back out to reveal the
// original 8. The answer is acted out, not asserted.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const INK = '#1F2937'
const VIEW_W = 360
const VIEW_H = 200

const TOTAL = 13
const CAME = 5
const START = TOTAL - CAME // 8

// Perch positions inside the canopy (two arcs of birds).
const PERCH: Array<[number, number]> = [
  [96, 64], [136, 50], [176, 44], [216, 50], [256, 64],
  [108, 100], [148, 90], [188, 86], [228, 90], [268, 100],
  [128, 132], [176, 128], [224, 132],
]

function Bird({ x, y, color, faded }: { x: number; y: number; color: string; faded: boolean }) {
  return (
    <g opacity={faded ? 0.22 : 1}>
      <ellipse cx={x} cy={y} rx={11} ry={7.5} fill={color} />
      <circle cx={x + 9} cy={y - 6} r={5} fill={color} />
      <polygon points={`${x + 13},${y - 7} ${x + 19},${y - 5.5} ${x + 13},${y - 4}`} fill="#F59E0B" />
      <path d={`M ${x - 3} ${y - 2} q -6 -7 -12 -3`} stroke="#FFFFFF" strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </g>
  )
}

export default function BirdsTreeG1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { mark: false, flown: false, hold: 2200, result: false, caption: t('Now there are 13 birds in the tree.', 'Sekarang ada 13 burung di pohon.') },
      { mark: true, flown: false, hold: 2400, result: false, caption: t('5 of them just flew IN — here they are (blue).', '5 ekor baru saja DATANG — ini mereka (biru).') },
      { mark: true, flown: true, hold: 2400, result: false, caption: t('Fly those 5 back out: 13 − 5 = 8 stay.', 'Terbangkan 5 itu kembali keluar: 13 − 5 = 8 yang tinggal.') },
      { mark: true, flown: true, hold: 0, result: true, caption: t('So there were 8 birds at first (C).', 'Jadi mula-mula ada 8 burung (C).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  const count = beat.flown ? START : TOTAL

  const aria = t('13 birds minus the 5 that flew in leaves 8 birds at the start.', '13 burung dikurangi 5 yang datang menyisakan 8 burung di awal.')

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* tree */}
          <rect x={170} y={148} width={20} height={40} rx={4} fill="#92400E" />
          <ellipse cx={180} cy={96} rx={130} ry={72} fill="#DCFCE7" stroke={GREEN} strokeWidth={2} />

          {/* birds: the last CAME perches are the newcomers */}
          {PERCH.map(([x, y], i) => {
            const isNew = i >= START
            const color = isNew && beat.mark ? BLUE : INK
            return <Bird key={i} x={x} y={y} color={color} faded={isNew && beat.flown} />
          })}

          {/* fly-out arrow once the newcomers leave */}
          {beat.flown && (
            <g>
              <path d={`M 290 70 q 34 -18 52 -44`} fill="none" stroke={BLUE} strokeWidth={2.5} strokeDasharray="6 4" />
              <polygon points="346,22 336,28 344,34" fill={BLUE} />
              <text x={330} y={52} fontSize={13} fontWeight={800} fill={BLUE} className="font-display">−5</text>
            </g>
          )}

          {/* running count */}
          <text x={24} y={30} fontSize={26} fontWeight={900} fill={beat.result ? GREEN : INK} className="font-display">
            {count}
          </text>
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
