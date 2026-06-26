// TIMO-22-P2H-Q18 — beat storyboard for counting squares.
//
// Figure: Z-staircase — top-left 3×2 block + bottom-right 3×2 block.
// Teaching walk:
//   0  intro     — orient: count ALL sizes
//   1  cells1x1  — all 12 unit cells (6 per block)
//   2  cells2x2  — 4 two-by-two squares (2 per block)
//   3  result    — 12 + 4 = 16

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'cells1x1' | 'cells2x2' | 'result'

export interface SquareBeat {
  phase: PhaseId
  caption: string
  equation: string
  /** Auto-hold in ms; 0 = final / manual. */
  hold: number
  result: boolean
}

export interface SquareStoryboard {
  steps: SquareBeat[]
  finalIndex: number
}

export function buildCountSquaresTIMO22P2Q18Steps(lang: Lang): SquareStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SquareBeat[] = [
    {
      phase: 'intro',
      caption: t(
        'Count ALL squares — every size counts: 1×1 and 2×2.',
        'Hitung SEMUA persegi — setiap ukuran dihitung: 1×1 dan 2×2.',
      ),
      equation: '',
      hold: 2200,
      result: false,
    },
    {
      phase: 'cells1x1',
      caption: t(
        'Count the 1×1 unit cells. Top block: 3 × 2 = 6; bottom block: 3 × 2 = 6. Total: 6 + 6 = 12.',
        'Hitung sel satuan 1×1. Blok atas: 3 × 2 = 6; blok bawah: 3 × 2 = 6. Total: 6 + 6 = 12.',
      ),
      equation: t('1×1 squares: 12', 'Persegi 1×1: 12'),
      hold: 2400,
      result: false,
    },
    {
      phase: 'cells2x2',
      caption: t(
        'Now find 2×2 squares. Each 3×2 block fits a 2×2 window in 2 positions. Two blocks → 2 + 2 = 4.',
        'Cari persegi 2×2. Setiap blok 3×2 memuat jendela 2×2 di 2 posisi. Dua blok → 2 + 2 = 4.',
      ),
      equation: t('2×2 squares: 4', 'Persegi 2×2: 4'),
      hold: 2400,
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        'Add all sizes: 12 + 4 = 16 squares.',
        'Jumlahkan semua ukuran: 12 + 4 = 16 persegi.',
      ),
      equation: '12 + 4 = 16',
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
