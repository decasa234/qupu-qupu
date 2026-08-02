import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import {
  LABELS,
  askClause,
  fracText,
  listEn,
  listId,
  modeClause,
  solve,
  type Params,
} from './index.js'

// Authored decomposition of a fraction comparison. Three spans carry the whole
// problem: the option set (what you are choosing between), the sentence that
// names WHY these particular fractions can be compared by one rule, and the ask.
//
// Every phrase below is built from the very same helpers `render` builds the
// body from, so each `phrase_*` is an exact substring of the DISPLAY body (the
// body after `stripSectionLabels` drops the "Find:" / "Cari:" markers). Nothing
// spans that marker and no two phrases overlap.
export function buildCompareFractionsBreakdown(params: Params): Breakdown {
  const { fractions, mode, ask } = params
  const s = solve(params)
  const wantBig = ask !== 'smallest'

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: listEn(s.texts),
      phrase_id: listId(s.texts),
      note_en: `These are the only fractions you may choose from — compare them against each other, not against anything else.`,
      note_id: `Hanya pecahan-pecahan inilah yang boleh kamu pilih — bandingkan satu sama lain, bukan dengan yang lain.`,
    },
    {
      category: 'fact',
      phrase_en: modeClause(params, 'en'),
      phrase_id: modeClause(params, 'id'),
      note_en: modeNote(params, 'en'),
      note_id: modeNote(params, 'id'),
    },
    {
      category: 'question',
      phrase_en: askClause(ask, 'en'),
      phrase_id: askClause(ask, 'id'),
      note_en:
        ask === 'closest-to-one'
          ? `Every fraction here is under one whole, so the nearest to a whole is just the biggest one — pick a letter, not a number.`
          : `Pick the letter of ONE fraction, not a number. Exactly one option is the ${wantBig ? 'biggest' : 'smallest'}; no two options are the same size.`,
      note_id:
        ask === 'closest-to-one'
          ? `Semua pecahan di sini kurang dari satu utuh, jadi yang paling dekat ke satu utuh berarti yang paling besar — pilih hurufnya, bukan bilangannya.`
          : `Pilih huruf SATU pecahan, bukan bilangannya. Tepat satu pilihan yang paling ${wantBig ? 'besar' : 'kecil'}; tidak ada dua pilihan yang sama besar.`,
    },
  ]

  const quantities: BreakdownQuantity[] = [
    {
      label_en: 'Options',
      label_id: 'Pilihan',
      value: s.texts.map((t, i) => `${LABELS[i]} = ${t}`).join(', '),
    },
    {
      label_en: 'Comparison rule',
      label_id: 'Aturan pembanding',
      value: ruleLabel(mode),
    },
  ]

  if (s.common !== null) {
    const { oddIndex, scaled, commonDen } = s.common
    quantities.push({
      label_en: `Rewritten in ${commonDen}ths`,
      label_id: `Ditulis ulang dalam per-${commonDen}`,
      value: `${fracText(fractions[oddIndex])} = ${fracText(scaled[oddIndex])}`,
    })
  }

  if (mode === 'benchmark-half') {
    quantities.push({
      label_en: 'Against one half',
      label_id: 'Terhadap setengah',
      value: fractions
        .map((f) => `${fracText(f)} ${2 * f.num > f.den ? '>' : '<'} 1/2`)
        .join(', '),
    })
  }

  quantities.push({
    label_en: 'Largest to smallest',
    label_id: 'Urutan dari terbesar',
    value: s.orderDesc.map((i) => s.texts[i]).join(' > '),
  })
  quantities.push({
    label_en: 'Answer',
    label_id: 'Jawaban',
    value: `${s.answer} (${s.answerText})`,
  })

  return {
    // The fractions are short enough to read as text, and the comparison is a
    // rule about the numbers themselves — the animated bars in the explainer are
    // the picture, the card needs none.
    needsVisual: false,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'compare-fractions',
      name_en: strategyName(mode, 'en'),
      name_id: strategyName(mode, 'id'),
    },
    trap: s.trapIndex === null ? null : buildTrap(params, s.trapIndex),
    answer: {
      form: 'choice',
      unit: null,
      value: s.answer,
    },
    vocab: [],
  }
}

function ruleLabel(mode: Params['mode']): string {
  if (mode === 'same-numerator') return 'same top number'
  if (mode === 'same-denominator') return 'same bottom number'
  if (mode === 'one-equivalent-pair') return 'rewrite one as an equivalent fraction'
  return 'compare against 1/2'
}

function strategyName(mode: Params['mode'], lang: 'en' | 'id'): string {
  if (mode === 'same-numerator') {
    return lang === 'id'
      ? 'Pembilang sama: yang penyebutnya lebih kecil lebih besar'
      : 'Same top number: fewer pieces means bigger pieces'
  }
  if (mode === 'same-denominator') {
    return lang === 'id'
      ? 'Penyebut sama: tinggal bandingkan pembilangnya'
      : 'Same bottom number: just compare the top numbers'
  }
  if (mode === 'one-equivalent-pair') {
    return lang === 'id'
      ? 'Samakan penyebut dulu dengan pecahan senilai'
      : 'Make the bottom numbers match with an equivalent fraction'
  }
  return lang === 'id' ? 'Pakai setengah sebagai patokan' : 'Use one half as a benchmark'
}

function modeNote(params: Params, lang: 'en' | 'id'): string {
  const { mode, fractions } = params
  if (mode === 'same-numerator') {
    const n = fractions[0].num
    return lang === 'id'
      ? `Karena semuanya mengambil ${n} bagian, yang membedakan hanya besar satu bagian: makin banyak potongan, makin kecil tiap potongan.`
      : `Since each one takes ${n} piece${n === 1 ? '' : 's'}, the only difference is how big one piece is: more pieces means smaller pieces.`
  }
  if (mode === 'same-denominator') {
    const d = fractions[0].den
    return lang === 'id'
      ? `Semua potongannya sama besar (satu per ${d}), jadi tinggal hitung siapa yang mengambil lebih banyak potongan.`
      : `Every piece is the same size (one ${d}th), so you only have to count who takes more pieces.`
  }
  if (mode === 'one-equivalent-pair') {
    return lang === 'id'
      ? `Satu pecahan dipotong dengan ukuran berbeda. Ubah dulu jadi pecahan senilai berpenyebut sama, baru pembilangnya boleh dibandingkan.`
      : `One fraction is cut in a different size. Rewrite it as an equivalent fraction with the same bottom number first — only then may the top numbers be compared.`
  }
  return lang === 'id'
    ? `Setengah adalah patokannya: kalikan dua pembilang, lalu bandingkan dengan penyebutnya untuk tahu satu pecahan ada di sisi mana.`
    : `One half is the yardstick: double the top number and compare it with the bottom to see which side of a half a fraction sits on.`
}

/**
 * The trap is always the same misconception wearing a different coat — reading
 * the digits as whole numbers instead of as a fraction.
 */
function buildTrap(params: Params, trapIndex: number): Breakdown['trap'] {
  const { fractions, mode, ask } = params
  const s = solve(params)
  const wrong = fractions[trapIndex]
  const label = LABELS[trapIndex]
  const wantBig = ask !== 'smallest'

  if (mode === 'same-numerator') {
    return {
      wrong: label,
      why_en: `${label} is ${fracText(wrong)}, whose bottom number is the ${wantBig ? 'biggest' : 'smallest'} — but a bigger bottom number cuts the whole into MORE and therefore SMALLER pieces. With the same top number, ${fracText(wrong)} is the ${wantBig ? 'smallest' : 'biggest'} of the lot, so the answer is ${s.answer}, ${s.answerText}.`,
      why_id: `${label} adalah ${fracText(wrong)}, penyebutnya paling ${wantBig ? 'besar' : 'kecil'} — padahal penyebut yang lebih besar memotong utuhnya jadi LEBIH BANYAK sehingga tiap potongan LEBIH KECIL. Dengan pembilang yang sama, ${fracText(wrong)} justru yang paling ${wantBig ? 'kecil' : 'besar'}, jadi jawabannya ${s.answer}, yaitu ${s.answerText}.`,
    }
  }

  const scaled = s.common === null ? null : s.common.scaled[trapIndex]
  const scaledText = scaled === null ? fracText(wrong) : fracText(scaled)
  return {
    wrong: label,
    why_en: `${label} is ${fracText(wrong)}, which has the ${wantBig ? 'biggest' : 'smallest'} top number — but the bottom numbers are not all the same yet, so top numbers cannot be compared straight away. Written in the same size pieces, ${fracText(wrong)} is ${scaledText}, and the answer is ${s.answer}, ${s.answerText}.`,
    why_id: `${label} adalah ${fracText(wrong)}, pembilangnya paling ${wantBig ? 'besar' : 'kecil'} — padahal penyebutnya belum sama semua, jadi pembilang belum boleh langsung dibandingkan. Ditulis dalam potongan sama besar, ${fracText(wrong)} adalah ${scaledText}, dan jawabannya ${s.answer}, yaitu ${s.answerText}.`,
  }
}
