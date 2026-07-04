import type { Breakdown, BreakdownHighlight } from '../types.js'
import { countByFormula, type Params } from './index.js'

// Authored decomposition of a painted-cube problem: a big cube is painted on
// all outer faces, cut into unit cubes, and the learner must count how many
// unit cubes land at a given painted-face count. Each phrase MUST be a
// substring of the rendered body.
export function buildPaintedCubeBreakdown(params: Params): Breakdown {
  const { n, k } = params
  const total = n ** 3
  const answer = countByFormula(n, k)

  const cubeSize = `${n}×${n}×${n}`

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: cubeSize,
      phrase_id: cubeSize,
      note_en: `The big cube is made of ${total} unit cubes stacked ${n} high, ${n} wide, ${n} deep.`,
      note_id: `Kubus besar terdiri dari ${total} kubus satuan yang disusun ${n} tinggi, ${n} lebar, ${n} dalam.`,
    },
    {
      category: 'condition',
      phrase_en: 'painted on all its outside faces',
      phrase_id: 'dicat pada semua sisi luarnya',
      note_en: 'Only the outer surface gets paint, before the cube is cut apart.',
      note_id: 'Hanya permukaan luar yang dicat, sebelum kubus dipotong-potong.',
    },
    {
      category: 'fact',
      phrase_en: `${total} small unit cubes`,
      phrase_id: `${total} kubus kecil satuan`,
      note_en: `Cutting the big cube gives ${n} × ${n} × ${n} = ${total} small cubes in total.`,
      note_id: `Memotong kubus besar menghasilkan ${n} × ${n} × ${n} = ${total} kubus kecil.`,
    },
    {
      category: 'question',
      phrase_en: `exactly ${k} painted ${k === 1 ? 'face' : 'faces'}`,
      phrase_id: `tepat ${k} sisi tercat`,
      note_en: 'Find how many small cubes have painted-face count exactly this many.',
      note_id: 'Cari berapa banyak kubus kecil yang jumlah sisi tercatnya sama persis dengan ini.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Cube size', label_id: 'Ukuran kubus', value: cubeSize },
      { label_en: 'Total small cubes', label_id: 'Total kubus kecil', value: String(total) },
      { label_en: 'Painted faces to count', label_id: 'Sisi tercat yang dicari', value: String(k) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'painted-cube-faces-count',
      name_en: 'Corners, edges, faces, inside',
      name_id: 'Sudut, rusuk, sisi, dalam',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
