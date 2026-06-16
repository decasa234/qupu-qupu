import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'

// WMI-20F2A-Q5 — count the base-ten blocks one at a time with a running total:
// 4 flats (100 each) → 400; 6 rods (10 each) → 460; 7 unit cubes → 467.

const GREEN = '#10B981'
const FLATS = 4
const RODS = 6
const CUBES = 7
const TOTAL = FLATS * 100 + RODS * 10 + CUBES // 467

const VIEW_W = 400

function Flat({ x, y, lit, dim }: { x: number; y: number; lit: boolean; dim: boolean }) {
  return (
    <g opacity={dim ? 0.25 : 1}>
      <polygon points={`${x},${y + 10} ${x + 26},${y} ${x + 78},${y} ${x + 52},${y + 10}`} fill="#FFD23F" stroke="#B8860B" strokeWidth={1.4} />
      <rect x={x} y={y + 10} width={52} height={7} fill="#F4B400" stroke="#B8860B" strokeWidth={1.4} />
      {lit && <polygon points={`${x - 3},${y + 20} ${x + 28},${y - 4} ${x + 84},${y - 4} ${x + 58},${y + 20}`} fill="none" stroke="#D97706" strokeWidth={2.5} strokeDasharray="6 4" />}
    </g>
  )
}

function Rod({ x, y, lit, dim }: { x: number; y: number; lit: boolean; dim: boolean }) {
  return (
    <g opacity={dim ? 0.25 : 1}>
      <rect x={x} y={y} width={11} height={58} fill="#D7263D" stroke="#7A0C1E" strokeWidth={1.4} />
      {[1, 2, 3, 4, 5].map((k) => (
        <line key={k} x1={x} y1={y + k * 9.7} x2={x + 11} y2={y + k * 9.7} stroke="#7A0C1E" strokeWidth={0.8} />
      ))}
      {lit && <rect x={x - 4} y={y - 4} width={19} height={66} rx={4} fill="none" stroke="#D97706" strokeWidth={2.5} strokeDasharray="6 4" />}
    </g>
  )
}

function CubeIcon({ x, y, lit, dim }: { x: number; y: number; lit: boolean; dim: boolean }) {
  return (
    <g opacity={dim ? 0.25 : 1}>
      <rect x={x} y={y} width={14} height={14} fill="#7EC8E3" stroke="#23647E" strokeWidth={1.4} />
      {lit && <rect x={x - 4} y={y - 4} width={22} height={22} rx={4} fill="none" stroke="#D97706" strokeWidth={2.5} strokeDasharray="6 4" />}
    </g>
  )
}

const CUBE_POS: Array<[number, number]> = [
  [318, 18], [344, 18],
  [318, 42], [344, 42],
  [318, 66],
  [318, 90],
  [318, 114],
]

/** Static figure: all blocks shown, no counting state. */
export function BaseTenBlocksG2Illustration() {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label="Base-ten blocks: four flats worth one hundred each, six rods worth ten each, and seven unit cubes.">
      <svg viewBox={`0 0 ${VIEW_W} 152`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {Array.from({ length: FLATS }, (_, i) => (
          <Flat key={i} x={16} y={16 + i * 28} lit={false} dim={false} />
        ))}
        {Array.from({ length: RODS }, (_, i) => (
          <Rod key={i} x={136 + i * 24} y={40} lit={false} dim={false} />
        ))}
        {CUBE_POS.slice(0, CUBES).map(([x, y], i) => (
          <CubeIcon key={i} x={x} y={y} lit={false} dim={false} />
        ))}
        <text x={200} y={134} textAnchor="middle" fontSize={13} fontWeight={700} fill="#6B7280">100 / 10 / 1</text>
      </svg>
    </div>
  )
}

export default function BaseTenBlocksG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Beats: intro, 4 flat-counts, 6 rod-counts, 7 cube-counts, result.
  const steps = useMemo(() => {
    const out: Array<{ f: number; r: number; c: number; total: number; hold: number; result: boolean; caption: string }> = [
      { f: 0, r: 0, c: 0, total: 0, hold: 2800, result: false, caption: t('The key: a flat = 100, a rod = 10, a little cube = 1. Count them one by one!', 'Kuncinya: lempeng = 100, batang = 10, kubus kecil = 1. Hitung satu per satu!') },
    ]
    for (let i = 1; i <= FLATS; i++) out.push({ f: i, r: 0, c: 0, total: i * 100, hold: 1500, result: false, caption: t(`Flat ${i}: ${i} × 100 = ${i * 100}`, `Lempeng ke-${i}: ${i} × 100 = ${i * 100}`) })
    for (let i = 1; i <= RODS; i++) out.push({ f: FLATS, r: i, c: 0, total: 400 + i * 10, hold: 1300, result: false, caption: t(`Rod ${i}: 400 + ${i * 10} = ${400 + i * 10}`, `Batang ke-${i}: 400 + ${i * 10} = ${400 + i * 10}`) })
    for (let i = 1; i <= CUBES; i++) out.push({ f: FLATS, r: RODS, c: i, total: 460 + i, hold: 1200, result: false, caption: t(`Cube ${i}: 460 + ${i} = ${460 + i}`, `Kubus ke-${i}: 460 + ${i} = ${460 + i}`) })
    out.push({ f: FLATS, r: RODS, c: CUBES, total: TOTAL, hold: 0, result: true, caption: t(`400 + 60 + 7 = ${TOTAL} (A). Don't miss the lone cubes at the bottom!`, `400 + 60 + 7 = ${TOTAL} (A). Jangan lewatkan kubus-kubus kecil di bawah!`) })
    return out
  }, [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const cubePos = CUBE_POS

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={t('Four flats are four hundred, six rods make four hundred sixty, and seven cubes make four hundred sixty-seven.', 'Empat lempeng itu empat ratus, enam batang menjadi empat ratus enam puluh, dan tujuh kubus menjadi empat ratus enam puluh tujuh.')}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} 152`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {Array.from({ length: FLATS }, (_, i) => (
            <Flat key={i} x={16} y={16 + i * 28} lit={beat.f === i + 1 && beat.r === 0} dim={beat.f < i + 1} />
          ))}
          {Array.from({ length: RODS }, (_, i) => (
            <Rod key={i} x={136 + i * 24} y={40} lit={beat.r === i + 1 && beat.c === 0} dim={beat.r < i + 1} />
          ))}
          {cubePos.slice(0, CUBES).map(([x, y], i) => (
            <CubeIcon key={i} x={x} y={y} lit={beat.c === i + 1} dim={beat.c < i + 1} />
          ))}
          <rect x={120} y={118} width={160} height={28} rx={9} fill="#E1EFFB" stroke="#30598A" strokeWidth={2} />
          <text x={200} y={132} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill="#30598A" className="font-display">
            {beat.total}
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
