// Storyboard for SEAMO-22-B-Q10 — speed catch-up problem.
//
// A car leaves A and a motorcycle leaves B simultaneously, same direction.
// 60 km/h car catches in 5 h  →  (60 − v) × 5 = d   [Eq 1]
// 70 km/h car catches in 3 h  →  (70 − v) × 3 = d   [Eq 2]
// Set equal: 300 − 5v = 210 − 3v  →  2v = 90  →  v = 45 km/h. Answer A.
//
// Trap: B (48) — using the average of 60 and 70.
//
// Beats:
//  0 — show the starting picture (car at A, moto at B, gap = d)
//  1 — Scenario 1: 60 km/h × 5 h → gap d = 5(60 − v)
//  2 — Scenario 2: 70 km/h × 3 h → gap d = 3(70 − v)
//  3 — Set equal, solve: 300 − 5v = 210 − 3v → 2v = 90
//  4 — Answer: v = 45 km/h (trap: don't just average 60 and 70)
//
// Pure function of `lang` — SSR-safe, deterministic.

export type Lang = 'en' | 'id'

export interface CatchUp22B10Step {
  /** Short heading for the beat, e.g. "Equation 1" */
  label: string | null
  /** Narrative caption */
  caption: string
  /** Optional inline math expression to display prominently */
  math: string | null
  /** Hold duration in ms before auto-advance */
  hold: number
  /** True only on the final winning beat */
  result: boolean
}

export interface CatchUp22B10Story {
  steps: CatchUp22B10Step[]
  finalIndex: number
  answer: string
}

export function buildCatchUp22B10Steps(lang: Lang): CatchUp22B10Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CatchUp22B10Step[] = [
    // Beat 0 — setup
    {
      label: null,
      caption: t(
        'Car starts at A, motorcycle at B. They move in the SAME direction. Let v = motorcycle speed (km/h) and d = gap AB (km). The car is faster, so it will eventually catch up.',
        'Mobil berangkat dari A, motor dari B. Keduanya bergerak ke ARAH YANG SAMA. Misalkan v = kecepatan motor (km/jam) dan d = jarak AB (km). Karena mobil lebih cepat, mobil akhirnya akan menyusul.',
      ),
      math: null,
      hold: 2800,
      result: false,
    },
    // Beat 1 — Equation 1
    {
      label: t('Scenario 1', 'Skenario 1'),
      caption: t(
        'Car at 60 km/h catches the motorcycle in 5 hours. In 5 h, the car gains (60 − v) km/h × 5 h = gap d.',
        'Mobil dengan kecepatan 60 km/jam menyusul motor dalam 5 jam. Dalam 5 jam, mobil mengejar (60 − v) km/jam × 5 jam = jarak d.',
      ),
      math: '(60 − v) × 5 = d',
      hold: 2600,
      result: false,
    },
    // Beat 2 — Equation 2
    {
      label: t('Scenario 2', 'Skenario 2'),
      caption: t(
        'Car at 70 km/h catches the motorcycle in 3 hours. In 3 h, the car gains (70 − v) × 3 = gap d (same gap!).',
        'Mobil dengan kecepatan 70 km/jam menyusul motor dalam 3 jam. Dalam 3 jam, mobil mengejar (70 − v) × 3 = jarak d (jarak yang sama!).',
      ),
      math: '(70 − v) × 3 = d',
      hold: 2600,
      result: false,
    },
    // Beat 3 — solve
    {
      label: t('Solve', 'Selesaikan'),
      caption: t(
        'Both expressions equal d, so set them equal and solve:',
        'Kedua persamaan sama dengan d, samakan dan selesaikan:',
      ),
      math: '300 − 5v = 210 − 3v  →  90 = 2v  →  v = 45',
      hold: 3000,
      result: false,
    },
    // Beat 4 — answer
    {
      label: null,
      caption: t(
        'Motorcycle speed = 45 km/h. Answer A. (Trap: averaging 60 and 70 gives 65 — wrong! You must set up two equations.)',
        'Kecepatan motor = 45 km/jam. Jawaban A. (Jebakan: rata-rata 60 dan 70 = 65 — salah! Kamu harus membuat dua persamaan.)',
      ),
      math: 'v = 45 km/h',
      hold: 0,
      result: true,
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
    answer: 'A',
  }
}
