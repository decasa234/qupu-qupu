// SEAMOX-23-A-Q3 — "Find the perimeter of the notched-rectangle figure"
// Dimensions: 10×8 cm outer, 4 cm wide × 3 cm deep notch from top. Answer = 42 cm.
//
// H edges: bottom(10) + top-left(3) + notch-bottom(4) + top-right(3) = 20 cm
// V edges: left(8) + notch-inner-left(3) + notch-inner-right(3) + right(8) = 22 cm
// Total: 20 + 22 = 42 cm
//
// Beats:
//   0. problem    — shape with given labels; perimeter unknown
//   1. horizontal — H-edges glow blue; "10 + 3 + 4 + 3 = 20 cm"
//   2. vertical   — V-edges glow orange; "8 + 3 + 3 + 8 = 22 cm"
//   3. result     — full outline green; "20 + 22 = 42 cm"
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type NotchPhase = 'problem' | 'horizontal' | 'vertical' | 'result'

export interface NotchBeat {
  phase: NotchPhase
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface NotchStoryboard {
  steps: NotchBeat[]
  finalIndex: number
}

export function buildNotchRectX23A3Steps(lang: Lang): NotchStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NotchBeat[] = [
    // Beat 0 — show the problem
    {
      phase: 'problem',
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'A rectangle (10 cm × 8 cm) with a 4 cm × 3 cm notch cut from the top. What is its perimeter?',
        'Persegi panjang (10 cm × 8 cm) dengan lekukan 4 cm × 3 cm di bagian atas. Berapa kelilingnya?',
      ),
    },

    // Beat 1 — reveal horizontal segments
    {
      phase: 'horizontal',
      equation: t('10 + 3 + 4 + 3 = 20 cm', '10 + 3 + 4 + 3 = 20 cm'),
      hold: 2400,
      result: false,
      caption: t(
        'Horizontal edges: bottom (10 cm) + left top (3 cm) + notch floor (4 cm) + right top (3 cm) = 20 cm.',
        'Sisi horizontal: bawah (10 cm) + atas kiri (3 cm) + lantai lekukan (4 cm) + atas kanan (3 cm) = 20 cm.',
      ),
    },

    // Beat 2 — reveal vertical segments
    {
      phase: 'vertical',
      equation: t('8 + 3 + 3 + 8 = 22 cm', '8 + 3 + 3 + 8 = 22 cm'),
      hold: 2400,
      result: false,
      caption: t(
        'Vertical edges: left (8 cm) + notch inner-left (3 cm) + notch inner-right (3 cm) + right (8 cm) = 22 cm.',
        'Sisi vertikal: kiri (8 cm) + dalam lekukan kiri (3 cm) + dalam lekukan kanan (3 cm) + kanan (8 cm) = 22 cm.',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      equation: t('20 + 22 = 42 cm', '20 + 22 = 42 cm'),
      hold: 0,
      result: true,
      caption: t(
        'Perimeter = 20 + 22 = 42 cm. Tip: the notch adds two depth segments (3+3=6 cm) but removes a 4 cm opening, net change = +2 cm vs. the plain rectangle perimeter of 2×(10+8)=36 cm.',
        'Keliling = 20 + 22 = 42 cm. Tips: lekukan menambah dua segmen kedalaman (3+3=6 cm) tetapi menghapus bukaan 4 cm, perubahan bersih = +6 cm vs. keliling persegi panjang biasa 2×(10+8)=36 cm.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
