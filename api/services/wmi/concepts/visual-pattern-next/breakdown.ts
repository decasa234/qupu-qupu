import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { AttrItem, Params } from './index.js'

const SHAPES = ['circle', 'triangle', 'square', 'star'] as const
const ICON: Record<string, string> = { circle: '○', triangle: '△', square: '□', star: '☆' }

// ── Display helpers ───────────────────────────────────────────────────────────

function attrLabel(item: AttrItem): string {
  return `${item.colour} ${ICON[item.shape]}`
}

// ── Authored decomposition ────────────────────────────────────────────────────
//
// visual-pattern-next: a row of shapes/colour+shape repeats a short cycle and
// ends in "?" — pick the item that comes next.
//
// All highlight phrases MUST be exact substrings of the display body produced
// by render(). The body format is (after stripSectionLabels removes "Find:" /
// "Cari:" prefixes):
//
//   simple/long-cycle:
//     EN: "<row> ?\nWhich picture comes next?"
//     ID: "<row> ?\nGambar apa berikutnya?"
//
//   two-attr:
//     EN: "<row>  ?\nWhich picture-and-colour comes next?"
//     ID: "<row>  ?\nGambar dan warna apa berikutnya?"
//
// The cycleIcons / cycleText span always starts the row, so it is a substring
// of the body in all languages.

export function buildVisualPatternNextBreakdown(params: Params): Breakdown {
  if (params.mode === 'simple' || params.mode === 'long-cycle') {
    const cycleIcons = params.cycle.map((s) => ICON[s]).join(' ')
    const ansShape = params.cycle[params.shown % params.cycle.length]
    const ansLabel = ['A', 'B', 'C', 'D'][SHAPES.indexOf(ansShape as (typeof SHAPES)[number])]

    const highlights: BreakdownHighlight[] = [
      {
        category: 'condition',
        phrase_en: cycleIcons,
        phrase_id: cycleIcons,
        note_en: `These ${params.cycle.length} picture(s) repeat in order.`,
        note_id: `${params.cycle.length} gambar ini berulang secara berurutan.`,
      },
      {
        category: 'fact',
        phrase_en: '?',
        phrase_id: '?',
        note_en: 'The "?" is the empty spot you must fill.',
        note_id: 'Tanda "?" adalah tempat kosong yang harus kamu isi.',
      },
      {
        category: 'question',
        phrase_en: 'Which picture comes next',
        phrase_id: 'Gambar apa berikutnya',
        note_en: 'Continue the cycle to find the next picture.',
        note_id: 'Lanjutkan pola siklusnya untuk menemukan gambar berikutnya.',
      },
    ]

    return {
      needsVisual: false,
      highlights,
      quantities: [
        { label_en: 'Cycle', label_id: 'Siklus', value: cycleIcons },
        { label_en: 'Pictures shown', label_id: 'Gambar tampil', value: String(params.shown) },
        {
          label_en: 'Cycle index of next',
          label_id: 'Indeks siklus berikutnya',
          value: String(params.shown % params.cycle.length),
        },
        { label_en: 'Answer', label_id: 'Jawaban', value: ansLabel },
      ],
      strategy: {
        conceptSlug: 'visual-pattern-next',
        name_en: 'find the repeat',
        name_id: 'temukan pola berulang',
      },
      trap:
        params.mode === 'long-cycle'
          ? {
              wrong: ICON[params.cycle[params.cycle.length - 1]],
              why_en: `Don't just use the last picture shown — count through the full cycle from the start.`,
              why_id: `Jangan hanya gunakan gambar terakhir yang ditampilkan — hitung siklusnya dari awal.`,
            }
          : null,
      answer: {
        form: 'choice',
        unit: null,
        value: ansLabel,
      },
      vocab: [],
    }
  }

  // ── two-attr mode ─────────────────────────────────────────────────────────
  const cycle = params.cycle
  const correctItem = cycle[params.shown % cycle.length]
  const correctText = attrLabel(correctItem)
  const cycleText = cycle.map(attrLabel).join('  →  ')

  const highlights: BreakdownHighlight[] = [
    {
      category: 'condition',
      // The row always starts with the first cycle item's text, which is a
      // substring of both EN and ID bodies.
      phrase_en: attrLabel(cycle[0]),
      phrase_id: attrLabel(cycle[0]),
      note_en: `The pattern repeats ${cycle.length} colour+shape pairs in order.`,
      note_id: `Polanya mengulang ${cycle.length} pasangan warna+bentuk secara berurutan.`,
    },
    {
      category: 'fact',
      phrase_en: '?',
      phrase_id: '?',
      note_en: 'The "?" is the spot you must identify.',
      note_id: 'Tanda "?" adalah tempat yang harus kamu tentukan.',
    },
    {
      category: 'question',
      phrase_en: 'Which picture-and-colour comes next',
      phrase_id: 'Gambar dan warna apa berikutnya',
      note_en: 'You must match both shape AND colour to the cycle.',
      note_id: 'Kamu harus mencocokkan bentuk DAN warna sesuai siklusnya.',
    },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: 'Cycle', label_id: 'Siklus', value: cycleText },
      { label_en: 'Items shown', label_id: 'Item tampil', value: String(params.shown) },
      {
        label_en: 'Cycle index of next',
        label_id: 'Indeks siklus berikutnya',
        value: String(params.shown % cycle.length),
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: correctText },
    ],
    strategy: {
      conceptSlug: 'visual-pattern-next',
      name_en: 'find the repeat (shape + colour)',
      name_id: 'temukan pola berulang (bentuk + warna)',
    },
    trap: {
      wrong: attrLabel({ shape: correctItem.shape, colour: cycle[(params.shown + 1) % cycle.length].colour }),
      why_en: `Watch the colour too — the same shape can appear in different colours. You need the exact (shape, colour) pair at this cycle position.`,
      why_id: `Perhatikan warnanya juga — bentuk yang sama bisa muncul dengan warna berbeda. Kamu perlu pasangan (bentuk, warna) yang tepat di posisi siklus ini.`,
    },
    answer: {
      form: 'choice',
      unit: null,
      value: 'A', // correct is always placed first → label A
    },
    vocab: [],
  }
}
