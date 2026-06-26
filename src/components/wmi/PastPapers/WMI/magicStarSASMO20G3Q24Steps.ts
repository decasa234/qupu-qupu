// SASMO 2020 G3 Q24 — magic arrangement steps.
// 7 circles in a Y-shape; 3 straight lines each through 3 circles share junction.
// Place 2,5,8,11,14,17,20 so every line sums to the same value — find max sum.
//
// Beat 0 — intro (empty figure)
// Beat 1 — total all numbers = 77; derive 3S = 77 + 2×junction
// Beat 2 — place 20 at junction → S = (77+40)/3 = 39
// Beat 3 — fill arms: (2,17), (5,14), (8,11) — each pair sums 19
// Beat 4 — result: each line = 39 ✓

export type Lang = 'en' | 'id'

export type MagicStarPhase = 'intro' | 'total' | 'center' | 'arms' | 'result'

export interface MagicStarStep {
  phase: MagicStarPhase
  /** Node ids to highlight (amber). */
  lit: string[]
  /** Values to display inside circles (node id → number). */
  filled: Record<string, number>
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface MagicStarStoryboard {
  steps: MagicStarStep[]
  finalIndex: number
}

// Optimal solution (max sum = 39): junction=20, arms=(2,17),(5,14),(8,11)
export const SOLUTION: Record<string, number> = {
  tl: 2, ml: 17,
  tr: 5, mr: 14,
  jn: 20,
  bm: 8, bt: 11,
}

export function buildMagicStarSASMO20G3Q24Steps(lang: Lang): MagicStarStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MagicStarStep[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      lit: [], filled: {},
      equation: '',
      hold: 1400,
      result: false,
      caption: t(
        'Place 2, 5, 8, 11, 14, 17, 20 in the 7 circles so every straight line (3 circles) has the same sum. Find the LARGEST possible sum.',
        'Tempatkan 2, 5, 8, 11, 14, 17, 20 di 7 lingkaran agar jumlah setiap garis lurus (3 lingkaran) sama. Cari nilai TERBESAR yang mungkin.',
      ),
    },
    // Beat 1 — total
    {
      phase: 'total',
      lit: [], filled: {},
      equation: '2+5+8+11+14+17+20 = 77',
      hold: 2000,
      result: false,
      caption: t(
        'Add all 7 numbers: total = 77. The junction circle lies on all 3 lines, so it is counted 3 times. Therefore: 3 × S = 77 + 2 × junction.',
        'Jumlahkan semua 7 bilangan: total = 77. Lingkaran persimpangan ada di ketiga garis, sehingga dihitung 3 kali. Maka: 3 × S = 77 + 2 × persimpangan.',
      ),
    },
    // Beat 2 — place 20 at junction
    {
      phase: 'center',
      lit: ['jn'],
      filled: { jn: 20 },
      equation: '3 × S = 77 + 2×20 = 117  →  S = 39',
      hold: 2200,
      result: false,
      caption: t(
        'To maximise S, put the largest number (20) at the junction. Then 3S = 77 + 40 = 117, so S = 39.',
        'Untuk memaksimalkan S, letakkan bilangan terbesar (20) di persimpangan. Maka 3S = 77 + 40 = 117, sehingga S = 39.',
      ),
    },
    // Beat 3 — fill arms
    {
      phase: 'arms',
      lit: ['tl', 'ml', 'tr', 'mr', 'bm', 'bt'],
      filled: { ...SOLUTION },
      equation: '(2+17+20)=39   (5+14+20)=39   (8+11+20)=39',
      hold: 2600,
      result: false,
      caption: t(
        'Remaining numbers must sum to 39 − 20 = 19 on each arm. Pairs: (2, 17), (5, 14), (8, 11) — each sums to 19. Place one pair per arm.',
        'Bilangan yang tersisa harus berjumlah 39 − 20 = 19 di setiap lengan. Pasangan: (2, 17), (5, 14), (8, 11) — masing-masing berjumlah 19. Tempatkan satu pasang di setiap lengan.',
      ),
    },
    // Beat 4 — result
    {
      phase: 'result',
      lit: ['tl', 'ml', 'jn', 'tr', 'mr', 'bm', 'bt'],
      filled: { ...SOLUTION },
      equation: 'S = 39 ✓',
      hold: 0,
      result: true,
      caption: t(
        'Every straight line sums to 39. The largest possible sum is 39.',
        'Setiap garis lurus berjumlah 39. Nilai terbesar yang mungkin adalah 39.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
