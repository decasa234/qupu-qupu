// HKIMO-18-P1H-Q25 — beat steps for the animated explainer.
//
// Optimal path (row, col):
//   (1,0)→(0,0)→(0,1)→(0,2)→(0,3)→(1,3)   [5 steps: up + top row + down]
//   →(2,3)→(2,2)→(2,1)→(2,0)→(3,0)           [5 steps: down + middle row + down]
//   →(4,0)→(4,1)→(4,2)→(4,3)→(3,3)           [5 steps: down + bottom row + up]
//   Total: 15 edges × 1 m = 15 m.
//
// 6 beats (0–5): title → start → top-5 → middle-5 → bottom-5 → answer.

export interface AppleGridHK18P1Q25Beat {
  caption: string
  /** How many of the 16 ordered path waypoints to reveal (0 = no trail). */
  pathPoints: number
  showAnswer: boolean
  hold: number
}

export interface AppleGridHK18P1Q25Story {
  steps: AppleGridHK18P1Q25Beat[]
  finalIndex: number
}

const EN: AppleGridHK18P1Q25Beat[] = [
  {
    caption: '16 apples on the floor. Distance between adjacent apples = 1 m.',
    pathPoints: 0,
    showAnswer: false,
    hold: 2200,
  },
  {
    caption: 'Start at the lone apple on the left (middle row).',
    pathPoints: 1,
    showAnswer: false,
    hold: 1800,
  },
  {
    caption: 'Go up, walk right across the top row, step down to the right corner: 5 steps.',
    pathPoints: 6,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Walk left across the middle row, step down to the left corner: 5 more steps.',
    pathPoints: 11,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Go down, walk right across the bottom row, step up to the last apple: 5 more steps.',
    pathPoints: 16,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'All 16 apples collected! Minimum distance = 5 + 5 + 5 = 15 m.',
    pathPoints: 16,
    showAnswer: true,
    hold: 3000,
  },
]

const ID: AppleGridHK18P1Q25Beat[] = [
  {
    caption: '16 apel di lantai. Jarak antara apel yang berdekatan = 1 m.',
    pathPoints: 0,
    showAnswer: false,
    hold: 2200,
  },
  {
    caption: 'Mulai dari apel sendirian di sebelah kiri (baris tengah).',
    pathPoints: 1,
    showAnswer: false,
    hold: 1800,
  },
  {
    caption: 'Naik ke atas, jalan ke kanan melintasi baris atas, turun ke pojok kanan: 5 langkah.',
    pathPoints: 6,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Jalan ke kiri melintasi baris tengah, turun ke pojok kiri: 5 langkah lagi.',
    pathPoints: 11,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Turun ke bawah, jalan ke kanan melintasi baris bawah, naik ke apel terakhir: 5 langkah lagi.',
    pathPoints: 16,
    showAnswer: false,
    hold: 2400,
  },
  {
    caption: 'Semua 16 apel terkumpul! Jarak minimum = 5 + 5 + 5 = 15 m.',
    pathPoints: 16,
    showAnswer: true,
    hold: 3000,
  },
]

export function buildAppleGridHK18P1Q25Steps(lang: 'en' | 'id'): AppleGridHK18P1Q25Story {
  const steps = lang === 'id' ? ID : EN
  return { steps, finalIndex: steps.length - 1 }
}
