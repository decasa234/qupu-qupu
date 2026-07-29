import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { LABELS, derive, type Params } from './index.js'

// Authored decomposition of a length-measure-compare problem.
//
// The figure carries the data (a ruler with the object drawn on it, or a chain
// of repeated units), so the stem is short. Every highlight phrase is built from
// the SAME string pieces `derive()` assembles the body from, so each phrase is
// guaranteed to be an exact substring of the DISPLAY body (i.e. after
// stripSectionLabels removes "Find:" / "Cari:" and collapses the blank line).
//
// The real trap only exists on the offset ruler: the object does not start at 0,
// so the number under its right end is NOT its length. Reading that number (or
// comparing right-end numbers) is the tempting wrong move, and that is exactly
// what this concept is teaching against.
const MINUS = '−'

export function buildLengthMeasureCompareBreakdown(params: Params): Breakdown {
  const d = derive(params)
  const { medium, ask } = params
  const u = d.unit
  const a = d.a
  const b = d.b

  // --- highlights ----------------------------------------------------------
  const highlights: BreakdownHighlight[] = []

  // object(s) under the ruler — what is actually being measured
  highlights.push({
    category: 'object',
    phrase_en: d.object.en,
    phrase_id: d.object.id,
    note_en:
      ask === 'measure-one'
        ? 'This is the thing being measured — find it in the picture first.'
        : 'These are the things being measured. Compare their lengths, not where they stop.',
    note_id:
      ask === 'measure-one'
        ? 'Inilah benda yang diukur — cari dulu di gambar.'
        : 'Inilah benda-benda yang diukur. Bandingkan panjangnya, bukan tempat berhentinya.',
  })

  // where the ends sit
  if (d.leftEnd && d.rightEnd) {
    // offset ruler, measuring one object: the two numbers you must subtract
    highlights.push({
      category: 'condition',
      phrase_en: d.leftEnd.en,
      phrase_id: d.leftEnd.id,
      note_en: `It does not start at 0! Measuring must begin from ${a.start}, so you have to subtract.`,
      note_id: `Bendanya tidak mulai dari 0! Mulainya dari ${a.start}, jadi kamu harus mengurangi.`,
    })
    highlights.push({
      category: 'fact',
      phrase_en: d.rightEnd.en,
      phrase_id: d.rightEnd.id,
      note_en: `The right end stops at ${a.end}. That is where it stops, not how long it is.`,
      note_id: `Ujung kanannya berhenti di ${a.end}. Itu tempat berhentinya, bukan panjangnya.`,
    })
  } else if (d.setup) {
    const isOffset = medium === 'offset-ruler'
    const isChain = medium === 'unit-chain'
    highlights.push({
      category: isOffset || isChain ? 'condition' : 'fact',
      phrase_en: d.setup.en,
      phrase_id: d.setup.id,
      note_en: isOffset
        ? `Nothing starts at 0, so length = right number ${MINUS} left number.`
        : isChain
          ? 'No gaps and no overlaps, so every unit counts as exactly 1.'
          : 'Everything starts at 0, so the number under the right end is the length.',
      note_id: isOffset
        ? `Tidak ada yang mulai dari 0, jadi panjang = angka kanan ${MINUS} angka kiri.`
        : isChain
          ? 'Tidak ada celah dan tidak bertumpuk, jadi setiap satuan bernilai tepat 1.'
          : 'Semua mulai dari 0, jadi angka di ujung kanan itulah panjangnya.',
    })
  }

  // the question
  highlights.push({
    category: 'question',
    phrase_en: d.question.en,
    phrase_id: d.question.id,
    note_en:
      ask === 'measure-one'
        ? medium === 'unit-chain'
          ? `Count how many ${u.longEn} fit along it.`
          : `Length = right number ${MINUS} left number.`
        : ask === 'longest'
          ? 'Work out every length first, then pick the biggest one.'
          : `Work out both lengths, then subtract the smaller from the bigger.`,
    note_id:
      ask === 'measure-one'
        ? medium === 'unit-chain'
          ? `Hitung ada berapa ${u.longId} yang muat sepanjang benda itu.`
          : `Panjang = angka kanan ${MINUS} angka kiri.`
        : ask === 'longest'
          ? 'Cari dulu panjang setiap benda, baru pilih yang terbesar.'
          : `Cari panjang keduanya, lalu kurangi yang besar dengan yang kecil.`,
  })

  // --- machine brief -------------------------------------------------------
  const quantities: BreakdownQuantity[] = d.infos.map((it) => ({
    label_en: `Length of the ${it.nameEn}`,
    label_id: `Panjang ${it.nameId}`,
    value:
      medium === 'unit-chain'
        ? String(it.length)
        : `${it.end} ${MINUS} ${it.start} = ${it.length}`,
  }))
  if (ask === 'difference') {
    quantities.push({
      label_en: 'Difference',
      label_id: 'Selisih',
      value: `${a.length} ${MINUS} ${b.length} = ${a.length - b.length}`,
    })
  }
  quantities.push({
    label_en: 'Answer',
    label_id: 'Jawaban',
    value: d.answer,
  })

  // --- trap: only real on the offset ruler ---------------------------------
  let trap: Breakdown['trap'] = null
  if (medium === 'offset-ruler') {
    if (ask === 'measure-one') {
      trap = {
        wrong: String(a.end),
        why_en: `${a.end} is the number under the right end, not the length. It starts at ${a.start}, so the length is ${a.end} ${MINUS} ${a.start} = ${a.length}.`,
        why_id: `${a.end} itu angka di ujung kanan, bukan panjangnya. Mulainya dari ${a.start}, jadi panjangnya ${a.end} ${MINUS} ${a.start} = ${a.length}.`,
      }
    } else if (ask === 'longest') {
      const trapItem = d.infos[d.farthestEndIndex]
      const winner = d.infos[d.longestIndex]
      if (d.farthestEndIndex !== d.longestIndex) {
        trap = {
          wrong: LABELS[d.farthestEndIndex],
          why_en: `The ${trapItem.nameEn} stops at the biggest number (${trapItem.end}), but it is only ${trapItem.end} ${MINUS} ${trapItem.start} = ${trapItem.length} long — shorter than the ${winner.nameEn} (${winner.length}).`,
          why_id: `${trapItem.NameId} berhenti di angka terbesar (${trapItem.end}), tetapi panjangnya cuma ${trapItem.end} ${MINUS} ${trapItem.start} = ${trapItem.length} — lebih pendek dari ${winner.nameId} (${winner.length}).`,
        }
      }
    } else {
      const endGap = a.end - b.end
      const real = a.length - b.length
      if (endGap > 0 && endGap !== real) {
        trap = {
          wrong: String(endGap),
          why_en: `${a.end} ${MINUS} ${b.end} = ${endGap} compares where they stop, not how long they are. The lengths are ${a.length} and ${b.length}, so the answer is ${real}.`,
          why_id: `${a.end} ${MINUS} ${b.end} = ${endGap} itu membandingkan tempat berhentinya, bukan panjangnya. Panjangnya ${a.length} dan ${b.length}, jadi jawabannya ${real}.`,
        }
      }
    }
  }

  const strategy =
    medium === 'offset-ruler'
      ? {
          conceptSlug: 'length-measure-compare',
          name_en: `Subtract: right end ${MINUS} left end`,
          name_id: `Kurangi: ujung kanan ${MINUS} ujung kiri`,
        }
      : medium === 'unit-chain'
        ? {
            conceptSlug: 'length-measure-compare',
            name_en: 'Count the repeated units',
            name_id: 'Hitung satuan berulang',
          }
        : {
            conceptSlug: 'length-measure-compare',
            name_en: 'Read the ruler from 0',
            name_id: 'Baca penggaris mulai dari 0',
          }

  return {
    needsVisual: true,
    highlights,
    quantities,
    strategy,
    trap,
    answer: {
      form: d.answer_type === 'multiple_choice' ? 'choice' : 'number',
      unit: d.answer_type === 'multiple_choice' ? null : u.shortId,
      value: d.answer,
    },
    vocab: [],
  }
}
