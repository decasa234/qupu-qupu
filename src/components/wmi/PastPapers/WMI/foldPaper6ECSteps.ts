// Beat-by-beat steps for IKMC-23-EC-Q6 (Kristoffer's transparent paper fold).
//
// Strategy: identify which digit segments are on each half of the paper,
// then overlay the two halves (since the paper is transparent) to find the
// three resulting digits → 4:0:6 (answer E).
//
// Beats:
//   0  Intro — "transparent paper with digit segments, fold line in the middle"
//   1  Top half — identify the segments on the top half (col by col)
//   2  Bottom half — identify the segments on the bottom half
//   3  Fold — top half folds down; both layers are visible (transparent)
//   4  Overlay col 1 → digit 4
//   5  Overlay col 2 → digit 0
//   6  Overlay col 3 → digit 6
//   7  Answer — 4:0:6 = option E

export type Lang = 'en' | 'id'

/** Which region of the paper to highlight visually. */
export type Highlight =
  | 'none'
  | 'top'
  | 'bottom'
  | 'fold'
  | 'col0'
  | 'col1'
  | 'col2'
  | 'result'

export interface FoldPaper6ECStep {
  highlight: Highlight
  caption: string
  hold: number
  /** Show the folded/overlay state in the explainer SVG instead of unfolded. */
  folded: boolean
  /** Show the result digit display. */
  result: boolean
}

export interface FoldPaper6ECStoryboard {
  steps: FoldPaper6ECStep[]
  finalIndex: number
}

export function buildFoldPaper6ECSteps(lang: Lang): FoldPaper6ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FoldPaper6ECStep[] = [
    // Beat 0 — intro
    {
      highlight: 'none',
      caption: t(
        'A transparent paper shows digit segments in two rows. The dashed line is the fold line.',
        'Kertas transparan menampilkan segmen angka dalam dua baris. Garis putus-putus adalah garis lipatan.',
      ),
      hold: 2800,
      folded: false,
      result: false,
    },
    // Beat 1 — top half
    {
      highlight: 'top',
      caption: t(
        'Top half: the upper segments of each column (top-left + top-right bars for col 1; top + sides for col 2; top + left side for col 3).',
        'Bagian atas: segmen atas setiap kolom (batang kiri-atas + kanan-atas untuk kol 1; atas + sisi untuk kol 2; atas + sisi kiri untuk kol 3).',
      ),
      hold: 3000,
      folded: false,
      result: false,
    },
    // Beat 2 — bottom half
    {
      highlight: 'bottom',
      caption: t(
        'Bottom half: the lower segments (middle + bottom-right for col 1; bottom sides + bottom bar for col 2; middle + bottom sides + bottom bar for col 3).',
        'Bagian bawah: segmen bawah (tengah + kanan-bawah untuk kol 1; sisi bawah + batang bawah untuk kol 2; tengah + sisi bawah + batang bawah untuk kol 3).',
      ),
      hold: 3000,
      folded: false,
      result: false,
    },
    // Beat 3 — fold
    {
      highlight: 'fold',
      caption: t(
        'Fold! The top half flips down onto the bottom. Since the paper is transparent, BOTH layers are visible at once.',
        'Lipat! Bagian atas terlipat ke bawah. Karena kertas transparan, KEDUA lapisan terlihat sekaligus.',
      ),
      hold: 2800,
      folded: true,
      result: false,
    },
    // Beat 4 — col 0 result
    {
      highlight: 'col0',
      caption: t(
        'Column 1: top segments (top-left + top-right) + bottom segments (middle + bottom-right) → digit 4.',
        'Kolom 1: segmen atas (kiri-atas + kanan-atas) + segmen bawah (tengah + kanan-bawah) → angka 4.',
      ),
      hold: 2800,
      folded: true,
      result: false,
    },
    // Beat 5 — col 1 result
    {
      highlight: 'col1',
      caption: t(
        'Column 2: top segments (top + left + right) + bottom segments (bottom-left + bottom-right + bottom) → digit 0.',
        'Kolom 2: segmen atas (atas + kiri + kanan) + segmen bawah (kiri-bawah + kanan-bawah + bawah) → angka 0.',
      ),
      hold: 2800,
      folded: true,
      result: false,
    },
    // Beat 6 — col 2 result
    {
      highlight: 'col2',
      caption: t(
        'Column 3: top segments (top + left) + bottom segments (middle + sides + bottom) → digit 6.',
        'Kolom 3: segmen atas (atas + kiri) + segmen bawah (tengah + sisi + bawah) → angka 6.',
      ),
      hold: 2800,
      folded: true,
      result: false,
    },
    // Beat 7 — answer
    {
      highlight: 'result',
      caption: t(
        'Combined: 4 : 0 : 6 — that is option E! The transparent fold overlays the two halves perfectly.',
        'Gabungan: 4 : 0 : 6 — itulah pilihan E! Lipatan transparan menumpuk kedua bagian dengan sempurna.',
      ),
      hold: 0,
      folded: true,
      result: true,
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
