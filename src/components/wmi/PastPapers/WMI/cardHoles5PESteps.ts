// IKMC-20-PE-Q5 — storyboard for the card-holes overlay animation.
//
// Question: José has two cards of the same size. Card A has four holes cut in
// it. José places card A directly on top of card B. What can José see?
// Answer: A.
//
// Card B has 6 black stars in a 3×2 grid.
// Card A has 4 holes: top-right (tr), left-center (lc), right-center (rc),
// bottom-left (bl).
//
// Each hole either reveals a star (the hole overlaps a star on card B) or shows
// nothing (no star behind it). The correct result (answer A) shows:
//   tr → star (black)
//   lc → star (black)
//   rc → star (black)
//   bl → no star (empty ring)
//
// Teaching walk, one idea per beat:
//   0. intro     — show card A + card B side by side; state the task.
//   1. overlay   — place card A on top of card B (overlaid view).
//   2. hole-tr   — spotlight top-right hole: a star shows through.
//   3. hole-lc   — spotlight left-center hole: a star shows through.
//   4. hole-rc   — spotlight right-center hole: a star shows through.
//   5. hole-bl   — spotlight bottom-left hole: no star behind it (empty).
//   6. result    — show all: 3 stars + 1 empty = answer A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type HoleId = 'tr' | 'lc' | 'rc' | 'bl'

export interface CardHoles5PEBeat {
  /** True after the overlay step (shows card A on top of card B). */
  overlaid: boolean
  /** Which hole is spotlighted this beat (amber ring). */
  activeHole: HoleId | null
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CardHoles5PEStoryboard {
  steps: CardHoles5PEBeat[]
  finalIndex: number
  /** The correct answer label. */
  answer: string
}

export function buildCardHoles5PESteps(lang: Lang): CardHoles5PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CardHoles5PEBeat[] = [
    // Beat 0 — intro: show side-by-side
    {
      overlaid: false,
      activeHole: null,
      hold: 2400,
      result: false,
      caption: t(
        'Card A has 4 holes. Card B has 6 stars. Place card A on card B — what shows through the holes?',
        'Kartu A punya 4 lubang. Kartu B punya 6 bintang. Letakkan kartu A di atas kartu B — apa yang terlihat melalui lubang?',
      ),
    },

    // Beat 1 — overlay
    {
      overlaid: true,
      activeHole: null,
      hold: 2000,
      result: false,
      caption: t(
        'Card A is placed on top of card B. We can only see card B through the holes.',
        'Kartu A diletakkan di atas kartu B. Kita hanya bisa melihat kartu B melalui lubang-lubang.',
      ),
    },

    // Beat 2 — top-right hole: star
    {
      overlaid: true,
      activeHole: 'tr',
      hold: 2200,
      result: false,
      caption: t(
        'Top-right hole: a star on card B is right behind it — so a star shows through.',
        'Lubang kanan atas: ada bintang di kartu B tepat di belakangnya — jadi bintang terlihat.',
      ),
    },

    // Beat 3 — left-center hole: star
    {
      overlaid: true,
      activeHole: 'lc',
      hold: 2200,
      result: false,
      caption: t(
        'Left-center hole: another star is behind it — a star shows through.',
        'Lubang tengah kiri: ada bintang di belakangnya — bintang terlihat.',
      ),
    },

    // Beat 4 — right-center hole: star
    {
      overlaid: true,
      activeHole: 'rc',
      hold: 2200,
      result: false,
      caption: t(
        'Right-center hole: a star is behind it — a star shows through.',
        'Lubang tengah kanan: ada bintang di belakangnya — bintang terlihat.',
      ),
    },

    // Beat 5 — bottom-left hole: no star
    {
      overlaid: true,
      activeHole: 'bl',
      hold: 2200,
      result: false,
      caption: t(
        'Bottom-left hole: no star on card B behind it — the hole is empty.',
        'Lubang kiri bawah: tidak ada bintang di kartu B di belakangnya — lubang kosong.',
      ),
    },

    // Beat 6 — result
    {
      overlaid: true,
      activeHole: null,
      hold: 0,
      result: true,
      caption: t(
        '3 stars + 1 empty hole = answer A.',
        '3 bintang + 1 lubang kosong = jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'A' }
}
