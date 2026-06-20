// IKMC-19-PE-Q11 — storyboard for the card-stack removal animation.
//
// The question: Five square cards are stacked. Removed one by one from the top.
// Determine the order. Answer D: 5 → 2 → 3 → 1 → 4.
//
// Teaching walk, one idea per beat:
//   0. intro     — static stack; the topmost card (5) is on top with no card above it.
//   1. remove-5  — card 5 removed; highlight card 2 as the new top.
//   2. remove-2  — card 2 removed; highlight card 3 as the new top.
//   3. remove-3  — card 3 removed; highlight card 1 as the new top.
//   4. remove-1  — card 1 removed; highlight card 4 as the new top (and last).
//   5. result    — card 4 removed; answer D shown.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export interface CardStack11Beat {
  /** Cards removed so far (shown faded in the SVG). */
  removed: ReadonlySet<number>
  /**
   * Which card is now on top and about to be removed (-1 = none).
   * The explainer renders a dashed amber ring around this card.
   */
  topCard: number | null
  /** Partial removal sequence built so far (e.g. "5 → 2"). */
  sequence: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CardStack11Storyboard {
  steps: CardStack11Beat[]
  finalIndex: number
}

export function buildCardStack11Steps(lang: Lang): CardStack11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CardStack11Beat[] = [
    // Beat 0 — intro: show the full static stack
    {
      removed: new Set(),
      topCard: 5,
      sequence: '',
      hold: 2200,
      result: false,
      caption: t(
        'Look at the stack. Card 5 has no card on top of it — it is the topmost card and is removed first.',
        'Perhatikan tumpukan. Kartu 5 tidak ada kartu lain di atasnya — kartu 5 adalah yang paling atas dan diambil pertama.',
      ),
    },

    // Beat 1 — card 5 removed
    {
      removed: new Set([5]),
      topCard: 2,
      sequence: '5',
      hold: 2200,
      result: false,
      caption: t(
        'Card 5 is removed (1st). Now card 2 is on top.',
        'Kartu 5 diambil (urutan ke-1). Sekarang kartu 2 ada di atas.',
      ),
    },

    // Beat 2 — card 2 removed
    {
      removed: new Set([5, 2]),
      topCard: 3,
      sequence: '5 → 2',
      hold: 2200,
      result: false,
      caption: t(
        'Card 2 is removed (2nd). Now card 3 is on top.',
        'Kartu 2 diambil (urutan ke-2). Sekarang kartu 3 ada di atas.',
      ),
    },

    // Beat 3 — card 3 removed
    {
      removed: new Set([5, 2, 3]),
      topCard: 1,
      sequence: '5 → 2 → 3',
      hold: 2200,
      result: false,
      caption: t(
        'Card 3 is removed (3rd). Now card 1 is on top.',
        'Kartu 3 diambil (urutan ke-3). Sekarang kartu 1 ada di atas.',
      ),
    },

    // Beat 4 — card 1 removed
    {
      removed: new Set([5, 2, 3, 1]),
      topCard: 4,
      sequence: '5 → 2 → 3 → 1',
      hold: 2200,
      result: false,
      caption: t(
        'Card 1 is removed (4th). Card 4 is the last one remaining.',
        'Kartu 1 diambil (urutan ke-4). Kartu 4 adalah yang terakhir tersisa.',
      ),
    },

    // Beat 5 — result
    {
      removed: new Set([5, 2, 3, 1, 4]),
      topCard: null,
      sequence: '5 → 2 → 3 → 1 → 4',
      hold: 0,
      result: true,
      caption: t(
        'Card 4 is removed last. Removal order: 5 → 2 → 3 → 1 → 4 — answer D.',
        'Kartu 4 diambil terakhir. Urutan pengambilan: 5 → 2 → 3 → 1 → 4 — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
