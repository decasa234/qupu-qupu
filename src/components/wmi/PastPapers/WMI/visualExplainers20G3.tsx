import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { W_GRIDS, WGrid, LampRow, BoatGrid, MiniTempChart, TEMP_CHARTS, TEMP_FAIL, ShapeAdditionBoard } from './scenes20G3Illustrations'
import { PatternShape, PATTERN_SHAPES } from './scenes20G3Illustrations'
import { ThreeRectangles } from './puzzles20G3Illustrations'

const GREEN = '#10B981'
const INK = '#1F2937'

function Caption({ result, children }: { result: boolean; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
      style={
        result
          ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
          : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
      }
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------- Q2: count the W's. */
export default function WGridCountG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type Beat = { aRows: number; counts: Partial<Record<string, number>>; hold: number; result: boolean; caption: string }
  const steps = useMemo<Beat[]>(() => {
    const aRowW = W_GRIDS.A.map((row) => row.filter((ch) => ch === 'W').length) // 1,2,1,1,0
    const out: Beat[] = [
      { aRows: 0, counts: {}, hold: 2600, result: false, caption: t('Each grid has 15 squares — 1/3 of 15 = 5. Hunt for the grid with exactly 5 W’s.', 'Tiap kotak punya 15 petak — 1/3 dari 15 = 5. Cari kotak dengan tepat 5 huruf W.') },
    ]
    let run = 0
    aRowW.forEach((n, r) => {
      run += n
      out.push({
        aRows: r + 1,
        counts: {},
        hold: 1500,
        result: false,
        caption: t(`Grid A, row ${r + 1}: ${n === 0 ? 'no W' : `${n} W`} → total ${run}`, `Kotak A, baris ${r + 1}: ${n === 0 ? 'tanpa W' : `${n} W`} → total ${run}`),
      })
    })
    out.push({ aRows: 5, counts: { A: 5 }, hold: 2000, result: false, caption: t('Grid A has 5 W’s — exactly 1/3! Check the rest to be sure.', 'Kotak A punya 5 W — tepat 1/3! Periksa sisanya untuk memastikan.') })
    out.push({ aRows: 5, counts: { A: 5, B: 6 }, hold: 1800, result: false, caption: t('Grid B: 6 W’s — 6/15 is too many. ✗', 'Kotak B: 6 W — 6/15 terlalu banyak. ✗') })
    out.push({ aRows: 5, counts: { A: 5, B: 6, C: 4 }, hold: 1800, result: false, caption: t('Grid C: 4 W’s — 4/15 is too few. ✗', 'Kotak C: 4 W — 4/15 terlalu sedikit. ✗') })
    out.push({ aRows: 5, counts: { A: 5, B: 6, C: 4, D: 4 }, hold: 1800, result: false, caption: t('Grid D: 4 W’s — too few. ✗', 'Kotak D: 4 W — terlalu sedikit. ✗') })
    out.push({ aRows: 5, counts: { A: 5, B: 6, C: 4, D: 4 }, hold: 0, result: true, caption: t('Only A has 5 of 15 squares as W — exactly 1/3 (A).', 'Hanya A yang punya 5 dari 15 petak berisi W — tepat 1/3 (A).') })
    return out
  }, [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Counting W squares: grid A has five of fifteen, exactly one third.', 'Menghitung petak W: kotak A punya lima dari lima belas, tepat sepertiga.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-start justify-center gap-3">
          {(['A', 'B', 'C', 'D'] as const).map((k) => {
            const count = beat.counts[k]
            const dim = k !== 'A' && count === undefined && !beat.result
            return (
              <div key={k} className="flex flex-col items-center gap-1" style={{ opacity: dim ? 0.35 : 1 }}>
                <WGrid rows={W_GRIDS[k]} size={k === 'A' ? 24 : 20} litRows={k === 'A' ? beat.aRows : count !== undefined ? 5 : 0} />
                <span
                  className="rounded-md px-2 font-display text-xs font-extrabold"
                  style={{
                    background: count === undefined ? 'transparent' : count === 5 ? '#D1FAE5' : '#FEE2E2',
                    color: count === undefined ? '#6B7280' : count === 5 ? '#065F46' : '#991B1B',
                  }}
                >
                  {k}{count !== undefined ? `: ${count} W` : ''}
                </span>
              </div>
            )
          })}
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* ------------------------------------------------- Q5: lamps and gaps. */
export function LampGapsG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(() => {
    const out: Array<{ gaps: number; lengths: boolean; hold: number; result: boolean; caption: string }> = [
      { gaps: 0, lengths: false, hold: 2400, result: false, caption: t('Lamps stand at BOTH ends of the 90 m road. Count the gaps, not the lamps!', 'Lampu berdiri di KEDUA ujung jalan 90 m. Hitung celahnya, bukan lampunya!') },
    ]
    for (let i = 1; i <= 9; i++) {
      out.push({ gaps: i, lengths: false, hold: 900, result: false, caption: t(`Gap ${i}`, `Celah ${i}`) })
    }
    out.push({ gaps: 9, lengths: false, hold: 2200, result: false, caption: t('10 lamps make only 9 gaps: 10 − 1 = 9.', '10 lampu hanya membuat 9 celah: 10 − 1 = 9.') })
    out.push({ gaps: 9, lengths: true, hold: 0, result: true, caption: t('90 m shared by 9 gaps: 90 ÷ 9 = 10 m each (C).', '90 m dibagi 9 celah: 90 ÷ 9 = 10 m tiap celah (C).') })
    return out
  }, [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Ten lamps make nine gaps, ninety divided by nine is ten metres.', 'Sepuluh lampu membuat sembilan celah, sembilan puluh dibagi sembilan adalah sepuluh meter.')}>
      <div className="flex flex-col items-center gap-3">
        <LampRow litGaps={beat.gaps} showLengths={beat.lengths} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* ------------------------------------------------- Q7: boat area. */
export function BoatAreaG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type Beat = { hl: 'sailBox' | 'sail' | 'hullBox' | 'hull' | null; tally: string; hold: number; result: boolean; caption: string }
  const steps = useMemo<Beat[]>(
    () => [
      { hl: null, tally: '', hold: 2400, result: false, caption: t('One grid square is 5 × 5 = 25 cm². Count the boat in squares first.', 'Satu petak kisi 5 × 5 = 25 cm². Hitung perahunya dalam petak dulu.') },
      { hl: 'sailBox', tally: '', hold: 2300, result: false, caption: t('Put a box around the sail: 2 squares wide × 3 tall = 6 squares.', 'Kurung layar dengan kotak: lebar 2 petak × tinggi 3 = 6 petak.') },
      { hl: 'sail', tally: t('sail = 3', 'layar = 3'), hold: 2300, result: false, caption: t('The sail cuts that box exactly in half: 6 ÷ 2 = 3 squares.', 'Layar membelah kotak itu tepat dua: 6 ÷ 2 = 3 petak.') },
      { hl: 'hullBox', tally: t('sail = 3', 'layar = 3'), hold: 2300, result: false, caption: t('Box the hull: 4 squares wide × 1 tall = 4 squares.', 'Kurung badan perahu: lebar 4 petak × tinggi 1 = 4 petak.') },
      { hl: 'hull', tally: t('sail 3 + hull 3', 'layar 3 + badan 3'), hold: 2300, result: false, caption: t('Each slanted end cuts off half a square: 4 − ½ − ½ = 3 squares.', 'Tiap ujung miring memotong setengah petak: 4 − ½ − ½ = 3 petak.') },
      { hl: null, tally: '3 + 3 = 6', hold: 2200, result: false, caption: t('Boat total: 3 + 3 = 6 squares.', 'Total perahu: 3 + 3 = 6 petak.') },
      { hl: null, tally: '6 × 25 = 150', hold: 0, result: true, caption: t('6 squares × 25 cm² = 150 cm² (C).', '6 petak × 25 cm² = 150 cm² (C).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={t('The sail is three squares, the hull three squares, six squares of twenty-five give one hundred fifty.', 'Layar tiga petak, badan tiga petak, enam petak kali dua puluh lima memberi seratus lima puluh.')}>
      <div className="flex flex-col items-center gap-3">
        <BoatGrid highlight={beat.hl} />
        {beat.tally && (
          <div className="rounded-lg border-2 px-3 py-1 font-display text-sm font-extrabold" style={{ borderColor: '#F4B400', background: '#FFF7E6', color: INK }}>
            {beat.tally}
          </div>
        )}
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* ------------------------------------------------- Q8: match the chart. */
export function TempChartsG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type Beat = { show: string[]; hold: number; result: boolean; caption: string }
  const steps = useMemo<Beat[]>(
    () => [
      { show: [], hold: 2500, result: false, caption: t('The table: 60, 70, 70, 80, 90, 80, 70 — one peak, at June. Compare month by month.', 'Tabel: 60, 70, 70, 80, 90, 80, 70 — satu puncak, di Juni. Bandingkan bulan demi bulan.') },
      { show: ['B'], hold: 2400, result: false, caption: t('Graph B: March reads 80°F, the table says 70°F. ✗', 'Grafik B: Maret terbaca 80°F, tabel bilang 70°F. ✗') },
      { show: ['B', 'C'], hold: 2400, result: false, caption: t('Graph C: July reads 90°F, the table says 80°F. ✗', 'Grafik C: Juli terbaca 90°F, tabel bilang 80°F. ✗') },
      { show: ['B', 'C', 'D'], hold: 2400, result: false, caption: t('Graph D: May reads 90°F, the table says 80°F. ✗', 'Grafik D: Mei terbaca 90°F, tabel bilang 80°F. ✗') },
      { show: ['B', 'C', 'D', 'A'], hold: 2400, result: false, caption: t('Graph A: every month matches — 60, 70, 70, 80, 90, 80, 70. ✓', 'Grafik A: semua bulan cocok — 60, 70, 70, 80, 90, 80, 70. ✓') },
      { show: ['B', 'C', 'D', 'A'], hold: 0, result: true, caption: t('The correct graph is A.', 'Grafik yang benar adalah A.') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Graphs B, C and D each disagree with the table at one month; graph A matches all seven.', 'Grafik B, C, dan D masing-masing berbeda dari tabel di satu bulan; grafik A cocok di ketujuh bulan.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-2">
          {(['A', 'B', 'C', 'D'] as const).map((k) => {
            const on = beat.show.includes(k)
            const fail = TEMP_FAIL[k]
            return (
              <div key={k} className="flex flex-col items-center gap-0.5" style={{ opacity: on ? 1 : 0.25 }}>
                <MiniTempChart values={TEMP_CHARTS[k]} badIndex={on ? fail : null} size={k === 'A' ? 120 : 100} />
                <span className="font-display text-xs font-extrabold" style={{ color: on ? (fail == null ? '#065F46' : '#991B1B') : '#6B7280' }}>
                  {k} {on ? (fail == null ? '✓' : '✗') : ''}
                </span>
              </div>
            )
          })}
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* ------------------------------------------------- Q13: shape addition. */
export function ShapeAddG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type R = { star?: boolean; sq?: boolean; circ?: boolean; tri?: boolean }
  type Beat = { r: R; hold: number; result: boolean; caption: string }
  const steps = useMemo<Beat[]>(
    () => [
      { r: {}, hold: 2400, result: false, caption: t('Solve column by column from the units — and write down every carry.', 'Selesaikan kolom demi kolom dari satuan — dan catat tiap simpanan.') },
      { r: { star: true }, hold: 2400, result: false, caption: t('Units: 3 + ★ ends in 0 → 3 + 7 = 10 → ★ = 7, carry 1.', 'Satuan: 3 + ★ berakhiran 0 → 3 + 7 = 10 → ★ = 7, simpan 1.') },
      { r: { star: true, sq: true }, hold: 2400, result: false, caption: t('Tens: ■ + 8 + 1 ends in 2 → 3 + 8 + 1 = 12 → ■ = 3, carry 1.', 'Puluhan: ■ + 8 + 1 berakhiran 2 → 3 + 8 + 1 = 12 → ■ = 3, simpan 1.') },
      { r: { star: true, sq: true, circ: true }, hold: 2400, result: false, caption: t('Hundreds: 6 + ● + 1 ends in 0 → 6 + 3 + 1 = 10 → ● = 3, carry 1.', 'Ratusan: 6 + ● + 1 berakhiran 0 → 6 + 3 + 1 = 10 → ● = 3, simpan 1.') },
      { r: { star: true, sq: true, circ: true, tri: true }, hold: 2400, result: false, caption: t('Thousands: 1 + carry 1 = 2 → ▲ = 2. Check: 633 + 1387 = 2020 ✓', 'Ribuan: 1 + simpanan 1 = 2 → ▲ = 2. Cek: 633 + 1387 = 2020 ✓') },
      { r: { star: true, sq: true, circ: true, tri: true }, hold: 0, result: true, caption: t('■ + ● + ★ + ▲ = 3 + 3 + 7 + 2 = 15 (D).', '■ + ● + ★ + ▲ = 3 + 3 + 7 + 2 = 15 (D).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={t('Column addition gives star seven, square three, circle three, triangle two, summing fifteen.', 'Penjumlahan bersusun memberi bintang tujuh, persegi tiga, lingkaran tiga, segitiga dua, jumlahnya lima belas.')}>
      <div className="flex flex-col items-center gap-3">
        <ShapeAdditionBoard revealed={beat.r} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* ------------------------------------------------- Q14: growing pattern. */
export function CirclePatternG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type Beat = { upto: number; hold: number; result: boolean; caption: string }
  const steps = useMemo<Beat[]>(
    () => [
      { upto: 9, hold: 2600, result: false, caption: t('Chunk the printed part: (●▲)(●●▲)(●●●▲) — groups end at positions 2, 5, 9.', 'Kelompokkan bagian tercetak: (●▲)(●●▲)(●●●▲) — kelompok berakhir di posisi 2, 5, 9.') },
      { upto: 13, hold: 2500, result: false, caption: t('Group 4 has FOUR circles: positions 10, 11, 12, 13 are all ●.', 'Kelompok 4 punya EMPAT lingkaran: posisi 10, 11, 12, 13 semuanya ●.') },
      { upto: 14, hold: 2400, result: false, caption: t('The triangle closes group 4 at position 14: 9 + 4 + 1 = 14 → ▲.', 'Segitiga menutup kelompok 4 di posisi 14: 9 + 4 + 1 = 14 → ▲.') },
      { upto: 16, hold: 2400, result: false, caption: t('Group 5 starts with circles: positions 15 and 16 are ●.', 'Kelompok 5 dimulai dengan lingkaran: posisi 15 dan 16 adalah ●.') },
      { upto: 16, hold: 0, result: true, caption: t('The “?” places 13, 14, 15 read ●, ▲, ● (B).', 'Tempat “?” 13, 14, 15 terbaca ●, ▲, ● (B).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('The pattern groups grow by one circle; positions thirteen to fifteen are circle, triangle, circle.', 'Kelompok pola bertambah satu lingkaran; posisi tiga belas sampai lima belas adalah lingkaran, segitiga, lingkaran.')}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 420 78" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => {
            const x = 16 + i * 26
            const pos = i + 1
            const deduced = i >= 9
            const shown = pos <= beat.upto
            const q = i >= 12 && i <= 14
            return (
              <g key={i}>
                {deduced && <rect x={x - 12} y={14} width={24} height={24} rx={4} fill="white" stroke={q ? '#E75480' : '#94A3B8'} strokeWidth={q ? 2.2 : 1.4} />}
                {shown && <PatternShape kind={PATTERN_SHAPES[i]} x={x} y={26} size={10} ghost={deduced} />}
                <text x={x} y={52} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={q ? '#E75480' : '#9CA3AF'} className="font-display">{pos}</text>
              </g>
            )
          })}
          {/* group brackets under positions: (1-2)(3-5)(6-9)(10-14) */}
          {[[1, 2], [3, 5], [6, 9], [10, 14]].map(([a, b], k) => {
            const xa = 16 + (a - 1) * 26 - 10
            const xb = 16 + (b - 1) * 26 + 10
            const visible = b <= beat.upto || k < 3
            return visible ? <path key={k} d={`M ${xa} 60 V 66 H ${xb} V 60`} fill="none" stroke="#30598A" strokeWidth={1.8} /> : null
          })}
        </svg>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* ------------------------------------------------- Q20: three rectangles. */
export function ThreeRectanglesG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type Beat = { region: 'leftCol' | 'strip' | 'greenWidth' | 'pinkWidth' | 'rightCol' | null; hold: number; result: boolean; caption: string }
  const steps = useMemo<Beat[]>(
    () => [
      { region: null, hold: 2500, result: false, caption: t('Three rectangles: 7, 50 and 33 cm². The left edge is 6 cm, the 7-piece is 3 cm wide.', 'Tiga persegi panjang: 7, 50, dan 33 cm². Tepi kiri 6 cm, potongan-7 lebarnya 3 cm.') },
      { region: 'leftCol', hold: 2500, result: false, caption: t('The left column is 3 cm wide and 6 cm tall: 3 × 6 = 18 cm².', 'Kolom kiri lebar 3 cm dan tinggi 6 cm: 3 × 6 = 18 cm².') },
      { region: 'strip', hold: 2500, result: false, caption: t('Below the 7 sits a green strip: 18 − 7 = 11 cm².', 'Di bawah angka 7 ada jalur hijau: 18 − 7 = 11 cm².') },
      { region: 'greenWidth', hold: 2600, result: false, caption: t('The whole green is 33 = 11 + 11 + 11 — three strips of width 3 → green is 9 cm wide.', 'Hijau seluruhnya 33 = 11 + 11 + 11 — tiga jalur selebar 3 → lebar hijau 9 cm.') },
      { region: 'pinkWidth', hold: 2400, result: false, caption: t('The pink sits on the rest: 9 − 3 = 6 cm wide.', 'Merah muda menempati sisanya: lebar 9 − 3 = 6 cm.') },
      { region: 'rightCol', hold: 2600, result: false, caption: t('The right column (width 6) holds pink + the green leftover: 50 + 22 = 72 cm².', 'Kolom kanan (lebar 6) memuat merah muda + sisa hijau: 50 + 22 = 72 cm².') },
      { region: 'rightCol', hold: 0, result: true, caption: t('? = 72 ÷ 6 = 12 cm.', '? = 72 ÷ 6 = 12 cm.') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Slicing the figure into columns: the left column gives a strip of eleven, the green is nine wide, and the right column of seventy-two over six gives twelve.', 'Mengiris bangun menjadi kolom: kolom kiri memberi jalur sebelas, hijau selebar sembilan, dan kolom kanan tujuh puluh dua dibagi enam memberi dua belas.')}>
      <div className="flex flex-col items-center gap-3">
        <ThreeRectangles region={beat.region} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}
