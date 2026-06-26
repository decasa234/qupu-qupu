// floorPlanOSN24NT2Q7Steps.ts
// OSN 2024 SD Nasional Teori2 Q7 — floor-plan carpet cost problem.
//
// Strategy: Read area from each zone, multiply by rate, then sum.
//   Zone A   → Ruang Utama       4,62 × 2,97 = 13,72 m²  × Rp250.000 = Rp3.430.000
//   Zone B   → 3 × Kamar Tidur   ≈ 23,16 m²              × Rp150.000 = Rp3.474.000
//   Rumput   → Taman + AJemur    ≈ 20,51 m²               × Rp95.000  = Rp1.948.450
//   Total                                                             ≈ Rp8.852.450
//
// Beat sequence (one idea per beat):
//   0. intro     — show the floor plan; state the three rates.
//   1. karpet-a  — highlight Ruang Utama, compute its area × Rp250.000.
//   2. karpet-b  — highlight all 3 Kamar Tidur, sum areas × Rp150.000.
//   3. rumput    — highlight Taman + Area Jemur × Rp95.000.
//   4. total     — add all three → Rp8.852.450.

export type Lang = 'en' | 'id'

export type FloorPhaseId = 'intro' | 'karpet-a' | 'karpet-b' | 'rumput' | 'total'

export interface FloorBeat {
  phase: FloorPhaseId
  /** Which colour zone(s) to glow/highlight */
  highlightA: boolean   // Ruang Utama
  highlightB: boolean   // Kamar Tidur rooms
  highlightR: boolean   // Taman + Area Jemur
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface FloorStoryboard {
  beats: FloorBeat[]
  finalIndex: number
}

export function buildFloorPlanOSN24NT2Q7Steps(lang: Lang): FloorStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats: FloorBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightA: false,
      highlightB: false,
      highlightR: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'The floor plan shows three zones that need covering: main room (Carpet A), bedrooms (Carpet B), and garden + drying area (synthetic grass).',
        'Denah rumah menunjukkan tiga zona yang perlu dilapisi: ruang utama (Karpet A), kamar tidur (Karpet B), dan taman + area jemur (rumput sintetis).',
      ),
    },

    // Beat 1 — Karpet A: Ruang Utama
    {
      phase: 'karpet-a',
      highlightA: true,
      highlightB: false,
      highlightR: false,
      equation: '4,62 × 2,97 = 13,72 m²  →  13,72 × Rp250.000 = Rp3.430.000',
      hold: 2800,
      result: false,
      caption: t(
        'Ruang Utama: 4,62 m wide × 2,97 m long = 13,72 m². Cost = 13,72 × Rp250.000 = Rp3.430.000.',
        'Ruang Utama: lebar 4,62 m × panjang 2,97 m = 13,72 m². Biaya = 13,72 × Rp250.000 = Rp3.430.000.',
      ),
    },

    // Beat 2 — Karpet B: 3 Kamar Tidur
    {
      phase: 'karpet-b',
      highlightA: false,
      highlightB: true,
      highlightR: false,
      equation: '8,85 + 6,14 + 8,17 = 23,16 m²  →  23,16 × Rp150.000 = Rp3.474.000',
      hold: 2800,
      result: false,
      caption: t(
        'Three bedrooms: KT1 (3,01×2,94 = 8,85 m²) + KT2 (≈6,14 m²) + KT3 (2,75×2,97 = 8,17 m²) = 23,16 m². Cost = Rp3.474.000.',
        'Tiga kamar tidur: KT1 (3,01×2,94 = 8,85 m²) + KT2 (≈6,14 m²) + KT3 (2,75×2,97 = 8,17 m²) = 23,16 m². Biaya = Rp3.474.000.',
      ),
    },

    // Beat 3 — Rumput sintetis: Taman + Area Jemur
    {
      phase: 'rumput',
      highlightA: false,
      highlightB: false,
      highlightR: true,
      equation: '4,73 + 3,63 + 12,15 = 20,51 m²  →  20,51 × Rp95.000 = Rp1.948.450',
      hold: 2800,
      result: false,
      caption: t(
        'Synthetic grass covers: Area Jemur (1,61×2,94 = 4,73 m²) + Taman right (≈3,63 m²) + Taman bottom (4,01×3,03 = 12,15 m²) = 20,51 m². Cost = Rp1.948.450.',
        'Rumput sintetis meliputi: Area Jemur (1,61×2,94 = 4,73 m²) + Taman kanan (≈3,63 m²) + Taman bawah (4,01×3,03 = 12,15 m²) = 20,51 m². Biaya = Rp1.948.450.',
      ),
    },

    // Beat 4 — Total
    {
      phase: 'total',
      highlightA: true,
      highlightB: true,
      highlightR: true,
      equation: 'Rp3.430.000 + Rp3.474.000 + Rp1.948.450 = Rp8.852.450',
      hold: 0,
      result: true,
      caption: t(
        'Total cost = Rp3.430.000 (Carpet A) + Rp3.474.000 (Carpet B) + Rp1.948.450 (synthetic grass) = Rp8.852.450.',
        'Total biaya = Rp3.430.000 (Karpet A) + Rp3.474.000 (Karpet B) + Rp1.948.450 (rumput sintetis) = Rp8.852.450.',
      ),
    },
  ]

  return { beats, finalIndex: beats.length - 1 }
}
