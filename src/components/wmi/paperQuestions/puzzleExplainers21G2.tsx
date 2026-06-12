import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  ChainDiagram21G2,
  BigCube21G2, CUBE_MISSING_G2,
  HEXES19, Hexagon19,
  Tower23, TOWER23, TOWER_TOTAL,
  RabbitMaze21G2, MAZE_MOVES_G2,
  SudokuBoard25,
} from './puzzles21G2Illustrations'
import { MOVE_NAMES_EN, MOVE_NAMES_ID } from './puzzles21G1Illustrations'

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

/* Q17 — the three chains. */
export function Chains21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { reveal: { chick?: boolean; sheep?: boolean; croc?: boolean; lion?: boolean } }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { reveal: {}, hold: 2600, result: false, caption: t('Each straight chain steps by its own amount — find each step from two known circles.', 'Setiap rantai lurus melangkah dengan besarnya sendiri — temukan dari dua lingkaran yang diketahui.') },
      { reveal: { chick: true }, hold: 2600, result: false, caption: t('Top: 18, 20, 🐤, 24 steps by 2 → 🐤 = 22.', 'Atas: 18, 20, 🐤, 24 melangkah 2 → 🐤 = 22.') },
      { reveal: { chick: true, sheep: true, croc: true }, hold: 2800, result: false, caption: t('Middle: 🐑, 24, 27, 🐊 steps by 3 → 🐑 = 21 and 🐊 = 30.', 'Tengah: 🐑, 24, 27, 🐊 melangkah 3 → 🐑 = 21 dan 🐊 = 30.') },
      { reveal: { chick: true, sheep: true, croc: true, lion: true }, hold: 2600, result: false, caption: t('Bottom: 30, 🦁, 40, 45 steps by 5 → 🦁 = 35.', 'Bawah: 30, 🦁, 40, 45 melangkah 5 → 🦁 = 35.') },
      { reveal: { chick: true, sheep: true, croc: true, lion: true }, hold: 0, result: true, caption: t('21 + 22 + 30 + 35 = 108.', '21 + 22 + 30 + 35 = 108.') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('The chains give sheep twenty-one, chick twenty-two, crocodile thirty and lion thirty-five, totalling one hundred eight.', 'Rantai memberi domba dua puluh satu, anak ayam dua puluh dua, buaya tiga puluh, dan singa tiga puluh lima, totalnya seratus delapan.')}>
      <div className="flex flex-col items-center gap-3">
        <ChainDiagram21G2 reveal={beat.reveal} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q18 — count the 10 missing cubes. */
export function BigCube21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(() => {
    const zone = (i: number) => (i < 3 ? t('shallow step', 'undakan dangkal') : i < 7 ? t('two-deep step', 'undakan dua-dalam') : t('deepest corner', 'sudut terdalam'))
    const out: Array<Beat<{ upto: number }>> = [
      { upto: -1, hold: 2500, result: false, caption: t('The full shape is 4 × 4 × 4. Count what each carved column still needs.', 'Bentuk penuhnya 4 × 4 × 4. Hitung kekurangan tiap kolom yang terpahat.') },
    ]
    CUBE_MISSING_G2.forEach((_, i) => out.push({ upto: i, hold: 1150, result: false, caption: `${zone(i)}: ${i + 1}` }))
    out.push({ upto: CUBE_MISSING_G2.length - 1, hold: 0, result: true, caption: t('3 + 4 + 3 = 10 cubes are needed.', '3 + 4 + 3 = 10 kubus dibutuhkan.') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={t('Counting the pit gives ten missing cubes.', 'Menghitung cekungan memberi sepuluh kubus hilang.')}>
      <div className="flex flex-col items-center gap-3">
        <BigCube21G2 countUpto={beat.upto} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q19 — hexagon rule: sum of opposite-pair products. */
export function Hexagons21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { hex: number; pair?: number; center?: number | null }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { hex: 0, hold: 2400, result: false, caption: t('Two hexagons are complete — hunt for the rule with their OPPOSITE parts.', 'Dua segi enam sudah lengkap — cari aturannya lewat bagian yang BERSEBERANGAN.') },
      { hex: 0, pair: 0, hold: 2300, result: false, caption: t('Hexagon 1: top × bottom = 2 × 5 = 10.', 'Segi enam 1: atas × bawah = 2 × 5 = 10.') },
      { hex: 0, pair: 1, hold: 2300, result: false, caption: t('Plus 9 × 1 = 9 → 19 so far.', 'Plus 9 × 1 = 9 → sejauh ini 19.') },
      { hex: 0, pair: 2, hold: 2400, result: false, caption: t('Plus 3 × 4 = 12 → 10 + 9 + 12 = 31, the centre! ✓', 'Plus 3 × 4 = 12 → 10 + 9 + 12 = 31, bilangan tengahnya! ✓') },
      { hex: 1, hold: 2600, result: false, caption: t('Check hexagon 2: 8×1 + 9×2 + 4×7 = 8 + 18 + 28 = 54 ✓ — the rule holds.', 'Cek segi enam 2: 8×1 + 9×2 + 4×7 = 8 + 18 + 28 = 54 ✓ — aturannya berlaku.') },
      { hex: 2, pair: 0, hold: 2400, result: false, caption: t('Hexagon 3: 4 × 5 = 20.', 'Segi enam 3: 4 × 5 = 20.') },
      { hex: 2, pair: 1, hold: 2300, result: false, caption: t('Plus 2 × 6 = 12 → 32.', 'Plus 2 × 6 = 12 → 32.') },
      { hex: 2, pair: 2, center: 56, hold: 2400, result: false, caption: t('Plus 8 × 3 = 24 → 20 + 12 + 24 = 56.', 'Plus 8 × 3 = 24 → 20 + 12 + 24 = 56.') },
      { hex: 2, center: 56, hold: 0, result: true, caption: t('🍍 = 56.', '🍍 = 56.') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('The centre equals the sum of the three opposite-pair products, so the pineapple is fifty-six.', 'Bilangan tengah sama dengan jumlah tiga hasil kali pasangan berseberangan, jadi nanasnya lima puluh enam.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-3">
          {HEXES19.map((h, i) => (
            <div key={i} style={{ opacity: beat.hex === i ? 1 : 0.4 }}>
              <Hexagon19 data={h} litPair={beat.hex === i ? beat.pair : undefined} showCenter={i === 2 ? (beat.center ?? null) : undefined} />
            </div>
          ))}
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q23 — climb the tower one layer per beat. */
export function Tower21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(() => {
    const out: Array<Beat<{ upto: number }>> = [
      { upto: -1, hold: 2500, result: false, caption: t('Only HEIGHTS stack: a lying 25×10 adds 10, a standing one adds 25, a square adds 5.', 'Hanya TINGGI yang bertumpuk: 25×10 rebah menambah 10, yang berdiri 25, persegi 5.') },
    ]
    let run = 0
    TOWER23.forEach((l, i) => {
      run += l.h
      out.push({ upto: i, hold: 1700, result: false, caption: `${lang === 'id' ? l.labelId : l.labelEn} → ${run}` })
    })
    out.push({ upto: TOWER23.length - 1, hold: 0, result: true, caption: t(`The tower is ${TOWER_TOTAL} cm tall.`, `Tinggi menara ${TOWER_TOTAL} cm.`) })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={t('Climbing layer by layer, the tower is one hundred forty centimetres.', 'Menaiki lapis demi lapis, menara setinggi seratus empat puluh sentimeter.')}>
      <div className="flex flex-col items-center gap-3">
        <Tower23 litUpto={beat.upto} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q24 — walk the rabbit. */
export function RabbitMaze21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(() => {
    const names = lang === 'id' ? MOVE_NAMES_ID : MOVE_NAMES_EN
    const out: Array<Beat<{ upto: number }>> = [
      { upto: -1, hold: 2600, result: false, caption: t('Visit every open square once, avoid the stones, end at the carrot. Moves: 1 ↑, 2 ←, 3 ↓, 4 →.', 'Lewati setiap petak terbuka sekali, hindari batu, akhiri di wortel. Gerakan: 1 ↑, 2 ←, 3 ↓, 4 →.') },
    ]
    let run = 0
    MAZE_MOVES_G2.forEach((m, i) => {
      run += m
      out.push({ upto: i, hold: 1250, result: false, caption: `${names[m]} (${m}) → ${run}` })
    })
    out.push({ upto: MAZE_MOVES_G2.length - 1, hold: 0, result: true, caption: t('1+1+4+3+3+4+4+4+1+2+1+4 = 32.', '1+1+4+3+3+4+4+4+1+2+1+4 = 32.') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={t('The rabbit’s route gives move numbers summing thirty-two.', 'Rute kelinci memberi angka gerakan berjumlah tiga puluh dua.')}>
      <div className="flex flex-col items-center gap-3">
        <RabbitMaze21G2 movesUpto={beat.upto} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q25 — quadruple-clue Sudoku deduction. */
export function Sudoku21G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { keys: string[]; quad?: number }
  const k = (cells: Array<[number, number]>) => cells.map(([r, c]) => `${r},${c}`)
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { keys: [], hold: 2700, result: false, caption: t('Rules: 1–5 once per row and column; each small clue lists EXACTLY what its four squares hold. Only one digit is given: the red 2.', 'Aturan: 1–5 sekali per baris dan kolom; tiap petunjuk kecil mendaftar PERSIS isi keempat petaknya. Hanya satu angka diberikan: 2 merah.') },
      { keys: [], quad: 2, hold: 2700, result: false, caption: t('The 2355 clue already contains the given 2 — its other three squares must hold 3, 5, 5.', 'Petunjuk 2355 sudah memuat angka 2 — tiga petak lainnya harus berisi 3, 5, 5.') },
      { keys: k([[2, 2], [2, 3], [3, 2]]), quad: 1, hold: 3000, result: false, caption: t('Two 5s can’t share a row or column, so they sit diagonally: (2,3) and (3,2). The 1335 clue then forces (2,2) = 3.', 'Dua angka 5 tak boleh seberis atau sekolom, jadi diagonal: (2,3) dan (3,2). Petunjuk 1335 lalu memaksa (2,2) = 3.') },
      { keys: k([[2, 2], [2, 3], [3, 2], [2, 1], [3, 1]]), quad: 1, hold: 2700, result: false, caption: t('1335 still needs a 1 and a 3: row 2 gets the 1 (row 3 will need its 3): (2,1) = 1, (3,1) = 3.', '1335 masih butuh 1 dan 3: baris 2 mendapat 1, baris 3 mendapat 3: (2,1) = 1, (3,1) = 3.') },
      { keys: k([[2, 2], [2, 3], [3, 2], [2, 1], [3, 1], [4, 1], [4, 2]]), quad: 3, hold: 2700, result: false, caption: t('1345 holds (3,1)=3 and (3,2)=5 → its bottom cells take 1 and 4: column 1 already has 3 → (4,1) = 4, (4,2) = 1.', '1345 memuat (3,1)=3 dan (3,2)=5 → sel bawahnya berisi 1 dan 4: kolom 1 sudah punya 3 → (4,1) = 4, (4,2) = 1.') },
      { keys: k([[2, 2], [2, 3], [3, 2], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [5, 2], [5, 3]]), quad: 4, hold: 2700, result: false, caption: t('1234 holds (4,2)=1 → the rest are 2, 3, 4: column 3 has 5 and 2 → (4,3) = 3, then (5,2) = 2, (5,3) = 4.', '1234 memuat (4,2)=1 → sisanya 2, 3, 4: kolom 3 sudah punya 5 dan 2 → (4,3) = 3, lalu (5,2) = 2, (5,3) = 4.') },
      { keys: k([[2, 2], [2, 3], [3, 2], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [5, 2], [5, 3], [1, 3], [1, 4], [2, 4]]), quad: 0, hold: 2700, result: false, caption: t('1235 holds (2,3)=5 → the rest are 1, 2, 3: column 3 forces (1,3) = 1, and row 2 forces (2,4) = 2, so (1,4) = 3.', '1235 memuat (2,3)=5 → sisanya 1, 2, 3: kolom 3 memaksa (1,3) = 1, dan baris 2 memaksa (2,4) = 2, jadi (1,4) = 3.') },
      {
        keys: k([[2, 2], [2, 3], [3, 2], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [5, 2], [5, 3], [1, 3], [1, 4], [2, 4], [1, 1], [1, 2], [5, 1], [3, 4], [4, 4], [5, 4]]),
        hold: 2700, result: false,
        caption: t('Once-per-row-and-column finishes the left grid: row 1 starts 2 4, column 1 ends 5, column 4 fills 4, 5, 1.', 'Sekali-per-baris-dan-kolom menyelesaikan kisi kiri: baris 1 diawali 2 4, kolom 1 diakhiri 5, kolom 4 terisi 4, 5, 1.'),
      },
      {
        keys: k([[2, 2], [2, 3], [3, 2], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [5, 2], [5, 3], [1, 3], [1, 4], [2, 4], [1, 1], [1, 2], [5, 1], [3, 4], [4, 4], [5, 4], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5]]),
        hold: 2700, result: false,
        caption: t('Each row’s missing digit lands in column 5: 5, 4, 1, 2, 3.', 'Angka yang hilang di tiap baris jatuh ke kolom 5: 5, 4, 1, 2, 3.'),
      },
      {
        keys: k([[2, 2], [2, 3], [3, 2], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [5, 2], [5, 3], [1, 3], [1, 4], [2, 4], [1, 1], [1, 2], [5, 1], [3, 4], [4, 4], [5, 4], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5]]),
        hold: 0, result: true,
        caption: 'ABCDE = 54123',
      },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  const keys = useMemo(() => new Set(beat.keys), [beat])
  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={t('Solving the quadruple-clue sudoku puts five, four, one, two, three down the lettered column.', 'Menyelesaikan sudoku petunjuk-kuad menempatkan lima, empat, satu, dua, tiga di kolom berhuruf.')}>
      <div className="flex flex-col items-center gap-3">
        <SudokuBoard25 revealKeys={keys} litQuad={beat.quad} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}
