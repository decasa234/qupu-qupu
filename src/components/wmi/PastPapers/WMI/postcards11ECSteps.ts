// IKMC-22-EC-Q11 — storyboard for the postcard-assignment explainer.
//
// Problem: 5 postcards (A–E) were sent to 5 friends.
//   Clues:
//     1. There are no ducks on Mike's card.
//     2. Cara's card has the sun on it.
//     3. There are exactly two living creatures on Paula's card.
//     4. Lexi's card has a dog on it.
//     5. There are kangaroos on Heather's card.
//
// Assignment logic (elimination):
//   Lexi   → E (dog)        [clue 4 — direct]
//   Heather → B (kangaroos) [clue 5 — direct]
//   Cara   → D (has sun + ducks) [clue 2 — D has sun in corner]
//   Paula  → C (ladybug + fly = 2 creatures) [clue 3]
//   Mike   → A (remaining; no ducks ✓) [clue 1 confirms]
//
// Answer: A (sunset card)
//
// Teaching beats — one idea per beat:
//   0. intro       — show all 5 cards; state the task.
//   1. lexi        — clue 4 assigns Lexi → E (dog).
//   2. heather     — clue 5 assigns Heather → B (kangaroos).
//   3. cara        — clue 2 assigns Cara → D (has the sun).
//   4. paula       — clue 3 assigns Paula → C (ladybug + fly = 2 creatures).
//   5. mike        — clue 1 confirms Mike → A (no ducks, the only card left).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'lexi' | 'heather' | 'cara' | 'paula' | 'mike'

export interface AnimBeat {
  phase: PhaseId
  /** Which cards are highlighted (the newly-assigned one). Empty means none yet. */
  highlightCard: string
  /** Assignment labels visible so far: Map of card letter → friend name. */
  assignments: Array<{ card: string; friend: string }>
  /** Card letters crossed out (assigned but now grayed out). */
  eliminated: string[]
  /** Caption text for the explanation box. */
  caption: string
  /** Short maths/logic line to display; '' to hide. */
  equation: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Postcards11Storyboard {
  steps: AnimBeat[]
  finalIndex: number
}

export function buildPostcards11ECSteps(lang: Lang): Postcards11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightCard: '',
      assignments: [],
      eliminated: [],
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Five postcards, five clues — one card per friend. Assign the easy ones first, then Mike\'s card is whatever remains.',
        'Lima kartu pos, lima petunjuk — satu kartu per teman. Tetapkan yang mudah lebih dulu, lalu kartu Mike adalah yang tersisa.',
      ),
    },

    // Beat 1 — Lexi → E (dog)
    {
      phase: 'lexi',
      highlightCard: 'E',
      assignments: [{ card: 'E', friend: 'Lexi' }],
      eliminated: ['E'],
      equation: t('Lexi ← dog card = E', 'Lexi ← kartu anjing = E'),
      hold: 2400,
      result: false,
      caption: t(
        'Clue 4: Lexi\'s card has a dog on it. Card E shows a dachshund → Lexi gets E.',
        'Petunjuk 4: Kartu Lexi memiliki gambar anjing. Kartu E menunjukkan anjing → Lexi mendapat E.',
      ),
    },

    // Beat 2 — Heather → B (kangaroos)
    {
      phase: 'heather',
      highlightCard: 'B',
      assignments: [{ card: 'E', friend: 'Lexi' }, { card: 'B', friend: 'Heather' }],
      eliminated: ['E', 'B'],
      equation: t('Heather ← kangaroo card = B', 'Heather ← kartu kanguru = B'),
      hold: 2400,
      result: false,
      caption: t(
        'Clue 5: There are kangaroos on Heather\'s card. Card B shows two kangaroos → Heather gets B.',
        'Petunjuk 5: Ada kanguru di kartu Heather. Kartu B menunjukkan dua kanguru → Heather mendapat B.',
      ),
    },

    // Beat 3 — Cara → D (sun)
    {
      phase: 'cara',
      highlightCard: 'D',
      assignments: [
        { card: 'E', friend: 'Lexi' },
        { card: 'B', friend: 'Heather' },
        { card: 'D', friend: 'Cara' },
      ],
      eliminated: ['E', 'B', 'D'],
      equation: t('Cara ← sun card = D', 'Cara ← kartu matahari = D'),
      hold: 2400,
      result: false,
      caption: t(
        'Clue 2: Cara\'s card has the sun on it. Card D shows a sun in the corner → Cara gets D.',
        'Petunjuk 2: Kartu Cara memiliki gambar matahari. Kartu D menunjukkan matahari di pojok → Cara mendapat D.',
      ),
    },

    // Beat 4 — Paula → C (2 creatures)
    {
      phase: 'paula',
      highlightCard: 'C',
      assignments: [
        { card: 'E', friend: 'Lexi' },
        { card: 'B', friend: 'Heather' },
        { card: 'D', friend: 'Cara' },
        { card: 'C', friend: 'Paula' },
      ],
      eliminated: ['E', 'B', 'D', 'C'],
      equation: t('Paula ← 2 creatures = C', 'Paula ← 2 makhluk hidup = C'),
      hold: 2400,
      result: false,
      caption: t(
        'Clue 3: Exactly two living creatures on Paula\'s card. Card C has a ladybug and a fly (2 creatures) → Paula gets C.',
        'Petunjuk 3: Tepat dua makhluk hidup di kartu Paula. Kartu C memiliki kepik dan lalat (2 makhluk) → Paula mendapat C.',
      ),
    },

    // Beat 5 — Mike → A (result)
    {
      phase: 'mike',
      highlightCard: 'A',
      assignments: [
        { card: 'E', friend: 'Lexi' },
        { card: 'B', friend: 'Heather' },
        { card: 'D', friend: 'Cara' },
        { card: 'C', friend: 'Paula' },
        { card: 'A', friend: 'Mike' },
      ],
      eliminated: [],
      equation: t('Mike ← A (no ducks ✓)', 'Mike ← A (tidak ada bebek ✓)'),
      hold: 0,
      result: true,
      caption: t(
        'Only card A is left — and it has no ducks (just a sunset). Clue 1 is confirmed. Mike gets card A.',
        'Hanya kartu A yang tersisa — dan tidak ada bebek di sana (hanya matahari terbenam). Petunjuk 1 terkonfirmasi. Mike mendapat kartu A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
