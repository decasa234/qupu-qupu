// WMI-22F3A-Q25 — storyboard builder for the number-grid explainer.
//
// Grid cell coordinates: [row][col], row top→bottom (0..2), col left→right (0..2).
// Solution: [[2,7,6],[5,4,3],[8,9,1]]
//   A = (2,0) = 8,  B = (1,1) = 4,  C = (2,2) = 1  →  ABC = 841
//
// Clues
//   Circle sums  TL=18  TR=20  BL=26  BR=17
//   Pattern sums  white(0,0)(0,1)(2,2)=10   gray(0,2)(1,1)(1,2)=13   striped(1,0)(2,0)(2,1)=22
//
// Solving chain (one concrete arithmetic fact per beat):
//   1. All clues announced.
//   2. 10+13+22=45=1+…+9 → each digit once.
//   3. TR circle − gray pattern = cell(0,1):  20−13=7.
//   4. White pattern − cell(0,1) = (0,0)+(2,2):  10−7=3.
//   5. BL circle − striped = B:  26−22=4.
//   6. TL circle: (0,0)+(1,0)=18−7−4=7; with (0,0)+(2,2)=3 try (0,0)=2,(2,2)=1 →(1,0)=5.
//   7. Bottom-right: B+(1,2)+(2,1)+(2,2)=17 → (1,2)+(2,1)=12; gray: (0,2)+4+(1,2)=13.
//   8. Striped: (1,0)+(2,0)+(2,1)=22 → 5+(2,0)+(2,1)=17; unused {3,6,8,9} → pin all four.
//   9. Final beat: A=8, B=4, C=1 → ABC=841.

export type Lang = 'en' | 'id'

// A null entry means the cell is still blank on that beat.
export type GridValues = (number | null)[][]

export interface NumberGridStep {
  /** 3×3 values to display (null = blank). */
  values: GridValues
  /** Cells to highlight on this beat (e.g. a freshly filled cell). */
  highlight: Array<[number, number]>
  hold: number
  result: boolean
  caption: string
}

export interface NumberGridStoryboard {
  steps: NumberGridStep[]
  finalIndex: number
}

const BLANK: GridValues = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
]

// Deep-clone and patch specific cells, returning a new grid.
function patch(base: GridValues, cells: Array<[number, number, number]>): GridValues {
  const g: GridValues = base.map((row) => [...row])
  for (const [r, c, v] of cells) g[r][c] = v
  return g
}

export function buildNumberGrid22G3Steps(lang: Lang): NumberGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Accumulate the grid progressively beat by beat.
  const g0 = BLANK

  // Beat 2: fix cell (0,1) = 7
  const g2 = patch(g0, [[0, 1, 7]])

  // Beat 3: no new digit, but we label (0,0) and (2,2) as a pair summing to 3
  const g3 = g2

  // Beat 4: fix B = (1,1) = 4
  const g4 = patch(g3, [[1, 1, 4]])

  // Beat 5: fix (0,0)=2, (1,0)=5, (2,2)=1
  const g5 = patch(g4, [
    [0, 0, 2],
    [1, 0, 5],
    [2, 2, 1],
  ])

  // Beat 6: fix (0,2)=6, (1,2)=3  (deduced from gray + bottom-right)
  const g6 = patch(g5, [
    [0, 2, 6],
    [1, 2, 3],
  ])

  // Beat 7: fix (2,0)=8, (2,1)=9  (deduced from striped)
  const g7 = patch(g6, [
    [2, 0, 8],
    [2, 1, 9],
  ])

  // Final beat: same full grid, mark A/B/C answer
  const gFull = g7

  const steps: NumberGridStep[] = [
    // Beat 0 — all clues introduced
    {
      values: g0,
      highlight: [],
      hold: 3200,
      result: false,
      caption: t(
        'We have 7 clues: circle sums TL=18, TR=20, BL=26, BR=17, and pattern totals white=10, gray=13, striped=22.',
        'Kita punya 7 petunjuk: lingkaran TL=18, TR=20, BL=26, BR=17, dan pola putih=10, abu-abu=13, garis=22.',
      ),
    },

    // Beat 1 — digit uniqueness
    {
      values: g0,
      highlight: [],
      hold: 2800,
      result: false,
      caption: t(
        '10 + 13 + 22 = 45 = 1+2+…+9. The three patterns together cover every cell once, so each digit 1–9 is used exactly once.',
        '10 + 13 + 22 = 45 = 1+2+…+9. Ketiga pola mencakup semua sel sekali, jadi tiap angka 1–9 dipakai tepat satu kali.',
      ),
    },

    // Beat 2 — find cell (0,1)=7 via TR − gray
    {
      values: g2,
      highlight: [[0, 1]],
      hold: 3000,
      result: false,
      caption: t(
        'Gray pattern: (0,2)+B+(1,2)=13. Top-right circle: (0,1)+(0,2)+B+(1,2)=20. Subtract: cell (0,1) = 20−13 = 7.',
        'Pola abu-abu: (0,2)+B+(1,2)=13. Lingkaran kanan atas: (0,1)+(0,2)+B+(1,2)=20. Kurangi: sel (0,1) = 20−13 = 7.',
      ),
    },

    // Beat 3 — find (0,0)+(2,2)=3 via white
    {
      values: g3,
      highlight: [
        [0, 0],
        [2, 2],
      ],
      hold: 2800,
      result: false,
      caption: t(
        'White pattern: (0,0) + 7 + (2,2) = 10, so (0,0) + (2,2) = 3. These two white cells must share 3 between them.',
        'Pola putih: (0,0) + 7 + (2,2) = 10, jadi (0,0) + (2,2) = 3. Dua sel putih ini berjumlah 3.',
      ),
    },

    // Beat 4 — find B=4 via BL − striped
    {
      values: g4,
      highlight: [[1, 1]],
      hold: 3000,
      result: false,
      caption: t(
        'Striped pattern (1,0)+(2,0)+(2,1)=22. Bottom-left circle adds B to exactly those three cells: 22+B=26, so B=4!',
        'Pola garis (1,0)+(2,0)+(2,1)=22. Lingkaran kiri bawah menambahkan B ke tepat ketiga sel itu: 22+B=26, jadi B=4!',
      ),
    },

    // Beat 5 — pin (0,0)=2, (1,0)=5, (2,2)=1
    {
      values: g5,
      highlight: [
        [0, 0],
        [1, 0],
        [2, 2],
      ],
      hold: 3200,
      result: false,
      caption: t(
        'Top-left circle: (0,0)+7+(1,0)+4=18 → (0,0)+(1,0)=7. With (0,0)+(2,2)=3, try (0,0)=2,(2,2)=1 → (1,0)=5. Check: 2+1=3 ✓, 2+5=7 ✓.',
        'Lingkaran kiri atas: (0,0)+7+(1,0)+4=18 → (0,0)+(1,0)=7. Dengan (0,0)+(2,2)=3, coba (0,0)=2,(2,2)=1 → (1,0)=5. Cek: 2+1=3 ✓, 2+5=7 ✓.',
      ),
    },

    // Beat 6 — pin (0,2)=6, (1,2)=3
    {
      values: g6,
      highlight: [
        [0, 2],
        [1, 2],
      ],
      hold: 3000,
      result: false,
      caption: t(
        'Bottom-right circle: 4+(1,2)+9+(2,1)=17 ... wait, try gray: (0,2)+4+(1,2)=13 → (0,2)+(1,2)=9. Unused digits include 3 and 6; 3+6=9 ✓. Top-right: 7+(0,2)+4+(1,2)=20 → (0,2)+(1,2)=9 ✓. Largest goes top: (0,2)=6, (1,2)=3.',
        'Gunakan pola abu-abu: (0,2)+4+(1,2)=13 → (0,2)+(1,2)=9. Angka yang tersisa mencakup 3 dan 6; 3+6=9 ✓. Lingkaran kanan atas: 7+(0,2)+4+(1,2)=20 → (0,2)+(1,2)=9 ✓. (0,2)=6, (1,2)=3.',
      ),
    },

    // Beat 7 — pin (2,0)=8, (2,1)=9
    {
      values: g7,
      highlight: [
        [2, 0],
        [2, 1],
      ],
      hold: 3000,
      result: false,
      caption: t(
        'Striped: 5+(2,0)+(2,1)=22 → (2,0)+(2,1)=17. Remaining digits are 8 and 9; 8+9=17 ✓. Bottom-left circle: 5+4+8+9=26 ✓. Grid complete!',
        'Pola garis: 5+(2,0)+(2,1)=22 → (2,0)+(2,1)=17. Angka yang tersisa adalah 8 dan 9; 8+9=17 ✓. Lingkaran kiri bawah: 5+4+8+9=26 ✓. Grid selesai!',
      ),
    },

    // Beat 8 (final) — read the answer
    {
      values: gFull,
      highlight: [
        [2, 0],
        [1, 1],
        [2, 2],
      ],
      hold: 0,
      result: true,
      caption: t(
        'A = (2,0) = 8,  B = (1,1) = 4,  C = (2,2) = 1  →  ABC = 841.',
        'A = (2,0) = 8,  B = (1,1) = 4,  C = (2,2) = 1  →  ABC = 841.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
