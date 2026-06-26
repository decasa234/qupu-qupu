// OSN-16-SD-PROV-Q6 — explainer storyboard
// Four rectilinear shapes (all 5×6 bounding box). Q: largest perimeter? A: shape 1.
// Insight: side notches (not corner cuts) add 2 units each to perimeter.

export interface FourShapesOSN16PQ6Step {
  /** Which shape to highlight (1–4), or null = show all */
  focus: 1 | 2 | 3 | 4 | null
  /** Perimeter label to display on the focused shape */
  perimLabel: string | null
  caption: string
  hold: number
  result: boolean
}

export function buildFourShapesOSN16PQ6Steps(lang: 'en' | 'id'): FourShapesOSN16PQ6Step[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      focus: null,
      perimLabel: null,
      hold: 2200,
      result: false,
      caption: t(
        'All four shapes fit inside the same 6 × 5 bounding box. Which has the longest perimeter?',
        'Keempat bangun masuk dalam kotak pembatas 6 × 5 yang sama. Mana yang kelilingnya paling panjang?',
      ),
    },
    {
      focus: 4,
      perimLabel: t('Perimeter = 22', 'Keliling = 22'),
      hold: 2000,
      result: false,
      caption: t(
        'Shape 4 is a plain rectangle: perimeter = 2 × (6 + 5) = 22 units.',
        'Bangun 4 adalah persegi panjang biasa: keliling = 2 × (6 + 5) = 22 satuan.',
      ),
    },
    {
      focus: 3,
      perimLabel: t('Perimeter = 22', 'Keliling = 22'),
      hold: 2000,
      result: false,
      caption: t(
        'Shape 3 cuts two corners — but corner cuts cancel out: perimeter = 22 units too.',
        'Bangun 3 memotong dua sudut — tapi potongan sudut saling meniadakan: keliling = 22 satuan juga.',
      ),
    },
    {
      focus: 2,
      perimLabel: t('Perimeter = 26', 'Keliling = 26'),
      hold: 2200,
      result: false,
      caption: t(
        'Shape 2 has 2 side notches (left & right). Each notch adds 2 units → 22 + 4 = 26 units.',
        'Bangun 2 punya 2 lekukan samping (kiri & kanan). Setiap lekukan +2 satuan → 22 + 4 = 26 satuan.',
      ),
    },
    {
      focus: 1,
      perimLabel: t('Perimeter = 30', 'Keliling = 30'),
      hold: 2200,
      result: false,
      caption: t(
        'Shape 1 has 4 side notches (top, bottom, left, right). 4 × 2 = +8 → 22 + 8 = 30 units.',
        'Bangun 1 punya 4 lekukan (atas, bawah, kiri, kanan). 4 × 2 = +8 → 22 + 8 = 30 satuan.',
      ),
    },
    {
      focus: 1,
      perimLabel: t('30 ← largest!', '30 ← terbesar!'),
      hold: 0,
      result: true,
      caption: t(
        'Shape 1 wins with perimeter = 30 — the most side notches, the longest boundary.',
        'Bangun 1 menang dengan keliling = 30 — lekukan samping terbanyak, batas terpanjang.',
      ),
    },
  ]
}
