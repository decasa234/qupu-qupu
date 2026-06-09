import type { Breakdown, BreakdownHighlight } from '../types.js'
import { linesOfSymmetry, type Params } from './index.js'

// Bilingual labels for the shape, mirroring index.ts. Kept here so the
// breakdown's highlight phrases match the rendered body exactly (the shape name
// is inserted verbatim into both body_en and body_id).
const SHAPE_EN: Record<Params['kind'], string> = {
  'equilateral-triangle': 'equilateral triangle',
  'isosceles-triangle': 'isosceles triangle',
  rectangle: 'rectangle',
  square: 'square',
  'regular-pentagon': 'regular pentagon',
  'regular-hexagon': 'regular hexagon',
}

const SHAPE_ID: Record<Params['kind'], string> = {
  'equilateral-triangle': 'segitiga sama sisi',
  'isosceles-triangle': 'segitiga sama kaki',
  rectangle: 'persegi panjang',
  square: 'persegi',
  'regular-pentagon': 'segi lima beraturan',
  'regular-hexagon': 'segi enam beraturan',
}

// Why each shape has the number of fold lines it does — a short, kid-friendly
// reason that names the equal sides / vertices doing the work.
const WHY_EN: Record<Params['kind'], string> = {
  'equilateral-triangle': 'All 3 sides are equal, so a fold line runs from each corner to the opposite side: 3 lines.',
  'isosceles-triangle': 'Only the 2 slanted sides are equal, so just 1 fold line works — from the top corner down.',
  rectangle: 'Fold across the middle the long way and the short way — 2 lines. Corner-to-corner does not match.',
  square: 'Fold side-to-side 2 ways and corner-to-corner 2 ways: 4 lines.',
  'regular-pentagon': 'All 5 sides and corners are equal, so a fold line runs from each corner to the opposite side: 5 lines.',
  'regular-hexagon': 'All 6 sides are equal: 3 fold lines join opposite corners and 3 join opposite sides — 6 lines.',
}

const WHY_ID: Record<Params['kind'], string> = {
  'equilateral-triangle': 'Ketiga sisinya sama panjang, jadi garis lipat berjalan dari tiap sudut ke sisi di depannya: 3 garis.',
  'isosceles-triangle': 'Hanya 2 sisi miring yang sama panjang, jadi cuma 1 garis lipat yang cocok — dari sudut atas ke bawah.',
  rectangle: 'Lipat di tengah ke arah panjang dan ke arah pendek — 2 garis. Dari sudut ke sudut tidak cocok.',
  square: 'Lipat sisi ke sisi 2 cara dan sudut ke sudut 2 cara: 4 garis.',
  'regular-pentagon': 'Kelima sisi dan sudutnya sama, jadi garis lipat berjalan dari tiap sudut ke sisi di depannya: 5 garis.',
  'regular-hexagon': 'Keenam sisinya sama: 3 garis lipat menyambung sudut berhadapan dan 3 menyambung sisi berhadapan — 6 garis.',
}

// Authored decomposition of a symmetry-count problem: count the lines of
// symmetry (fold lines) of a regular-ish shape. Figure-heavy — the shape lives
// in the in-card illustration, so the highlights spotlight the stem words the
// kid reads: the shape name (which fixes the count) and the question itself.
// Each phrase MUST be an exact substring of the DISPLAY body (after
// stripSectionLabels removes "Find:" / "Cari:"; no glossary markup here).
export function buildSymmetryCountBreakdown(params: Params): Breakdown {
  const count = linesOfSymmetry(params)
  const shapeEn = SHAPE_EN[params.kind]
  const shapeId = SHAPE_ID[params.kind]

  const highlights: BreakdownHighlight[] = [
    // fact — look at the picture; the shape is drawn there
    {
      category: 'fact',
      phrase_en: 'figure',
      phrase_id: 'gambar',
      note_en: 'The shape is drawn in the picture — count its fold lines there.',
      note_id: 'Bangun digambar di gambar — hitung garis lipatnya di sana.',
    },
    // condition — the shape, which fixes the number of fold lines
    {
      category: 'condition',
      phrase_en: shapeEn,
      phrase_id: shapeId,
      note_en: WHY_EN[params.kind],
      note_id: WHY_ID[params.kind],
    },
    // question — what to count
    {
      category: 'question',
      phrase_en: 'How many lines of symmetry',
      phrase_id: 'Ada berapa garis simetri',
      note_en: 'A line of symmetry folds the shape so both halves match exactly. Count every fold that works.',
      note_id: 'Garis simetri melipat bangun sehingga kedua bagian cocok tepat. Hitung setiap lipatan yang berhasil.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Shape', label_id: 'Bangun', value: shapeEn },
      { label_en: 'Lines of symmetry', label_id: 'Garis simetri', value: String(count) },
    ],

    strategy: {
      conceptSlug: 'symmetry-count',
      name_en: 'Fold it in half',
      name_id: 'Lipat jadi dua',
    },

    // No single tempting wrong number across shapes — leave the trap off.
    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(count),
    },

    vocab: [],
  }
}
