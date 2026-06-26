// SASMO-19-G3-Q16 — "Berapa banyak persegi panjang yang ada pada gambar berikut?"
// Answer: 30 (1 main house + 1 attic win + 9 left win + 9 right win + 3 door area + 1 garage + 6 garage win)
// Pure storyboard builder — no random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type HouseRectsPhase =
  | 'intro'
  | 'main-house'
  | 'attic'
  | 'left-win'
  | 'right-win'
  | 'door-area'
  | 'garage-body'
  | 'garage-win'
  | 'result'

export interface HouseRectsBeat {
  phase: HouseRectsPhase
  highlightMain: boolean
  highlightAttic: boolean
  highlightLeftWin: boolean
  highlightRightWin: boolean
  highlightDoor: boolean
  highlightGarageBody: boolean
  highlightGarageWin: boolean
  runningTotal: number
  equation: string
  caption: string
  /** Auto-hold ms; 0 = final / manual. */
  hold: number
  result: boolean
}

export function buildHouseRectsSteps(lang: Lang): HouseRectsBeat[] {
  const id = lang === 'id'
  const none = {
    highlightMain: false,
    highlightAttic: false,
    highlightLeftWin: false,
    highlightRightWin: false,
    highlightDoor: false,
    highlightGarageBody: false,
    highlightGarageWin: false,
  }
  return [
    {
      phase: 'intro',
      ...none,
      runningTotal: 0,
      equation: '',
      caption: id
        ? 'Hitung SEMUA persegi panjang — termasuk yang terbentuk dari gabungan kotak-kotak kecil!'
        : 'Count ALL rectangles — including those formed by combining smaller ones!',
      hold: 2000,
      result: false,
    },
    {
      phase: 'main-house',
      ...none,
      highlightMain: true,
      runningTotal: 1,
      equation: '1',
      caption: id
        ? 'Dinding utama rumah: 1 persegi panjang besar'
        : 'Main house wall: 1 large rectangle',
      hold: 1800,
      result: false,
    },
    {
      phase: 'attic',
      ...none,
      highlightAttic: true,
      runningTotal: 2,
      equation: '1 + 1 = 2',
      caption: id ? 'Jendela atap: +1 → total 2' : 'Attic window: +1 → total 2',
      hold: 1800,
      result: false,
    },
    {
      phase: 'left-win',
      ...none,
      highlightLeftWin: true,
      runningTotal: 11,
      equation: '2 + 9 = 11',
      caption: id
        ? 'Jendela kiri 2×2: 4 satuan + 2 baris + 2 kolom + 1 penuh = 9'
        : 'Left window 2×2: 4 unit + 2 rows + 2 cols + 1 full = 9',
      hold: 2200,
      result: false,
    },
    {
      phase: 'right-win',
      ...none,
      highlightRightWin: true,
      runningTotal: 20,
      equation: '11 + 9 = 20',
      caption: id ? 'Jendela kanan 2×2: +9 → total 20' : 'Right window 2×2: +9 → total 20',
      hold: 1800,
      result: false,
    },
    {
      phase: 'door-area',
      ...none,
      highlightDoor: true,
      runningTotal: 23,
      equation: '20 + 3 = 23',
      caption: id
        ? 'Pintu + 2 panel samping: +3 → total 23'
        : 'Door + 2 side panels: +3 → total 23',
      hold: 1800,
      result: false,
    },
    {
      phase: 'garage-body',
      ...none,
      highlightGarageBody: true,
      runningTotal: 24,
      equation: '23 + 1 = 24',
      caption: id ? 'Badan garasi: +1 → total 24' : 'Garage body: +1 → total 24',
      hold: 1800,
      result: false,
    },
    {
      phase: 'garage-win',
      ...none,
      highlightGarageWin: true,
      runningTotal: 30,
      equation: '24 + 6 = 30',
      caption: id
        ? 'Jendela garasi (1×3): 3+2+1 = 6 → total 30'
        : 'Garage window (1×3): 3+2+1=6 → total 30',
      hold: 2200,
      result: false,
    },
    {
      phase: 'result',
      highlightMain: true,
      highlightAttic: true,
      highlightLeftWin: true,
      highlightRightWin: true,
      highlightDoor: true,
      highlightGarageBody: true,
      highlightGarageWin: true,
      runningTotal: 30,
      equation: '1+1+9+9+3+1+6 = 30',
      caption: id
        ? 'Total persegi panjang = 30'
        : 'Total rectangles = 30',
      hold: 0,
      result: true,
    },
  ]
}
