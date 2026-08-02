import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { askClause, evalPhrase, ruleSentence, shapeName, solve, type Params } from './index.js'

// Authored decomposition of a growing-figure question. One idea carries all
// three ask forms: the drawn pictures are not the puzzle, they are the EVIDENCE.
// The child measures them, reads off how picture n is built, and then the rule
// answers a question about a picture nobody drew.
//
// Every phrase below is assembled from the very same sentences `render` builds
// the body from, so each `phrase_*` is an exact substring of the DISPLAY body
// (the body after `stripSectionLabels` drops the "Find:" / "Cari:" markers).
// Nothing here spans that marker, and no two phrases overlap.
export function buildGrowingFigureNthTermBreakdown(params: Params): Breakdown {
  const { shape, height, shownCount, ask, targetIndex, secondIndex } = params
  const s = solve(params)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: `Pictures 1 to ${shownCount}`,
      phrase_id: `Gambar ke-1 sampai gambar ke-${shownCount}`,
      note_en: `Find them in the drawing first, left to right. They are the only pictures you can count — everything else has to come from the rule.`,
      note_id: `Temukan dulu di gambar, dari kiri ke kanan. Hanya gambar-gambar inilah yang bisa dihitung — sisanya harus datang dari aturan.`,
    },
    {
      category: 'fact',
      phrase_en: 'built from small squares',
      phrase_id: 'disusun dari persegi kecil',
      note_en: `So "how big" always means "how many small squares". Count each drawn picture and write the numbers down: ${s.shown.join(', ')}.`,
      note_id: `Jadi "sebesar apa" selalu berarti "berapa banyak persegi kecil". Hitung tiap gambar yang ada lalu tulis bilangannya: ${s.shown.join(', ')}.`,
    },
    {
      category: 'condition',
      phrase_en: 'in the same way',
      phrase_id: 'dengan cara yang sama',
      note_en: `The growing move never changes, so one rule covers every picture. Look at HOW the ${shapeName(shape, height, 'en')} is built, not just at the numbers.`,
      note_id: `Cara tumbuhnya tidak pernah berubah, jadi satu aturan berlaku untuk semua gambar. Lihat BAGAIMANA ${shapeName(shape, height, 'id')} itu dibangun, bukan cuma bilangannya.`,
    },
    {
      category: 'condition',
      phrase_en: 'the pattern keeps going',
      phrase_id: 'polanya terus berlanjut',
      note_en: `Picture ${targetIndex} really exists — it is just not drawn. You reach it with the rule, not by counting.`,
      note_id: `Gambar ke-${targetIndex} itu benar-benar ada — hanya saja tidak digambar. Kamu sampai ke sana lewat aturan, bukan dengan menghitung.`,
    },
    {
      category: 'question',
      phrase_en: askClause(params, s.targetCount, 'en'),
      phrase_id: askClause(params, s.targetCount, 'id'),
      note_en:
        ask === 'count-at-n'
          ? `A number of squares is wanted, not a picture number.`
          : ask === 'n-where-count-is'
            ? `A picture NUMBER is wanted, not a number of squares — the rule has to be run backwards.`
            : `The gap between two pictures is wanted, so work out both of them and take one away from the other.`,
      note_id:
        ask === 'count-at-n'
          ? `Yang diminta banyaknya persegi, bukan nomor gambarnya.`
          : ask === 'n-where-count-is'
            ? `Yang diminta NOMOR gambarnya, bukan banyaknya persegi — aturannya harus dijalankan mundur.`
            : `Yang diminta selisih dua gambar, jadi hitung keduanya lalu kurangkan.`,
    },
  ]

  const quantities: BreakdownQuantity[] = [
    {
      label_en: 'Shape that grows',
      label_id: 'Bentuk yang bertumbuh',
      value: shapeName(shape, height, 'id'),
    },
    {
      label_en: 'Squares in each drawn picture',
      label_id: 'Banyak persegi tiap gambar yang ada',
      value: s.shown.map((v, i) => `${i + 1} → ${v}`).join(', '),
    },
    {
      label_en: 'Jumps between them',
      label_id: 'Lompatan antar gambar',
      value: s.jumps.join(', '),
    },
    {
      label_en: 'Do the jumps stay the same?',
      label_id: 'Apakah lompatannya tetap?',
      value: s.sameJump
        ? `ya, selalu ${s.jumps[0]}`
        : s.jumpGrowth === null
          ? 'tidak'
          : `tidak, tiap lompatan naik ${s.jumpGrowth}`,
    },
    {
      label_en: 'Rule for picture n',
      label_id: 'Aturan untuk gambar ke-n',
      value: ruleSentence(shape, height, 'id'),
    },
    {
      label_en: 'Picture asked about',
      label_id: 'Gambar yang ditanyakan',
      value:
        ask === 'difference-between-two'
          ? `ke-${targetIndex} dan ke-${secondIndex}`
          : ask === 'n-where-count-is'
            ? `yang punya ${s.targetCount} persegi`
            : `ke-${targetIndex}`,
    },
    {
      label_en: 'Rule used on it',
      label_id: 'Aturan dipakai di situ',
      value:
        ask === 'difference-between-two'
          ? `${evalPhrase(shape, height, targetIndex, 'id')}; ${evalPhrase(shape, height, secondIndex, 'id')}`
          : evalPhrase(shape, height, targetIndex, 'id'),
    },
    { label_en: 'Answer', label_id: 'Jawaban', value: s.answer },
  ]

  const lastJump = s.jumps[s.jumps.length - 1]
  // What reading the build gives instead, phrased for the ask that was made.
  const right_en =
    ask === 'count-at-n'
      ? `picture ${targetIndex} holds ${evalPhrase(shape, height, targetIndex, 'en')} squares`
      : ask === 'n-where-count-is'
        ? `${evalPhrase(shape, height, targetIndex, 'en')} squares, so ${s.targetCount} squares is picture ${targetIndex}`
        : `${evalPhrase(shape, height, targetIndex, 'en')} and ${evalPhrase(shape, height, secondIndex, 'en')}`
  const right_id =
    ask === 'count-at-n'
      ? `gambar ke-${targetIndex} berisi ${evalPhrase(shape, height, targetIndex, 'id')} persegi`
      : ask === 'n-where-count-is'
        ? `${evalPhrase(shape, height, targetIndex, 'id')} persegi, jadi ${s.targetCount} persegi ada di gambar ke-${targetIndex}`
        : `${evalPhrase(shape, height, targetIndex, 'id')} dan ${evalPhrase(shape, height, secondIndex, 'id')}`

  return {
    // The growing figure only exists as a picture; the stem states that a rule
    // exists, the drawing carries the evidence for which rule it is — exactly
    // how the WMI papers this concept is mined from present it.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'growing-figure-nth-term',
      name_en: 'Count the drawn pictures, read the rule off the build, then use it far ahead',
      name_id: 'Hitung gambar yang ada, baca aturannya dari cara membangunnya, lalu pakai jauh ke depan',
    },
    // Only a pattern whose jumps are still growing has a genuinely tempting wrong
    // answer: keeping the last jump going forever.
    trap:
      s.trap === null
        ? null
        : {
            wrong: s.trap,
            why_en: `${s.trap} comes from adding ${lastJump} again and again, as if the jump never changed. But the jumps go ${s.jumps.join(', ')} — they keep growing. Reading the build instead gives ${right_en}, and the answer is ${s.answer}.`,
            why_id: `${s.trap} muncul karena ${lastJump} ditambahkan berulang-ulang, seolah-olah lompatannya tidak pernah berubah. Padahal lompatannya ${s.jumps.join(', ')} — terus membesar. Kalau cara membangunnya yang dibaca, hasilnya ${right_id}, dan jawabannya ${s.answer}.`,
          },
    answer: {
      form: 'number',
      unit: null,
      value: s.answer,
    },
    vocab: [],
  }
}
