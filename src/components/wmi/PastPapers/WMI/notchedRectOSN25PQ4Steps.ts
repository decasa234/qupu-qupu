// OSN-25-SD-PROV-Q4 — Keliling bangun berlekukan (notched rectangle perimeter)
//
// The figure: 8×6 rectangle with a rectangular notch cut from the lower-right corner.
// Key insight: the notch never changes the perimeter — it stays at 2×(8+6) = 28.
//
// Animation beats:
//   0. intro     — static L-shape, state the problem.
//   1. bounding  — overlay the bounding rectangle (dashed); show 2×(8+6)=28.
//   2. cancel    — highlight notch edges in amber; show equivalent rectangle ghost in green.
//   3. result    — "28 satuan" in green.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type NotchedRectPhase = 'intro' | 'bounding' | 'cancel' | 'result'

export interface NotchedRectBeat {
  phase: NotchedRectPhase
  showBoundingRect: boolean
  highlightNotch: boolean
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface NotchedRectStoryboard {
  steps: NotchedRectBeat[]
  finalIndex: number
}

export function buildNotchedRectOSN25PQ4Steps(lang: Lang): NotchedRectStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NotchedRectBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showBoundingRect: false,
      highlightNotch: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'What is the perimeter of this L-shaped figure? (8 × 6 outer dimensions, notch cut from lower-right.)',
        'Berapa keliling bangun berbentuk L ini? (8 × 6, dengan lekukan di sudut kanan bawah.)',
      ),
    },

    // Beat 1 — show bounding rectangle
    {
      phase: 'bounding',
      showBoundingRect: true,
      highlightNotch: false,
      equation: '2 × (8 + 6) = 28',
      hold: 2400,
      result: false,
      caption: t(
        'The bounding rectangle (dashed) has perimeter 2 × (8 + 6) = 28.',
        'Persegi panjang luar (putus-putus) memiliki keliling 2 × (8 + 6) = 28.',
      ),
    },

    // Beat 2 — notch cancellation
    {
      phase: 'cancel',
      showBoundingRect: true,
      highlightNotch: true,
      equation: '+a +b − a − b = 0',
      hold: 2400,
      result: false,
      caption: t(
        'The notch removes two rectangle sides (green dashes) and replaces them with two equal sides (amber) — net change: 0!',
        'Lekukan menghapus dua sisi persegi panjang (hijau putus-putus) dan menggantinya dengan dua sisi sama panjang (jingga) — perubahan bersih: 0!',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      showBoundingRect: false,
      highlightNotch: false,
      equation: '28 satuan',
      hold: 0,
      result: true,
      caption: t(
        'Perimeter = 28 units — the rectangular notch never changes the perimeter.',
        'Keliling = 28 satuan — lekukan persegi tidak pernah mengubah keliling.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
