import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { compose, gapPairs, pairList, solve, type Params } from './index.js'

// Authored decomposition of a posts-and-gaps problem. Four spans, and the one
// that decides everything is the CONDITION: does the line have a thing at each
// end, or does it curl round and close? That single phrase is the difference
// between n - 1 gaps and n gaps, and therefore between the answer and the trap.
//
// Every phrase is taken verbatim from `compose(params)` — the same function that
// builds the body — so a highlight is an exact substring of the DISPLAY body
// (the body after `stripSectionLabels` drops the "Find:" / "Cari:" marker) by
// construction, in both languages, and no two spans overlap.
export function buildIntervalFencepostCountBreakdown(params: Params): Breakdown {
  const { ends, count, span, ask, target } = params
  const s = solve(params)
  const t = compose(params)
  const ring = ends === 'closed'

  // The gaps the ANSWER is made of — which is not always the given arrangement.
  // Scaling up counts the bigger arrangement; walking from item 1 to item n
  // counts a straight run of n, ring or no ring. Naming the wrong list here is
  // exactly how a correct answer ends up with an argument that does not hold.
  const askPairs =
    ask === 'gap'
      ? gapPairs(count, ends)
      : ask === 'total-for-m-items'
        ? gapPairs(target as number, ends)
        : gapPairs(target as number, 'open')
  /** True when the arrangement the ANSWER counts closes back on itself. */
  const askRing = ask !== 'how-long-until-the-nth' && ring

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: t.itemsPhrase_en,
      phrase_id: t.itemsPhrase_id,
      note_en: `These are the things you can count. Careful — the question is not about how many there are, it is about the ${t.gapsWord_en} between them.`,
      note_id: `Ini benda yang bisa kamu hitung. Hati-hati — yang ditanya bukan banyaknya, tapi ${t.gapWord_id} di antaranya.`,
    },
    {
      category: 'condition',
      phrase_en: t.endsPhrase_en,
      phrase_id: t.endsPhrase_id,
      note_en: ring
        ? `The line curls round and closes, so after the last one there is still a ${t.gapWord_en} back to the first. That makes ${s.gapCount} ${t.gapsWord_en} for ${count} ${t.items_en} — the same number.`
        : `The line stops at both ends, so after the last one there is no ${t.gapWord_en} left over. That makes ${s.gapCount} ${t.gapsWord_en} for ${count} ${t.items_en} — one fewer.`,
      note_id: ring
        ? `Barisannya melingkar dan menutup, jadi setelah yang terakhir masih ada satu ${t.gapWord_id} kembali ke yang pertama. Untuk ${count} ${t.item_id} ada ${s.gapCount} ${t.gapWord_id} — sama banyak.`
        : `Barisannya berhenti di kedua ujung, jadi setelah yang terakhir tidak ada ${t.gapWord_id} lagi. Untuk ${count} ${t.item_id} ada ${s.gapCount} ${t.gapWord_id} — satu lebih sedikit.`,
    },
    {
      category: 'fact',
      phrase_en: t.spanPhrase_en,
      phrase_id: t.spanPhrase_id,
      note_en: `This whole ${span} ${t.unit_en} is shared out equally, one share per ${t.gapWord_en}.`,
      note_id: `Seluruh ${span} ${t.unit_id} ini dibagi rata, satu bagian untuk setiap ${t.gapWord_id}.`,
    },
    {
      category: 'question',
      phrase_en: t.question_en,
      phrase_id: t.question_id,
      note_en:
        ask === 'gap'
          ? `One ${t.gapWord_en}, so divide ${span} by the number of ${t.gapsWord_en} — not by the number of ${t.items_en}.`
          : ask === 'total-for-m-items'
            ? `Work out one ${t.gapWord_en} first, then count how many ${t.gapsWord_en} ${target} ${t.items_en} make and multiply.`
            : `Count only the ${t.gapsWord_en} you actually cross on the way from number 1 to number ${target}.`,
      note_id:
        ask === 'gap'
          ? `Satu ${t.gapWord_id}, jadi bagi ${span} dengan banyaknya ${t.gapWord_id} — bukan dengan banyaknya ${t.item_id}.`
          : ask === 'total-for-m-items'
            ? `Cari dulu satu ${t.gapWord_id}, lalu hitung ada berapa ${t.gapWord_id} untuk ${target} ${t.item_id}, baru kalikan.`
            : `Hitung hanya ${t.gapWord_id} yang benar-benar kamu lewati dari nomor 1 sampai nomor ${target}.`,
    },
  ]

  const quantities: BreakdownQuantity[] = [
    {
      label_en: `How many ${t.items_en}`,
      label_id: `Banyak ${t.item_id}`,
      value: String(count),
    },
    {
      label_en: `How many ${t.gapsWord_en}`,
      label_id: `Banyak ${t.gapWord_id}`,
      value: ring ? `${count}` : `${count} - 1 = ${s.gapCount}`,
    },
    {
      label_en: ring ? 'Right around' : 'Total',
      label_id: ring ? 'Keliling' : 'Seluruhnya',
      value: `${span} ${t.unit_id}`,
    },
    {
      label_en: `One ${t.gapWord_en}`,
      label_id: `Satu ${t.gapWord_id}`,
      value: `${span} : ${s.gapCount} = ${s.gapSize}`,
    },
  ]
  if (ask !== 'gap') {
    quantities.push({
      label_en: `${t.gapsWord_en} the question asks about`,
      label_id: `${t.gapWord_id} yang ditanyakan`,
      value: String(s.targetGaps),
    })
  }
  quantities.push({ label_en: 'Answer', label_id: 'Jawaban', value: `${s.value} ${t.unit_id}` })

  return {
    // A picture of the things and the spaces between them is the fastest way to
    // see that the two counts are not the same number.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'interval-fencepost-count',
      name_en: 'Turn a count of things into a count of gaps',
      name_id: 'Ubah banyak benda menjadi banyak jarak',
    },
    trap:
      s.trap === null
        ? null
        : {
            wrong: String(s.trap),
            why_en: askRing
              ? `Using ${s.trapGaps} ${t.gapsWord_en} instead of ${s.targetGaps} gives ${s.trap}. Round a ring nothing is left over at the end — from the last one you walk straight back to the first, and that walk is a ${t.gapWord_en} too. Count them: ${pairList(askPairs, 'en')}. The answer is ${s.value} ${t.unit_en}.`
              : `Using ${s.trapGaps} ${t.gapsWord_en} instead of ${s.targetGaps} gives ${s.trap}. But the ${t.gapsWord_en} sit BETWEEN the ${t.items_en}, so the last one has nothing after it. Count them: ${pairList(askPairs, 'en')}. The answer is ${s.value} ${t.unit_en}.`,
            why_id: askRing
              ? `Memakai ${s.trapGaps} ${t.gapWord_id} dan bukan ${s.targetGaps} menghasilkan ${s.trap}. Di lingkaran tidak ada yang tersisa di ujung — dari yang terakhir kamu langsung kembali ke yang pertama, dan itu juga satu ${t.gapWord_id}. Hitung: ${pairList(askPairs, 'id')}. Jawabannya ${s.value} ${t.unit_id}.`
              : `Memakai ${s.trapGaps} ${t.gapWord_id} dan bukan ${s.targetGaps} menghasilkan ${s.trap}. Padahal ${t.gapWord_id} berada DI ANTARA ${t.item_id}, jadi yang terakhir tidak punya lanjutan lagi. Hitung: ${pairList(askPairs, 'id')}. Jawabannya ${s.value} ${t.unit_id}.`,
          },
    answer: {
      form: 'unit',
      unit: s.unit,
      value: s.answer,
    },
    vocab: [],
  }
}
