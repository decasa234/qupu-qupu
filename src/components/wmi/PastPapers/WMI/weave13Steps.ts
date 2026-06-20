// IKMC-19-PE-Q13 — storyboard for the woven-strips animation.
//
// The question: Four strips are woven into a pattern, as shown.
// What do you see when you look at it from the other side? → Answer B.
//
// The weave: 2 red vertical × 2 grey horizontal = 4 crossings.
// Stem: red vertical strips are ON TOP at all 4 crossings.
// When flipped to the back: (1) left↔right mirror, (2) over/under swaps.
// Result: grey horizontal strips ON TOP at all 4 crossings → matches option B.
//
// Teaching walk, one idea per beat:
//   0. intro  — show front view; label "vertical red strips are on top."
//   1. mirror — show mirrored weave; caption "Flip to the back: left ↔ right swap."
//   2. swap   — show back result (grey on top); caption "Over/under also swaps: grey is now on top."
//   3. result — highlight option B; caption "Answer B matches the back view."
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type WeavePhase = 'intro' | 'mirror' | 'swap' | 'result'

export interface WeaveBeat {
  /** Which animation phase this beat belongs to. */
  phase: WeavePhase
  /**
   * Crossing matrix [TL, TR, BL, BR] — true = vertical strip on top at that crossing.
   * Drives WeavePanel to show the right weave for this beat.
   */
  vertOver: [boolean, boolean, boolean, boolean]
  /** Mirror the panel horizontally (simulate the left↔right flip). */
  mirrored: boolean
  /** True on the result beat — triggers green highlight. */
  result: boolean
  /** Equation chip text; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
}

export interface WeaveStoryboard {
  steps: WeaveBeat[]
  finalIndex: number
}

export function buildWeave13Steps(lang: Lang): WeaveStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // STEM crossing matrix: vertical on top at all 4 crossings
  const STEM_OVER: [boolean, boolean, boolean, boolean] = [true, true, true, true]
  // BACK crossing matrix: horizontal on top at all 4 crossings (= answer B)
  const BACK_OVER: [boolean, boolean, boolean, boolean] = [false, false, false, false]

  const steps: WeaveBeat[] = [
    // Beat 0 — intro: show front view
    {
      phase: 'intro',
      vertOver: STEM_OVER,
      mirrored: false,
      result: false,
      equation: '',
      hold: 2400,
      caption: t(
        'Front view: the red vertical strips are on top at every crossing.',
        'Tampak depan: strip merah vertikal berada di atas di setiap persilangan.',
      ),
    },

    // Beat 1 — mirror: flip left↔right
    {
      phase: 'mirror',
      vertOver: STEM_OVER,
      mirrored: true,
      result: false,
      equation: t('flip: left ↔ right', 'balik: kiri ↔ kanan'),
      hold: 2200,
      caption: t(
        'Flip to the back: left and right swap sides.',
        'Balik ke belakang: kiri dan kanan bertukar posisi.',
      ),
    },

    // Beat 2 — swap: over/under swaps at every crossing
    {
      phase: 'swap',
      vertOver: BACK_OVER,
      mirrored: true,
      result: false,
      equation: t('over ↔ under', 'atas ↔ bawah'),
      hold: 2200,
      caption: t(
        'Over/under also swaps: now the grey horizontal strips are on top.',
        'Atas/bawah juga bertukar: kini strip abu-abu horizontal berada di atas.',
      ),
    },

    // Beat 3 — result: highlight option B
    {
      phase: 'result',
      vertOver: BACK_OVER,
      mirrored: true,
      result: true,
      equation: t('Answer: B', 'Jawaban: B'),
      hold: 0,
      caption: t(
        'This matches option B — grey strips on top at all crossings.',
        'Ini sesuai pilihan B — strip abu-abu di atas di semua persilangan.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
