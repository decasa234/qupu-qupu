// SASMO 2019 Grade 3 Q18 — pictograph beat storyboard.
// Icon data: Anastacia 1 | Braiden 7 | Clarke 8 | Darla 4 | Eddie 4.
// Each icon = 6 muffins. Total = 24×6 = 144.
// Mom distributes to 4 (not Clarke): 144÷4 = 36 each.
// Eddie had 4×6=24; gains 36−24 = 12. Answer: 12.

export type PictographFocus = null | 'eddie' | 'no_clarke' | 'result'

export interface PictographStep {
  focus: PictographFocus
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = '12'
export const ANSWER_EN = '12'

export function buildPictographMuffinsSASMO19G3Q18Steps(lang: 'en' | 'id'): PictographStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      focus: null,
      hold: 2200,
      result: false,
      caption: t(
        'Read the pictograph — each muffin icon stands for 6 muffins.',
        'Baca grafik gambar — setiap ikon muffin mewakili 6 muffin.',
      ),
    },
    {
      focus: null,
      hold: 2600,
      result: false,
      caption: t(
        'Count all icons: 1 + 7 + 8 + 4 + 4 = 24 icons. Total muffins: 24 × 6 = 144.',
        'Hitung semua ikon: 1 + 7 + 8 + 4 + 4 = 24 ikon. Total muffin: 24 × 6 = 144.',
      ),
    },
    {
      focus: 'eddie',
      hold: 2200,
      result: false,
      caption: t(
        'Eddie originally had 4 icons → 4 × 6 = 24 muffins.',
        'Eddie awalnya punya 4 ikon → 4 × 6 = 24 muffin.',
      ),
    },
    {
      focus: 'no_clarke',
      hold: 2600,
      result: false,
      caption: t(
        'Mom divides 144 equally among 4 siblings (not Clarke): 144 ÷ 4 = 36 each.',
        'Ibu membagi 144 muffin rata kepada 4 bersaudara (tidak termasuk Clarke): 144 ÷ 4 = 36 per orang.',
      ),
    },
    {
      focus: 'result',
      hold: 0,
      result: true,
      caption: t(
        'Eddie: 36 − 24 = 12 more muffins now.',
        'Eddie: 36 − 24 = 12 muffin lebih banyak sekarang.',
      ),
    },
  ]
}
