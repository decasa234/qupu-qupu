import type { ComponentType, ReactNode } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  BalanceBoard,
  BallRow,
  CardHandsBoard,
  Cups22G2Illustration,
  DialBoard,
  DIAL_VALUES,
  EggGrid,
  FlowchartBoard,
  KidsBoard,
  LineGrid,
  LINE_OPTS,
  lineLength,
  MirrorBlocksBoard,
  PaperStackBoard,
  Q5_BALLS,
  Q11_TARGETS,
  Q21_DANNY,
  SeatGridBoard,
  ShapeSumBoard,
  SharkBoard,
  SHARK_FISH,
  SHARK_THRESHOLD,
  SoldiersBoard,
  TargetsBoard,
  TCoverBoard,
} from './paper22G2Visuals'

type StepPair = { en: string; id: string }

// ── Beat harness (real beat-by-beat explainers) ────────────────────────────
type Beat = { en: string; id: string; visual: ReactNode; result?: boolean; hold?: number }

function useBeatIndex(beats: Beat[], props: ExplainerProps): number {
  return useBeatControl(beats.length - 1, {
    ...props,
    holds: beats.map((b, i) => b.hold ?? (i === beats.length - 1 ? 0 : 2200)),
  })
}

function Shell({ aria, beat, lang }: { aria: string; beat: Beat; lang: 'en' | 'id' }) {
  return (
    <div className="mx-auto w-full max-w-[760px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        {beat.visual}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {lang === 'id' ? beat.id : beat.en}
        </div>
      </div>
    </div>
  )
}

// ── Legacy static factory (still used by the not-yet-redrawn questions) ─────
function makeExplainer(
  Illustration: ComponentType,
  title: StepPair,
  steps: StepPair[],
): ComponentType<ExplainerProps> {
  return function Paper22G2Explainer(props: ExplainerProps) {
    const index = useBeatControl(steps.length - 1, {
      ...props,
      holds: steps.map((_, step) => (step === steps.length - 1 ? 0 : 2300)),
    })
    const lang = props.lang ?? 'en'
    const text = steps[index]?.[lang] ?? steps[steps.length - 1][lang]
    return (
      <div className="mx-auto w-full max-w-[760px]" role="img" aria-label={`${title[lang]}. ${text}`}>
        <Illustration />
        <div
          className="mx-auto mt-3 rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            index === steps.length - 1
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {text}
        </div>
      </div>
    )
  }
}

// ── Q1 · Shark ─────────────────────────────────────────────────────────────
const SHARK_BELOW = SHARK_FISH.map((f) => f.value < SHARK_THRESHOLD)
function sharkMarks(n: number): Array<'ok' | 'no' | undefined> {
  return SHARK_FISH.map((_, i) => (i < n ? (SHARK_BELOW[i] ? 'ok' : 'no') : undefined))
}
export function Shark22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const v = SHARK_FISH.map((f) => f.value)
  const beats: Beat[] = [
    { en: `The shark eats any fish numbered below ${SHARK_THRESHOLD}. Check them one by one.`, id: `Hiu memakan ikan bernomor di bawah ${SHARK_THRESHOLD}. Periksa satu per satu.`, visual: <SharkBoard marks={sharkMarks(0)} /> },
    { en: `${v[0]} is more than ${SHARK_THRESHOLD} — too big.`, id: `${v[0]} lebih dari ${SHARK_THRESHOLD} — terlalu besar.`, visual: <SharkBoard marks={sharkMarks(2)} /> },
    { en: `${v[2]} is below ${SHARK_THRESHOLD} — eaten! (1)`, id: `${v[2]} di bawah ${SHARK_THRESHOLD} — dimakan! (1)`, visual: <SharkBoard marks={sharkMarks(3)} /> },
    { en: `${v[3]} is below ${SHARK_THRESHOLD} — eaten! (2)`, id: `${v[3]} di bawah ${SHARK_THRESHOLD} — dimakan! (2)`, visual: <SharkBoard marks={sharkMarks(4)} /> },
    { en: `${v[4]} and ${v[5]} are above ${SHARK_THRESHOLD}.`, id: `${v[4]} dan ${v[5]} di atas ${SHARK_THRESHOLD}.`, visual: <SharkBoard marks={sharkMarks(6)} /> },
    { en: `${v[6]} is below ${SHARK_THRESHOLD} — eaten! (3)`, id: `${v[6]} di bawah ${SHARK_THRESHOLD} — dimakan! (3)`, visual: <SharkBoard marks={sharkMarks(7)} /> },
    { en: `${v[7]} is above ${SHARK_THRESHOLD}. Three fish were below ${SHARK_THRESHOLD} — answer B.`, id: `${v[7]} di atas ${SHARK_THRESHOLD}. Tiga ikan di bawah ${SHARK_THRESHOLD} — jawaban B.`, visual: <SharkBoard marks={sharkMarks(8)} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Tiga ikan bernomor di bawah 374 — jawaban B.' : 'Three fish are numbered below 374 — answer B.'} beat={beat} lang={lang} />
}

// ── Q3 · Paper stack ───────────────────────────────────────────────────────
export function PaperStack22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats: Beat[] = [
    { en: 'When one sheet covers another’s edge, it lies on top. So the most-hidden sheets are at the bottom.', id: 'Jika satu kertas menutup tepi kertas lain, ia di atas. Jadi kertas paling tertutup ada di bawah.', visual: <PaperStackBoard /> },
    { en: 'Reading the overlaps from the bottom up: sheet 4 is first …', id: 'Membaca tumpukan dari bawah: kertas 4 pertama …', visual: <PaperStackBoard fromBottom={1} /> },
    { en: '… then sheet 3 is second …', id: '… lalu kertas 3 kedua …', visual: <PaperStackBoard fromBottom={2} /> },
    { en: '… then sheet 6 is third from the bottom.', id: '… lalu kertas 6 ketiga dari bawah.', visual: <PaperStackBoard fromBottom={3} focusId={6} /> },
    { en: 'The third sheet from the bottom shows 6 — answer D.', id: 'Kertas ketiga dari bawah bernomor 6 — jawaban D.', visual: <PaperStackBoard fromBottom={3} focusId={6} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Kertas ketiga dari bawah bernomor 6 — jawaban D.' : 'The third sheet from the bottom is 6 — answer D.'} beat={beat} lang={lang} />
}

// ── Q12 · Egg path ─────────────────────────────────────────────────────────
export function EggPath22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const s = (...idx: number[]) => new Set(idx)
  const beats: Beat[] = [
    { en: 'Start at 1. Add 1, then 2, then 3 — one more each egg.', id: 'Mulai dari 1. Tambah 1, lalu 2, lalu 3 — satu lebih tiap telur.', visual: <EggGrid /> },
    { en: '1 +1→2, 2 +2→4, 4 +3→7.', id: '1 +1→2, 2 +2→4, 4 +3→7.', visual: <EggGrid revealed={s(2)} active={2} /> },
    { en: '7 +4→11, 11 +5→16.', id: '7 +4→11, 11 +5→16.', visual: <EggGrid revealed={s(2)} active={5} /> },
    { en: '16 +6→22.', id: '16 +6→22.', visual: <EggGrid revealed={s(2, 6)} active={6} /> },
    { en: '22 +7→29, 29 +8→37.', id: '22 +7→29, 29 +8→37.', visual: <EggGrid revealed={s(2, 6)} active={8} /> },
    { en: '37 +9→46, 46 +10→56.', id: '37 +9→46, 46 +10→56.', visual: <EggGrid revealed={s(2, 6, 9, 10)} active={10} /> },
    { en: '56 +11→67. The ? is 67 — answer C.', id: '56 +11→67. Tanda ? adalah 67 — jawaban C.', visual: <EggGrid revealed={s(2, 6, 9, 10, 11)} active={11} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Mengikuti +1, +2, +3, … tanda ? adalah 67.' : 'Following +1, +2, +3, … the ? egg is 67.'} beat={beat} lang={lang} />
}

// ── Q16 · Flowchart ────────────────────────────────────────────────────────
export function Flowchart22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats: Beat[] = [
    { en: 'Read the inputs: A = 65 and B = 80.', id: 'Baca masukan: A = 65 dan B = 80.', visual: <FlowchartBoard stage={0} /> },
    { en: 'The test box checks A + B = 65 + 80 = 145.', id: 'Kotak syarat memeriksa A + B = 65 + 80 = 145.', visual: <FlowchartBoard stage={1} /> },
    { en: 'Is 145 > 150? No — take the FALSE branch.', id: 'Apakah 145 > 150? Tidak — ambil cabang FALSE.', visual: <FlowchartBoard stage={2} /> },
    { en: 'FALSE branch: C = B − A = 80 − 65.', id: 'Cabang FALSE: C = B − A = 80 − 65.', visual: <FlowchartBoard stage={3} /> },
    { en: 'Output C = 15.', id: 'Keluaran C = 15.', visual: <FlowchartBoard stage={4} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? '145 tidak lebih dari 150, jadi C = B − A = 15.' : '145 is not over 150, so C = B − A = 15.'} beat={beat} lang={lang} />
}

// ── Q19 · Shape addition ───────────────────────────────────────────────────
export function ShapeAddition22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats: Beat[] = [
    { en: 'Same shape = same digit, and the total is 2022.', id: 'Bentuk sama = angka sama, dan totalnya 2022.', visual: <ShapeSumBoard /> },
    { en: '2022 has 4 digits but we add three 3-digit numbers — the leading 2 is a carry from the hundreds.', id: '2022 punya 4 angka padahal menjumlah tiga bilangan 3 angka — angka 2 di depan adalah simpanan dari kolom ratusan.', visual: <ShapeSumBoard col="h" /> },
    { en: 'Hundreds: 3 × square = 18, plus a carry 2 makes 20. So square = 6.', id: 'Ratusan: 3 × persegi = 18, ditambah simpanan 2 menjadi 20. Jadi persegi = 6.', visual: <ShapeSumBoard s={6} col="h" /> },
    { en: 'Tens: 6 + 6 + triangle + carry must total 22, so triangle = 8.', id: 'Puluhan: 6 + 6 + segitiga + simpanan harus 22, jadi segitiga = 8.', visual: <ShapeSumBoard s={6} t={8} col="t" /> },
    { en: 'Units: 6 + 8 + circle = 22, so circle = 8.', id: 'Satuan: 6 + 8 + lingkaran = 22, jadi lingkaran = 8.', visual: <ShapeSumBoard s={6} t={8} c={8} col="u" /> },
    { en: 'square + triangle + circle = 6 + 8 + 8 = 22. (666 + 668 + 688 = 2022.)', id: 'persegi + segitiga + lingkaran = 6 + 8 + 8 = 22. (666 + 668 + 688 = 2022.)', visual: <ShapeSumBoard s={6} t={8} c={8} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Persegi 6, segitiga 8, lingkaran 8; jumlahnya 22.' : 'Square 6, triangle 8, circle 8; their sum is 22.'} beat={beat} lang={lang} />
}

// ── Q20 · Password dial ────────────────────────────────────────────────────
export function PasswordDial22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const r = (...d: number[]) => d
  const beats: Beat[] = [
    { en: `The pointer starts at ${DIAL_VALUES[0]}.`, id: `Penunjuk mulai dari ${DIAL_VALUES[0]}.`, visual: <DialBoard pointerIndex={0} recorded={r()} /> },
    { en: 'Clockwise 3 lands on 9.', id: 'Searah jarum jam 3 berhenti di 9.', visual: <DialBoard pointerIndex={3} recorded={r(9)} activeTurn={0} /> },
    { en: 'Counter-clockwise 4 lands on 5.', id: 'Berlawanan jarum jam 4 berhenti di 5.', visual: <DialBoard pointerIndex={9} recorded={r(9, 5)} activeTurn={1} /> },
    { en: 'Clockwise 2 lands on 3.', id: 'Searah jarum jam 2 berhenti di 3.', visual: <DialBoard pointerIndex={1} recorded={r(9, 5, 3)} activeTurn={2} /> },
    { en: 'Clockwise 3 lands on 2.', id: 'Searah jarum jam 3 berhenti di 2.', visual: <DialBoard pointerIndex={4} recorded={r(9, 5, 3, 2)} activeTurn={3} /> },
    { en: 'Counter-clockwise 6 lands on 8.', id: 'Berlawanan jarum jam 6 berhenti di 8.', visual: <DialBoard pointerIndex={8} recorded={r(9, 5, 3, 2, 8)} activeTurn={4} /> },
    { en: 'Password = 95328.', id: 'Kata sandi = 95328.', visual: <DialBoard pointerIndex={8} recorded={r(9, 5, 3, 2, 8)} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Mengikuti kelima putaran menghasilkan 95328.' : 'Following the five turns gives 95328.'} beat={beat} lang={lang} />
}

// ── Q25 · T-cover ──────────────────────────────────────────────────────────
export function TCover22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const winner: Array<[number, number]> = [[1, 2], [2, 2], [3, 2], [2, 3]]
  const candA: Array<[number, number]> = [[0, 3], [1, 3], [2, 3], [1, 2]]
  const candB: Array<[number, number]> = [[3, 0], [3, 1], [3, 2], [2, 1]]
  const beats: Beat[] = [
    { en: 'Each cell hides an arithmetic value — work them all out first.', id: 'Tiap petak menyembunyikan nilai hitung — hitung semuanya dulu.', visual: <TCoverBoard mode="expr" /> },
    { en: 'Now the grid is just numbers. The T must cover 3 in a line plus 1 stem.', id: 'Sekarang kisi hanya angka. T menutup 3 segaris ditambah 1 tangkai.', visual: <TCoverBoard mode="val" /> },
    { en: 'A tall T on the right: 35 + 9 + 57 + 43 = 144.', id: 'T tegak di kanan: 35 + 9 + 57 + 43 = 144.', visual: <TCoverBoard mode="val" cover={candA} sum={144} /> },
    { en: 'Across the bottom: 52 + 70 + 20 + 0 = 142.', id: 'Mendatar di bawah: 52 + 70 + 20 + 0 = 142.', visual: <TCoverBoard mode="val" cover={candB} sum={142} /> },
    { en: 'Best T: 43 + 28 + 20 + 57 = 148.', id: 'T terbaik: 43 + 28 + 20 + 57 = 148.', visual: <TCoverBoard mode="val" cover={winner} sum={148} best />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'T terbaik menutup 43, 28, 20, 57 — jumlah 148.' : 'The best T covers 43, 28, 20, 57 — sum 148.'} beat={beat} lang={lang} />
}

// ── Q5 · Balls ─────────────────────────────────────────────────────────────
export function Balls22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats: Beat[] = [
    { en: 'Two rules: equal black & white, AND more large than small. Test each option.', id: 'Dua aturan: hitam = putih, DAN besar lebih banyak dari kecil. Uji tiap pilihan.', visual: <BallRow balls={Q5_BALLS.A} /> },
    { en: 'A: 3 black, 3 white ✓ — but 3 large = 3 small, not more. ✗', id: 'A: 3 hitam, 3 putih ✓ — tetapi 3 besar = 3 kecil, tidak lebih. ✗', visual: <BallRow balls={Q5_BALLS.A} /> },
    { en: 'C: colours equal ✓ — but only 2 large vs 4 small. ✗', id: 'C: warna sama ✓ — tetapi hanya 2 besar lawan 4 kecil. ✗', visual: <BallRow balls={Q5_BALLS.C} /> },
    { en: 'D: 4 white but only 2 black — not equal. ✗', id: 'D: 4 putih tetapi hanya 2 hitam — tidak sama. ✗', visual: <BallRow balls={Q5_BALLS.D} /> },
    { en: 'B: 3 black, 3 white, and 4 large > 2 small. ✓ — answer B.', id: 'B: 3 hitam, 3 putih, dan 4 besar > 2 kecil. ✓ — jawaban B.', visual: <BallRow balls={Q5_BALLS.B} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Hanya B memenuhi kedua aturan — jawaban B.' : 'Only B meets both rules — answer B.'} beat={beat} lang={lang} />
}

// ── Q8 · Thick lines ───────────────────────────────────────────────────────
export function ThickLines22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const len = (k: string) => lineLength(LINE_OPTS[k])
  const beats: Beat[] = [
    { en: 'Don’t judge by eye — measure: each horizontal piece is 3 cm, each vertical 2 cm.', id: 'Jangan menilai dengan mata — ukur: tiap ruas mendatar 3 cm, tiap tegak 2 cm.', visual: <LineGrid option="D" /> },
    { en: `D looks longest: 8×3 + 1×2 = ${len('D')} cm.`, id: `D tampak terpanjang: 8×3 + 1×2 = ${len('D')} cm.`, visual: <LineGrid option="D" /> },
    { en: `But A = ${len('A')} cm and B = ${len('B')} cm.`, id: `Tetapi A = ${len('A')} cm dan B = ${len('B')} cm.`, visual: <LineGrid option="A" /> },
    { en: `C: 8×3 + 4×2 = ${len('C')} cm — the true longest. Answer C.`, id: `C: 8×3 + 4×2 = ${len('C')} cm — yang terpanjang sebenarnya. Jawaban C.`, visual: <LineGrid option="C" />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Diukur, C terpanjang dengan 29 cm.' : 'Measured, C is longest at 29 cm.'} beat={beat} lang={lang} />
}

// ── Q10 · Children order ───────────────────────────────────────────────────
export function ChildrenOrder22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const n = (a?: string, b?: string, c?: string, d?: string) => [a, b, c, d]
  const beats: Beat[] = [
    { en: 'Dan says he is the tallest — the starred boy on the left.', id: 'Dan paling tinggi — anak berbintang di kiri.', visual: <KidsBoard names={n('Dan')} ring={0} /> },
    { en: 'The shortest child is the little girl — she must be Pan.', id: 'Anak terpendek adalah gadis kecil — pasti Pan.', visual: <KidsBoard names={n('Dan', 'Pan')} ring={1} /> },
    { en: 'Ann > Ken, and the 4th child is taller than the 3rd, so Ann is 4th and Ken is 3rd.', id: 'Ann > Ken, dan anak ke-4 lebih tinggi dari ke-3, jadi Ann ke-4 dan Ken ke-3.', visual: <KidsBoard names={n('Dan', 'Pan', 'Ken', 'Ann')} /> },
    { en: 'Left to right: Dan, Pan, Ken, Ann — answer C.', id: 'Kiri ke kanan: Dan, Pan, Ken, Ann — jawaban C.', visual: <KidsBoard names={n('Dan', 'Pan', 'Ken', 'Ann')} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Urutan kiri ke kanan: Dan, Pan, Ken, Ann.' : 'Order left to right: Dan, Pan, Ken, Ann.'} beat={beat} lang={lang} />
}

// ── Q11 · Targets ──────────────────────────────────────────────────────────
export function Targets22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = Object.fromEntries(Q11_TARGETS.map((t) => [t.name, t.total]))
  const all = { Alex: T.Alex, Bob: T.Bob, Celine: T.Celine, Dan: T.Dan }
  const beats: Beat[] = [
    { en: 'Score each player by ring — but a BLACK arrow counts 3× its ring.', id: 'Hitung tiap pemain dari lingkaran — tetapi panah HITAM bernilai 3× lingkarannya.', visual: <TargetsBoard /> },
    { en: `Alex: 10+6+6+4+4 = ${T.Alex}. Bob: 10+6+4+4 = ${T.Bob}.`, id: `Alex: 10+6+6+4+4 = ${T.Alex}. Bob: 10+6+4+4 = ${T.Bob}.`, visual: <TargetsBoard totals={{ Alex: T.Alex, Bob: T.Bob }} /> },
    { en: `Celine’s black arrow in 10 scores 30: 30+6+4 = ${T.Celine}. Dan’s black in 6 scores 18: 18+6+4+4 = ${T.Dan}.`, id: `Panah hitam Celine di 10 bernilai 30: 30+6+4 = ${T.Celine}. Panah hitam Dan di 6 bernilai 18: 18+6+4+4 = ${T.Dan}.`, visual: <TargetsBoard totals={all} /> },
    { en: `Highest = Celine (${T.Celine}), lowest = Bob (${T.Bob}) — answer D.`, id: `Tertinggi = Celine (${T.Celine}), terendah = Bob (${T.Bob}) — jawaban D.`, visual: <TargetsBoard totals={all} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Celine tertinggi, Bob terendah — jawaban D.' : 'Celine highest, Bob lowest — answer D.'} beat={beat} lang={lang} />
}

export const Cups22G2Explainer = makeExplainer(
  Cups22G2Illustration,
  { en: 'Find each picture value', id: 'Cari nilai tiap gambar' },
  [
    { en: 'Four mugs total 36, so one mug is 36 ÷ 4 = 9.', id: 'Empat mug berjumlah 36, jadi satu mug 36 ÷ 4 = 9.' },
    { en: 'Cup × cup = 49, so one cup is 7.', id: 'Cangkir × cangkir = 49, jadi satu cangkir 7.' },
    { en: 'Use the single pictures shown in the final line.', id: 'Gunakan masing-masing satu gambar pada baris terakhir.' },
    { en: '9 + 7 = 16. Answer B.', id: '9 + 7 = 16. Jawaban B.' },
  ],
)

// ── Q17 · Balances ─────────────────────────────────────────────────────────
export function Balance22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats: Beat[] = [
    { en: 'Three level balances: A = B+C+D, C = B+D, and A = 3D.', id: 'Tiga neraca seimbang: A = B+C+D, C = B+D, dan A = 3D.', visual: <BalanceBoard /> },
    { en: 'Replace C with B+D in the first: A = B + (B+D) + D = 2B + 2D.', id: 'Ganti C dengan B+D pada yang pertama: A = B + (B+D) + D = 2B + 2D.', visual: <BalanceBoard /> },
    { en: 'But A = 3D, so 2B + 2D = 3D, which gives 2B = D.', id: 'Tetapi A = 3D, jadi 2B + 2D = 3D, sehingga 2B = D.', visual: <BalanceBoard /> },
    { en: 'One D ball balances two B balls — answer 2.', id: 'Satu bola D seimbang dengan dua bola B — jawaban 2.', visual: <BalanceBoard />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'D = 2B, jadi satu D = dua B.' : 'D = 2B, so one D = two B.'} beat={beat} lang={lang} />
}

// ── Q18 · Seat grid ────────────────────────────────────────────────────────
export function SeatGrid22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats: Beat[] = [
    { en: 'Find the seat with A directly above and D directly to the right.', id: 'Cari tempat dengan A tepat di atas dan D tepat di kanan.', visual: <SeatGridBoard /> },
    { en: 'At (3, 2) the cell above is A ✓.', id: 'Di (3, 2) sel di atasnya adalah A ✓.', visual: <SeatGridBoard seat={[3, 2]} above /> },
    { en: 'And the cell to its right is D ✓ — this seat is unique.', id: 'Dan sel di kanannya adalah D ✓ — tempat ini unik.', visual: <SeatGridBoard seat={[3, 2]} above right /> },
    { en: 'a × 2 + b = 3 × 2 + 2 = 8.', id: 'a × 2 + b = 3 × 2 + 2 = 8.', visual: <SeatGridBoard seat={[3, 2]} above right />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Tempat (3,2): 3×2+2 = 8.' : 'Seat (3,2): 3×2+2 = 8.'} beat={beat} lang={lang} />
}

// ── Q21 · Card hands ───────────────────────────────────────────────────────
export function CardHands22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats: Beat[] = [
    { en: 'Equal-rank cards pair off and are discarded.', id: 'Kartu bernilai sama berpasangan dan dibuang.', visual: <CardHandsBoard /> },
    { en: 'Visible pairs: the two 9s, the two 5s, and the two Jacks.', id: 'Pasangan terlihat: dua kartu 9, dua kartu 5, dan dua Jack.', visual: <CardHandsBoard pairs /> },
    { en: 'That leaves 2, 8, K and 3 as singles — their four partners are in Danny’s hand.', id: 'Tersisa 2, 8, K dan 3 sebagai tunggal — keempat pasangannya ada di tangan Danny.', visual: <CardHandsBoard singles /> },
    { en: 'The one extra Jack added to the deck has no partner — also in Danny’s hand.', id: 'Satu Jack tambahan dalam dek tak punya pasangan — juga di tangan Danny.', visual: <CardHandsBoard singles /> },
    { en: 'Danny holds 4 + 1 = 5 cards.', id: 'Danny memegang 4 + 1 = 5 kartu.', visual: <CardHandsBoard danny={Q21_DANNY} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Danny memegang 5 kartu.' : 'Danny holds 5 cards.'} beat={beat} lang={lang} />
}

// ── Q23 · Soldiers ─────────────────────────────────────────────────────────
export function Soldiers22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats: Beat[] = [
    { en: 'Soldiers 1, 2, 3, 4 march left toward a deep hole, then a shallow hole.', id: 'Prajurit 1, 2, 3, 4 berbaris ke kiri menuju lubang dalam, lalu lubang dangkal.', visual: <SoldiersBoard order={[1, 2, 3, 4]} /> },
    { en: 'The deep hole needs two: 1 and 2 drop in (1 below, 2 on top); 3, 4 cross.', id: 'Lubang dalam butuh dua: 1 dan 2 masuk (1 bawah, 2 atas); 3, 4 menyeberang.', visual: <SoldiersBoard order={[3, 4]} rightHole={[1, 2]} /> },
    { en: 'Then 2 climbs out, then 1 — joining at the back: 3, 4, 2, 1.', id: 'Lalu 2 keluar, lalu 1 — bergabung di belakang: 3, 4, 2, 1.', visual: <SoldiersBoard order={[3, 4, 2, 1]} /> },
    { en: 'The shallow hole needs one: front soldier 3 drops in; 4, 2, 1 cross.', id: 'Lubang dangkal butuh satu: prajurit depan 3 masuk; 4, 2, 1 menyeberang.', visual: <SoldiersBoard order={[4, 2, 1]} leftHole={[3]} /> },
    { en: '3 climbs out to the back: final order 4, 2, 1, 3 → 4213.', id: '3 keluar ke belakang: urutan akhir 4, 2, 1, 3 → 4213.', visual: <SoldiersBoard order={[4, 2, 1, 3]} />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Urutan akhir 4213.' : 'Final order 4213.'} beat={beat} lang={lang} />
}

// ── Q24 · Mirror blocks ────────────────────────────────────────────────────
export function MirrorBlocks22G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats: Beat[] = [
    { en: 'The 3-D solid only shows the shape — the two mirrors give the colours: black is 3 long, gray 2 long, white single cubes.', id: 'Bentuk 3-D hanya menunjukkan rangka — kedua cermin memberi warnanya: hitam panjang 3, abu-abu 2, putih kubus tunggal.', visual: <MirrorBlocksBoard /> },
    { en: 'The black 1×1×3 makes the 3-wide black base in the front mirror.', id: 'Balok hitam 1×1×3 membentuk alas hitam selebar 3 di cermin depan.', visual: <MirrorBlocksBoard /> },
    { en: 'Two gray 1×1×2 blocks make the tall gray tower and the deep gray piece, matching both mirrors.', id: 'Dua balok abu-abu 1×1×2 membentuk menara tinggi dan balok dalam, cocok dengan kedua cermin.', visual: <MirrorBlocksBoard /> },
    { en: 'Every leftover single cell must be a white 1×1×1 — there are 3 of them.', id: 'Setiap sel satuan sisa pasti balok putih 1×1×1 — ada 3 buah.', visual: <MirrorBlocksBoard />, result: true },
  ]
  const beat = beats[useBeatIndex(beats, props)] ?? beats[beats.length - 1]
  return <Shell aria={lang === 'id' ? 'Tiga balok putih 1×1×1 digunakan.' : 'Three white 1×1×1 blocks are used.'} beat={beat} lang={lang} />
}
