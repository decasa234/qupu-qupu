import { useMemo, type ComponentType } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import type { Lang } from '../concepts/explainers/makeTenSteps'

// A shared "deduce by checking" explainer: rows reveal one per beat, each a
// candidate or fact — red ✗ when it fails, green ✓ when it works, blue when it
// is a neutral fact in the chain. Used by the simple non-figure questions so
// every answer is DERIVED on screen (never just asserted).

const GREEN = '#10B981'

export interface TryItem {
  text: string
  /** true → ✓ green, false → ✗ red, null → neutral fact (blue). */
  ok: boolean | null
}

export interface TryStory {
  intro: string
  items: TryItem[]
  final: string
  aria: string
}

export function makeTryCheckExplainer(build: (lang: Lang) => TryStory): ComponentType<ExplainerProps> {
  return function TryCheckExplainer(props: ExplainerProps) {
    const lang = (props.lang ?? 'en') as Lang
    const story = useMemo(() => build(lang), [lang])
    const finalIndex = story.items.length + 1
    const holds = useMemo(() => [2100, ...story.items.map(() => 2300), 0], [story])
    const index = useBeatControl(finalIndex, { ...props, holds })
    const shown = Math.max(0, Math.min(index, story.items.length))
    const result = index >= finalIndex
    const caption = index === 0 ? story.intro : result ? story.final : story.items[index - 1].text

    return (
      <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={story.aria}>
        <div className="flex flex-col items-center gap-3">
          <div className="flex w-full flex-col gap-2">
            {story.items.map((item, i) => {
              const on = i < shown
              const color = item.ok === true ? '#065F46' : item.ok === false ? '#991B1B' : '#30598A'
              const bg = item.ok === true ? '#D1FAE5' : item.ok === false ? '#FEE2E2' : '#E1EFFB'
              const border = item.ok === true ? GREEN : item.ok === false ? '#DC2626' : '#93C5FD'
              return (
                <div
                  key={i}
                  className="rounded-lg border-2 px-3 py-1.5 font-display text-sm font-bold"
                  style={{
                    opacity: on ? 1 : 0.15,
                    background: on ? bg : '#FFFFFF',
                    borderColor: on ? border : '#E2E8F0',
                    color,
                  }}
                >
                  {item.ok === true ? '✓ ' : item.ok === false ? '✗ ' : ''}
                  {item.text}
                </div>
              )
            })}
          </div>

          <div
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              result
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
            }
          >
            {caption}
          </div>
        </div>
      </div>
    )
  }
}

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** WMI-19F1A-Q2 — largest of 37, 73, 56, 65: compare the tens digit. */
export const LargestTensG1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare the tens digit first — it decides which number is bigger.', 'Bandingkan angka puluhan dulu — itu yang menentukan mana yang lebih besar.'),
    items: [
      { text: t('37 → tens digit 3', '37 → puluhan 3'), ok: false },
      { text: t('56 → tens digit 5', '56 → puluhan 5'), ok: false },
      { text: t('65 → tens digit 6', '65 → puluhan 6'), ok: false },
      { text: t('73 → tens digit 7 — the biggest', '73 → puluhan 7 — paling besar'), ok: true },
    ],
    final: t('73 has the biggest tens digit, so 73 is the largest (B).', '73 punya angka puluhan terbesar, jadi 73 yang paling besar (B).'),
    aria: t('Comparing tens digits, 73 is the largest.', 'Membandingkan puluhan, 73 yang terbesar.'),
  }
})

/** WMI-19F1A-Q7 — which choice equals 9? Work out each one. */
export const EqualsNineG1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out every choice and look for 9.', 'Hitung setiap pilihan dan cari yang hasilnya 9.'),
    items: [
      { text: '14 + 5 = 19', ok: false },
      { text: '16 − 9 = 7', ok: false },
      { text: '3 + 7 = 10', ok: false },
      { text: '10 − 1 = 9', ok: true },
    ],
    final: t('Only 10 − 1 equals 9 (D).', 'Hanya 10 − 1 yang sama dengan 9 (D).'),
    aria: t('Checking each choice, 10 minus 1 equals 9.', 'Memeriksa tiap pilihan, 10 dikurangi 1 sama dengan 9.'),
  }
})

/** WMI-19F1A-Q12 — 2-digit between 50 and 90 with tens = 3 × units. */
export const DigitRuleG1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The tens digit is 3 × the units digit — try each units digit.', 'Angka puluhan = 3 × angka satuan — coba tiap angka satuan.'),
    items: [
      { text: t('units 1 → tens 3 → 31: not between 50 and 90', 'satuan 1 → puluhan 3 → 31: tidak di antara 50 dan 90'), ok: false },
      { text: t('units 2 → tens 6 → 62: between 50 and 90', 'satuan 2 → puluhan 6 → 62: di antara 50 dan 90'), ok: true },
      { text: t('units 3 → tens 9 → 93: too big', 'satuan 3 → puluhan 9 → 93: terlalu besar'), ok: false },
    ],
    final: t('Only 62 fits both rules (C).', 'Hanya 62 yang memenuhi kedua aturan (C).'),
    aria: t('Trying each units digit, only 62 fits.', 'Mencoba tiap satuan, hanya 62 yang cocok.'),
  }
})

/** WMI-19F1A-Q13 — how many 6s from 50 to 100. */
export const CountSixesG1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Count the written 6s in two groups: ones place, then tens place.', 'Hitung angka 6 dalam dua kelompok: tempat satuan, lalu puluhan.'),
    items: [
      { text: t('Ones place: 56, 66, 76, 86, 96 → five 6s', 'Satuan: 56, 66, 76, 86, 96 → lima angka 6'), ok: null },
      { text: t('Tens place: 60, 61, …, 69 → ten 6s', 'Puluhan: 60, 61, …, 69 → sepuluh angka 6'), ok: null },
      { text: '5 + 10 = 15', ok: true },
    ],
    final: t('15 sixes are written (A). (66 counts twice — once per place!)', 'Ada 15 angka 6 (A). (66 dihitung dua kali — sekali per tempat!)'),
    aria: t('Five ones-place sixes plus ten tens-place sixes is 15.', 'Lima 6 satuan plus sepuluh 6 puluhan adalah 15.'),
  }
})

/** WMI-19F1A-Q14 — 12 □ 6 □ 7 = 13: try each sign pair. */
export const TwoSignsG1Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Try each pair of signs in 12 □ 6 □ 7 = 13.', 'Coba tiap pasangan tanda pada 12 □ 6 □ 7 = 13.'),
    items: [
      { text: '+ , + : 12 + 6 + 7 = 25', ok: false },
      { text: '− , − : 12 − 6 − 7 = −1', ok: false },
      { text: '+ , − : 12 + 6 − 7 = 11', ok: false },
      { text: '− , + : 12 − 6 + 7 = 13', ok: true },
    ],
    final: t('The signs are − then + (D).', 'Tandanya − lalu + (D).'),
    aria: t('Trying all sign pairs, minus then plus gives 13.', 'Mencoba semua pasangan tanda, kurang lalu tambah menghasilkan 13.'),
  }
})

/** WMI-19F2A-Q6 — how much less is 15×4 than 15×6. */
export const ProductGapG2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out both products, then find the gap.', 'Hitung kedua hasil kali, lalu cari selisihnya.'),
    items: [
      { text: '15 × 6 = 90', ok: null },
      { text: '15 × 4 = 60', ok: null },
      { text: '90 − 60 = 30', ok: true },
      { text: t('Shortcut: the gap is 2 groups of 15 → 15 × 2 = 30', 'Cara cepat: selisihnya 2 kelompok 15 → 15 × 2 = 30'), ok: null },
    ],
    final: t('15 × 4 is 30 less than 15 × 6 (C).', '15 × 4 lebih kecil 30 dari 15 × 6 (C).'),
    aria: t('90 minus 60 is 30.', '90 dikurangi 60 adalah 30.'),
  }
})

/** WMI-19F2A-Q7 — which choice equals 28? */
export const EqualsTwentyEightG2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Work out every choice and look for 28.', 'Hitung setiap pilihan dan cari yang hasilnya 28.'),
    items: [
      { text: '19 × 2 = 38', ok: false },
      { text: '63 − 45 = 18', ok: false },
      { text: '5 + 15 + 13 = 33', ok: false },
      { text: '52 + 14 − 38 = 66 − 38 = 28', ok: true },
    ],
    final: t('Only 52 + 14 − 38 equals 28 (C).', 'Hanya 52 + 14 − 38 yang sama dengan 28 (C).'),
    aria: t('Checking each choice, 52 plus 14 minus 38 equals 28.', 'Memeriksa tiap pilihan, 52 tambah 14 kurang 38 sama dengan 28.'),
  }
})
