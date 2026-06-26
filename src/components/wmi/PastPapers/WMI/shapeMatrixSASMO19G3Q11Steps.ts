import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Storyboard for SASMO-19-G3-Q11 — 3×3 shape matrix "find the missing shape".
// Five beats:
//   1. Show full grid — introduce the matrix.
//   2. Highlight row 0 — column rule observed in row 0.
//   3. Highlight row 1 — column rule confirmed in row 1.
//   4. Highlight row 2 col 0 & col 1 — apply the rule.
//   5. Reveal answer in row 2 col 2 (= option B).

export interface SmQ11Beat {
  /** Row index (0–2) to tint with amber, or -1 for none. */
  highlightRow: number
  /** Whether to reveal the answer shape in row-2 col-2. */
  showAnswer: boolean
  caption: string
  /** Auto-advance hold in ms (0 = stays forever — final beat). */
  hold: number
  result: boolean
}

export interface SmQ11Story {
  steps: SmQ11Beat[]
  finalIndex: number
}

export function buildSmQ11Steps(lang: Lang): SmQ11Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SmQ11Beat[] = [
    // Beat 1 — introduce the matrix
    {
      highlightRow: -1,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'A 3×3 shape matrix: each row has a shape (col 1), circles (col 2), and a combined figure (col 3).',
        'Matriks 3×3: setiap baris memiliki bentuk (kol 1), lingkaran (kol 2), dan gabungan (kol 3).',
      ),
    },
    // Beat 2 — highlight row 0
    {
      highlightRow: 0,
      showAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        'Row 1: 3-arm star + one circle ring → the 3-arm star drawn inside that circle.',
        'Baris 1: bintang 3 lengan + satu lingkaran → bintang 3 lengan di dalam lingkaran.',
      ),
    },
    // Beat 3 — highlight row 1
    {
      highlightRow: 1,
      showAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        'Row 2: smaller star + double rings → trefoil (star overlaid on the two rings).',
        'Baris 2: bintang kecil + dua lingkaran → trefoil (bintang digabung dengan lingkaran).',
      ),
    },
    // Beat 4 — highlight row 2, no answer yet
    {
      highlightRow: 2,
      showAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        'Row 3: 6-arm star + triple rings → apply the same rule: what goes in the ? cell?',
        'Baris 3: bintang 6 lengan + tiga lingkaran → terapkan aturan yang sama: apa yang mengisi sel ??',
      ),
    },
    // Beat 5 — reveal answer B
    {
      highlightRow: 2,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        '6-arm star inside triple concentric rings — that is answer B!',
        'Bintang 6 lengan di dalam tiga lingkaran konsentris — itu adalah jawaban B!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
