import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import {
  analyse,
  askClause,
  cellName,
  chaptersOf,
  MARK_GLYPH,
  MARK_LETTERS,
  moveHighlight,
  trapAnswer,
  type Params,
} from './index.js'

// Authored decomposition of the visit-every-square route. One idea carries all
// three ask forms: "exactly once" is not a wish, it is a constraint that keeps
// deciding the next hop for you. A square with a single unvisited neighbour must
// be entered now; a turn that would strand a square behind the rabbit was never
// a turn. Everything else in the stem exists to say which squares are stones and
// where the marks sit.
//
// Every phrase below is lifted from the very sentences `render` builds the body
// from, so each `phrase_*` is an exact substring of the DISPLAY body (the body
// after `stripSectionLabels` drops the "Find:" / "Cari:" markers). Nothing here
// spans that marker and no two phrases overlap.
export function buildVisitAllCellsPathBreakdown(params: Params): Breakdown {
  const a = analyse(params)
  const trap = trapAnswer(params, a)
  const chapters = chaptersOf(a.trace)
  const forcedRun = chapters.find((ch) => ch.kind === 'run') ?? null
  const firstFork = chapters.find((ch) => ch.kind === 'eliminate') ?? null

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: 'the green square',
      phrase_id: 'petak hijau',
      note_en: `Find it in the picture first — it is ${cellName(params.start, 'en')}, and it already counts as square 1.`,
      note_id: `Temukan dulu di gambar — letaknya ${cellName(params.start, 'id')}, dan petak itu sudah terhitung sebagai petak ke-1.`,
    },
    {
      category: 'fact',
      phrase_en: moveHighlight(params.step, 'en'),
      phrase_id: moveHighlight(params.step, 'id'),
      note_en:
        params.step === 'knight'
          ? 'An L-shaped jump, exactly like a chess knight. It may hop right over a stone — only the square it lands on has to be free.'
          : 'No diagonals. From any square there are at most four places to go, and usually fewer.',
      note_id:
        params.step === 'knight'
          ? 'Lompatan berbentuk huruf L, persis kuda catur. Ia boleh melompati batu — yang penting petak pendaratannya kosong.'
          : 'Tidak boleh menyerong. Dari satu petak paling banyak ada empat tujuan, biasanya malah lebih sedikit.',
    },
    {
      category: 'fact',
      phrase_en: 'The blue squares are stones',
      phrase_id: 'Petak biru adalah batu',
      note_en: `There ${params.blocked.length === 1 ? 'is 1 stone' : `are ${params.blocked.length} stones`}, so only ${a.free.length} squares are left to cover.`,
      note_id: `Ada ${params.blocked.length} batu, jadi tinggal ${a.free.length} petak yang harus didatangi.`,
    },
    {
      category: 'condition',
      phrase_en: 'every square that is not a stone exactly once',
      phrase_id: 'setiap petak yang bukan batu tepat satu kali',
      note_en:
        'This is the rule that does the work. Never twice — so a square with only one unvisited neighbour left has to be entered right now, before that neighbour is used up.',
      note_id:
        'Inilah aturan yang bekerja. Tidak boleh dua kali — jadi petak yang tetangganya tinggal satu harus dimasuki sekarang juga, sebelum tetangga itu terpakai.',
    },
    {
      category: 'question',
      phrase_en: askClause(params.ask, 'en'),
      phrase_id: askClause(params.ask, 'id'),
      note_en:
        params.ask === 'value-at-marked-cell'
          ? 'Count squares, not hops: the rabbit is already standing on square 1 before it moves at all.'
          : params.ask === 'visit-order-of-marked-cells'
            ? 'The letters on the picture are just names. Their order in the answer comes from the route, not from where they sit.'
            : 'Not the shortest route and not the best one — how many complete routes there are altogether.',
      note_id:
        params.ask === 'value-at-marked-cell'
          ? 'Yang dihitung petak, bukan lompatan: sebelum bergerak pun kelinci sudah berdiri di petak ke-1.'
          : params.ask === 'visit-order-of-marked-cells'
            ? 'Huruf di gambar cuma nama. Urutannya di jawaban ditentukan rute, bukan letak hurufnya.'
            : 'Bukan rute terpendek dan bukan rute terbaik — melainkan ada berapa rute utuh seluruhnya.',
    },
  ]

  const markSpeech =
    params.ask === 'value-at-marked-cell'
      ? `${MARK_GLYPH} ${cellName(params.marks[0], 'en')}`
      : params.ask === 'visit-order-of-marked-cells'
        ? params.marks.map((cell, i) => `${MARK_LETTERS[i]} ${cellName(cell, 'en')}`).join(', ')
        : '—'
  const quantities: BreakdownQuantity[] = [
    { label_en: 'Board', label_id: 'Papan', value: `${params.rows} × ${params.cols}` },
    {
      label_en: 'Stones',
      label_id: 'Batu',
      value: params.blocked.map((cell) => cellName(cell, 'en')).join(', '),
    },
    { label_en: 'Squares to cover', label_id: 'Petak yang harus didatangi', value: String(a.free.length) },
    { label_en: 'Start', label_id: 'Petak awal', value: cellName(params.start, 'en') },
    { label_en: 'Marked squares', label_id: 'Petak bertanda', value: markSpeech },
    {
      label_en: 'First forced run',
      label_id: 'Rangkaian wajib pertama',
      value: forcedRun
        ? `${cellName(forcedRun.steps[0].from, 'en')} → ${cellName(forcedRun.steps[forcedRun.steps.length - 1].to, 'en')}`
        : '—',
    },
    {
      label_en: 'First real fork',
      label_id: 'Persimpangan pertama',
      value: firstFork ? cellName(firstFork.steps[0].from, 'en') : '—',
    },
    {
      label_en: 'Complete routes',
      label_id: 'Rute utuh',
      value: String(a.count),
    },
    {
      label_en: 'Route order',
      label_id: 'Urutan rute',
      value: a.route.length === 0 ? '—' : a.route.map((cell) => cellName(cell, 'en')).join(' → '),
    },
    { label_en: 'Answer', label_id: 'Jawaban', value: a.answer },
  ]

  return {
    // The board only exists as a picture: which squares are stones, where the
    // rabbit sits, where the marks are. The stem states the rules, the figure
    // carries the layout — exactly how the WMI papers this concept is mined
    // from present it.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'visit-all-cells-path',
      name_en: 'Take the hops that have no alternative, and refuse the turns that strand a square',
      name_id: 'Ambil lompatan yang tidak ada pilihan lain, dan tolak belokan yang meninggalkan petak',
    },
    trap:
      trap === null
        ? null
        : params.ask === 'value-at-marked-cell'
          ? {
              wrong: trap,
              why_en: `${trap} counts the hops instead of the squares. The rabbit is on square 1 before it jumps at all, so the ${trap} hops that reach the mark land it on square ${a.answer}.`,
              why_id: `${trap} menghitung lompatannya, bukan petaknya. Sebelum melompat pun kelinci sudah di petak ke-1, jadi ${trap} lompatan menuju tanda itu berhenti di petak ke-${a.answer}.`,
            }
          : {
              wrong: trap,
              why_en: `${trap} is the order the letters are printed on the board, left to right. The rabbit does not visit them in that order — trace the route and it reaches them ${a.visitOrderLetters.join('')}.`,
              why_id: `${trap} adalah urutan huruf yang tercetak di papan dari kiri ke kanan. Kelinci tidak mendatanginya dengan urutan itu — telusuri rutenya dan urutannya ${a.visitOrderLetters.join('')}.`,
            },
    // Two asks answer with a count; the third answers with three letters typed
    // in route order. `Breakdown` has no plain-text form, so that one is filed
    // as 'unit' with no unit — it is metadata only, nothing renders off it.
    answer: {
      form: params.ask === 'visit-order-of-marked-cells' ? 'unit' : 'number',
      unit: null,
      value: a.answer,
    },
    vocab: [],
  }
}
