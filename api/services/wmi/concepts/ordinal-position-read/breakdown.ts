import type { Breakdown, BreakdownHighlight, BreakdownQuantity, BreakdownTrap } from '../types.js'
import { cellLabel, derive, type AnchorView, type Params } from './index.js'

// Authored decomposition of an ordinal-position-read row problem. One idea sits
// under every ask: a place in a row only means something once you say WHICH END
// you are counting from. The highlights therefore spotlight (a) how long the row
// is, (b) each anchor's direction or landmark, and (c) what to do once you have
// landed.
//
// Every phrase below is built from the very strings `derive()` puts in the body,
// so they are exact substrings of the DISPLAY text (after stripSectionLabels
// drops "Cari:" / "Find:" and collapses the blank line) by construction.

/** Kid note explaining why this anchor is the hard part. */
function anchorNote(v: AnchorView, n: number, lang: 'en' | 'id'): string {
  const fromLeftPos = v.target + 1
  const fromRightPos = n - v.target
  if (v.anchor.type === 'from-right') {
    return lang === 'id'
      ? `Hitungan ke-1 ada di ujung KANAN. Dari kiri benda ini ada di urutan ke-${fromLeftPos}, jadi jangan hitung dari kiri.`
      : `Count number 1 sits at the RIGHT end. From the left this one is at place ${fromLeftPos}, so do not count from the left.`
  }
  if (v.anchor.type === 'from-left') {
    return lang === 'id'
      ? `Hitungan ke-1 ada di ujung KIRI. Benda yang sama ada di urutan ke-${fromRightPos} kalau dihitung dari kanan.`
      : `Count number 1 sits at the LEFT end. The same one is at place ${fromRightPos} counting from the right.`
  }
  if (v.anchor.type === 'neighbour-of') {
    return lang === 'id'
      ? `Temukan bendanya dulu (urutan ke-${v.anchor.marker + 1} dari kiri), lalu geser 1 tempat. Benda itu sendiri bukan jawabannya.`
      : `Find that item first (place ${v.anchor.marker + 1} from the left), then move one place. That item itself is not the answer.`
  }
  return lang === 'id'
    ? `Mulai dari urutan ke-${v.anchor.marker + 1} dari kiri, lalu melangkah ${v.anchor.step} tempat — bukan 1.`
    : `Start at place ${v.anchor.marker + 1} from the left, then take ${v.anchor.step} places — not 1.`
}

export function buildOrdinalPositionReadBreakdown(params: Params): Breakdown {
  const { kind, cells, ask } = params
  const d = derive(params)
  const n = d.n

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: d.fact_en,
      phrase_id: d.fact_id,
      note_en: `Count the row first: ${n} in all. Every "from the right" answer leans on this number.`,
      note_id: `Hitung dulu barisannya: ada ${n}. Setiap jawaban "dari kanan" bergantung pada angka ini.`,
    },
    ...d.views.map(
      (v): BreakdownHighlight => ({
        category: v.category,
        phrase_en: v.phrase_en,
        phrase_id: v.phrase_id,
        note_en: anchorNote(v, n, 'en'),
        note_id: anchorNote(v, n, 'id'),
      }),
    ),
    {
      category: 'question',
      phrase_en: d.question_en,
      phrase_id: d.question_id,
      note_en:
        ask === 'read'
          ? 'You are not counting how many — you are reading what is standing there.'
          : ask === 'which-option-contains-both'
            ? 'Land on both places first, then look for the option that names exactly those two.'
            : 'Land on both places first, then do the arithmetic with what you found.',
      note_id:
        ask === 'read'
          ? 'Kamu tidak diminta menghitung ada berapa — kamu diminta membaca apa yang berdiri di situ.'
          : ask === 'which-option-contains-both'
            ? 'Temukan dulu kedua tempatnya, baru cari pilihan yang menyebutkan tepat kedua benda itu.'
            : 'Temukan dulu kedua tempatnya, baru hitung dengan apa yang kamu temukan.',
    },
  ]

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Items in the row', label_id: 'Banyak benda di barisan', value: String(n) },
    ...d.views.map((v, i): BreakdownQuantity => {
      const which = d.views.length === 1 ? '' : ` ${i + 1}`
      return {
        label_en: `Place found${which} (from the left)`,
        label_id: `Urutan yang ditemukan${which} (dari kiri)`,
        value: String(v.target + 1),
      }
    }),
    ...d.views.map((v, i): BreakdownQuantity => {
      const which = d.views.length === 1 ? '' : ` ${i + 1}`
      return {
        label_en: `Item found${which}`,
        label_id: `Isi yang ditemukan${which}`,
        value: v.label_id,
      }
    }),
    { label_en: 'Answer', label_id: 'Jawaban', value: d.answer },
  ]

  const strategy: Breakdown['strategy'] = {
    conceptSlug: 'ordinal-position-read',
    name_en: 'Say which end first, then walk the row',
    name_id: 'Tentukan ujungnya dulu, baru telusuri barisannya',
  }

  // Only a real slip earns a trap. `derive` already refuses to name one when the
  // "wrong end" reading happens to land on the same item.
  let trap: BreakdownTrap = null
  if (d.trapValue !== null && d.trapValue !== d.answer) {
    const slip = d.views.find((v) => v.mistake !== v.target) ?? d.views[0]
    const wrongLabelId = cellLabel(cells[slip.mistake], kind, 'id')
    const wrongLabelEn = cellLabel(cells[slip.mistake], kind, 'en')
    const fromRight = slip.anchor.type === 'from-right'
    const landmark = slip.anchor.type === 'neighbour-of' || slip.anchor.type === 'offset-from-item'
    trap = {
      wrong: d.trapValue,
      why_en: fromRight
        ? `That is what you get counting from the LEFT: place ${slip.mistake + 1} from the left holds ${wrongLabelEn}. The question counts from the right, where ${slip.label_en} is standing.`
        : landmark
          ? `That is the landmark itself (or its nearest neighbour), ${wrongLabelEn}. Stepping the full distance lands on ${slip.label_en}.`
          : `That is what you get counting from the RIGHT: ${wrongLabelEn}. The question counts from the left, where ${slip.label_en} is standing.`,
      why_id: fromRight
        ? `Itu hasil kalau dihitung dari KIRI: urutan ke-${slip.mistake + 1} dari kiri berisi ${wrongLabelId}. Soal minta dari kanan, dan di situ berdiri ${slip.label_id}.`
        : landmark
          ? `Itu bendanya sendiri (atau tetangga terdekatnya), yaitu ${wrongLabelId}. Kalau melangkah sejauh yang diminta, kamu mendarat di ${slip.label_id}.`
          : `Itu hasil kalau dihitung dari KANAN: ${wrongLabelId}. Soal minta dari kiri, dan di situ berdiri ${slip.label_id}.`,
    }
  }

  return {
    needsVisual: true,
    highlights,
    quantities,
    strategy,
    trap,
    answer: {
      form: d.answer_type === 'multiple_choice' ? 'choice' : 'number',
      unit: null,
      value: d.answer,
    },
    vocab: [],
  }
}
