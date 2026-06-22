// IKMC-20-PE-Q17 — storyboard for the Latin-square card deduction.
//
// Question: Tom has 9 cards ({dot,tri,sq} × {1,2,3}) placed in a 3×3 board so every
// row and column has all three shapes and all three counts. Three are pre-placed:
//   [0,0] = 1 dot · [1,1] = 2 dots · [2,0] = 2 triangles
// What card goes in the GREY cell [2,1]?  Answer: D — one square.
//
// Deduction steps:
//   1. Row 2 has shape=tri (count 2) → missing shapes: dot + sq; missing counts: 1 + 3.
//   2. Col 1 has shape=dot (count 2) → missing shapes: tri + sq; missing counts: 1 + 3.
//   3. Intersection of missing shapes in row 2 AND col 1 = {sq} → grey cell must be a square.
//   4. Col 1 needs counts 1 and 3. Row 2 needs counts 1 and 3.
//      Col 0 row 0 is count 1 (1 dot), row 2 is count 2 (2 tri) → remaining rows in col 0 = count 3.
//      This means col 0 row 1 = count 3. Col 1 row 0 must satisfy col-0 having all 3 counts.
//      Focusing on the grey cell: col 1 at rows 0,1,2 must have counts 1,2,3.
//      Count 2 is at row 1. Grey cell [2,1] and [0,1] split counts 1 and 3.
//      Row 0 col 1: row 0 already has count 1 at col 0 → row 0 col 1 must have count 3
//        (to avoid repeating count 1 in row 0). → Grey cell [2,1] gets count 1.
//   5. Result: 1 square → answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export interface CardsGrid17PEBeat {
  /** Which row to tint (null = none) */
  highlightRow: number | null
  /** Which column to tint (null = none) */
  highlightCol: number | null
  /** Reveal the answer in the grey cell */
  revealAnswer: boolean
  /** Caption text */
  caption: string
  /** Auto-hold in ms (0 = final / manual) */
  hold: number
  /** True only on the final result beat */
  result: boolean
}

export interface CardsGrid17PEStoryboard {
  steps: CardsGrid17PEBeat[]
  finalIndex: number
  answer: string
}

export function buildCardsGrid17PESteps(lang: Lang): CardsGrid17PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CardsGrid17PEBeat[] = [
    // Beat 0 — intro
    {
      highlightRow: null,
      highlightCol: null,
      revealAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        'Each row and each column must have all three shapes (dot, triangle, square) ' +
          'and all three counts (1, 2, 3). What card goes in the grey cell?',
        'Setiap baris dan kolom harus memiliki tiga bentuk (titik, segitiga, persegi) ' +
          'dan tiga jumlah (1, 2, 3). Kartu apa yang tepat di kotak abu-abu?',
      ),
    },

    // Beat 1 — check row 2
    {
      highlightRow: 2,
      highlightCol: null,
      revealAnswer: false,
      hold: 2600,
      result: false,
      caption: t(
        'Row 3 already has 2 triangles (col 1). ' +
          'Missing shapes: dot and square. Missing counts: 1 and 3.',
        'Baris 3 sudah punya 2 segitiga (kol 1). ' +
          'Bentuk yang kurang: titik dan persegi. Jumlah yang kurang: 1 dan 3.',
      ),
    },

    // Beat 2 — check col 1
    {
      highlightRow: null,
      highlightCol: 1,
      revealAnswer: false,
      hold: 2600,
      result: false,
      caption: t(
        'Column 2 already has 2 dots (row 2). ' +
          'Missing shapes: triangle and square. Missing counts: 1 and 3.',
        'Kolom 2 sudah punya 2 titik (baris 2). ' +
          'Bentuk yang kurang: segitiga dan persegi. Jumlah yang kurang: 1 dan 3.',
      ),
    },

    // Beat 3 — shape intersection
    {
      highlightRow: 2,
      highlightCol: 1,
      revealAnswer: false,
      hold: 2600,
      result: false,
      caption: t(
        'Row 3 needs: dot or square. Col 2 needs: triangle or square. ' +
          'The ONLY shape in BOTH lists is SQUARE — so the grey cell must be a square!',
        'Baris 3 butuh: titik atau persegi. Kol 2 butuh: segitiga atau persegi. ' +
          'Satu-satunya bentuk di KEDUA daftar adalah PERSEGI — jadi kotak abu-abu harus persegi!',
      ),
    },

    // Beat 4 — count deduction
    {
      highlightRow: 2,
      highlightCol: 1,
      revealAnswer: false,
      hold: 2800,
      result: false,
      caption: t(
        'Now for the count. Row 3 needs counts 1 and 3. Col 2 needs counts 1 and 3. ' +
          'Row 1 at col 2 has count 3 (to complete row 1). So col 2 row 1 = 3. ' +
          'That means the grey cell [row 3, col 2] gets count 1.',
        'Sekarang cari jumlahnya. Baris 3 butuh jumlah 1 dan 3. Kol 2 butuh jumlah 1 dan 3. ' +
          'Baris 1 di kol 2 memiliki jumlah 3. Jadi kotak abu-abu [baris 3, kol 2] mendapat jumlah 1.',
      ),
    },

    // Beat 5 — result
    {
      highlightRow: null,
      highlightCol: null,
      revealAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        'The grey cell must be a SQUARE with count 1 — that is "one square". Answer D!',
        'Kotak abu-abu harus berisi PERSEGI dengan jumlah 1 — yaitu "satu persegi". Jawaban D!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'D' }
}
