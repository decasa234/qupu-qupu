import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import {
  CHOICE_LABELS,
  VIEW_WORD_EN,
  VIEW_WORD_ID,
  columnHeights,
  flatKey,
  plural,
  projectVoxels,
  solve,
  type Params,
  type Solution,
} from './index.js'

// Authored decomposition of a views-of-a-solid problem. One idea carries all
// three ask forms: a flat view is a SHADOW of the pile along one direction, so
// it throws away everything that hides behind something else — which is why a
// view can never be read as a count, and why a count can never be read off a
// view unless the view carries the stack numbers.
//
// Every phrase is assembled from the same params the body is assembled from, so
// each `phrase_*` is an exact substring of the DISPLAY body (the body after
// `stripSectionLabels` drops the "Find:" / "Cari:" marker). No phrase spans that
// marker and no two phrases overlap.

/**
 * The misconception behind `which-view`: read only the row of stacks nearest to
 * you and ignore what stands behind it. It is only offered as a trap when that
 * careless reading really is one of the four pictures on screen — otherwise
 * naming it would be pointing at an answer the child cannot pick.
 */
function nearRowTrapLabel(params: Params, s: Solution): string | null {
  if (params.view === 'top') return null // looking down, the near layer IS the whole view
  const near =
    params.view === 'front'
      ? s.cubes.filter((c) => c.y === 0)
      : s.cubes.filter((c) => c.x === s.solid.width - 1)
  if (near.length === 0) return null
  const flat = projectVoxels(near, params.view, s.frame)
  const key = flatKey(flat)
  if (key === flatKey(s.truth)) return null
  const at = s.options.findIndex((option) => flatKey(option) === key)
  return at >= 0 ? CHOICE_LABELS[at] : null
}

export function buildViewsOfSolidBreakdown(params: Params): Breakdown {
  const s = solve(params)
  const { ask, view, layer } = params
  const highlights: BreakdownHighlight[] = []
  const quantities: BreakdownQuantity[] = []

  if (ask === 'which-view') {
    highlights.push({
      category: 'fact',
      phrase_en: plural(s.total, 'unit cube', 'unit cubes'),
      phrase_id: `${s.total} kubus satuan`,
      note_en: `${s.total} cubes are stacked on ${plural(s.stacks.length, 'floor square', 'floor squares')}. The flat picture will show fewer squares than that, because stacks hide behind each other.`,
      note_id: `${s.total} kubus ditumpuk di ${s.stacks.length} kotak lantai. Gambar datarnya akan punya kotak lebih sedikit, karena tumpukan saling menutupi.`,
    })
    highlights.push({
      category: 'condition',
      phrase_en: 'Every stack sits on the floor with no gaps',
      phrase_id: 'Setiap tumpukan berdiri dari lantai tanpa rongga',
      note_en: 'No cube floats and no stack is hollow, so seeing the top of a stack tells you the whole stack.',
      note_id: 'Tidak ada kubus melayang dan tidak ada tumpukan berongga, jadi melihat puncak tumpukan sudah cukup untuk tahu seluruh tumpukannya.',
    })
    if (view === 'top') {
      highlights.push({
        category: 'object',
        phrase_en: 'the bottom edge of the picture is the front',
        phrase_id: 'sisi bawah gambar adalah bagian depan',
        note_en: 'Find the front row first — the row nearest you in the drawing is the bottom row of the flat picture.',
        note_id: 'Cari baris depan dulu — baris yang paling dekat denganmu di gambar adalah baris paling bawah pada gambar datarnya.',
      })
    }
    highlights.push({
      category: 'question',
      phrase_en: `Which picture shows the solid seen from the ${VIEW_WORD_EN[view]}?`,
      phrase_id: `Gambar manakah yang menunjukkan bangun itu dilihat dari ${VIEW_WORD_ID[view]}?`,
      note_en:
        view === 'top'
          ? 'A square is filled when a cube stands on it. How tall the stack is does not show from up here.'
          : `Each column of the picture is as tall as the TALLEST stack lined up behind it, not as tall as the nearest one.`,
      note_id:
        view === 'top'
          ? 'Sebuah kotak terisi kalau ada kubus berdiri di situ. Tinggi tumpukannya tidak terlihat dari atas.'
          : `Tiap kolom gambar setinggi tumpukan PALING TINGGI yang berjajar di belakangnya, bukan setinggi tumpukan terdepan.`,
    })
  } else if (ask === 'cubes-per-layer') {
    highlights.push({
      category: 'object',
      phrase_en: 'unit cubes',
      phrase_id: 'kubus satuan',
      note_en: 'Every cube is the same size, so a stack of 3 reaches exactly 3 layers up.',
      note_id: 'Semua kubus sama besar, jadi tumpukan 3 kubus mencapai tepat 3 tingkat.',
    })
    highlights.push({
      category: 'condition',
      phrase_en: 'Every stack sits on the floor with no gaps',
      phrase_id: 'Setiap tumpukan berdiri dari lantai tanpa rongga',
      note_en: 'A stack never starts halfway up, so a stack that is tall enough puts a cube in every layer below its top.',
      note_id: 'Tumpukan tidak pernah mulai di tengah, jadi tumpukan yang cukup tinggi mengisi setiap tingkat di bawah puncaknya.',
    })
    highlights.push({
      category: 'fact',
      phrase_en: 'the layers are counted from the floor up',
      phrase_id: 'tingkat dihitung dari lantai ke atas',
      note_en: 'Layer 1 is the one touching the floor, layer 2 sits on top of it, and so on.',
      note_id: 'Tingkat 1 adalah yang menempel lantai, tingkat 2 di atasnya, begitu seterusnya.',
    })
    highlights.push({
      category: 'question',
      phrase_en: `How many cubes are in layer ${layer} of the solid?`,
      phrase_id: `Ada berapa kubus di tingkat ke-${layer} bangun itu?`,
      note_en: `Count the stacks that are AT LEAST ${layer} cubes tall — each of those puts exactly one cube in layer ${layer}.`,
      note_id: `Hitung tumpukan yang tingginya PALING SEDIKIT ${layer} kubus — masing-masing menyumbang tepat satu kubus di tingkat ke-${layer}.`,
    })
  } else {
    highlights.push({
      category: 'object',
      phrase_en: 'the top view of a solid built from cubes',
      phrase_id: 'tampak atas sebuah bangun dari kubus',
      note_en: 'You are looking straight down on the pile, so you see its floor squares, not its height.',
      note_id: 'Kamu melihat tumpukan itu lurus dari atas, jadi yang terlihat kotak lantainya, bukan tingginya.',
    })
    highlights.push({
      category: 'condition',
      phrase_en: 'the bottom edge of the picture is the front',
      phrase_id: 'sisi bawah gambar adalah bagian depan',
      note_en: 'The bottom row of squares is the row nearest you; the top row is furthest away.',
      note_id: 'Baris kotak paling bawah adalah baris yang paling dekat denganmu; baris paling atas paling jauh.',
    })
    highlights.push({
      category: 'fact',
      phrase_en: 'The number in each square tells how many cubes are stacked on that square',
      phrase_id: 'Angka di setiap kotak memberi tahu berapa kubus ditumpuk di kotak itu',
      note_en: `The numbers are the height of each hidden stack — that is the only way a flat picture can carry a cube count.`,
      note_id: `Angka itu tinggi tiap tumpukan yang tidak terlihat — hanya dengan angka itulah gambar datar bisa memberi tahu jumlah kubus.`,
    })
    highlights.push({
      category: 'question',
      phrase_en: 'How many cubes are there altogether?',
      phrase_id: 'Ada berapa kubus seluruhnya?',
      note_en: `Add the ${s.footprint} numbers, not the ${s.footprint} squares.`,
      note_id: `Jumlahkan ${s.footprint} angkanya, bukan ${s.footprint} kotaknya.`,
    })
  }

  quantities.push(
    {
      label_en: 'Floor squares',
      label_id: 'Kotak lantai',
      value: `${s.solid.width} × ${s.solid.depth} = ${s.footprint}`,
    },
    {
      label_en: 'Stack heights (front row first)',
      label_id: 'Tinggi tumpukan (baris depan dulu)',
      value: s.rows.map((row) => row.join(', ')).join(' / '),
    },
    { label_en: 'Cubes in the solid', label_id: 'Kubus dalam bangun', value: String(s.total) },
  )

  if (ask === 'which-view') {
    quantities.push({
      label_en: 'Seen from',
      label_id: 'Dilihat dari',
      value: VIEW_WORD_EN[view],
    })
    quantities.push(
      view === 'top'
        ? {
            label_en: 'Squares filled in the view',
            label_id: 'Kotak terisi pada tampakannya',
            value: String(s.truth.cells.filter(Boolean).length),
          }
        : {
            label_en: 'Column heights of the view',
            label_id: 'Tinggi kolom tampakannya',
            value: columnHeights(s.truth).join(', '),
          },
    )
  } else if (ask === 'cubes-per-layer') {
    quantities.push({ label_en: 'Layer asked for', label_id: 'Tingkat yang ditanya', value: String(layer) })
    quantities.push({
      label_en: `Stacks at least ${layer} tall`,
      label_id: `Tumpukan setinggi minimal ${layer}`,
      value: String(s.layerCount),
    })
  } else {
    quantities.push({
      label_en: 'Row totals',
      label_id: 'Jumlah tiap baris',
      value: `${s.rowTotals.join(' + ')} = ${s.total}`,
    })
  }
  quantities.push({ label_en: 'Answer', label_id: 'Jawaban', value: s.answer })

  // Traps — only ever a wrong answer the child could actually give here.
  let trap: Breakdown['trap'] = null
  if (ask === 'which-view') {
    const label = nearRowTrapLabel(params, s)
    if (label) {
      trap = {
        wrong: label,
        why_en: `Picture ${label} is what you get by drawing only the row of stacks nearest you and forgetting the ones behind. A stack behind a short one still sticks up over it, so the real view is picture ${s.answerLabel}.`,
        why_id: `Gambar ${label} adalah hasil menggambar hanya barisan tumpukan yang paling dekat dan melupakan yang di belakangnya. Tumpukan di belakang yang lebih tinggi tetap muncul di atas yang pendek, jadi tampakan yang benar adalah gambar ${s.answerLabel}.`,
      }
    }
  } else if (ask === 'cubes-per-layer' && s.exactLayerCount !== s.layerCount) {
    trap = {
      wrong: String(s.exactLayerCount),
      why_en: `Only ${plural(s.exactLayerCount, 'stack is', 'stacks are')} exactly ${layer} cubes tall, but a taller stack passes THROUGH layer ${layer} on its way up and leaves a cube there too. Counting every stack at least ${layer} tall gives ${s.layerCount}.`,
      why_id: `Memang hanya ${s.exactLayerCount} tumpukan yang tingginya tepat ${layer} kubus, tetapi tumpukan yang lebih tinggi juga MELEWATI tingkat ke-${layer} dan meninggalkan satu kubus di situ. Menghitung semua tumpukan setinggi minimal ${layer} memberi ${s.layerCount}.`,
    }
  } else if (ask === 'count-blocks' && s.footprint !== s.total) {
    trap = {
      wrong: String(s.footprint),
      why_en: `There are ${s.footprint} squares, but a square is a floor space, not a cube — the number written on it says how many cubes stand there. Adding the numbers gives ${s.total}.`,
      why_id: `Kotaknya memang ${s.footprint}, tetapi kotak itu tempat di lantai, bukan kubus — angka di atasnya yang memberi tahu berapa kubus berdiri di situ. Menjumlahkan angkanya memberi ${s.total}.`,
    }
  }

  return {
    // The pile (or its numbered plan) cannot be described in words a 7-year-old
    // would rebuild the same way twice, so this concept always draws.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'views-of-solid',
      name_en:
        ask === 'count-blocks'
          ? 'Add the stack numbers on the plan'
          : ask === 'cubes-per-layer'
            ? 'Count the stacks tall enough to reach the layer'
            : 'Flatten the pile one direction at a time',
      name_id:
        ask === 'count-blocks'
          ? 'Jumlahkan angka tumpukan pada denah'
          : ask === 'cubes-per-layer'
            ? 'Hitung tumpukan yang cukup tinggi untuk mencapai tingkat itu'
            : 'Pipihkan tumpukan satu arah demi satu arah',
    },
    trap,
    answer: {
      form: ask === 'which-view' ? 'choice' : 'number',
      unit: null,
      value: s.answer,
    },
    vocab: [],
  }
}
