// OSN-24-SD-NAS-TEORI2-Q10 — lompat berjumlah prima explainer storyboard
//
// Grid layout (col 0–4, row 0–2), each tile 0.5 m × 0.5 m:
//   row 0:  —    [2]  [3]  [4]   —
//   row 1:  [1]  [7]  [6]  [5]  [11]
//   row 2:  —    [8]  [9]  [10]  —
//
// Valid paths (5 distinct tiles, start=1, end=11, each jump < 1 m, sum prime):
//   Path A: 1 → 7 → 6 → 4 → 11   sum = 29  (prime ✓)
//   Path B: 1 → 8 → 6 → 5 → 11   sum = 31  (prime ✓)
//
// Cell coordinates [col, row]:
//   tile 1=[0,1]  tile 7=[1,1]  tile 6=[2,1]  tile 4=[3,0]  tile 11=[4,1]
//   tile 8=[1,2]                tile 5=[3,1]

export interface PrimeJumpStep {
  /** [col, row] cells for the trail polyline; [] = no trail shown */
  path: readonly (readonly [number, number])[]
  /** Trail colour */
  trailColor: string
  /** Explainer caption text */
  caption: string
  /** True on the final answer beat */
  result: boolean
  /** Auto-advance hold in ms; 0 = stay on this beat */
  hold: number
}

export function buildPrimeJumpOSN24NT2Q10Steps(lang: 'en' | 'id'): PrimeJumpStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  return [
    {
      path: [],
      trailColor: '#F59E0B',
      hold: 2000,
      result: false,
      caption: t(
        'Start at tile 1, end at tile 11 — exactly 5 tiles. Each jump < 1 m. The sum of tile numbers must be prime.',
        'Mulai petak 1, akhir petak 11 — tepat 5 petak. Setiap lompatan < 1 m. Jumlah nomor petak harus prima.',
      ),
    },
    {
      // Path A: 1→7→6→4→11 — coordinates [0,1]→[1,1]→[2,1]→[3,0]→[4,1]
      path: [[0, 1], [1, 1], [2, 1], [3, 0], [4, 1]],
      trailColor: '#16A34A',
      hold: 2500,
      result: false,
      caption: t(
        'Jalur 1→7→6→4→11: 1+7+6+4+11 = 29 ✓ (prime)',
        'Jalur 1→7→6→4→11: 1+7+6+4+11 = 29 ✓ (prima)',
      ),
    },
    {
      // Path B: 1→8→6→5→11 — coordinates [0,1]→[1,2]→[2,1]→[3,1]→[4,1]
      path: [[0, 1], [1, 2], [2, 1], [3, 1], [4, 1]],
      trailColor: '#2563EB',
      hold: 2500,
      result: false,
      caption: t(
        'Jalur 1→8→6→5→11: 1+8+6+5+11 = 31 ✓ (prime)',
        'Jalur 1→8→6→5→11: 1+8+6+5+11 = 31 ✓ (prima)',
      ),
    },
    {
      path: [],
      trailColor: '#F59E0B',
      hold: 0,
      result: true,
      caption: t(
        'Exactly 2 valid paths: 1→7→6→4→11 (sum 29) and 1→8→6→5→11 (sum 31).',
        'Tepat 2 jalur valid: 1→7→6→4→11 (jumlah 29) dan 1→8→6→5→11 (jumlah 31).',
      ),
    },
  ]
}
