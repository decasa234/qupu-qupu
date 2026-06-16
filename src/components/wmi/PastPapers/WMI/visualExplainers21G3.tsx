// Beat-based explainers for WMI-21F3A figure questions.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  StarGrid21G3, STAR_BANDS,
  ChocolateBar21G3,
  NotchedSquare21G3, NOTCH_EDGES,
  DivingTable21G3, DIVERS11, diveDrops,
  ShadedFig21G3, SHADED12,
  Shelves21G3,
  TallyMoney21G3, MONEY15,
  FruitEquations21G3,
  HexRing21G3, HEX20,
  SixRectangles21G3,
} from './scenes21G3Illustrations'

const GREEN = '#10B981'

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
type Beat<T> = T & { hold: number; result: boolean; caption: string }
function useBeats<T>(props: ExplainerProps, steps: Array<Beat<T>>) {
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  return steps[index] ?? steps[steps.length - 1]
}
const half = (n: number) => (n % 1 === 0 ? `${n}` : `${Math.floor(n)}½`)

/* Q5 — count the star band by band in unit triangles. */
export function Star21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(() => {
    const out: Array<Beat<{ upto: number }>> = [
      { upto: -1, hold: 2500, result: false, caption: t('The little blue triangle is the unit: 1 cm². Slice the star into thin rows and count.', 'Segitiga biru kecil adalah satuannya: 1 cm². Iris bintang jadi jalur-jalur tipis dan hitung.') },
    ]
    let run = 0
    STAR_BANDS.forEach((b, i) => {
      run += b
      const note = i === 4 ? t(' — the top triangle alone is 1+3+5+7+9 = 25', ' — segitiga atas saja 1+3+5+7+9 = 25') : ''
      out.push({ upto: i, hold: 1500, result: false, caption: `+${half(b)} → ${half(run)}${note}` })
    })
    out.push({ upto: STAR_BANDS.length - 1, hold: 0, result: true, caption: t('60 unit triangles × 1 cm² = 60 cm² (A).', '60 segitiga satuan × 1 cm² = 60 cm² (A).') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Counting the star row by row gives sixty unit triangles, sixty square centimetres.', 'Menghitung bintang jalur demi jalur memberi enam puluh segitiga satuan, enam puluh sentimeter persegi.')}>
      <div className="flex flex-col items-center gap-3">
        <StarGrid21G3 bandUpto={beat.upto} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q6 — eat the border, count the core. */
export function Chocolate21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { eaten: boolean; innerLit: number }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { eaten: false, innerLit: -1, hold: 2400, result: false, caption: t('The whole bar: 8 × 3 = 24 squares.', 'Seluruh cokelat: 8 × 3 = 24 petak.') },
      { eaten: true, innerLit: -1, hold: 2500, result: false, caption: t('Jenny eats every edge square — only the inner strip survives.', 'Jenny memakan semua petak tepi — hanya jalur dalam yang tersisa.') },
      { eaten: true, innerLit: 5, hold: 2500, result: false, caption: t('The survivors: (8−2) × (3−2) = 6 × 1 = 6 squares.', 'Yang tersisa: (8−2) × (3−2) = 6 × 1 = 6 petak.') },
      { eaten: true, innerLit: 5, hold: 2300, result: false, caption: t('Fraction left = 6 out of 24 = 6/24.', 'Bagian tersisa = 6 dari 24 = 6/24.') },
      { eaten: true, innerLit: 5, hold: 0, result: true, caption: t('6/24 = 1/4 (C).', '6/24 = 1/4 (C).') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={t('Eating the border leaves six of twenty-four squares, one quarter.', 'Memakan tepinya menyisakan enam dari dua puluh empat petak, seperempat.')}>
      <div className="flex flex-col items-center gap-3">
        <ChocolateBar21G3 eaten={beat.eaten} innerLit={beat.innerLit} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q7 — walk the outline edge by edge. */
export function Notch21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(() => {
    const out: Array<Beat<{ upto: number }>> = [
      { upto: -1, hold: 2500, result: false, caption: t('Walk the whole outline once — the notch adds edges, it doesn’t remove them.', 'Telusuri seluruh garis tepi sekali — lekukan menambah sisi, bukan menguranginya.') },
    ]
    let run = 0
    NOTCH_EDGES.forEach((e, i) => {
      run += e.len
      out.push({ upto: i, hold: 1500, result: false, caption: `+${e.len} → ${run}` })
    })
    out.push({ upto: NOTCH_EDGES.length - 1, hold: 0, result: true, caption: t('Perimeter = 160 cm (A).', 'Keliling = 160 cm (A).') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={t('Adding all eight edges of the notched square gives one hundred sixty centimetres.', 'Menjumlahkan kedelapan sisi persegi berlekuk memberi seratus enam puluh sentimeter.')}>
      <div className="flex flex-col items-center gap-3">
        <NotchedSquare21G3 edgeUpto={beat.upto} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q11 — drop extremes, sum, then rank. */
export function Diving21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { litRow?: number; showFinals: number }
  const steps = useMemo<Array<Beat<S>>>(() => {
    const out: Array<Beat<S>> = [
      { showFinals: -1, hold: 2600, result: false, caption: t('Rule: cross out ONE highest and ONE lowest score, then add the six left.', 'Aturan: coret SATU skor tertinggi dan SATU terendah, lalu jumlahkan enam sisanya.') },
    ]
    DIVERS11.forEach((d, i) => {
      const { final } = diveDrops(d.scores)
      const hi = Math.max(...d.scores)
      const lo = Math.min(...d.scores)
      out.push({ litRow: i, showFinals: i, hold: 2600, result: false, caption: `${d.name}: ${t('drop', 'buang')} ${hi} & ${lo} → ${final}` })
    })
    out.push({ showFinals: 3, hold: 2400, result: false, caption: t('Rank: Candice 35 > Betty 34 > Dora 32 > Ada 30.', 'Peringkat: Candice 35 > Betty 34 > Dora 32 > Ada 30.') })
    out.push({ showFinals: 3, hold: 0, result: true, caption: t('Top three: Candice – Betty – Dora (A).', 'Tiga teratas: Candice – Betty – Dora (A).') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={t('Dropping extremes gives Candice thirty-five, Betty thirty-four, Dora thirty-two, Ada thirty.', 'Membuang skor ekstrem memberi Candice tiga puluh lima, Betty tiga puluh empat, Dora tiga puluh dua, Ada tiga puluh.')}>
      <div className="flex flex-col items-center gap-3">
        <DivingTable21G3 litRow={beat.litRow} showFinals={beat.showFinals} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q12 — measure each option in unit squares. */
export function ShadedGrids21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { lit?: 'A' | 'B' | 'C' | 'D' }
  const steps = useMemo<Array<Beat<S>>>(() => {
    const cap = (k: 'A' | 'B' | 'C' | 'D') => `${k}: ${SHADED12[k].areaText}`
    return [
      { hold: 2400, result: false, caption: t('Count full squares and half-square triangles — never trust your eyes.', 'Hitung petak penuh dan segitiga setengah petak — jangan percaya mata.') },
      { lit: 'A', hold: 2500, result: false, caption: cap('A') },
      { lit: 'B', hold: 2500, result: false, caption: cap('B') },
      { lit: 'C', hold: 2500, result: false, caption: cap('C') + ' ✓' },
      { lit: 'D', hold: 2500, result: false, caption: cap('D') + t(' (one big triangle)', ' (satu segitiga besar)') },
      { lit: 'C', hold: 0, result: true, caption: t('C has 5 unit squares — the largest (C).', 'C punya 5 petak satuan — paling luas (C).') },
    ]
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Measuring gives four and a half, four, five and four; option C is largest.', 'Pengukuran memberi empat setengah, empat, lima, dan empat; pilihan C terbesar.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-4">
          {(['A', 'B', 'C', 'D'] as const).map((k) => (
            <div key={k} className="flex flex-col items-center" style={{ opacity: !beat.lit || beat.lit === k ? 1 : 0.35 }}>
              <ShadedFig21G3 k={k} size={26} />
              <span className="font-display text-xs font-extrabold text-gray-600">({k})</span>
            </div>
          ))}
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q13 — cancel matching bottles from the two equal shelves. */
export function Shelves21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { faded: string[] }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { faded: [], hold: 2600, result: false, caption: t('Both shelves hold the SAME total — like a balance scale.', 'Kedua rak memuat total yang SAMA — seperti timbangan.') },
      { faded: ['t1', 'b4'], hold: 2500, result: false, caption: t('One M on each shelf — cross them out, they cancel.', 'Ada satu M di tiap rak — coret, saling menghapus.') },
      { faded: ['t1', 'b4', 't0', 'b0'], hold: 2500, result: false, caption: t('One L on top cancels one L below.', 'Satu L di atas menghapus satu L di bawah.') },
      { faded: ['t1', 'b4', 't0', 'b0', 't2', 't3', 'b2', 'b3'], hold: 2600, result: false, caption: t('Two S on top cancel the two S below.', 'Dua S di atas menghapus dua S di bawah.') },
      { faded: ['t1', 'b4', 't0', 'b0', 't2', 't3', 'b2', 'b3'], hold: 2600, result: false, caption: t('Left over: 3 S on top = 1 L below → L = 3 × S.', 'Tersisa: 3 S di atas = 1 L di bawah → L = 3 × S.') },
      { faded: ['t1', 'b4', 't0', 'b0', 't2', 't3', 'b2', 'b3'], hold: 2400, result: false, caption: 'L = 3 × 850 = 2550 ml', },
      { faded: ['t1', 'b4', 't0', 'b0', 't2', 't3', 'b2', 'b3'], hold: 0, result: true, caption: t('2550 ml = 2 L 550 ml (B).', '2550 ml = 2 L 550 ml (B).') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  const faded = useMemo(() => new Set(beat.faded), [beat])
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Cancelling matching bottles leaves three smalls equal to one large: two litres five hundred fifty millilitres.', 'Mencoret botol yang sama menyisakan tiga kecil sama dengan satu besar: dua liter lima ratus lima puluh mililiter.')}>
      <div className="flex flex-col items-center gap-3">
        <Shelves21G3 faded={faded} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q15 — one denomination per beat with a running total. */
export function Tally21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(() => {
    const out: Array<Beat<{ upto: number }>> = [
      { upto: -1, hold: 2500, result: false, caption: t('Read each tally (a crossed gate = 5), multiply by the bill value, keep a running total.', 'Baca tiap turus (gerbang silang = 5), kalikan nilai pecahan, jaga total berjalan.') },
    ]
    let total = 0
    MONEY15.forEach((m, i) => {
      total += m.value * m.count
      out.push({ upto: i, hold: 2100, result: false, caption: `$${m.value} × ${m.count} = ${m.value * m.count} → ${total}` })
    })
    out.push({ upto: MONEY15.length - 1, hold: 0, result: true, caption: t('Total: $1570 (D).', 'Total: $1570 (D).') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Eight hundreds, twelve fifties, four twenties, seven tens, three fives and five ones total one thousand five hundred seventy dollars.', 'Delapan ratusan, dua belas lima-puluhan, empat dua-puluhan, tujuh puluhan, tiga limaan, dan lima satuan berjumlah seribu lima ratus tujuh puluh dolar.')}>
      <div className="flex flex-col items-center gap-3">
        <TallyMoney21G3 upto={beat.upto} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q18 — sum-product pair, then split the block. */
export function Fruits21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { reveal: { s?: boolean; g?: boolean; p?: boolean } }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { reveal: {}, hold: 2600, result: false, caption: t('Group 🍇 × 🍍 as one block P — it appears in the first TWO lines.', 'Kelompokkan 🍇 × 🍍 sebagai satu blok P — ia muncul di DUA baris pertama.') },
      { reveal: {}, hold: 2600, result: false, caption: t('Line 1: 🍓 × P = 240. Line 2: 🍓 + P = 31.', 'Baris 1: 🍓 × P = 240. Baris 2: 🍓 + P = 31.') },
      { reveal: {}, hold: 2600, result: false, caption: t('Sum 31, product 240 → try 15 & 16: 15 × 16 = 240 ✓', 'Jumlah 31, hasil kali 240 → coba 15 & 16: 15 × 16 = 240 ✓') },
      { reveal: {}, hold: 2800, result: false, caption: t('Try 🍓 = 16, P = 15: line 3 needs 🍇 − 🍍 = −7 with 🍇 × 🍍 = 15 — impossible ✗', 'Coba 🍓 = 16, P = 15: baris 3 butuh 🍇 − 🍍 = −7 dengan 🍇 × 🍍 = 15 — mustahil ✗') },
      { reveal: { s: true }, hold: 2800, result: false, caption: t('So 🍓 = 15, P = 16: line 3 gives 🍇 − 🍍 = 9 − 15 = −6 with 🍇 × 🍍 = 16 → 🍇 = 2, 🍍 = 8 ✓', 'Jadi 🍓 = 15, P = 16: baris 3 memberi 🍇 − 🍍 = 9 − 15 = −6 dengan 🍇 × 🍍 = 16 → 🍇 = 2, 🍍 = 8 ✓') },
      { reveal: { s: true, g: true, p: true }, hold: 2500, result: false, caption: t('Check all: 15×2×8 = 240 ✓, 15+2×8 = 31 ✓, 15+2−8 = 9 ✓', 'Periksa semua: 15×2×8 = 240 ✓, 15+2×8 = 31 ✓, 15+2−8 = 9 ✓') },
      { reveal: { s: true, g: true, p: true }, hold: 0, result: true, caption: t('Side by side: 15 | 2 | 8 → 1528.', 'Berdampingan: 15 | 2 | 8 → 1528.') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={t('The strawberry is fifteen, grape two, pineapple eight, making one thousand five hundred twenty-eight.', 'Stroberi lima belas, anggur dua, nanas delapan, membentuk seribu lima ratus dua puluh delapan.')}>
      <div className="flex flex-col items-center gap-3">
        <FruitEquations21G3 reveal={beat.reveal} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q20 — decode the colour rules on hexagon 1, then transfer. */
export function Hex21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { fig?: 0 | 1; pair?: number; showMissing?: boolean }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { hold: 2600, result: false, caption: t('Segments of the SAME colour sit opposite each other — pair them across the centre.', 'Ruas dengan warna SAMA saling berhadapan — pasangkan melewati pusat.') },
      { fig: 0, pair: 0, hold: 2500, result: false, caption: t('Yellow pair: 64 − 10 = 54 — the centre!', 'Pasangan kuning: 64 − 10 = 54 — itu pusatnya!') },
      { fig: 0, pair: 1, hold: 2500, result: false, caption: t('Pink pair: 28 + 26 = 54 ✓', 'Pasangan merah muda: 28 + 26 = 54 ✓') },
      { fig: 0, pair: 2, hold: 2500, result: false, caption: t('Blue pair: 9 × 6 = 54 ✓ — yellow subtracts, pink adds, blue multiplies.', 'Pasangan biru: 9 × 6 = 54 ✓ — kuning mengurang, merah muda menambah, biru mengali.') },
      { fig: 1, pair: 2, hold: 2500, result: false, caption: t('Hexagon 2, yellow: 75 − 27 = 48 — matches the centre 48 ✓', 'Heksagon 2, kuning: 75 − 27 = 48 — cocok dengan pusat 48 ✓') },
      { fig: 1, pair: 1, hold: 2500, result: false, caption: t('Blue: 8 × 6 = 48 ✓', 'Biru: 8 × 6 = 48 ✓') },
      { fig: 1, pair: 0, hold: 2600, result: false, caption: t('Pink must also make 48: 8 + ? = 48 → ? = 48 − 8.', 'Merah muda juga harus 48: 8 + ? = 48 → ? = 48 − 8.') },
      { fig: 1, pair: 0, showMissing: true, hold: 0, result: true, caption: '? = 40', },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={t('Yellow pairs subtract, pink pairs add, blue pairs multiply to the centre; eight plus forty is forty-eight.', 'Pasangan kuning mengurang, merah muda menambah, biru mengali menjadi pusat; delapan tambah empat puluh adalah empat puluh delapan.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-4">
          {HEX20.map((h, i) => (
            <div key={i} style={{ opacity: beat.fig === undefined || beat.fig === i ? 1 : 0.35 }}>
              <HexRing21G3 data={h} litPair={beat.fig === i ? beat.pair : undefined} showMissing={beat.showMissing} />
            </div>
          ))}
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q21 — relay across the rows: areas → widths → areas. */
export function SixRects21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { lit: number[]; reveal: Partial<Record<number, string>> }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { lit: [], reveal: {}, hold: 2600, result: false, caption: t('Top row is 6 cm tall, bottom row 7 cm — and their edges line up.', 'Baris atas setinggi 6 cm, baris bawah 7 cm — dan tepi-tepinya segaris.') },
      { lit: [0, 1], reveal: { 1: '22' }, hold: 2700, result: false, caption: t('The 9 cm span: 9 × 6 = 54 — so the middle one is 54 − 32 = 22 cm².', 'Bentang 9 cm: 9 × 6 = 54 — jadi yang tengah 54 − 32 = 22 cm².') },
      { lit: [1, 2], reveal: { 1: '22' }, hold: 2700, result: false, caption: t('Middle + right: 22 + 26 = 48 cm², height 6 → that stretch is 48 ÷ 6 = 8 cm wide.', 'Tengah + kanan: 22 + 26 = 48 cm², tinggi 6 → bentang itu lebarnya 48 ÷ 6 = 8 cm.') },
      { lit: [3, 4], reveal: { 1: '22', 4: '20' }, hold: 2700, result: false, caption: t('Below, the same 8 cm with height 7: 8 × 7 = 56 → blank = 56 − 36 = 20 cm².', 'Di bawah, 8 cm yang sama dengan tinggi 7: 8 × 7 = 56 → yang kosong = 56 − 36 = 20 cm².') },
      { lit: [4, 5], reveal: { 1: '22', 4: '20', 5: '50' }, hold: 2700, result: false, caption: t('The 10 cm span: 10 × 7 = 70 → ? = 70 − 20 = 50.', 'Bentang 10 cm: 10 × 7 = 70 → ? = 70 − 20 = 50.') },
      { lit: [5], reveal: { 1: '22', 4: '20', 5: '50' }, hold: 0, result: true, caption: t('? = 50 cm².', '? = 50 cm².') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={t('Walking the rows gives twenty-two, a shared eight-centimetre span, twenty, and finally fifty square centimetres.', 'Menelusuri barisnya memberi dua puluh dua, bentang delapan sentimeter, dua puluh, dan akhirnya lima puluh sentimeter persegi.')}>
      <div className="flex flex-col items-center gap-3">
        <SixRectangles21G3 litRects={beat.lit} reveal={beat.reveal} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}
