// SIMOC-19-G3-Q9 — stack map → front view storyboard
//
// Figure 4 stack map (2 rows × 3 cols):
//   back row  (top):    2  2  4
//   front row (bottom): 1  3  1
//
// Front view rule: max height per column.
//   col 0: max(1, 2) = 2
//   col 1: max(3, 2) = 3
//   col 2: max(1, 4) = 4
// Profile: [2, 3, 4] → answer B.
//
// Pure builder — no random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type StackMapPhaseId = 'intro' | 'col0' | 'col1' | 'col2' | 'result'

export interface StackMapBeat {
  phase: StackMapPhaseId
  /** Column to highlight in the grid (0, 1, 2) or -1 for none. */
  highlightCol: number
  /** Arithmetic line shown below the figure ('' to hide). */
  equation: string
  /** Explanation caption. */
  caption: string
  /** Auto-hold in ms; 0 = final beat (no auto-advance). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export function buildStackMapSIMOC19G3Q9Steps(lang: Lang): StackMapBeat[] {
  const id = lang === 'id'
  return [
    {
      phase: 'intro',
      highlightCol: -1,
      equation: '',
      caption: id
        ? 'Tampilan depan menunjukkan tumpukan tertinggi di setiap kolom peta.'
        : 'The front view shows the tallest stack in each column of the map.',
      hold: 2000,
      result: false,
    },
    {
      phase: 'col0',
      highlightCol: 0,
      equation: id
        ? 'Kolom 1: maks(1, 2) = 2'
        : 'Column 1: max(1, 2) = 2',
      caption: id
        ? 'Kolom 1: baris depan = 1, baris belakang = 2. Tampilan depan = 2 kubus.'
        : 'Column 1: front row = 1, back row = 2. Front view height = 2.',
      hold: 2400,
      result: false,
    },
    {
      phase: 'col1',
      highlightCol: 1,
      equation: id
        ? 'Kolom 2: maks(3, 2) = 3'
        : 'Column 2: max(3, 2) = 3',
      caption: id
        ? 'Kolom 2: baris depan = 3, baris belakang = 2. Tampilan depan = 3 kubus.'
        : 'Column 2: front row = 3, back row = 2. Front view height = 3.',
      hold: 2400,
      result: false,
    },
    {
      phase: 'col2',
      highlightCol: 2,
      equation: id
        ? 'Kolom 3: maks(1, 4) = 4'
        : 'Column 3: max(1, 4) = 4',
      caption: id
        ? 'Kolom 3: baris depan = 1, baris belakang = 4. Tampilan depan = 4 kubus.'
        : 'Column 3: front row = 1, back row = 4. Front view height = 4.',
      hold: 2400,
      result: false,
    },
    {
      phase: 'result',
      highlightCol: -1,
      equation: id
        ? 'Tampilan depan: [2, 3, 4] → Jawaban B'
        : 'Front view: [2, 3, 4] → Answer B',
      caption: id
        ? 'Profil tampilan depan adalah 2, 3, 4 dari kiri ke kanan. Cocok dengan pilihan B.'
        : 'The front-view profile is 2, 3, 4 from left to right. This matches option B.',
      hold: 0,
      result: true,
    },
  ]
}
