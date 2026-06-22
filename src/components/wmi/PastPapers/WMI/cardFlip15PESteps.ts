// IKMC-20-PE-Q15 — storyboard for the card-flip animation.
//
// Question: This card lies on the table. It is flipped over its top edge then
// flipped over its left edge. What does the card look like after the two flips?
// Answer: B (down-triangle | square | circle).
//
// Original card:     circle | square | triangle-up
// After flip 1 (top edge — vertical mirror, triangle flips):
//                    circle | square | triangle-down
// After flip 2 (left edge — horizontal mirror, columns swap):
//                    triangle-down | square | circle   ← Answer B
//
// Combined: two perpendicular flips = 180° rotation of the card.
//
// Teaching walk, one idea per beat:
//   0. intro     — show the original card; note the three shapes.
//   1. flip1     — flip over top edge; show result; triangle now points down.
//   2. flip1-ann — annotate: circle and square stay, triangle inverted.
//   3. flip2     — flip over left edge; show result; order reversed.
//   4. flip2-ann — annotate: down-triangle now on left, circle now on right.
//   5. result    — show final card with answer B badge.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

import type { ShapeId } from './CardFlip15PEIllustration'

export type Lang = 'en' | 'id'

export interface CardFlip15PEBeat {
  /** Three shapes currently displayed on the card. */
  shapes: [ShapeId, ShapeId, ShapeId]
  /**
   * Label shown above the card for the current state.
   * null = no label.
   */
  stateLabel: string | null
  /**
   * Slot index (0/1/2) to highlight with an amber ring, or null.
   */
  highlightSlot: number | null
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CardFlip15PEStoryboard {
  steps: CardFlip15PEBeat[]
  finalIndex: number
  /** The correct answer label. */
  answer: string
}

export function buildCardFlip15PESteps(lang: Lang): CardFlip15PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const original: [ShapeId, ShapeId, ShapeId]  = ['circle',   'square', 'tri-up']
  const afterFlip1: [ShapeId, ShapeId, ShapeId] = ['circle',   'square', 'tri-down']
  const afterFlip2: [ShapeId, ShapeId, ShapeId] = ['tri-down', 'square', 'circle']

  const steps: CardFlip15PEBeat[] = [
    // Beat 0 — intro: original card
    {
      shapes: original,
      stateLabel: t('Original card', 'Kartu awal'),
      highlightSlot: null,
      hold: 2400,
      result: false,
      caption: t(
        'The original card has: circle (left), square (middle), triangle △ (right).',
        'Kartu asal memiliki: lingkaran (kiri), persegi (tengah), segitiga △ (kanan).',
      ),
    },

    // Beat 1 — flip over top edge
    {
      shapes: afterFlip1,
      stateLabel: t('After flip 1 — over top edge', 'Setelah balik 1 — tepi atas'),
      highlightSlot: null,
      hold: 2400,
      result: false,
      caption: t(
        'Flip over the top edge: the card rotates forward. Left-right order stays the same, but the triangle now points DOWN (▼).',
        'Balik melewati tepi atas: kartu berputar ke depan. Urutan kiri-kanan tetap, tapi segitiga kini menunjuk KE BAWAH (▼).',
      ),
    },

    // Beat 2 — annotate triangle inversion
    {
      shapes: afterFlip1,
      stateLabel: t('After flip 1 — over top edge', 'Setelah balik 1 — tepi atas'),
      highlightSlot: 2,  // highlight the right slot (triangle-down)
      hold: 2200,
      result: false,
      caption: t(
        'The triangle was pointing up (△). After flipping over the top edge it now points down (▼). The circle and square are unchanged.',
        'Segitiga tadinya menunjuk ke atas (△). Setelah dibalik melewati tepi atas, kini menunjuk ke bawah (▼). Lingkaran dan persegi tidak berubah.',
      ),
    },

    // Beat 3 — flip over left edge
    {
      shapes: afterFlip2,
      stateLabel: t('After flip 2 — over left edge', 'Setelah balik 2 — tepi kiri'),
      highlightSlot: null,
      hold: 2400,
      result: false,
      caption: t(
        'Now flip over the left edge: the card rotates sideways. Left and right columns swap. The ▼ moves to the left, the circle moves to the right.',
        'Sekarang balik melewati tepi kiri: kartu berputar ke samping. Kolom kiri dan kanan bertukar. ▼ berpindah ke kiri, lingkaran berpindah ke kanan.',
      ),
    },

    // Beat 4 — annotate column swap
    {
      shapes: afterFlip2,
      stateLabel: t('After flip 2 — over left edge', 'Setelah balik 2 — tepi kiri'),
      highlightSlot: 0,  // highlight the left slot (tri-down)
      hold: 2200,
      result: false,
      caption: t(
        'The ▼ (was on the right) is now on the LEFT. The square stays in the middle. The circle (was on the left) is now on the RIGHT.',
        '▼ (tadinya di kanan) kini berada di KIRI. Persegi tetap di tengah. Lingkaran (tadinya di kiri) kini di KANAN.',
      ),
    },

    // Beat 5 — result
    {
      shapes: afterFlip2,
      stateLabel: t('Final result', 'Hasil akhir'),
      highlightSlot: null,
      hold: 0,
      result: true,
      caption: t(
        'Two flips = 180° rotation. Final card: ▼ (left) | square (middle) | circle (right) = answer B.',
        'Dua kali balik = rotasi 180°. Kartu akhir: ▼ (kiri) | persegi (tengah) | lingkaran (kanan) = jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'B' }
}
