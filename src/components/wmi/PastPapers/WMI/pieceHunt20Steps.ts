import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Canonical matches in the 3×3 grid ([row, col], 1-indexed):
//   Piece 1 (pink-white domino), 2 matches:
//     (2,1) pink + (2,2) white;  (3,3) pink + (3,2) white (turned 180°).
//   Piece 2 (black-cornered L), 3 matches:
//     M1 black (2,3) with whites (2,2), (3,2)
//     M2 black (2,3) with whites (1,2), (1,3)
//     M3 black (3,1) with whites (3,2), (2,2)

export const PIECE1_COLOR = '#F59E0B'
export const PIECE2_COLOR = '#2f6df0'

export interface PieceHuntStep {
  /** Grid cells to outline ([row, col], 1-indexed). */
  highlightCells: Array<[number, number]>
  highlightColor: string
  /** Running tally shown beside the grid, e.g. "Piece 1: 2". */
  tally: string
  caption: string
  hold: number
  result: boolean
}

export interface PieceHuntStoryboard {
  steps: PieceHuntStep[]
  finalIndex: number
}

export function buildPieceHunt20Steps(lang: Lang): PieceHuntStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const p1 = (n: number) => t(`Piece 1: ${n}`, `Potongan 1: ${n}`)
  const p2 = (n: number) => t(`Piece 2: ${n}`, `Potongan 2: ${n}`)

  const steps: PieceHuntStep[] = [
    {
      highlightCells: [],
      highlightColor: PIECE1_COLOR,
      tally: '',
      hold: 1700,
      result: false,
      caption: t(
        'Hunt each piece in the grid — pieces may be turned!',
        'Cari tiap potongan di dalam kotak — potongan boleh diputar!',
      ),
    },
    {
      highlightCells: [
        [2, 1],
        [2, 2],
      ],
      highlightColor: PIECE1_COLOR,
      tally: p1(1),
      hold: 1900,
      result: false,
      caption: t(
        'Piece 1: the middle-left pink has a white on its right. Found one!',
        'Potongan 1: merah muda kiri-tengah punya putih di kanannya. Ketemu satu!',
      ),
    },
    {
      highlightCells: [
        [3, 3],
        [3, 2],
      ],
      highlightColor: PIECE1_COLOR,
      tally: p1(2),
      hold: 2000,
      result: false,
      caption: t(
        'Turn it around: the bottom-right pink has a white on its left. Piece 1 appears 2 times.',
        'Putar: merah muda kanan-bawah punya putih di kirinya. Potongan 1 muncul 2 kali.',
      ),
    },
    {
      highlightCells: [
        [2, 3],
        [2, 2],
        [3, 2],
      ],
      highlightColor: PIECE2_COLOR,
      tally: p2(1),
      hold: 2000,
      result: false,
      caption: t(
        'Piece 2, turned: black on the right edge, whites to its left and below-left. Found one!',
        'Potongan 2, diputar: hitam di tepi kanan, putih di kiri dan kiri-bawahnya. Ketemu satu!',
      ),
    },
    {
      highlightCells: [
        [2, 3],
        [1, 2],
        [1, 3],
      ],
      highlightColor: PIECE2_COLOR,
      tally: p2(2),
      hold: 2000,
      result: false,
      caption: t(
        'Same black circle, turned again: the two whites above it fit too!',
        'Lingkaran hitam yang sama, diputar lagi: dua putih di atasnya juga pas!',
      ),
    },
    {
      highlightCells: [
        [3, 1],
        [3, 2],
        [2, 2],
      ],
      highlightColor: PIECE2_COLOR,
      tally: p2(3),
      hold: 2100,
      result: false,
      caption: t(
        'Bottom-left black: white beside it and white above that. Piece 2 appears 3 times.',
        'Hitam kiri-bawah: putih di sampingnya dan putih di atasnya. Potongan 2 muncul 3 kali.',
      ),
    },
    {
      highlightCells: [],
      highlightColor: PIECE2_COLOR,
      tally: t('2 + 3', '2 + 3'),
      hold: 0,
      result: true,
      caption: t('Piece 1 + Piece 2 = 2 + 3 = 5.', 'Potongan 1 + Potongan 2 = 2 + 3 = 5.'),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
