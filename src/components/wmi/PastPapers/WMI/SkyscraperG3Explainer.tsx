import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SkyscraperFigure, SK_ANSWER } from './SkyscraperG3Illustration'

// WMI-19F3A-Q25 — the forced chain (every cell derived, failed tries shown):
//   bottom row from the right-3 clue (only 1,2,4 climbing works beside the
//   given 3) → C's column from its top-3/bottom-2 pair → C's row from the
//   left-3 clue → left column gives A → the last two cells give B and D.

const GREEN = '#10B981'

interface Beat {
  fills: Array<[string, number]>
  lit: string[]
  clues: string[]
  hold: number
  result: boolean
  mark?: boolean
  caption: string
}

export default function SkyscraperG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Beat[]>(
    () => [
      { fills: [], lit: [], clues: [], hold: 3200, result: false, caption: t('Heights 1–4 in every row and column. An outside number = how many buildings you SEE from there (taller hides shorter). One 3 is given.', 'Tinggi 1–4 di tiap baris dan kolom. Angka di luar = berapa gedung yang TERLIHAT dari sana (yang tinggi menutupi yang pendek). Satu angka 3 sudah diberikan.') },
      { fills: [], lit: ['3-1', '3-2', '3-3'], clues: ['right3'], hold: 3400, result: false, caption: t('Bottom row, seen from the RIGHT (3 visible). The far cell is the given 3 — to still see it, everything before must stay lower and climb: try 4 first? You would see only the 4 ✗.', 'Baris bawah, dilihat dari KANAN (terlihat 3). Sel terjauh adalah 3 yang diberikan — agar tetap terlihat, semua di depannya harus lebih rendah dan menaik: coba 4 duluan? Hanya 4 yang terlihat ✗.') },
      { fills: [['3-3', 1], ['3-2', 2], ['3-1', 4]], lit: [], clues: ['right3'], hold: 3400, result: false, caption: t('Try 2 first? You see 2, 4 — only two ✗. Only 1, 2, 4 climbing works: you see 1, then 2, then 4 = three ✓ (the far 3 hides behind the 4). Bottom row = 3 4 2 1.', 'Coba 2 duluan? Terlihat 2, 4 — hanya dua ✗. Hanya 1, 2, 4 menaik yang berhasil: terlihat 1, lalu 2, lalu 4 = tiga ✓ (si 3 di ujung tersembunyi di balik 4). Baris bawah = 3 4 2 1.') },
      { fills: [['0-2', 1], ['1-2', 3], ['2-2', 4]], lit: ['0-2', '1-2', '2-2'], clues: ['top2', 'bottom2'], hold: 3600, result: false, caption: t('C\'s column: bottom cell is now 2. From the TOP you must see 3 of {1,3,4}: 3-4-1 shows two ✗, 1-4-3 shows two ✗ — only 1-3-4 climbing shows three ✓. So C = 3!', 'Kolom C: sel bawahnya kini 2. Dari ATAS harus terlihat 3 dari {1,3,4}: 3-4-1 hanya dua ✗, 1-4-3 hanya dua ✗ — hanya 1-3-4 menaik yang tiga ✓. Jadi C = 3!') },
      { fills: [['2-0', 1], ['2-1', 2], ['2-3', 3]], lit: ['2-0', '2-1', '2-3'], clues: ['left2'], hold: 3600, result: false, caption: t('Third row has the 4 in C\'s column. LEFT clue 3 → the two cells before the 4 must climb. Try 2,3? Then the last cell is 1 — but its column already has a 1 ✗. So 1, 2 → row = 1 2 4 3.', 'Baris ketiga punya 4 di kolom C. Petunjuk KIRI 3 → dua sel sebelum 4 harus menaik. Coba 2,3? Maka sel terakhir 1 — tapi kolomnya sudah punya 1 ✗. Jadi 1, 2 → baris = 1 2 4 3.') },
      { fills: [['0-0', 2], ['1-0', 4]], lit: ['0-0', '1-0'], clues: ['left0', 'bottom0'], hold: 3400, result: false, caption: t('Left column misses {2,4}. If the TOP cell were 4, the left clue 3 would see only the 4 ✗ → top is 2, so A = 4. (Check bottom 2: you see 3 then 4 ✓.)', 'Kolom kiri kurang {2,4}. Kalau sel ATAS 4, petunjuk kiri 3 hanya melihat 4 ✗ → atasnya 2, jadi A = 4. (Cek bawah 2: terlihat 3 lalu 4 ✓.)') },
      { fills: [['1-1', 1], ['1-3', 2], ['0-1', 3], ['0-3', 4]], lit: ['1-1', '1-3'], clues: [], hold: 3400, result: false, caption: t('A\'s row misses {1,2}; B\'s column already has a 2 → B = 1 and D = 2. The top row finishes itself: 2 3 1 4 (left sees 2, 3, 4 = three ✓).', 'Baris A kurang {1,2}; kolom B sudah punya 2 → B = 1 dan D = 2. Baris atas selesai sendiri: 2 3 1 4 (dari kiri terlihat 2, 3, 4 = tiga ✓).') },
      { fills: [], lit: [], clues: [], hold: 0, result: true, mark: true, caption: t(`Read the letters: A = 4, B = 1, C = 3, D = 2 → ABCD = ${SK_ANSWER}.`, `Baca hurufnya: A = 4, B = 1, C = 3, D = 2 → ABCD = ${SK_ANSWER}.`) },
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

  const aria = t('Each clue forces a row or column in turn; the marked cells read 4132.', 'Setiap petunjuk memaksa satu baris atau kolom; sel bertanda terbaca 4132.')

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <SkyscraperFigure solved={solved} activeKeys={beat.fills.map(([k]) => k)} litKeys={beat.lit} litClues={beat.clues} markAnswers={beat.mark} />
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
