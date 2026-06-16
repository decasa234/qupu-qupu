import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// WMI-19F3A-Q23 — every reachable sum is shown with the CONCRETE addition that
// makes it (1+2 = 3, 6+5+4 = 15, …), marked on a 1–15 board one small group at
// a time. Two-face sums can never use partner (opposite) faces; a corner takes
// one number from each partner pair. Only 13 is never marked.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const PURPLE = '#7C3AED'
const RED = '#DC2626'
const AMBER = '#D97706'
const INK = '#1F2937'

const VIEW_W = 380
const CHIP = 36
const GAP = 8
const ROW0_X = (VIEW_W - (8 * CHIP + 7 * GAP)) / 2

type Mark = [number, string] // sum, colour

interface Beat {
  adds: Mark[]
  ring: number[]
  red13: boolean
  hold: number
  result: boolean
  caption: string
}

export default function DieSumsG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Beat[]>(
    () => [
      { adds: [], ring: [], red13: false, hold: 3200, result: false, caption: t('The die rule: opposite faces are PARTNERS that add to 7 — 1 with 6, 2 with 5, 3 with 4. You can NEVER see both partners at once.', 'Aturan dadu: sisi berhadapan adalah PASANGAN yang berjumlah 7 — 1 dengan 6, 2 dengan 5, 3 dengan 4. Kamu TAK PERNAH melihat kedua pasangan sekaligus.') },
      { adds: [[1, BLUE], [2, BLUE], [3, BLUE], [4, BLUE], [5, BLUE], [6, BLUE]], ring: [], red13: false, hold: 2800, result: false, caption: t('Easiest: look at ONE face. It shows 1, 2, 3, 4, 5, or 6 — mark all six blue.', 'Paling mudah: lihat SATU sisi. Bisa 1, 2, 3, 4, 5, atau 6 — tandai keenamnya biru.') },
      { adds: [[3, PURPLE]], ring: [], red13: false, hold: 2600, result: false, caption: t('Now TWO faces at once, like 1 and 2: the sum is 1 + 2 = 3. Mark it purple.', 'Sekarang DUA sisi sekaligus, misal 1 dan 2: jumlahnya 1 + 2 = 3. Tandai ungu.') },
      { adds: [[4, PURPLE], [5, PURPLE], [6, PURPLE]], ring: [], red13: false, hold: 2800, result: false, caption: t('More pairs: 1+3 = 4, 1+4 = 5, 1+5 = 6. All fine — none of them are partners.', 'Pasangan lain: 1+3 = 4, 1+4 = 5, 1+5 = 6. Semua boleh — tak ada yang berpasangan.') },
      { adds: [], ring: [7], red13: false, hold: 3200, result: false, caption: t('Can two faces make 7? The only ways are 1+6, 2+5, 3+4 — every one is a PARTNER pair! So with two faces, 7 is impossible.', 'Bisakah dua sisi membuat 7? Satu-satunya cara 1+6, 2+5, 3+4 — semuanya PASANGAN! Jadi dengan dua sisi, 7 mustahil.') },
      { adds: [[8, PURPLE], [9, PURPLE], [10, PURPLE], [11, PURPLE]], ring: [], red13: false, hold: 3000, result: false, caption: t('Bigger pairs: 2+6 = 8, 3+6 = 9, 4+6 = 10, 5+6 = 11. And 11 is the BIGGEST two faces can do!', 'Pasangan besar: 2+6 = 8, 3+6 = 9, 4+6 = 10, 5+6 = 11. Dan 11 adalah yang TERBESAR untuk dua sisi!') },
      { adds: [], ring: [], red13: false, hold: 3000, result: false, caption: t('Last: THREE faces — a corner. A corner picks ONE number from EACH partner pair: {1 or 6} + {2 or 5} + {3 or 4}. That is just 8 corners — try them all!', 'Terakhir: TIGA sisi — sebuah pojok. Pojok mengambil SATU angka dari TIAP pasangan: {1 atau 6} + {2 atau 5} + {3 atau 4}. Cuma ada 8 pojok — coba semuanya!') },
      { adds: [[6, GREEN], [7, GREEN], [9, GREEN], [10, GREEN]], ring: [], red13: false, hold: 3200, result: false, caption: t('Corners with the 1: 1+2+3 = 6, 1+2+4 = 7 (so 7 IS possible after all!), 1+5+3 = 9, 1+5+4 = 10.', 'Pojok dengan angka 1: 1+2+3 = 6, 1+2+4 = 7 (ternyata 7 BISA juga!), 1+5+3 = 9, 1+5+4 = 10.') },
      { adds: [[11, GREEN], [12, GREEN], [14, GREEN], [15, GREEN]], ring: [], red13: false, hold: 3200, result: false, caption: t('Corners with the 6: 6+2+3 = 11, 6+2+4 = 12, 6+5+3 = 14, 6+5+4 = 15. That was all 8 corners.', 'Pojok dengan angka 6: 6+2+3 = 11, 6+2+4 = 12, 6+5+3 = 14, 6+5+4 = 15. Itu sudah kedelapan pojok.') },
      { adds: [], ring: [], red13: true, hold: 3400, result: false, caption: t('Look at the board: only 13 is still empty! Could a corner make 13? 6+5+2 uses partners 2-5 ✗, 6+4+3 uses partners 3-4 ✗. No way.', 'Lihat papannya: hanya 13 yang masih kosong! Bisakah pojok membuat 13? 6+5+2 memakai pasangan 2-5 ✗, 6+4+3 memakai pasangan 3-4 ✗. Tidak bisa.') },
      { adds: [], ring: [], red13: true, hold: 0, result: true, caption: t('The only sum you can never see is 13 — so the answer is 13.', 'Satu-satunya jumlah yang tak pernah terlihat adalah 13 — jadi jawabannya 13.') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  // Cumulative marks up to the current beat; the first colour a sum gets is kept.
  const marks = useMemo(() => {
    const m = new Map<number, { color: string; fresh: boolean }>()
    for (let i = 0; i <= index && i < steps.length; i++) {
      for (const [n, color] of steps[i].adds) {
        if (!m.has(n)) m.set(n, { color, fresh: i === index })
        else if (i === index) m.set(n, { ...m.get(n)!, fresh: true })
      }
    }
    return m
  }, [index, steps])

  const aria = t('Marking every sum one, two, or three faces can show leaves only 13 unmarked.', 'Menandai semua jumlah dari satu, dua, atau tiga sisi menyisakan hanya 13.')

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} 156`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* opposite-pair legend: 1-6, 2-5, 3-4 each add to 7 */}
          {[[1, 6], [2, 5], [3, 4]].map(([a, b], i) => {
            const lx = VIEW_W / 2 + (i - 1) * 96 - 33
            return (
              <g key={`pair${i}`}>
                <rect x={lx} y={4} width={22} height={22} rx={5} fill="#FFF7ED" stroke={AMBER} strokeWidth={1.5} />
                <text x={lx + 11} y={15} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={INK}>{a}</text>
                <line x1={lx + 24} y1={15} x2={lx + 42} y2={15} stroke={AMBER} strokeWidth={2} strokeDasharray="3 3" />
                <rect x={lx + 44} y={4} width={22} height={22} rx={5} fill="#FFF7ED" stroke={AMBER} strokeWidth={1.5} />
                <text x={lx + 55} y={15} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={INK}>{b}</text>
              </g>
            )
          })}
          <text x={VIEW_W / 2} y={37} textAnchor="middle" fontSize={11} fontWeight={700} fill="#92400E">{t('partners — each pair adds to 7, never seen together', 'pasangan — tiap pasangan berjumlah 7, tak pernah terlihat bersamaan')}</text>
          {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => {
            const row = n <= 8 ? 0 : 1
            const col = n <= 8 ? n - 1 : n - 9
            const x = ROW0_X + col * (CHIP + GAP) + (row === 1 ? (CHIP + GAP) / 2 : 0)
            const y = 48 + row * (CHIP + 14)
            const mk = marks.get(n)
            const isThirteen = n === 13 && beat.red13
            const ringed = beat.ring.includes(n)
            return (
              <g key={n}>
                <rect
                  x={x}
                  y={y}
                  width={CHIP}
                  height={CHIP}
                  rx={8}
                  fill={isThirteen ? '#FEE2E2' : mk ? `${mk.color}22` : '#FFFFFF'}
                  stroke={isThirteen ? RED : ringed ? AMBER : mk ? mk.color : '#CBD5E1'}
                  strokeWidth={isThirteen || (mk && mk.fresh) ? 3 : ringed ? 2.5 : mk ? 2 : 1.5}
                  strokeDasharray={ringed ? '5 4' : undefined}
                />
                <text x={x + CHIP / 2} y={y + CHIP / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill={isThirteen ? RED : mk ? INK : '#94A3B8'} className="font-display">
                  {n}
                </text>
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
