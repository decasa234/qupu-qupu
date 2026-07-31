import type { Breakdown, BreakdownHighlight, BreakdownQuantity, BreakdownTrap } from '../types.js'
import {
  givenPhraseEn,
  givenPhraseId,
  linkPhraseEn,
  linkPhraseId,
  questionPhraseEn,
  questionPhraseId,
  solve,
  type Params,
} from './index.js'

// Authored decomposition of a comparison-chain word problem. One idea sits under
// all four ask forms: only ONE count is printed, so every other count has to be
// walked to, one link at a time.
//
// Every `phrase_*` below comes from the same helper that builds the body, so a
// highlight can never drift out of the rendered text. Phrases are also pairwise
// non-overlapping: each link clause is anchored by the name of the child it
// compares against (unique per link), and the stated count carries its own full
// stop so it cannot match inside a link sentence about the same child.
export function buildComparisonChainBreakdown(params: Params): Breakdown {
  const sol = solve(params)
  const { names, links, item_id, item_en, givenIndex } = params
  const { values } = sol
  const n = names.length

  const givenHighlight: BreakdownHighlight = {
    category: 'fact',
    phrase_en: givenPhraseEn(params, values),
    phrase_id: givenPhraseId(params, values),
    note_en: `The only count actually printed. Everything else has to be walked to from here.`,
    note_id: `Satu-satunya jumlah yang benar-benar tertulis. Jumlah yang lain harus ditelusuri dari sini.`,
  }

  const linkHighlights: BreakdownHighlight[] = links.map((link, i) => {
    const from = names[i]
    const to = names[i + 1]
    const a = values[i]
    const b = values[i + 1]
    const noteMathEn =
      link.kind === 'more'
        ? `${a} + ${link.k} = ${b}`
        : link.kind === 'fewer'
          ? `${a} − ${link.k} = ${b}`
          : link.kind === 'times'
            ? `${a} × ${link.m} = ${b}`
            : `${a} × ${link.m} + ${link.k} = ${b}`
    return {
      category: 'condition',
      phrase_en: linkPhraseEn(params, i),
      phrase_id: linkPhraseId(params, i),
      note_en: `${to} is only described through ${from}, so ${from} must be pinned first — ${noteMathEn}.`,
      note_id: `${to} cuma dijelaskan lewat ${from}, jadi ${from} harus dikunci dulu — ${noteMathEn}.`,
    }
  })

  const questionNote = (): { en: string; id: string } => {
    switch (params.ask) {
      case 'value':
        return {
          en: `Read which child is being asked about — it is easy to stop one link early.`,
          id: `Lihat baik-baik anak mana yang ditanya — gampang berhenti satu langkah terlalu cepat.`,
        }
      case 'total':
        return {
          en: `Every child's count goes in, including the one that was printed.`,
          id: `Semua jumlah ikut dihitung, termasuk yang sudah tertulis di soal.`,
        }
      case 'difference':
        return {
          en: `Compare these two children only, after both counts are pinned.`,
          id: `Bandingkan dua anak ini saja, setelah kedua jumlahnya terkunci.`,
        }
      case 'rank':
        return {
          en: `The biggest number printed in the story is not always the biggest pile.`,
          id: `Angka terbesar yang tertulis di soal belum tentu tumpukan terbanyak.`,
        }
    }
  }
  const qNote = questionNote()

  const questionHighlight: BreakdownHighlight = {
    category: 'question',
    phrase_en: questionPhraseEn(params, sol),
    phrase_id: questionPhraseId(params, sol),
    note_en: qNote.en,
    note_id: qNote.id,
  }

  // Text order, so the renderer lights them up the way the child reads them.
  const highlights: BreakdownHighlight[] = sol.forward
    ? [givenHighlight, ...linkHighlights, questionHighlight]
    : [...linkHighlights, givenHighlight, questionHighlight]

  const quantities: BreakdownQuantity[] = names.map((name, i) => ({
    label_en: i === givenIndex ? `${name} (printed)` : name,
    label_id: i === givenIndex ? `${name} (tertulis)` : name,
    value: String(values[i]),
  }))
  quantities.push({ label_en: 'Answer', label_id: 'Jawaban', value: sol.answer })

  const strategy: Breakdown['strategy'] = {
    conceptSlug: 'comparison-chain-solve',
    name_en: 'Pin the printed count, then walk the chain one link at a time',
    name_id: 'Kunci jumlah yang tertulis, lalu telusuri rantai satu per satu',
  }

  const trap = buildTrap(params, sol, n)

  return {
    needsVisual: false,
    highlights,
    quantities,
    strategy,
    trap,
    // 'rank' answers with a child's name — a pick from the named set, not a count.
    answer: {
      form: params.ask === 'rank' ? 'choice' : 'number',
      unit: null,
      value: sol.answer,
    },
    vocab: [item_id, item_en],
  }
}

/**
 * The tempting wrong answer this chain actually produces. Every branch is a real
 * mis-read of the chain, never a random near-miss — and every branch is checked
 * against the answer, because a trap that equals the answer teaches the mistake.
 */
function buildTrap(params: Params, sol: ReturnType<typeof solve>, n: number): BreakdownTrap {
  const { names } = params
  const { values } = sol

  let candidate: { wrong: string; why_en: string; why_id: string } | null = null

  if (params.ask === 'value') {
    // Stopping one link early — by far the most common chain mistake.
    const pos = sol.order.indexOf(sol.targetIndex)
    const prev = sol.order[pos - 1]
    const target = names[sol.targetIndex]
    candidate = {
      wrong: String(values[prev]),
      why_en: `${values[prev]} is what ${names[prev]} holds, not ${target}. There is still one link left: ${names[prev]} → ${target}.`,
      why_id: `${values[prev]} itu jumlah punya ${names[prev]}, bukan ${target}. Masih ada satu langkah lagi: ${names[prev]} → ${target}.`,
    }
  } else if (params.ask === 'total') {
    // Adding up the counts you worked out and forgetting the last one pinned.
    const last = sol.order[sol.order.length - 1]
    candidate = {
      wrong: String(sol.total - values[last]),
      why_en: `That total leaves ${names[last]} out. All ${n} children count, so add ${values[last]} as well.`,
      why_id: `Total itu belum memasukkan ${names[last]}. Semua ${n} anak ikut dihitung, jadi tambahkan ${values[last]} juga.`,
    }
  } else if (params.ask === 'difference') {
    // Comparing against the neighbour instead of the child actually named.
    const step = sol.hiIndex < sol.loIndex ? 1 : -1
    const near = sol.hiIndex + step
    const wrong = Math.abs(values[sol.hiIndex] - values[near])
    candidate = {
      wrong: String(wrong),
      why_en: `${wrong} is the gap between ${names[sol.hiIndex]} and ${names[near]}. The question compares ${names[sol.hiIndex]} with ${names[sol.loIndex]}, which is further along the chain.`,
      why_id: `${wrong} itu selisih ${names[sol.hiIndex]} dengan ${names[near]}. Yang ditanya selisih ${names[sol.hiIndex]} dengan ${names[sol.loIndex]}, yang letaknya lebih jauh di rantai.`,
    }
  } else {
    // Picking whoever the biggest printed number is attached to.
    const loud = loudestIndex(params, sol)
    if (loud !== null) {
      candidate = {
        wrong: names[loud],
        why_en: `${names[loud]} carries the biggest number in the text, but that number is a comparison, not a pile. Work out every count first: ${names.map((nm, i) => `${nm} ${values[i]}`).join(', ')}.`,
        why_id: `${names[loud]} membawa angka terbesar di soal, tapi angka itu perbandingan, bukan jumlah tumpukan. Hitung dulu semuanya: ${names.map((nm, i) => `${nm} ${values[i]}`).join(', ')}.`,
      }
    }
  }

  // A trap that equals the right answer would teach the mistake, so drop it.
  if (!candidate || candidate.wrong === sol.answer) return null
  return candidate
}

/**
 * Which child's sentence shows the biggest bare number. That is the pile a child
 * skimming for "the biggest number" would point at — usually the wrong one,
 * because a comparison number is not a count.
 */
function loudestIndex(params: Params, sol: ReturnType<typeof solve>): number | null {
  const printed = params.names.map((_, i) => {
    if (i === params.givenIndex) return sol.values[i]
    const link = params.links[i - 1]
    if (!link) return -1 // index 0 on a backwards walk carries no number of its own
    return link.kind === 'times' || link.kind === 'times-plus' ? link.m : link.k
  })
  let best = 0
  for (let i = 1; i < printed.length; i++) if (printed[i] > printed[best]) best = i
  return printed[best] < 0 ? null : best
}
