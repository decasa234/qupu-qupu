// HKIMO-20-P1H-Q17 — beat definitions for the explainer animation.
//
// Strategy: count squares by size, largest to smallest.
//   Beat 0 — intro: show the staircase; ask students to look for ALL sizes.
//   Beat 1 — big:   highlight the 4 original large squares → running total 4.
//   Beat 2 — med:   highlight the 3 pairwise-overlap squares (3/4 size) → total 7.
//   Beat 3 — sm:    highlight the 2 triple-overlap squares (1/2 size) → total 9.
//   Beat 4 — tiny:  highlight the 1 quadruple-overlap square (1/4 size) → total 10.
//   Beat 5 — result: 10 ✓ (green).

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'big' | 'med' | 'sm' | 'tiny' | 'result'

export interface OverlapBeat {
  phase: PhaseId
  /** How many sizes to highlight (0 = none; 1 = large only; 2 = large+med; etc.) */
  highlightLevels: number
  /** Running count to display. */
  count: number | null
  /** Equation / maths label; '' to hide. */
  equation: string
  caption: string
  hold: number   // auto-advance ms; 0 = final / manual
  result: boolean
}

export function buildOverlapSquaresHK20P1Q17Steps(lang: Lang): OverlapBeat[] {
  const en = lang === 'en'
  return [
    {
      phase: 'intro',
      highlightLevels: 0,
      count: null,
      equation: '',
      caption: en
        ? 'Count ALL squares — big ones AND ones hidden inside the overlaps!'
        : 'Hitung SEMUA bujursangkar — yang besar DAN yang tersembunyi di dalam tumpang tindih!',
      hold: 2000,
      result: false,
    },
    {
      phase: 'big',
      highlightLevels: 1,
      count: 4,
      equation: en ? '4 large squares' : '4 bujursangkar besar',
      caption: en
        ? 'There are 4 large squares (the original shapes). Count: 4.'
        : 'Ada 4 bujursangkar besar (bentuk aslinya). Jumlah: 4.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'med',
      highlightLevels: 2,
      count: 7,
      equation: en ? '4 + 3 = 7' : '4 + 3 = 7',
      caption: en
        ? 'Each pair of adjacent squares overlaps, forming 3 medium squares. Count: 4 + 3 = 7.'
        : 'Setiap pasang bujursangkar yang berdekatan bertumpang tindih, membentuk 3 bujursangkar sedang. Jumlah: 4 + 3 = 7.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'sm',
      highlightLevels: 3,
      count: 9,
      equation: en ? '7 + 2 = 9' : '7 + 2 = 9',
      caption: en
        ? 'Three squares overlap in 2 places, giving 2 smaller squares. Count: 7 + 2 = 9.'
        : 'Tiga bujursangkar bertumpang tindih di 2 tempat, menghasilkan 2 bujursangkar lebih kecil. Jumlah: 7 + 2 = 9.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'tiny',
      highlightLevels: 4,
      count: 10,
      equation: en ? '9 + 1 = 10' : '9 + 1 = 10',
      caption: en
        ? 'All 4 squares share one tiny region in the centre — 1 more square. Count: 9 + 1 = 10.'
        : 'Semua 4 bujursangkar berbagi satu daerah kecil di tengah — 1 bujursangkar lagi. Jumlah: 9 + 1 = 10.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'result',
      highlightLevels: 4,
      count: 10,
      equation: en ? '4 + 3 + 2 + 1 = 10' : '4 + 3 + 2 + 1 = 10',
      caption: en
        ? 'Total: 4 large + 3 medium + 2 small + 1 tiny = 10 squares!'
        : 'Total: 4 besar + 3 sedang + 2 kecil + 1 sangat kecil = 10 bujursangkar!',
      hold: 0,
      result: true,
    },
  ]
}
