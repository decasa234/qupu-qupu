// polygonSidesTIMO22P1Q18Steps — TIMO 2022 Heat Primary-1 Q18
// "How many side(s) is / are there in the polygon below?" → 18
//
// Beat walk: intro → trace each of the 18 sides one by one → result.
// Pure builder: (lang) → storyboard. No random, no Date. SSR-safe.

export type Lang = 'en' | 'id'

export interface SideBeat {
  phase: string
  /** -1 = none; 0–17 = current side (0-based index); 18 = all */
  highlightSide: number
  /** Running count to display (0 = hide) */
  count: number
  caption: string
  hold: number
  result: boolean
}

const EN_DESC: readonly string[] = [
  'top edge',
  'top-right bevel',
  'right wall',
  'top of right notch (short)',
  'right notch — right wall',
  'right notch — bottom',
  'right notch — left wall',
  'between right & middle notch',
  'middle notch — right wall',
  'middle notch — bottom',
  'middle notch — left wall',
  'between middle & left notch',
  'left notch — right wall',
  'left notch — bottom',
  'left notch — left wall',
  'top of left notch (short)',
  'left wall',
  'top-left bevel',
]

const ID_DESC: readonly string[] = [
  'sisi atas',
  'miring kanan atas',
  'dinding kanan',
  'atas lekukan kanan (pendek)',
  'lekukan kanan — dinding kanan',
  'lekukan kanan — bawah',
  'lekukan kanan — dinding kiri',
  'antara lekukan kanan & tengah',
  'lekukan tengah — dinding kanan',
  'lekukan tengah — bawah',
  'lekukan tengah — dinding kiri',
  'antara lekukan tengah & kiri',
  'lekukan kiri — dinding kanan',
  'lekukan kiri — bawah',
  'lekukan kiri — dinding kiri',
  'atas lekukan kiri (pendek)',
  'dinding kiri',
  'miring kiri atas',
]

export function buildPolygonSidesTIMO22P1Q18Steps(lang: Lang): SideBeat[] {
  const en = lang === 'en'
  const descs = en ? EN_DESC : ID_DESC

  const beats: SideBeat[] = [
    {
      phase: 'intro',
      highlightSide: -1,
      count: 0,
      caption: en
        ? 'Count every straight segment between two corners — each is one side.'
        : 'Hitung setiap segmen lurus antara dua sudut — itu satu sisi.',
      hold: 2000,
      result: false,
    },
  ]

  for (let i = 0; i < 18; i++) {
    beats.push({
      phase: `side-${i + 1}`,
      highlightSide: i,
      count: i + 1,
      caption: en
        ? `Side ${i + 1} — ${descs[i]}.`
        : `Sisi ${i + 1} — ${descs[i]}.`,
      hold: 900,
      result: false,
    })
  }

  beats.push({
    phase: 'result',
    highlightSide: 18,
    count: 18,
    caption: en
      ? 'All 18 sides counted — the polygon has 18 sides!'
      : 'Semua 18 sisi terhitung — poligon ini memiliki 18 sisi!',
    hold: 0,
    result: true,
  })

  return beats
}
