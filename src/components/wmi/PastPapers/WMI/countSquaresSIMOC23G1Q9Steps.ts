// SIMOC-23-G1-Q9 — beat storyboard for counting squares.
//
// Figure: 4 isolated corner squares (each undivided) + 4×4 centre grid.
// Teaching walk:
//   0  intro      — orient: count ALL sizes
//   1  corners    — 4 corner squares → 4
//   2  cells1x1   — grid 1×1: 4×4 = 16
//   3  cells2x2   — grid 2×2: 3×3 = 9
//   4  cells3x3   — grid 3×3: 2×2 = 4
//   5  cells4x4   — grid 4×4: 1×1 = 1
//   6  result     — 4+16+9+4+1 = 34 → A

export type Lang = 'en' | 'id'

export type PhaseId =
  | 'intro'
  | 'corners'
  | 'cells1x1'
  | 'cells2x2'
  | 'cells3x3'
  | 'cells4x4'
  | 'result'

export interface SquareBeat {
  phase: PhaseId
  caption: string
  equation: string
  /** Auto-hold duration in ms; 0 = final / manual. */
  hold: number
  result: boolean
}

export interface SquareStoryboard {
  steps: SquareBeat[]
  finalIndex: number
}

export function buildCountSquaresSIMOC23G1Q9Steps(lang: Lang): SquareStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SquareBeat[] = [
    {
      phase: 'intro',
      caption: t(
        'Count ALL squares — every size counts: 1×1, 2×2, 3×3, and 4×4.',
        'Hitung SEMUA persegi — setiap ukuran dihitung: 1×1, 2×2, 3×3, dan 4×4.',
      ),
      equation: '',
      hold: 2200,
      result: false,
    },
    {
      phase: 'corners',
      caption: t(
        'Start with the 4 corner squares — each is one large undivided square. That gives 4.',
        'Mulai dari 4 persegi di sudut — masing-masing adalah satu persegi besar tanpa garis di dalam. Itu 4 persegi.',
      ),
      equation: t('Corner squares: 4', 'Persegi sudut: 4'),
      hold: 2000,
      result: false,
    },
    {
      phase: 'cells1x1',
      caption: t(
        'Inside the centre grid count 1×1 squares. 4 columns × 4 rows = 16.',
        'Di kotak tengah, hitung persegi 1×1. 4 kolom × 4 baris = 16.',
      ),
      equation: t('1×1 squares: 16', 'Persegi 1×1: 16'),
      hold: 2000,
      result: false,
    },
    {
      phase: 'cells2x2',
      caption: t(
        'Count 2×2 squares. Slide a 2×2 window across the grid — 3 positions across × 3 down = 9.',
        'Hitung persegi 2×2. Geser jendela 2×2 di kotak — 3 posisi mendatar × 3 ke bawah = 9.',
      ),
      equation: t('2×2 squares: 9', 'Persegi 2×2: 9'),
      hold: 2000,
      result: false,
    },
    {
      phase: 'cells3x3',
      caption: t(
        'Count 3×3 squares. A 3×3 window fits 2 across × 2 down = 4.',
        'Hitung persegi 3×3. Jendela 3×3 pas 2 mendatar × 2 ke bawah = 4.',
      ),
      equation: t('3×3 squares: 4', 'Persegi 3×3: 4'),
      hold: 2000,
      result: false,
    },
    {
      phase: 'cells4x4',
      caption: t(
        'Count 4×4 squares — the whole grid itself is exactly one big square.',
        'Hitung persegi 4×4 — seluruh kotak itu sendiri tepat satu persegi besar.',
      ),
      equation: t('4×4 squares: 1', 'Persegi 4×4: 1'),
      hold: 2000,
      result: false,
    },
    {
      phase: 'result',
      caption: t(
        'Add them all up: 4 + 16 + 9 + 4 + 1 = 34 squares. The answer is A.',
        'Jumlahkan semuanya: 4 + 16 + 9 + 4 + 1 = 34 persegi. Jawaban adalah A.',
      ),
      equation: '4 + 16 + 9 + 4 + 1 = 34',
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
