import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { LABELS, derive, type Params } from './index.js'

// Authored decomposition of a length-measure-compare problem.
//
// The figure carries the data (a ruler with the object drawn on it, or a strip
// of unit squares under it), so the stem is short. Every highlight phrase is built from
// the SAME string pieces `derive()` assembles the body from, so each phrase is
// guaranteed to be an exact substring of the DISPLAY body (i.e. after
// stripSectionLabels removes "Find:" / "Cari:" and collapses the blank line).
//
// The real trap only exists on the offset ruler: the object does not start at 0,
// so the number under its right end is NOT its length. Reading that number (or
// comparing right-end numbers) is the tempting wrong move, and that is exactly
// what this concept is teaching against.
const MINUS = '−'

/**
 * The ranking a child gets by reading the RIGHT-HAND end numbers instead of
 * measuring — i.e. the wrong answer this concept exists to disarm. Sorted
 * farthest-stopping first, position breaking a tie exactly like `rankOrder`.
 */
function endRanking(d: ReturnType<typeof derive>): number[] {
  return d.infos.map((_, i) => i).sort((i, j) => d.infos[j].end - d.infos[i].end || i - j)
}

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
        : ask === 'sum-two'
          ? 'These are the two things being measured. Add their lengths, not the numbers they stop on.'
          : 'These are the things being measured. Compare their lengths, not where they stop.',
    note_id:
      ask === 'measure-one'
        ? 'Inilah benda yang diukur — cari dulu di gambar.'
        : ask === 'sum-two'
          ? 'Inilah dua benda yang diukur. Jumlahkan panjangnya, bukan angka tempat berhentinya.'
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
          ? 'No gaps and no overlaps, so every square counts as exactly 1.'
          : 'Everything starts at 0, so the number under the right end is the length.',
      note_id: isOffset
        ? `Tidak ada yang mulai dari 0, jadi panjang = angka kanan ${MINUS} angka kiri.`
        : isChain
          ? 'Tidak ada celah dan tidak bertumpuk, jadi setiap petak bernilai tepat 1.'
          : 'Semua mulai dari 0, jadi angka di ujung kanan itulah panjangnya.',
    })
  }

  // the one length the child is TOLD (relative-from-known only)
  if (d.stated) {
    highlights.push({
      category: 'fact',
      phrase_en: d.stated.en,
      phrase_id: d.stated.id,
      note_en: `This length is handed to you, not measured. Check it on the ruler: ${a.end} ${MINUS} ${a.start} = ${a.length} — the same rule you now use on the shortest one.`,
      note_id: `Panjang ini diberi tahu, bukan diukur. Cek di penggaris: ${a.end} ${MINUS} ${a.start} = ${a.length} — aturan itu juga yang kamu pakai untuk benda terpendek.`,
    })
  }

  // the question
  const questionNote = {
    en:
      ask === 'measure-one'
        ? medium === 'unit-chain'
          ? `Count how many ${u.longEn} fit along it.`
          : `Length = right number ${MINUS} left number.`
        : ask === 'longest'
          ? 'Work out every length first, then pick the biggest one.'
          : ask === 'nth-longest'
            ? 'Measure every object first, then put the lengths in order and count down to the one asked for.'
            : ask === 'order-all'
              ? 'Measure every object first, then line the lengths up from biggest to smallest.'
              : ask === 'sum-two'
                ? 'Work out both lengths, then add them together.'
                : ask === 'relative-from-known'
                  ? 'Find the shortest bar, then measure it the same way the given length was measured.'
                  : `Work out both lengths, then subtract the smaller from the bigger.`,
    id:
      ask === 'measure-one'
        ? medium === 'unit-chain'
          ? `Hitung ada berapa ${u.longId} yang muat sepanjang benda itu.`
          : `Panjang = angka kanan ${MINUS} angka kiri.`
        : ask === 'longest'
          ? 'Cari dulu panjang setiap benda, baru pilih yang terbesar.'
          : ask === 'nth-longest'
            ? 'Ukur dulu semua benda, urutkan panjangnya, baru hitung sampai urutan yang ditanya.'
            : ask === 'order-all'
              ? 'Ukur dulu semua benda, lalu susun panjangnya dari yang terbesar ke terkecil.'
              : ask === 'sum-two'
                ? 'Cari panjang keduanya, lalu jumlahkan.'
                : ask === 'relative-from-known'
                  ? 'Cari benda terpendek, lalu ukur dengan cara yang sama seperti panjang yang sudah diberi tahu.'
                  : `Cari panjang keduanya, lalu kurangi yang besar dengan yang kecil.`,
  }
  highlights.push({
    category: 'question',
    phrase_en: d.question.en,
    phrase_id: d.question.id,
    note_en: questionNote.en,
    note_id: questionNote.id,
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
  if (ask === 'sum-two') {
    quantities.push({
      label_en: 'Total',
      label_id: 'Jumlah',
      value: `${a.length} + ${b.length} = ${a.length + b.length}`,
    })
  }
  if (ask === 'nth-longest' || ask === 'order-all') {
    quantities.push({
      label_en: 'Longest to shortest',
      label_id: 'Urut dari terpanjang',
      value: d.rankOrder.map((i) => `${d.infos[i].NameId} ${d.infos[i].length}`).join(', '),
    })
  }
  if (ask === 'relative-from-known') {
    quantities.push({
      label_en: 'Given: the longest',
      label_id: 'Diketahui: yang terpanjang',
      value: `${a.NameId} ${a.length}`,
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
    } else if (ask === 'nth-longest') {
      // Ranking by where the bars STOP instead of by how long they are — the
      // same misread as `longest`, just one place further down the list.
      const byEnd = endRanking(d)
      const wrongPick = byEnd[d.nth - 1]
      const rightPick = d.rankOrder[d.nth - 1]
      if (wrongPick !== undefined && wrongPick !== rightPick) {
        const bad = d.infos[wrongPick]
        const good = d.infos[rightPick]
        trap = {
          wrong: LABELS[wrongPick],
          why_en: `Ranked by where they stop, the ${bad.nameEn} lands there — but it is ${bad.end} ${MINUS} ${bad.start} = ${bad.length} long, and ranking by LENGTH puts the ${good.nameEn} (${good.length}) in that place.`,
          why_id: `Kalau diurutkan dari tempat berhentinya, ${bad.nameId} yang kena — padahal panjangnya ${bad.end} ${MINUS} ${bad.start} = ${bad.length}, dan kalau diurutkan dari PANJANG yang di posisi itu ${good.nameId} (${good.length}).`,
        }
      }
    } else if (ask === 'order-all') {
      const byEnd = endRanking(d)
      const byEndText = byEnd.map((i) => d.infos[i].NameId).join(', ')
      const offered = (d.choices_id ?? []).find((c) => c.text === byEndText)
      if (offered && offered.label !== d.answer) {
        trap = {
          wrong: offered.label,
          why_en: `That is the order of where the bars STOP, not how long they are. Subtract first: ${d.infos
            .map((it) => `${it.nameEn} ${it.length}`)
            .join(', ')}.`,
          why_id: `Itu urutan tempat bendanya BERHENTI, bukan urutan panjangnya. Kurangi dulu: ${d.infos
            .map((it) => `${it.nameId} ${it.length}`)
            .join(', ')}.`,
        }
      }
    } else if (ask === 'sum-two') {
      const endSum = a.end + b.end
      const real = a.length + b.length
      if (endSum !== real) {
        trap = {
          wrong: String(endSum),
          why_en: `${a.end} + ${b.end} = ${endSum} adds where they stop, not how long they are. The lengths are ${a.length} and ${b.length}, so the total is ${real}.`,
          why_id: `${a.end} + ${b.end} = ${endSum} itu menjumlahkan tempat berhentinya, bukan panjangnya. Panjangnya ${a.length} dan ${b.length}, jadi jumlahnya ${real}.`,
        }
      }
    } else if (ask === 'relative-from-known') {
      if (b.end !== b.length) {
        trap = {
          wrong: String(b.end),
          why_en: `${b.end} is the number under the shortest bar's right end. It starts at ${b.start}, so its length is ${b.end} ${MINUS} ${b.start} = ${b.length}.`,
          why_id: `${b.end} itu angka di ujung kanan benda terpendek. Mulainya dari ${b.start}, jadi panjangnya ${b.end} ${MINUS} ${b.start} = ${b.length}.`,
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
            name_en: 'Count the unit squares',
            name_id: 'Hitung petak satuan',
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
