import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// WMI-20F2A-Q7 — the pink arrow turns 1½ numbers (45°) clockwise each step:
// 9:00 → 10:30 → (12:00, hidden behind the black hand!) → 1:30 → 3:00 → 4:30.
// The hidden 12 explains the seemingly bigger jump in the printed sequence.

const GREEN = '#10B981'
const PINK = '#F08080'
const INK = '#1F2937'

/** Clock face with a fixed black hand at 12 and a pink arrow at `deg` (0 = up). */
export function ArrowClock({ deg, size = 150, ghost }: { deg: number; size?: number; ghost?: boolean }) {
  const R = 70
  const cx = 0, cy = 0
  const rad = ((deg - 90) * Math.PI) / 180
  const ax = cx + Math.cos(rad) * (R - 26)
  const ay = cy + Math.sin(rad) * (R - 26)
  return (
    <svg viewBox="-80 -80 160 160" width={size} height={size} aria-hidden="true" style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={R} fill="white" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 - 90) * (Math.PI / 180)
        const big = i % 5 === 0
        const r1 = big ? R - 8 : R - 4.5
        return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * (R - 1.5)} y2={Math.sin(a) * (R - 1.5)} stroke={INK} strokeWidth={big ? 2.2 : 1} />
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const a = (n * 30 - 90) * (Math.PI / 180)
        return (
          <text key={n} x={Math.cos(a) * (R - 17)} y={Math.sin(a) * (R - 17)} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={INK}>
            {n}
          </text>
        )
      })}
      {/* fixed black hand at 12 */}
      <line x1={0} y1={0} x2={0} y2={-(R - 22)} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <polygon points={`-5,${-(R - 24)} 5,${-(R - 24)} 0,${-(R - 14)}`} fill={INK} />
      {/* pink arrow */}
      <g opacity={ghost ? 0.35 : 1}>
        <line x1={0} y1={0} x2={ax * 0.82} y2={ay * 0.82} stroke={PINK} strokeWidth={7} strokeLinecap="round" />
        <polygon
          points="0,-7 14,0 0,7"
          fill={PINK}
          transform={`translate(${ax * 0.82}, ${ay * 0.82}) rotate(${deg - 90})`}
        />
      </g>
      <circle cx={0} cy={0} r={5} fill={INK} />
    </svg>
  )
}

// Arrow positions in degrees clockwise from 12.
const SEQ = [270, 315, 0, 45, 90, 135] // 9:00, 10:30, 12:00(hidden), 1:30, 3:00, 4:30

export default function ClockTurnG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { pos: 0, ghost: false, hold: 2600, result: false, caption: t('The black hand stays at 12. Watch the PINK arrow: it starts at 9.', 'Jarum hitam tetap di angka 12. Perhatikan panah MERAH MUDA: mulai di angka 9.') },
      { pos: 1, ghost: false, hold: 2800, result: false, caption: t('Next picture: the arrow moved to between 10 and 11 — it turned 1½ numbers clockwise.', 'Gambar berikutnya: panah pindah ke antara 10 dan 11 — berputar 1½ angka searah jarum jam.') },
      { pos: 2, ghost: true, hold: 3000, result: false, caption: t('Turn 1½ more: the arrow lands EXACTLY on 12 — hidden behind the black hand! That is why the printed jump looks bigger.', 'Putar 1½ lagi: panah tepat di angka 12 — tersembunyi di balik jarum hitam! Itu sebabnya lompatan di gambar tampak lebih besar.') },
      { pos: 3, ghost: false, hold: 2400, result: false, caption: t('Turn 1½ again: between 1 and 2.', 'Putar 1½ lagi: antara 1 dan 2.') },
      { pos: 4, ghost: false, hold: 2400, result: false, caption: t('Turn 1½ again: exactly at 3 — the last printed clock.', 'Putar 1½ lagi: tepat di angka 3 — jam terakhir yang tercetak.') },
      { pos: 5, ghost: false, hold: 2600, result: false, caption: t('So the next turn lands between 4 and 5.', 'Maka putaran berikutnya mendarat di antara 4 dan 5.') },
      { pos: 5, ghost: false, hold: 0, result: true, caption: t('The next clock shows the arrow between 4 and 5 (B).', 'Jam berikutnya menunjukkan panah di antara 4 dan 5 (B).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={t('The arrow turns one and a half numbers each step, passing 12 unseen, so the next position is between 4 and 5.', 'Panah berputar satu setengah angka tiap langkah, melewati 12 tanpa terlihat, jadi posisi berikutnya antara 4 dan 5.')}>
      <div className="flex flex-col items-center gap-3">
        <ArrowClock deg={SEQ[beat.pos]} ghost={beat.ghost} size={170} />
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
