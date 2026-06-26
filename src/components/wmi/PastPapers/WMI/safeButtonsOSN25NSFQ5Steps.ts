// OSN-25-SD-NAS-SEMIFINAL-Q5 storyboard — safe-lock button combinations.
//
// 2×4 button grid, press 4 so each row AND each column has an odd count.
// 4 total across 4 cols → exactly 1 per col (odd ✓).
// k = buttons in row 0; k must be odd AND 4−k must be odd → k ∈ {1, 3}.
// C(4,1) + C(4,3) = 4 + 4 = 8.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type SafeButtonPhase = 'intro' | 'per-col' | 'k1' | 'k3' | 'count' | 'result'

export interface SafeButtonStep {
  phase: SafeButtonPhase
  /** Pressed cells as [row, col] pairs — row 0 = top row, col 0 = leftmost. */
  pressed: readonly [number, number][]
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface SafeButtonStoryboard {
  steps: SafeButtonStep[]
  finalIndex: number
}

export function buildSafeButtonsOSN25NSFQ5Steps(lang: Lang): SafeButtonStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SafeButtonStep[] = [
    // Beat 0 — intro: show the empty 2×4 grid
    {
      phase: 'intro',
      pressed: [],
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'A safe has buttons in 2 rows × 4 columns. Press exactly 4 buttons so every row AND every column has an odd count.',
        'Lemari besi punya 2 baris × 4 kolom tombol. Tekan tepat 4 tombol agar setiap baris DAN setiap kolom berjumlah ganjil.',
      ),
    },

    // Beat 1 — per-column constraint
    {
      phase: 'per-col',
      pressed: [[0, 0], [1, 1], [0, 2], [1, 3]],
      equation: t('4 buttons ÷ 4 columns = 1 per column', '4 tombol ÷ 4 kolom = 1 per kolom'),
      hold: 2600,
      result: false,
      caption: t(
        'With 4 buttons pressed across 4 columns, each column must have exactly 1 pressed button (1 is odd ✓). So the question becomes: which ROW does each column\'s button go in?',
        'Dengan 4 tombol di 4 kolom, tiap kolom harus punya tepat 1 tombol ditekan (1 ganjil ✓). Pertanyaannya: tombol tiap kolom ada di BARIS mana?',
      ),
    },

    // Beat 2 — k = 1 example (1 button in row 0, 3 in row 1)
    {
      phase: 'k1',
      pressed: [[0, 0], [1, 1], [1, 2], [1, 3]],
      equation: 'k = 1',
      hold: 2600,
      result: false,
      caption: t(
        'Let k = number of columns whose button is in row 1. Case k=1: row 1 has 1 button (odd ✓), row 2 has 3 (odd ✓). Choose 1 of 4 columns → C(4,1) = 4 ways.',
        'Misal k = banyak kolom yang tombolnya di baris 1. Kasus k=1: baris 1 ada 1 tombol (ganjil ✓), baris 2 ada 3 (ganjil ✓). Pilih 1 dari 4 kolom → C(4,1) = 4 cara.',
      ),
    },

    // Beat 3 — k = 3 example (3 buttons in row 0, 1 in row 1)
    {
      phase: 'k3',
      pressed: [[0, 0], [0, 1], [0, 2], [1, 3]],
      equation: 'k = 3',
      hold: 2600,
      result: false,
      caption: t(
        'Case k=3: row 1 has 3 buttons (odd ✓), row 2 has 1 (odd ✓). Choose 3 of 4 columns → C(4,3) = 4 ways. (k=0,2,4 all make one row even — invalid.)',
        'Kasus k=3: baris 1 ada 3 tombol (ganjil ✓), baris 2 ada 1 (ganjil ✓). Pilih 3 dari 4 kolom → C(4,3) = 4 cara. (k=0,2,4 membuat satu baris genap — tidak valid.)',
      ),
    },

    // Beat 4 — count
    {
      phase: 'count',
      pressed: [[0, 0], [1, 1], [1, 2], [1, 3]],
      equation: 'C(4,1) + C(4,3) = 4 + 4',
      hold: 2400,
      result: false,
      caption: t(
        'k must be odd; valid k ∈ {1, 3}. C(4,1) = 4 (k=1 cases) + C(4,3) = 4 (k=3 cases).',
        'k harus ganjil; k yang valid ∈ {1, 3}. C(4,1) = 4 (kasus k=1) + C(4,3) = 4 (kasus k=3).',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      pressed: [[0, 0], [1, 1], [1, 2], [1, 3]],
      equation: '4 + 4 = 8',
      hold: 0,
      result: true,
      caption: t(
        'Total combinations = C(4,1) + C(4,3) = 4 + 4 = 8.',
        'Total kombinasi = C(4,1) + C(4,3) = 4 + 4 = 8.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
