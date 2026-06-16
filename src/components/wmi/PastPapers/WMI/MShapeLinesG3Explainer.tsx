import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MShape, M_PTS, M_X, lineHit, M_VIEW_W, M_VIEW_H, M_ANSWER } from './MShapeLinesG3Illustration'

// WMI-19F3A-Q17 — the ten triangles appear ONE AT A TIME with a running count:
//   line 1 across all four strokes → triangles 1-3 (left peak, valley V, right
//   peak); line 2 the same way → 4-6; the lines CROSS, and the X closes one
//   skinny triangle with each stroke → 7-10. Total 3 + 3 + 4 = 10.

const GREEN = '#10B981'
const TRI_FILL = ['rgba(37,99,235,0.3)', 'rgba(16,185,129,0.32)', 'rgba(217,119,6,0.32)', 'rgba(219,39,119,0.3)']
const TRI_EDGE = ['#2563EB', '#059669', '#B45309', '#BE185D']

type Pt = [number, number]

export default function MShapeLinesG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // The ten triangles, in the order they are revealed.
  const tris = useMemo<Pt[][]>(() => {
    const peakTris = (line: 1 | 2): Pt[][] => [
      [M_PTS.P1, lineHit(line, 0), lineHit(line, 1)],
      [lineHit(line, 1), lineHit(line, 2), M_PTS.V],
      [M_PTS.P2, lineHit(line, 2), lineHit(line, 3)],
    ]
    const xTris: Pt[][] = [0, 1, 2, 3].map((i) => [M_X, lineHit(1, i), lineHit(2, i)])
    return [...peakTris(1), ...peakTris(2), ...xTris]
  }, [])

  const steps = useMemo(() => {
    const part = (en: string, id: string) => t(en, id)
    const triBeat = (n: number, en: string, id: string) => ({
      l1: true,
      l2: n > 3,
      upto: n,
      x: n > 6,
      hold: 2400,
      result: false,
      caption: t(`${en} (total: ${n})`, `${id} (total: ${n})`),
    })
    return [
      { l1: false, l2: false, upto: 0, x: false, hold: 2600, result: false, caption: part('The figure is an M — four strokes. We may add TWO straight lines. Watch where we put them!', 'Gambarnya huruf M — empat goresan. Kita boleh menambah DUA garis lurus. Perhatikan di mana garisnya!') },
      { l1: true, l2: false, upto: 0, x: false, hold: 2400, result: false, caption: part('Line 1 goes right ACROSS the M — it cuts all four strokes.', 'Garis 1 melintang menembus M — memotong keempat goresan.') },
      triBeat(1, 'Triangle 1: the LEFT PEAK is now closed by line 1.', 'Segitiga 1: PUNCAK KIRI kini tertutup oleh garis 1.'),
      triBeat(2, 'Triangle 2: the V in the middle.', 'Segitiga 2: lembah V di tengah.'),
      triBeat(3, 'Triangle 3: the RIGHT PEAK.', 'Segitiga 3: PUNCAK KANAN.'),
      { l1: true, l2: true, upto: 3, x: false, hold: 2800, result: false, caption: part('Line 2 also cuts all four strokes — and we TILT it so it crosses line 1!', 'Garis 2 juga memotong keempat goresan — dan kita MIRINGKAN agar menyilang garis 1!') },
      triBeat(4, 'Triangle 4: the left peak again, now with line 2.', 'Segitiga 4: puncak kiri lagi, kini dengan garis 2.'),
      triBeat(5, 'Triangle 5: the V again.', 'Segitiga 5: lembah V lagi.'),
      triBeat(6, 'Triangle 6: the right peak again.', 'Segitiga 6: puncak kanan lagi.'),
      { l1: true, l2: true, upto: 6, x: true, hold: 2600, result: false, caption: part('The two lines cross at the red point X — crossing lines make EXTRA skinny triangles!', 'Kedua garis bersilangan di titik merah X — garis yang bersilangan membuat segitiga tipis TAMBAHAN!') },
      triBeat(7, 'Triangle 7: stroke 1 + the two lines close a skinny triangle at X.', 'Segitiga 7: goresan 1 + kedua garis menutup segitiga tipis di X.'),
      triBeat(8, 'Triangle 8: same with stroke 2.', 'Segitiga 8: sama dengan goresan 2.'),
      triBeat(9, 'Triangle 9: stroke 3.', 'Segitiga 9: goresan 3.'),
      triBeat(10, 'Triangle 10: stroke 4!', 'Segitiga 10: goresan 4!'),
      { l1: true, l2: true, upto: 10, x: true, hold: 0, result: true, caption: part(`Count them: 3 + 3 + 4 = ${M_ANSWER} triangles. (Parallel lines would stop at 6!)`, `Hitung: 3 + 3 + 4 = ${M_ANSWER} segitiga. (Garis sejajar hanya sampai 6!)`) },
    ]
  }, [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('Each line across the M closes three triangles, and crossing the lines adds four skinny ones: ten in all.', 'Tiap garis yang melintasi M menutup tiga segitiga, dan persilangannya menambah empat segitiga tipis: sepuluh semuanya.')

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${M_VIEW_W} ${M_VIEW_H}`} width="100%" style={{ maxWidth: 280, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {tris.slice(0, beat.upto).map((p, i) => {
            const isNew = i === beat.upto - 1
            return (
              <polygon
                key={i}
                points={p.map(([x, y]) => `${x},${y}`).join(' ')}
                fill={TRI_FILL[i % 4]}
                stroke={isNew ? TRI_EDGE[i % 4] : 'none'}
                strokeWidth={2.5}
                opacity={isNew ? 1 : 0.45}
              />
            )
          })}
          <MShape showL1={beat.l1} showL2={beat.l2} />
          {(beat.x || beat.upto > 6) && <circle cx={M_X[0]} cy={M_X[1]} r={5} fill="#DC2626" />}
          {beat.upto > 0 && (
            <g>
              <rect x={M_VIEW_W - 44} y={6} width={38} height={26} rx={8} fill="#E1EFFB" stroke="#30598A" strokeWidth={2} />
              <text x={M_VIEW_W - 25} y={19} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#30598A" className="font-display">
                {beat.upto}
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
