import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SOLIDS, IsoStack,
  BalloonField21, ARROWS21,
  ChainDiagram21,
  BigCube21, CUBE_MISSING,
  CIRCLES22, CircleCard22,
  Mobile21,
  RabbitMaze21, MAZE_MOVES, MOVE_NAMES_EN, MOVE_NAMES_ID,
} from './puzzles21G1Illustrations'

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

/* Q3 — count the cubes of each solid; D one cube per beat. */
export function Solids21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { solid: 'A' | 'B' | 'C' | 'D'; upto: number; counts: Partial<Record<string, number>> }
  const steps = useMemo<Array<Beat<S>>>(() => {
    const out: Array<Beat<S>> = [
      { solid: 'A', upto: SOLIDS.A.length - 1, counts: {}, hold: 2400, result: false, caption: t('Count each solid — including cubes sitting on top. A: 7 on the floor + 1 on top = 8. ✗', 'Hitung tiap bangun — termasuk kubus di atas. A: 7 di lantai + 1 di atas = 8. ✗') },
      { solid: 'B', upto: SOLIDS.B.length - 1, counts: { A: 8 }, hold: 2400, result: false, caption: t('B: 6 on the floor + a tower of 2 more = 8. ✗', 'B: 6 di lantai + menara 2 lagi = 8. ✗') },
      { solid: 'C', upto: SOLIDS.C.length - 1, counts: { A: 8, B: 8 }, hold: 2400, result: false, caption: t('C: a flat zigzag of 8. ✗', 'C: zigzag datar isi 8. ✗') },
    ]
    for (let i = 0; i < SOLIDS.D.length; i++) {
      out.push({
        solid: 'D', upto: i, counts: { A: 8, B: 8, C: 8 }, hold: 950, result: false,
        caption: t(`D, cube ${i + 1}`, `D, kubus ke-${i + 1}`),
      })
    }
    out.push({ solid: 'D', upto: SOLIDS.D.length - 1, counts: { A: 8, B: 8, C: 8, D: 9 }, hold: 0, result: true, caption: t('D has 9 cubes — the answer is D.', 'D punya 9 kubus — jawabannya D.') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Solids A, B and C have eight cubes; D has nine.', 'Bangun A, B, dan C punya delapan kubus; D punya sembilan.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-end justify-center gap-4">
          <IsoStack voxels={SOLIDS[beat.solid]} size={20} upto={beat.upto} />
        </div>
        <div className="flex gap-2">
          {(['A', 'B', 'C', 'D'] as const).map((k) => {
            const n = beat.counts[k] ?? (k === beat.solid ? beat.upto + 1 : undefined)
            const active = k === beat.solid
            return (
              <span key={k} className="rounded-md border-2 px-2 py-0.5 font-display text-xs font-extrabold" style={{ borderColor: active ? '#D97706' : '#CBD5E1', background: n === 9 ? '#D1FAE5' : n !== undefined ? '#F8FAFC' : 'white', color: n === 9 ? '#065F46' : '#1F2937' }}>
                {k}: {n ?? '–'}
              </span>
            )
          })}
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q18 — shoot the arrows one per beat. */
export function Balloons21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { shot: number; survivors: boolean }
  const steps = useMemo<Array<Beat<S>>>(() => {
    const out: Array<Beat<S>> = [
      { shot: -1, survivors: false, hold: 2500, result: false, caption: t('21 balloons (3 + 5 + 5 + 5 + 3). Each arrow pops EVERY balloon on its straight line.', '21 balon (3 + 5 + 5 + 5 + 3). Tiap panah memecahkan SEMUA balon pada garis lurusnya.') },
    ]
    let total = 0
    const seen = new Set<string>()
    ARROWS21.forEach((a, i) => {
      a.hits.forEach(([r, c]) => seen.add(`${r},${c}`))
      total = seen.size
      out.push({ shot: i, survivors: false, hold: 2400, result: false, caption: `${lang === 'id' ? a.labelId : a.labelEn} → ${total}` })
    })
    out.push({ shot: ARROWS21.length - 1, survivors: true, hold: 2400, result: false, caption: t('16 popped. The survivors sit safely off every line.', '16 pecah. Yang selamat berada aman di luar semua garis.') })
    out.push({ shot: ARROWS21.length - 1, survivors: true, hold: 0, result: true, caption: t('21 − 16 = 5 balloons are not broken.', '21 − 16 = 5 balon tidak pecah.') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={t('Five arrows pop sixteen balloons; five survive.', 'Lima panah memecahkan enam belas balon; lima selamat.')}>
      <div className="flex flex-col items-center gap-3">
        <BalloonField21 shotUpto={beat.shot} highlightSurvivors={beat.survivors} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q19 — the number chains. */
export function Chains21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { reveal: { chick?: boolean; croc?: boolean; sheep?: boolean; lion?: boolean } }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { reveal: {}, hold: 2600, result: false, caption: t('Each straight line counts up by its own equal step. Read the line with the most numbers first.', 'Setiap garis lurus naik dengan langkahnya sendiri. Baca garis dengan angka terbanyak dulu.') },
      { reveal: { chick: true, croc: true }, hold: 2800, result: false, caption: t('Middle column: 2, 4, …, 10 steps by 2 → ○ = 6 and △ = 8.', 'Kolom tengah: 2, 4, …, 10 melangkah 2 → ○ = 6 dan △ = 8.') },
      { reveal: { chick: true, croc: true, sheep: true }, hold: 2600, result: false, caption: t('Left line: 0, ☆, 6 with equal steps → 0, 3, 6 → ☆ = 3.', 'Garis kiri: 0, ☆, 6 dengan langkah sama → 0, 3, 6 → ☆ = 3.') },
      { reveal: { chick: true, croc: true, sheep: true, lion: true }, hold: 2600, result: false, caption: t('Bottom line: 8, 9, □, 11 steps by 1 → □ = 10.', 'Garis bawah: 8, 9, □, 11 melangkah 1 → □ = 10.') },
      { reveal: { chick: true, croc: true, sheep: true, lion: true }, hold: 0, result: true, caption: t('☆ + ○ + △ + □ = 3 + 6 + 8 + 10 = 27.', '☆ + ○ + △ + □ = 3 + 6 + 8 + 10 = 27.') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('The chains give the star three, circle six, triangle eight and square ten, summing twenty-seven.', 'Rantai memberi bintang tiga, lingkaran enam, segitiga delapan, dan persegi sepuluh, jumlahnya dua puluh tujuh.')}>
      <div className="flex flex-col items-center gap-3">
        <ChainDiagram21 reveal={beat.reveal} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q21 — count the missing cubes one per beat. */
export function BigCube21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(() => {
    const zone = (i: number) => (i < 6 ? t('right side', 'sisi kanan') : t('front-row top', 'atas baris depan'))
    const out: Array<Beat<{ upto: number }>> = [
      { upto: -1, hold: 2500, result: false, caption: t('The full shape is a 4 × 4 × 4 cube. Count every empty space — even the deeper ones.', 'Bentuk penuhnya kubus 4 × 4 × 4. Hitung setiap ruang kosong — termasuk yang lebih dalam.') },
    ]
    CUBE_MISSING.forEach((_, i) => {
      out.push({ upto: i, hold: 1200, result: false, caption: `${zone(i)}: ${i + 1}` })
    })
    out.push({ upto: CUBE_MISSING.length - 1, hold: 0, result: true, caption: t('6 + 2 = 8 cubes are needed.', '6 + 2 = 8 kubus dibutuhkan.') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={t('Counting the gaps in the four-by-four-by-four cube gives eight missing cubes.', 'Menghitung celah pada kubus empat kali empat kali empat memberi delapan kubus hilang.')}>
      <div className="flex flex-col items-center gap-3">
        <BigCube21 countUpto={beat.upto} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q22 — discover the circle rule on complete examples. */
export function Circles22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { lit: number; apple: boolean }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { lit: -1, apple: false, hold: 2400, result: false, caption: t('Three circles are complete — use them to find the rule.', 'Tiga lingkaran sudah lengkap — gunakan untuk menemukan aturannya.') },
      { lit: 0, apple: false, hold: 2400, result: false, caption: t('Circle 1: green 5 + 8 = 13, minus pink 8 → 5, the box! ✓', 'Lingkaran 1: hijau 5 + 8 = 13, dikurangi merah muda 8 → 5, kotaknya! ✓') },
      { lit: 1, apple: false, hold: 2400, result: false, caption: t('Circle 2: 4 + 7 − 2 = 9 ✓ — the rule holds.', 'Lingkaran 2: 4 + 7 − 2 = 9 ✓ — aturannya berlaku.') },
      { lit: 2, apple: false, hold: 2400, result: false, caption: t('Circle 3: 11 + 6 − 5 = 12 ✓ — confirmed: green + green − pink = box.', 'Lingkaran 3: 11 + 6 − 5 = 12 ✓ — terbukti: hijau + hijau − merah muda = kotak.') },
      { lit: 3, apple: false, hold: 2600, result: false, caption: t('Circle 4: 9 + 🍎 − 4 = 11 → 9 + 🍎 = 15 → 🍎 = 6.', 'Lingkaran 4: 9 + 🍎 − 4 = 11 → 9 + 🍎 = 15 → 🍎 = 6.') },
      { lit: 3, apple: true, hold: 0, result: true, caption: t('🍎 = 6.', '🍎 = 6.') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('The rule green plus green minus pink equals the box forces the apple to be six.', 'Aturan hijau plus hijau minus merah muda sama dengan kotak memaksa apel bernilai enam.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-2">
          {CIRCLES22.map((d, i) => (
            <CircleCard22 key={i} data={i === 3 && beat.apple ? { ...d, right: 6 } : d} showApple={i === 3 && !beat.apple} lit={beat.lit === i} />
          ))}
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q24 — the balanced mobile. */
export function Mobile21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { values: { melon?: boolean; pine?: boolean; grape?: boolean } }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { values: {}, hold: 2500, result: false, caption: t('Every beam balances. Start from the known fruit: 🍓 = 10.', 'Setiap palang seimbang. Mulai dari buah yang diketahui: 🍓 = 10.') },
      { values: { melon: true }, hold: 2700, result: false, caption: t('Left beam: 3 🍓 = 2 🍉 → 30 = 2 🍉 → 🍉 = 15.', 'Palang kiri: 3 🍓 = 2 🍉 → 30 = 2 🍉 → 🍉 = 15.') },
      { values: { melon: true }, hold: 2600, result: false, caption: t('The left side weighs 30 + 30 = 60, so the right side is 60 too: 30 per string.', 'Sisi kiri beratnya 30 + 30 = 60, jadi sisi kanan juga 60: 30 per tali.') },
      { values: { melon: true, pine: true }, hold: 2700, result: false, caption: t('Right string: 🍓 + 🍉 + 🍍 = 30 → 10 + 15 + 🍍 = 30 → 🍍 = 5.', 'Tali kanan: 🍓 + 🍉 + 🍍 = 30 → 10 + 15 + 🍍 = 30 → 🍍 = 5.') },
      { values: { melon: true, pine: true, grape: true }, hold: 2700, result: false, caption: t('Other string: 🍍 + 🍍 + 🍇 = 30 → 5 + 5 + 🍇 = 30 → 🍇 = 20.', 'Tali satunya: 🍍 + 🍍 + 🍇 = 30 → 5 + 5 + 🍇 = 30 → 🍇 = 20.') },
      { values: { melon: true, pine: true, grape: true }, hold: 0, result: true, caption: t('The grapes weigh 20.', 'Anggur beratnya 20.') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Balancing the mobile gives watermelon fifteen, pineapple five and grapes twenty.', 'Menyeimbangkan mobil gantung memberi semangka lima belas, nanas lima, dan anggur dua puluh.')}>
      <div className="flex flex-col items-center gap-3">
        <Mobile21 values={beat.values} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q25 — walk the rabbit one move per beat. */
export function RabbitMaze21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(() => {
    const names = lang === 'id' ? MOVE_NAMES_ID : MOVE_NAMES_EN
    const out: Array<Beat<{ upto: number }>> = [
      { upto: -1, hold: 2600, result: false, caption: t('Visit every open square once, avoid the stones, end at the carrot. Moves: 1 ↑, 2 ←, 3 ↓, 4 →.', 'Lewati setiap petak terbuka sekali, hindari batu, akhiri di wortel. Gerakan: 1 ↑, 2 ←, 3 ↓, 4 →.') },
    ]
    let run = 0
    MAZE_MOVES.forEach((m, i) => {
      run += m
      out.push({ upto: i, hold: 1300, result: false, caption: `${names[m]} (${m}) → ${run}` })
    })
    out.push({ upto: MAZE_MOVES.length - 1, hold: 0, result: true, caption: t('4+3+2+3+3+4+1+4+3+4+1 = 32.', '4+3+2+3+3+4+1+4+3+4+1 = 32.') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={t('The rabbit’s only route gives move numbers summing thirty-two.', 'Satu-satunya rute kelinci memberi angka gerakan berjumlah tiga puluh dua.')}>
      <div className="flex flex-col items-center gap-3">
        <RabbitMaze21 movesUpto={beat.upto} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}
