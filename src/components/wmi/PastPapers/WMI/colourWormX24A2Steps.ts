import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ColourWormPhase = 'show' | 'near' | 'cycle' | 'result'

export interface ColourWormStep {
  phase: ColourWormPhase
  revealAnswer: boolean
  highlightIds: string[]
  caption: string
  hold: number
  result: boolean
}

export interface ColourWormStoryboard {
  steps: ColourWormStep[]
  finalIndex: number
}

// Sequence head → tail (circle ids):
// y3(Y) y2(Y) g5(G) r3(R) r2(R) g4(G) g3(G) r1(R) y1(Y) g2(G) g1(G) q(?)
// The cycle visible near the tail: …Y G G ? → ? = Yellow.

export function buildColourWormX24A2Steps(lang: Lang): ColourWormStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ColourWormStep[] = [
    {
      phase: 'show',
      revealAnswer: false,
      highlightIds: [],
      hold: 1800,
      result: false,
      caption: t(
        'Look at the worm — each circle has a colour: Red, Green, or Yellow. Find the pattern!',
        'Perhatikan ulatnya — setiap lingkaran punya warna: Merah, Hijau, atau Kuning. Temukan polanya!',
      ),
    },
    {
      phase: 'near',
      revealAnswer: false,
      highlightIds: ['g1', 'g2', 'q'],
      hold: 2000,
      result: false,
      caption: t(
        'The two circles right next to "?" are both Green. Scan the worm to find the same pattern elsewhere.',
        'Dua lingkaran tepat di sebelah "?" keduanya berwarna Hijau. Cari pola yang sama di bagian lain ular.',
      ),
    },
    {
      phase: 'cycle',
      revealAnswer: false,
      highlightIds: ['y1', 'g2', 'g1', 'q'],
      hold: 2200,
      result: false,
      caption: t(
        'Look left of those two Greens: a Yellow appears! The repeating unit is …Yellow → Green → Green → ? → Yellow → Green → Green…',
        'Lihat di sebelah kiri dua Hijau itu: ada Kuning! Pola berulangnya: …Kuning → Hijau → Hijau → ? → Kuning → Hijau → Hijau…',
      ),
    },
    {
      phase: 'result',
      revealAnswer: true,
      highlightIds: ['q'],
      hold: 0,
      result: true,
      caption: t(
        '? = Yellow ✓ — the next colour after Green, Green in the cycle is Yellow.',
        '? = Kuning ✓ — warna berikutnya setelah Hijau, Hijau dalam siklusnya adalah Kuning.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
