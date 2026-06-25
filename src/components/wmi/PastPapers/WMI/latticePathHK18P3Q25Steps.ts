// HKIMO-18-P3H-Q25 beat steps for the animated explainer.
//
// Problem: from A=(0,0) to B=(2,3), move only right or up.
// The grid has a staircase shape: bottom row is 3 cells wide, upper 2 rows are 2 cells wide.
// The x=3 column at the bottom is a dead-end (no path to B from there).
// Effective path: 2 right + 3 up = C(5,2) = 10 ways.
//
// 4 beats:
//   0 — show grid, ask "how many ways?"
//   1 — fill DP row y=0 and y=1 (entry + step boundary)
//   2 — fill DP rows y=2 and y=3 (upper section), reveal accumulation
//   3 — formula C(5,2)=10, answer

export interface LatticePathHK18P3Q25Beat {
  caption_en: string
  caption_id: string
  showRow01: boolean   // show DP counts for y=0 and y=1
  showRow23: boolean   // show DP counts for y=2 and y=3
  showFormula: boolean
  showAnswer: boolean
  hold: number
}

const BEATS: LatticePathHK18P3Q25Beat[] = [
  {
    caption_en: 'Andy can only move right (→) or up (↑). How many different routes from A to B?',
    caption_id: 'Andy hanya bisa bergerak ke kanan (→) atau ke atas (↑). Ada berapa rute berbeda dari A ke B?',
    showRow01: false,
    showRow23: false,
    showFormula: false,
    showAnswer: false,
    hold: 2200,
  },
  {
    caption_en: 'Count paths reaching each dot. From A, there is exactly 1 way to reach every dot on row y=0 (go straight right) and 1 way on column x=0 (go straight up).',
    caption_id: 'Hitung jalur yang mencapai setiap titik. Dari A, ada tepat 1 cara mencapai setiap titik di baris y=0 (jalan kanan terus) dan 1 cara di kolom x=0 (jalan atas terus).',
    showRow01: true,
    showRow23: false,
    showFormula: false,
    showAnswer: false,
    hold: 2800,
  },
  {
    caption_en: 'Each interior dot = left neighbour + bottom neighbour. The counts build up: 1→2→3 then 1→3→6 then 1→4→10.',
    caption_id: 'Setiap titik interior = tetangga kiri + tetangga bawah. Hitungan menumpuk: 1→2→3 lalu 1→3→6 lalu 1→4→10.',
    showRow01: true,
    showRow23: true,
    showFormula: false,
    showAnswer: false,
    hold: 3000,
  },
  {
    caption_en: 'To reach B, Andy must take exactly 2 steps right and 3 steps up (5 steps total). Ways = C(5,2) = 10.',
    caption_id: 'Untuk mencapai B, Andy harus mengambil tepat 2 langkah kanan dan 3 langkah atas (5 langkah total). Cara = C(5,2) = 10.',
    showRow01: true,
    showRow23: true,
    showFormula: true,
    showAnswer: true,
    hold: 3200,
  },
]

export function buildLatticePathHK18P3Q25Steps(lang: 'en' | 'id' = 'en') {
  return { steps: BEATS, finalIndex: BEATS.length - 1, lang }
}
