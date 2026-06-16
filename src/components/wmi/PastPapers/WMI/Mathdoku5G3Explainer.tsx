import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Mathdoku5Figure, MD_ANSWER } from './Mathdoku5G3Illustration'

// WMI-19F3A-Q24 — the full forced chain, one deduction per beat (every digit is
// derived, never asserted; see the solution proof in the illustration header):
//   forced cages → B's column gives 3 → A = 4 → 10× corner → row finishes →
//   left column → middle block gives B → bottom-left gives C → top row →
//   right block gives D → read ABCD = 4554.

const GREEN = '#10B981'

interface Beat {
  fills: Array<[string, number]>
  lit: string[]
  hold: number
  result: boolean
  mark?: boolean
  caption: string
}

export default function Mathdoku5G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Beat[]>(
    () => [
      { fills: [], lit: [], hold: 3000, result: false, caption: t('Fill 1–5 so every row and column has all five numbers, and every cage hits its target. A, B, C, D are the answer.', 'Isi 1–5 agar tiap baris dan kolom memuat kelima angka, dan tiap kandang mencapai targetnya. A, B, C, D adalah jawabannya.') },
      { fills: [], lit: ['2-1', '3-1', '3-0', '4-0', '0-4', '1-4', '2-2', '3-2'], hold: 3400, result: false, caption: t('Cages with only ONE option: 20× = 4×5, 15× = 3×5, 10× = 2×5, and 4− must be {1,5} (the only two numbers 4 apart).', 'Kandang dengan SATU pilihan saja: 20× = 4×5, 15× = 3×5, 10× = 2×5, dan 4− pasti {1,5} (satu-satunya dua angka berselisih 4).') },
      { fills: [['1-1', 3]], lit: ['2-1', '3-1'], hold: 3200, result: false, caption: t('Also 12+ = 3+4+5 (the biggest three). In B\'s column the 20× cage already takes 4 and 5 — so the 12+ cell there must be the 3.', 'Juga 12+ = 3+4+5 (tiga terbesar). Di kolom B kandang 20× sudah memakai 4 dan 5 — jadi sel 12+ di kolom itu pasti 3.') },
      { fills: [['1-2', 4], ['1-3', 5]], lit: ['2-2', '3-2'], hold: 3400, result: false, caption: t('So A and its right neighbour share {4,5}. But A\'s column also holds the 4− pair {1,5} — two 5s in one column is illegal → A = 4, neighbour = 5.', 'Jadi A dan tetangga kanannya berbagi {4,5}. Tapi kolom A juga memuat pasangan 4− {1,5} — dua angka 5 di satu kolom dilarang → A = 4, tetangganya 5.') },
      { fills: [['1-4', 2], ['0-4', 5]], lit: ['0-4', '1-4'], hold: 3000, result: false, caption: t('10× = {2,5}, but A\'s row just got its 5 → the cell beside it is 2, and the 5 goes on top.', '10× = {2,5}, tapi baris A baru saja mendapat 5 → sel di sebelahnya 2, dan 5 naik ke atas.') },
      { fills: [['1-0', 1], ['2-0', 2]], lit: ['1-0', '2-0'], hold: 3000, result: false, caption: t('A\'s row now shows 3, 4, 5, 2 — only 1 is missing → first cell = 1. Then 2÷ below it: 2 ÷ 1 = 2 ✓.', 'Baris A kini berisi 3, 4, 5, 2 — tinggal 1 → sel pertama = 1. Lalu 2÷ di bawahnya: 2 ÷ 1 = 2 ✓.') },
      { fills: [['2-2', 5], ['3-2', 1]], lit: ['2-2', '2-3', '2-4'], hold: 3400, result: false, caption: t('Middle row: 4+ = 1+3 (the only way). The 4− cell in that row is {1 or 5} — the 1 is taken by the 4+ pair → it is 5, and the 1 goes below.', 'Baris tengah: 4+ = 1+3 (satu-satunya cara). Sel 4− di baris itu {1 atau 5} — angka 1 sudah dipakai pasangan 4+ → jadi 5, dan 1 turun ke bawah.') },
      { fills: [['2-1', 4], ['3-1', 5]], lit: ['2-1', '3-1'], hold: 3000, result: false, caption: t('That row now has its 5 → the 20× cell there is the 4, so B = 5!', 'Baris itu kini sudah punya 5 → sel 20× di sana adalah 4, jadi B = 5!') },
      { fills: [['0-0', 4], ['0-1', 1]], lit: ['0-0', '1-0', '2-0', '3-0', '4-0'], hold: 3200, result: false, caption: t('Left column: 1 and 2 are placed, and 15× = {3,5} fills the bottom two → the top-left must be 4. Its 5+ partner: 5 − 4 = 1.', 'Kolom kiri: 1 dan 2 sudah terisi, dan 15× = {3,5} mengisi dua sel bawah → pojok kiri atas pasti 4. Pasangan 5+-nya: 5 − 4 = 1.') },
      { fills: [['4-1', 2], ['4-2', 3], ['4-0', 5], ['3-0', 3]], lit: ['4-0', '4-1', '4-2'], hold: 3400, result: false, caption: t('B\'s column shows 1, 3, 4, 5 → its last cell = 2; the bottom 5+ gives 3 beside it. The bottom row now has 2 and 3 → C cannot be the 3 of 15× → C = 5, and 3 goes above.', 'Kolom B berisi 1, 3, 4, 5 → sel terakhirnya = 2; 5+ bawah memberi 3 di sebelahnya. Baris bawah kini punya 2 dan 3 → C tak boleh jadi 3 dari 15× → C = 5, dan 3 naik ke atas.') },
      { fills: [['0-2', 2], ['0-3', 3]], lit: ['0-2', '0-3'], hold: 3000, result: false, caption: t('Top row misses {2,3} — and |2−3| = 1 fits the 1− cage ✓. A\'s column already has 3 and 5 below → the 2 goes left, the 3 right.', 'Baris atas kurang {2,3} — dan |2−3| = 1 cocok dengan kandang 1− ✓. Kolom A sudah punya 3 dan 5 di bawah → 2 ke kiri, 3 ke kanan.') },
      { fills: [['2-3', 1], ['2-4', 3]], lit: ['2-3', '2-4'], hold: 2800, result: false, caption: t('The 4+ pair {1,3}: its left column already has a 3 on top → 1 left, 3 right.', 'Pasangan 4+ {1,3}: kolom kirinya sudah punya 3 di atas → 1 di kiri, 3 di kanan.') },
      { fills: [['4-3', 4], ['4-4', 1], ['3-3', 2], ['3-4', 4]], lit: ['3-3', '3-4', '4-3', '4-4'], hold: 3400, result: false, caption: t('Bottom row misses {1,4} and |4−1| = 3 ✓; D\'s column still needs its 4 → D = 4, last cell 1. Above: 8× = 2×4 → 2 then 4.', 'Baris bawah kurang {1,4} dan |4−1| = 3 ✓; kolom D masih butuh angka 4 → D = 4, sel terakhir 1. Di atasnya: 8× = 2×4 → 2 lalu 4.') },
      { fills: [], lit: [], hold: 0, result: true, mark: true, caption: t(`Read the letters: A = 4, B = 5, C = 5, D = 4 → ABCD = ${MD_ANSWER}.`, `Baca hurufnya: A = 4, B = 5, C = 5, D = 4 → ABCD = ${MD_ANSWER}.`) },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const solved = useMemo(() => {
    const acc: Record<string, number> = {}
    for (let i = 0; i <= index && i < steps.length; i++) for (const [k, v] of steps[i].fills) acc[k] = v
    return acc
  }, [index, steps])

  const aria = t('Working cage by cage, every cell is forced; the marked cells read 4554.', 'Dikerjakan kandang demi kandang, setiap sel terpaksa satu nilai; sel bertanda terbaca 4554.')

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <Mathdoku5Figure solved={solved} activeKeys={beat.fills.map(([k]) => k)} litKeys={beat.lit} markAnswers={beat.mark} />
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
