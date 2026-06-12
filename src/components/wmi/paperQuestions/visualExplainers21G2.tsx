import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { LINES2, LineFigure, lineCounts, MONEY11, Money21G2Illustration, Words21G2, countLetter, FIGURES14, CellsShape, L_PIECE, BoxNet21G2 } from './scenes21G2Illustrations'
import { AppleGrid21 } from './scenes21G1Illustrations'

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

/* Q2 — count unit segments per line. */
export function Lines21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { counted: string[] }
  const steps = useMemo<Array<Beat<S>>>(() => {
    const cap = (k: string) => {
      const c = lineCounts(LINES2[k])
      return `${k}: ${c.h} ${lang === 'id' ? 'mendatar' : 'across'} + ${c.v} ${lang === 'id' ? 'tegak' : 'up-down'} = ${c.total}`
    }
    return [
      { counted: [], hold: 2400, result: false, caption: t('Eyes lie — count the unit segments of each line instead.', 'Mata bisa menipu — hitung saja ruas satuan tiap garis.') },
      { counted: ['A'], hold: 2200, result: false, caption: cap('A') },
      { counted: ['A', 'B'], hold: 2200, result: false, caption: cap('B') },
      { counted: ['A', 'B', 'C'], hold: 2200, result: false, caption: cap('C') + ' ✓' },
      { counted: ['A', 'B', 'C', 'D'], hold: 2200, result: false, caption: cap('D') },
      { counted: ['A', 'B', 'C', 'D'], hold: 0, result: true, caption: t('C has 15 unit segments — the longest (C).', 'C punya 15 ruas satuan — terpanjang (C).') },
    ]
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Counting segments gives fourteen, thirteen, fifteen and thirteen; line C is longest.', 'Menghitung ruas memberi empat belas, tiga belas, lima belas, dan tiga belas; garis C terpanjang.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-4">
          {(['A', 'B', 'C', 'D'] as const).map((k) => (
            <div key={k} className="flex flex-col items-center" style={{ opacity: beat.counted.includes(k) || beat.counted.length === 0 ? 1 : 0.35 }}>
              <LineFigure fig={LINES2[k]} showCount={beat.counted.includes(k)} />
              <span className="font-display text-xs font-extrabold text-gray-600">({k})</span>
            </div>
          ))}
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q9 — apple grid product (reuses the G1 grid primitive). */
export function AppleProduct21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ mark: Array<[number, number]> }>>>(
    () => [
      { mark: [], hold: 2300, result: false, caption: t('Find the apple — it sits in the middle.', 'Cari apelnya — ia duduk di tengah.') },
      { mark: [[1, 0]], hold: 2300, result: false, caption: t('On the apple’s LEFT: the 7.', 'Di KIRI apel: angka 7.') },
      { mark: [[1, 0], [0, 2]], hold: 2500, result: false, caption: t('On its TOP RIGHT — one up, one right: the 4 (not the 9 above or the 6 beside!).', 'Di KANAN ATASNYA — satu naik, satu kanan: angka 4 (bukan 9 di atas atau 6 di samping!).') },
      { mark: [[1, 0], [0, 2]], hold: 0, result: true, caption: t('7 × 4 = 28 (C).', '7 × 4 = 28 (C).') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[260px]" role="img" aria-label={t('Seven left of the apple times four at its top right equals twenty-eight.', 'Tujuh di kiri apel kali empat di kanan atasnya sama dengan dua puluh delapan.')}>
      <div className="flex flex-col items-center gap-3">
        <AppleGrid21 mark={beat.mark} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q11 — money: one denomination per beat with a running total. */
export function Money21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number; total: number }>>>(() => {
    const out: Array<Beat<{ upto: number; total: number }>> = [
      { upto: -1, total: 0, hold: 2400, result: false, caption: t('Read each tally (a crossed gate = 5), multiply by the bill, keep a running total.', 'Baca tiap turus (gerbang silang = 5), kalikan dengan pecahan, jaga total berjalan.') },
    ]
    let total = 0
    MONEY11.forEach((m, i) => {
      total += m.value * m.count
      out.push({ upto: i, total, hold: 2100, result: false, caption: `$${m.value} × ${m.count} = ${m.value * m.count} → ${total}` })
    })
    out.push({ upto: MONEY11.length - 1, total, hold: 0, result: true, caption: t('Total: $563 (A).', 'Total: $563 (A).') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Four hundreds, six twenties, two tens, three fives and eight ones total five hundred sixty-three dollars.', 'Empat ratusan, enam dua-puluhan, dua puluhan, tiga limaan, dan delapan satuan berjumlah lima ratus enam puluh tiga dolar.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-full" style={{ opacity: 1 }}>
          <Money21G2Illustration />
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {MONEY11.map((m, i) => (
            <span key={m.value} className="rounded-md border-2 px-2 py-0.5 font-display text-xs font-extrabold" style={{ borderColor: i <= beat.upto ? '#10B981' : '#CBD5E1', background: i <= beat.upto ? '#D1FAE5' : 'white', color: i <= beat.upto ? '#065F46' : '#9CA3AF' }}>
              ${m.value}×{m.count}
            </span>
          ))}
          <span className="rounded-md border-2 border-[#30598A] bg-[#E1EFFB] px-2 py-0.5 font-display text-xs font-extrabold text-[#30598A]">= {beat.total}</span>
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q13 — letter tally, one candidate per beat. */
export function Letters21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { letter?: string; tally: Partial<Record<string, number>> }
  const steps = useMemo<Array<Beat<S>>>(() => {
    const letters = ['E', 'P', 'N', 'A']
    const out: Array<Beat<S>> = [
      { tally: {}, hold: 2300, result: false, caption: t('Tally each candidate letter across all seven words.', 'Turus tiap huruf kandidat di ketujuh kata.') },
    ]
    const tally: Partial<Record<string, number>> = {}
    letters.forEach((L) => {
      tally[L] = countLetter(L)
      out.push({ letter: L, tally: { ...tally }, hold: 2400, result: false, caption: `${L}: ${countLetter(L)}` })
    })
    out.push({ letter: 'A', tally: { ...tally }, hold: 0, result: true, caption: t('A wins with 8 — three of them hide in BANANA (C).', 'A menang dengan 8 — tiga di antaranya bersembunyi di BANANA (C).') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Tallying gives E seven, P six, N five and A eight; A appears most.', 'Turus memberi E tujuh, P enam, N lima, dan A delapan; A paling sering.')}>
      <div className="flex flex-col items-center gap-3">
        <Words21G2 markLetter={beat.letter} />
        <div className="flex gap-2">
          {['E', 'P', 'N', 'A'].map((L) => (
            <span key={L} className="rounded-md border-2 px-2 py-0.5 font-display text-xs font-extrabold" style={{ borderColor: beat.tally[L] !== undefined ? (L === 'A' ? '#10B981' : '#30598A') : '#CBD5E1', background: beat.tally[L] !== undefined ? (L === 'A' ? '#D1FAE5' : '#E1EFFB') : 'white' }}>
              {L}: {beat.tally[L] ?? '–'}
            </span>
          ))}
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q14 — split each figure into two L's (or fail). */
export function Pieces21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { fig: number; count: number }
  const steps = useMemo<Array<Beat<S>>>(() => {
    const out: Array<Beat<S>> = [
      { fig: -1, count: 0, hold: 2500, result: false, caption: t('The piece covers 4 squares, so each 8-square figure needs exactly two pieces. Rotations only — no flips!', 'Kepingnya menutup 4 petak, jadi tiap gambar 8 petak butuh tepat dua keping. Hanya rotasi — tanpa membalik!') },
    ]
    let count = 0
    FIGURES14.forEach((f, i) => {
      if (f.split) {
        count++
        out.push({ fig: i, count, hold: 2300, result: false, caption: t(`Figure ${i + 1}: splits into two L's ✓ → ${count}`, `Gambar ${i + 1}: terbelah menjadi dua L ✓ → ${count}`) })
      } else {
        out.push({ fig: i, count, hold: 2600, result: false, caption: t(`Figure ${i + 1}: any L you place leaves a non-L behind — impossible without flipping ✗`, `Gambar ${i + 1}: L mana pun menyisakan bentuk bukan-L — mustahil tanpa membalik ✗`) })
      }
    })
    out.push({ fig: FIGURES14.length - 1, count, hold: 0, result: true, caption: t('5 of the 6 figures can be formed (D).', '5 dari 6 gambar dapat dibentuk (D).') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Five figures split into two L pieces; one cannot.', 'Lima gambar terbelah menjadi dua keping L; satu tidak bisa.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <CellsShape cells={L_PIECE} size={14} colorOf={() => '#F4B400'} />
          <span className="font-display text-xs font-bold text-gray-500">× 2</span>
        </div>
        <div className="flex flex-wrap items-end justify-center gap-3">
          {FIGURES14.map((f, i) => {
            const active = beat.fig === i
            const done = beat.fig >= i || beat.result
            const colorOf = (cell: [number, number]) => {
              if (!done || !f.split) return done && !f.split ? '#FCA5A5' : '#C5BCE0'
              const inA = f.split.a.some(([r, c]) => r === cell[0] && c === cell[1])
              return inA ? '#F4B400' : '#7EC8E3'
            }
            return (
              <div key={i} className="flex flex-col items-center gap-0.5 rounded-lg p-1" style={{ outline: active ? '3px solid #D97706' : 'none', opacity: done || beat.fig === -1 ? 1 : 0.35 }}>
                <CellsShape cells={f.cells} colorOf={colorOf} />
                <span className="font-display text-xs font-extrabold" style={{ color: done ? (f.split ? '#065F46' : '#991B1B') : '#6B7280' }}>
                  {i + 1} {done ? (f.split ? '✓' : '✗') : ''}
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

/* Q15 — fold the net, fill two layers. */
export function BoxNet21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ layers: number }>>>(
    () => [
      { layers: 0, hold: 2500, result: false, caption: t('Fold the four 2×2 walls up around the 2×2 base — a lidless box, 2 cm deep.', 'Lipat keempat dinding 2×2 mengelilingi alas 2×2 — kotak tanpa tutup, dalamnya 2 cm.') },
      { layers: 1, hold: 2400, result: false, caption: t('Bottom layer: 2 × 2 = 4 cubes.', 'Lapisan bawah: 2 × 2 = 4 kubus.') },
      { layers: 2, hold: 2400, result: false, caption: t('The walls are 2 cm tall — a second layer fits: 4 + 4 = 8.', 'Dinding setinggi 2 cm — lapisan kedua muat: 4 + 4 = 8.') },
      { layers: 2, hold: 0, result: true, caption: t('The box holds 8 cubes (B).', 'Kotak memuat 8 kubus (B).') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={t('The folded box is two by two by two and holds eight unit cubes.', 'Kotak yang terlipat berukuran dua kali dua kali dua dan memuat delapan kubus satuan.')}>
      <div className="flex flex-col items-center gap-3">
        <BoxNet21G2 liftLayers={beat.layers} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}
