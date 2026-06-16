import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { QUILT_SQUARES, QUILT_TOTAL, QuiltBoard, SPIRAL_PATH, SPIRAL_VALUES, SPIRAL_RED, SpiralGrid, FootballBoard } from './puzzles20G3Illustrations'

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

function Counter({ n, total }: { n: number; total: number }) {
  return (
    <div className="rounded-lg border-2 px-3 py-1 font-display text-sm font-extrabold" style={{ borderColor: '#F4B400', background: '#FFF7E6', color: '#1F2937' }}>
      {n} / {total}
    </div>
  )
}

/* ------------------------------------------------- Q17: the 20 squares. */
export default function QuiltSquaresG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type Beat = { sq: number; hold: number; result: boolean; caption: string }
  const steps = useMemo<Beat[]>(() => {
    const out: Beat[] = [
      { sq: -1, hold: 2600, result: false, caption: t('Hunt size by size — straight squares first, tilted ones last. One square per step!', 'Cari ukuran demi ukuran — persegi lurus dulu, yang miring terakhir. Satu persegi tiap langkah!') },
    ]
    const label = (i: number): string => {
      const kind = QUILT_SQUARES[i].kind
      const before = QUILT_SQUARES.slice(0, i).filter((s) => s.kind === kind).length + 1
      if (kind === 'unit') return t(`Small 1×1 square #${before}`, `Persegi kecil 1×1 ke-${before}`)
      if (kind === 'two') return t('The 2×2 square in the centre', 'Persegi 2×2 di tengah')
      if (kind === 'three') return t(`3×3 square #${before} (corner ${before})`, `Persegi 3×3 ke-${before} (sudut ${before})`)
      if (kind === 'four') return t('The whole 4×4 square', 'Persegi 4×4 utuh')
      return before === 1 ? t('Tilted square: the big diamond', 'Persegi miring: belah ketupat besar') : t('Tilted square: the small diamond', 'Persegi miring: belah ketupat kecil')
    }
    for (let i = 0; i < QUILT_TOTAL; i++) {
      out.push({ sq: i, hold: 1250, result: false, caption: `${label(i)} → ${i + 1}` })
    }
    out.push({ sq: -1, hold: 0, result: true, caption: t('12 small + 1 + 4 + 1 straight + 2 tilted = 20 squares.', '12 kecil + 1 + 4 + 1 lurus + 2 miring = 20 persegi.') })
    return out
  }, [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  const counted = beat.result ? QUILT_TOTAL : beat.sq + 1
  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={t('Counting every square in the quilt figure one at a time reaches twenty.', 'Menghitung setiap persegi pada gambar satu per satu mencapai dua puluh.')}>
      <div className="flex flex-col items-center gap-3">
        <QuiltBoard highlight={beat.sq >= 0 ? QUILT_SQUARES[beat.sq].pts : null} />
        <Counter n={counted} total={QUILT_TOTAL} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* ------------------------------------------------- Q22: the spiral walk. */
export function SpiralGridG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type Beat = { upto: number; path: boolean; hold: number; result: boolean; caption: string }
  const steps = useMemo<Beat[]>(() => {
    const out: Beat[] = [
      { upto: -1, path: false, hold: 2600, result: false, caption: t('Look for the path the numbers walk. Start at the 1 in the top-right corner.', 'Cari jalur yang dilalui bilangan. Mulai dari angka 1 di pojok kanan atas.') },
      { upto: -1, path: true, hold: 3000, result: false, caption: t('Counterclockwise around the edge: 1 2 3 4 5, 1 2 3 4 5, … — 20 cells, it closes perfectly!', 'Berlawanan jarum jam mengelilingi tepi: 1 2 3 4 5, 1 2 3 4 5, … — 20 sel, menutup dengan pas!') },
      { upto: 26, path: true, hold: 3000, result: false, caption: t('The path coils inward. Row 2 keeps counting: 1 2 3 4 5 — and down the left: 1, 2. All printed numbers agree!', 'Jalurnya berpilin ke dalam. Baris 2 terus menghitung: 1 2 3 4 5 — dan turun di kiri: 1, 2. Semua angka tercetak cocok!') },
    ]
    // unknown cells are path indices 27..34
    for (let i = 27; i <= 34; i++) {
      const [r, c] = SPIRAL_PATH[i]
      const v = SPIRAL_VALUES[r][c]
      const prev = v === 1 ? 5 : v - 1
      const red = SPIRAL_RED(r, c)
      out.push({
        upto: i,
        path: true,
        hold: 1500,
        result: false,
        caption: red
          ? t(`After ${prev} comes ${v} — a RED cell: ${v}!`, `Setelah ${prev} datang ${v} — sel MERAH: ${v}!`)
          : t(`After ${prev} comes ${v}.`, `Setelah ${prev} datang ${v}.`),
      })
    }
    out.push({ upto: 34, path: false, hold: 2400, result: false, caption: t('The four red cells hold 3 and 2 (top), 5 and 1 (bottom).', 'Empat sel merah berisi 3 dan 2 (atas), 5 dan 1 (bawah).') })
    out.push({ upto: 34, path: false, hold: 0, result: true, caption: t('3 + 2 + 5 + 1 = 11.', '3 + 2 + 5 + 1 = 11.') })
    return out
  }, [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={t('The numbers one to five repeat along a counterclockwise spiral; the red cells get three, two, five and one, which sum to eleven.', 'Bilangan satu sampai lima berulang sepanjang spiral berlawanan jarum jam; sel merah berisi tiga, dua, lima, dan satu, jumlahnya sebelas.')}>
      <div className="flex flex-col items-center gap-3">
        <SpiralGrid revealUpto={beat.upto} showPath={beat.path} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* ------------------------------------------------- Q23: football points. */
export function FootballG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type Beat = { keys: string[]; pts: Partial<Record<string, number>>; hold: number; result: boolean; caption: string }
  const steps = useMemo<Beat[]>(() => {
    const acc = (...keys: string[]) => keys
    return [
      { keys: [], pts: {}, hold: 2700, result: false, caption: t('○ = 3 points, △ = 1, × = 0. The points column will force every empty cell.', '○ = 3 poin, △ = 1, × = 0. Kolom poin akan memaksa setiap sel kosong.') },
      { keys: acc('HI', 'IH'), pts: {}, hold: 2700, result: false, caption: t('H shows ○△△○ = 8 points but has 11: the missing game is worth 3 → H BEAT I.', 'H menampilkan ○△△○ = 8 poin padahal totalnya 11: laga yang hilang bernilai 3 → H MENGALAHKAN I.') },
      { keys: acc('HI', 'IH', 'WH'), pts: {}, hold: 2600, result: false, caption: t('H’s row already says H beat W — so W’s cell against H is ×.', 'Baris H sudah bilang H mengalahkan W — jadi sel W melawan H adalah ×.') },
      { keys: acc('HI', 'IH', 'WH', 'WT', 'TW'), pts: {}, hold: 2700, result: false, caption: t('W shows ×○△ = 4 of 5 points. With × vs H fixed, the last point must be a DRAW with T.', 'W menampilkan ×○△ = 4 dari 5 poin. Karena × lawan H sudah pasti, poin terakhir harus SERI dengan T.') },
      { keys: acc('HI', 'IH', 'WH', 'WT', 'TW', 'TI', 'IT'), pts: {}, hold: 2700, result: false, caption: t('T shows ×△○ plus the new △ = 5 of 8 points → 3 missing → T BEAT I.', 'T menampilkan ×△○ plus △ baru = 5 dari 8 poin → kurang 3 → T MENGALAHKAN I.') },
      { keys: acc('HI', 'IH', 'WH', 'WT', 'TW', 'TI', 'IT', 'MH', 'MA', 'MW'), pts: {}, hold: 2700, result: false, caption: t('M’s blanks come from the columns: H beat M (×), A lost to M (○), W lost to M (○).', 'Sel kosong M terbaca dari kolom: H mengalahkan M (×), A kalah dari M (○), W kalah dari M (○).') },
      { keys: acc('HI', 'IH', 'WH', 'WT', 'TW', 'TI', 'IT', 'MH', 'MA', 'MW', 'IA'), pts: {}, hold: 2500, result: false, caption: t('A’s row shows × against I — so I beat A: ○.', 'Baris A menampilkan × lawan I — jadi I mengalahkan A: ○.') },
      { keys: acc('HI', 'IH', 'WH', 'WT', 'TW', 'TI', 'IT', 'MH', 'MA', 'MW', 'IA'), pts: { M: 10 }, hold: 2500, result: false, caption: t('M: 3 + 0 + 3 + 3 + 1 = 10 points.', 'M: 3 + 0 + 3 + 3 + 1 = 10 poin.') },
      { keys: acc('HI', 'IH', 'WH', 'WT', 'TW', 'TI', 'IT', 'MH', 'MA', 'MW', 'IA'), pts: { M: 10, I: 5 }, hold: 2500, result: false, caption: t('I: 1 + 0 + 0 + 3 + 1 = 5 points.', 'I: 1 + 0 + 0 + 3 + 1 = 5 poin.') },
      { keys: acc('HI', 'IH', 'WH', 'WT', 'TW', 'TI', 'IT', 'MH', 'MA', 'MW', 'IA'), pts: { M: 10, I: 5 }, hold: 0, result: true, caption: t('M − I = 10 − 5 = 5.', 'M − I = 10 − 5 = 5.') },
    ]
  }, [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  const keys = useMemo(() => new Set(beat.keys), [beat])
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Filling the table from the points totals gives M ten points and I five, a difference of five.', 'Mengisi tabel dari total poin memberi M sepuluh poin dan I lima, selisih lima.')}>
      <div className="flex flex-col items-center gap-3">
        <FootballBoard revealKeys={keys} pts={beat.pts} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}
