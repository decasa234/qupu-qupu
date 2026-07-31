import type { Breakdown, BreakdownHighlight, BreakdownQuantity, BreakdownTrap } from '../types.js'
import { deltaText, derive, listOf, type Params } from './index.js'

// Authored decomposition of a subset-sum-target problem. One idea sits under all
// three ask forms: a total is only reached when the parts add up EXACTLY, and
// the size of a group (how many cards, how big they look) tells you nothing
// about its total.
//
// Every highlight phrase MUST be an exact substring of the DISPLAY body — the
// body after stripSectionLabels drops "Cari:" / "Find:" and whitespace is
// collapsed — so each phrase below is built from the same params the body is
// built from, and no two phrases overlap.
export function buildSubsetSumTargetBreakdown(params: Params): Breakdown {
  const { ask, values, target, size, actor } = params
  const d = derive(params)
  const listId = listOf(values, 'id')
  const listEn = listOf(values, 'en')

  let highlights: BreakdownHighlight[]
  let quantities: BreakdownQuantity[]
  let strategy: Breakdown['strategy']
  let trap: BreakdownTrap

  if (ask === 'which-cut-line') {
    highlights = [
      {
        category: 'object',
        phrase_en: `They show ${listEn}`,
        phrase_id: `Angkanya ${listId}`,
        note_en: `These are the cards, left to right. Their order never changes — only where the cut goes.`,
        note_id: `Ini kartunya, urut dari kiri ke kanan. Urutannya tidak berubah — yang berpindah hanya garisnya.`,
      },
      {
        category: 'fact',
        phrase_en: `between two cards`,
        phrase_id: `di antara dua kartu`,
        note_en: `The cut sits in a gap, so no card gets split. Every card belongs fully to one side.`,
        note_id: `Garisnya di celah, jadi tidak ada kartu yang terbelah. Tiap kartu masuk penuh ke satu sisi.`,
      },
      {
        category: 'condition',
        phrase_en: `the left part and the right part have the same total`,
        phrase_id: `jumlah bagian kiri sama dengan jumlah bagian kanan`,
        note_en: `Equal TOTALS, not an equal number of cards. All ${d.n} cards add to ${d.total}, so each side must be ${d.total} ÷ 2 = ${d.half}.`,
        note_id: `Yang sama JUMLAHNYA, bukan banyak kartunya. Semua ${d.n} kartu berjumlah ${d.total}, jadi tiap sisi harus ${d.total} ÷ 2 = ${d.half}.`,
      },
      {
        category: 'question',
        phrase_en: `Which number is on the card just before the cut?`,
        phrase_id: `Angka berapa yang ada di kartu tepat sebelum garis potong?`,
        note_en: `Add from the left and stop the moment the running total is ${d.half}. The card you stopped on is the answer.`,
        note_id: `Jumlahkan dari kiri, berhenti pas jumlahnya ${d.half}. Kartu tempat kamu berhenti itulah jawabannya.`,
      },
    ]

    quantities = [
      { label_en: 'Cards, left to right', label_id: 'Kartu dari kiri', value: values.join(', ') },
      { label_en: 'Whole row', label_id: 'Jumlah semua', value: String(d.total) },
      { label_en: 'Each half', label_id: 'Tiap bagian', value: `${d.total} ÷ 2 = ${d.half}` },
      { label_en: 'Running totals', label_id: 'Jumlah berjalan', value: d.prefix.slice(1, d.n).join(', ') },
      { label_en: 'Cards left of the cut', label_id: 'Kartu di bagian kiri', value: String(d.cut) },
      { label_en: 'Answer', label_id: 'Jawaban', value: d.answer },
    ]

    strategy = {
      conceptSlug: 'subset-sum-target',
      name_en: 'Halve the total, then add from the left',
      name_id: 'Bagi dua totalnya, lalu jumlahkan dari kiri',
    }

    // The classic trap: splitting the row into two equal PILES instead of two
    // equal TOTALS. It is always available (the row has an even card count) and
    // is always wrong, because the true cut never sits at the middle.
    trap = {
      wrong: String(d.trapCard),
      why_en: `Cutting down the middle gives ${d.trapCut} cards each way, but the totals come out ${d.trapCutLeft} and ${d.trapCutRight} — not equal. Same number of cards is not the same total.`,
      why_id: `Memotong di tengah memberi ${d.trapCut} kartu di tiap sisi, tapi jumlahnya jadi ${d.trapCutLeft} dan ${d.trapCutRight} — tidak sama. Banyak kartu yang sama bukan berarti jumlahnya sama.`,
    }
  } else if (ask === 'balance-the-seesaw') {
    highlights = [
      {
        category: 'condition',
        phrase_en: `level only when both sides weigh the same`,
        phrase_id: `seimbang kalau berat kedua sisinya sama`,
        note_en: `This is the whole rule: the right pan must reach ${target} kg exactly. Even 1 kg off tips the beam.`,
        note_id: `Ini aturannya: piring kanan harus tepat ${target} kg. Meleset 1 kg saja lengannya sudah miring.`,
      },
      {
        category: 'fact',
        phrase_en: `one block of ${target} kg`,
        phrase_id: `satu balok ${target} kg`,
        note_en: `The left pan never changes, so ${target} is the number the right pan has to match.`,
        note_id: `Piring kiri tidak berubah, jadi ${target} itulah angka yang harus ditiru piring kanan.`,
      },
      {
        category: 'object',
        phrase_en: `weighing ${listEn} kg`,
        phrase_id: `dengan berat ${listId} kg`,
        note_en: `These are the blocks you may choose from. None of them is ${target} kg on its own.`,
        note_id: `Ini balok yang boleh dipilih. Tidak ada satu pun yang beratnya ${target} kg sendirian.`,
      },
      {
        category: 'condition',
        phrase_en: `put ${size} blocks on the right pan`,
        phrase_id: `menaruh ${size} balok di piring kanan`,
        note_en: `Exactly ${size} blocks — not one, not three. So add the ${size} weights in each option together.`,
        note_id: `Tepat ${size} balok — bukan satu, bukan tiga. Jadi jumlahkan ${size} berat di tiap pilihan.`,
      },
      {
        category: 'question',
        phrase_en: `Which blocks make the scale balance?`,
        phrase_id: `Balok mana yang membuat timbangan seimbang?`,
        note_en: `Weigh every option and keep the one that lands on ${target} kg exactly.`,
        note_id: `Timbang tiap pilihan, ambil yang jatuh tepat di ${target} kg.`,
      },
    ]

    quantities = [
      { label_en: 'Left pan', label_id: 'Piring kiri', value: `${target} kg` },
      { label_en: 'Blocks available', label_id: 'Balok yang ada', value: `${values.join(', ')} kg` },
      { label_en: 'Blocks to place', label_id: 'Balok yang ditaruh', value: String(size) },
      {
        label_en: 'Option totals',
        label_id: 'Jumlah tiap pilihan',
        value: d.options.map((o) => `${o.label} ${o.sum}`).join(', '),
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: `${d.answerLabel} (${d.winner.join(' + ')} = ${target})` },
    ]

    strategy = {
      conceptSlug: 'subset-sum-target',
      name_en: 'Weigh every option, keep the exact one',
      name_id: 'Timbang tiap pilihan, ambil yang persis',
    }

    trap = d.trapOption
      ? {
          wrong: d.trapOption.values.join(' + '),
          why_en: `${d.trapOption.values.join(' + ')} = ${d.trapOption.sum} kg, which is ${deltaText(d.trapOption.delta, 'en')} of ${target} kg. A scale does not round — it tips.`,
          why_id: `${d.trapOption.values.join(' + ')} = ${d.trapOption.sum} kg, ${deltaText(d.trapOption.delta, 'id')} dari ${target} kg. Timbangan tidak membulatkan — dia miring.`,
        }
      : null
  } else {
    highlights = [
      {
        category: 'object',
        phrase_en: `They show ${listEn}`,
        phrase_id: `Angkanya ${listId}`,
        note_en: `These are the only cards ${actor} may choose from.`,
        note_id: `Hanya kartu inilah yang boleh dipilih ${actor}.`,
      },
      {
        category: 'condition',
        phrase_en: `exactly ${size} cards`,
        phrase_id: `tepat ${size} kartu`,
        note_en: `Every answer must use ${size} cards — so the options are already the right size, and only their totals differ.`,
        note_id: `Setiap jawaban harus memakai ${size} kartu — jadi tiap pilihan sudah pas banyaknya, yang beda hanya jumlahnya.`,
      },
      {
        category: 'condition',
        phrase_en: `add up to ${target}`,
        phrase_id: `yang jumlahnya ${target}`,
        note_en: `Exactly ${target}, not near ${target}. One over or one under is just as wrong.`,
        note_id: `Tepat ${target}, bukan sekitar ${target}. Lebih 1 atau kurang 1 sama-sama salah.`,
      },
      {
        category: 'question',
        phrase_en: `Which cards should ${actor} take?`,
        phrase_id: `Kartu mana yang harus ${actor} ambil?`,
        note_en: `Add each option up and compare it with ${target}; only one lands on it.`,
        note_id: `Jumlahkan tiap pilihan lalu bandingkan dengan ${target}; hanya satu yang pas.`,
      },
    ]

    quantities = [
      { label_en: 'Cards on the table', label_id: 'Kartu di meja', value: values.join(', ') },
      { label_en: 'Cards to take', label_id: 'Kartu yang diambil', value: String(size) },
      { label_en: 'Target total', label_id: 'Jumlah yang dicari', value: String(target) },
      {
        label_en: 'Option totals',
        label_id: 'Jumlah tiap pilihan',
        value: d.options.map((o) => `${o.label} ${o.sum}`).join(', '),
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: `${d.answerLabel} (${d.winner.join(' + ')} = ${target})` },
    ]

    strategy = {
      conceptSlug: 'subset-sum-target',
      name_en: 'Add up each choice and keep the exact one',
      name_id: 'Jumlahkan tiap pilihan, ambil yang tepat',
    }

    // The near miss: the wrong option closest to the target. "Close enough" is
    // the misconception this whole concept exists to break.
    trap = d.trapOption
      ? {
          wrong: d.trapOption.values.join(' + '),
          why_en: `${d.trapOption.values.join(' + ')} = ${d.trapOption.sum}, which is ${deltaText(d.trapOption.delta, 'en')} of ${target}. Close is not the same as equal.`,
          why_id: `${d.trapOption.values.join(' + ')} = ${d.trapOption.sum}, ${deltaText(d.trapOption.delta, 'id')} dari ${target}. Hampir sama bukan berarti sama.`,
        }
      : null
  }

  return {
    needsVisual: true,
    highlights,
    quantities,
    strategy,
    trap,
    answer:
      ask === 'which-cut-line'
        ? { form: 'number', unit: null, value: d.answer }
        : { form: 'choice', unit: null, value: d.answer },
    vocab: [],
  }
}
