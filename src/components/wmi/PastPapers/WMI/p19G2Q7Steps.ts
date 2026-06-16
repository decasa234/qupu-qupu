import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { NodeName } from './P19G2Q7Illustration'

// WMI-19P2A-Q7 — the trapezoid is cut by dashed lines into pieces; the question
// asks which TABLE of shape-counts (parallelogram / rectangle / trapezoid /
// triangle) is correct. The four option figures were count tables (not viewable),
// and the official answer is A.
//
// The explainer teaches the METHOD the seed's hint_steps name: take ONE shape kind
// at a time so nothing is double-counted, highlighting a genuine instance of each
// kind that exists in the drawn figure, then lands on "the matching table is A".
//
// Every highlighted piece below is a real region of P19G2Q7Illustration's lattice.

export type ShapeKind = 'triangle' | 'rectangle' | 'parallelogram' | 'trapezoid'

export interface Q7Step {
  /** Pieces tinted this beat (node-name polygons). Empty on intro / result. */
  shapes: NodeName[][]
  kind: ShapeKind | null
  caption: string
  hold: number
  result: boolean
}

export interface Q7Storyboard {
  answer: string
  steps: Q7Step[]
  finalIndex: number
}

export function buildP19G2Q7Steps(answer: string, lang: Lang): Q7Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const letter = (answer || 'A').trim().toUpperCase() || 'A'

  // Genuine pieces of the drawn figure, grouped by kind.
  const TRIANGLES: NodeName[][] = [
    ['R_BL', 'RBM', 'F_M'], // bottom-centre-left triangle
    ['R_BR', 'RBM', 'F_M'], // bottom-centre-right triangle
  ]
  const RECTANGLE: NodeName[][] = [['R_TL', 'R_TR', 'R_BR', 'R_BL']] // the central rectangle
  const TRAPEZOIDS: NodeName[][] = [
    ['TL', 'TR', 'R_TR', 'R_TL'], // top cap trapezoid
    ['TL', 'TR', 'BR', 'BL'], // the WHOLE outer trapezoid
  ]

  const steps: Q7Step[] = [
    {
      shapes: [],
      kind: null,
      hold: 2600,
      result: false,
      caption: t(
        'Trick: count ONE kind of shape at a time so you never lose track or double-count.',
        'Trik: hitung SATU jenis bentuk setiap kali agar tidak bingung atau menghitung dua kali.',
      ),
    },
    {
      shapes: TRIANGLES,
      kind: 'triangle',
      hold: 2200,
      result: false,
      caption: t(
        'Triangles first: the central line makes the two little triangles at the bottom.',
        'Segitiga dulu: garis tengah membentuk dua segitiga kecil di bagian bawah.',
      ),
    },
    {
      shapes: RECTANGLE,
      kind: 'rectangle',
      hold: 2200,
      result: false,
      caption: t(
        'Rectangles: only the box in the middle has four square corners.',
        'Persegi panjang: hanya kotak di tengah yang keempat sudutnya siku-siku.',
      ),
    },
    {
      shapes: RECTANGLE,
      kind: 'parallelogram',
      hold: 2400,
      result: false,
      caption: t(
        'Parallelograms: count shapes with both pairs of sides parallel — the middle box also counts here.',
        'Jajar genjang: hitung bentuk yang kedua pasang sisinya sejajar — kotak tengah ikut di sini.',
      ),
    },
    {
      shapes: TRAPEZOIDS,
      kind: 'trapezoid',
      hold: 2400,
      result: false,
      caption: t(
        'Trapezoids: just ONE pair of parallel sides — the top cap, and the whole big shape.',
        'Trapesium: hanya SATU pasang sisi sejajar — tutup atas, dan seluruh bentuk besarnya.',
      ),
    },
    {
      shapes: [],
      kind: null,
      hold: 0,
      result: true,
      caption: t(
        `Write the four counts in order and match the table — only Figure ${letter} agrees.`,
        `Tulis keempat jumlah berurutan dan cocokkan tabel — hanya Gambar ${letter} yang sesuai.`,
      ),
    },
  ]

  return { answer: letter, steps, finalIndex: steps.length - 1 }
}
