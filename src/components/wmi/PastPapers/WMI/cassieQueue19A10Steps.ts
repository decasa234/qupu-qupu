// SEAMO-19-A-Q10 — storyboard for "Cassie queue" animation.
//
// The question: Cassie is 12th from front and 5th from back.
// How many people are in the queue? Answer: A = 16.
//
// Key insight:
//   Total = (rank from front) + (rank from back) − 1
//         = 12 + 5 − 1 = 16.
//   Equivalently: 11 people in front + Cassie + 4 people behind = 16.
//
// Animation beats:
//   0. intro   — show queue; state positions.
//   1. front   — highlight the 11 people in front of Cassie.
//   2. back    — highlight the 4 people behind Cassie.
//   3. count   — annotate: 11 + 1 + 4 = 16.
//   4. trap    — show the common mistake (12 + 5 = 17 double-counts Cassie).
//   5. result  — reveal total = 16. Answer A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId =
  | 'intro'
  | 'front'
  | 'back'
  | 'count'
  | 'trap'
  | 'result'

export interface AnimBeat {
  phase: PhaseId
  /** Which group to highlight visually: 'none'|'front'|'back'|'all' */
  highlight: 'none' | 'front' | 'back' | 'all'
  /** Show the trap annotation (12+5=17 wrong). */
  showTrap: boolean
  /** Show the correct count annotation (11+1+4=16). */
  showCount: boolean
  caption: string
  hold: number
  result: boolean
}

export interface CassieQueueStoryboard {
  steps: AnimBeat[]
  finalIndex: number
}

export function buildCassieQueue19A10Steps(lang: Lang): CassieQueueStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: 'none',
      showTrap: false,
      showCount: false,
      hold: 2400,
      result: false,
      caption: t(
        'Cassie is queuing for an iPhone. She is 12th from the front and 5th from the back.',
        'Cassie sedang mengantri untuk iPhone. Ia berada di posisi ke-12 dari depan dan ke-5 dari belakang.',
      ),
    },

    // Beat 1 — front group
    {
      phase: 'front',
      highlight: 'front',
      showTrap: false,
      showCount: false,
      hold: 2000,
      result: false,
      caption: t(
        'She is 12th from front → 11 people are ahead of her (positions 1–11).',
        'Ia ke-12 dari depan → 11 orang berada di depannya (posisi 1–11).',
      ),
    },

    // Beat 2 — back group
    {
      phase: 'back',
      highlight: 'back',
      showTrap: false,
      showCount: false,
      hold: 2000,
      result: false,
      caption: t(
        'She is 5th from back → 4 people are behind her (positions 13–16).',
        'Ia ke-5 dari belakang → 4 orang berada di belakangnya (posisi 13–16).',
      ),
    },

    // Beat 3 — count
    {
      phase: 'count',
      highlight: 'all',
      showTrap: false,
      showCount: true,
      hold: 2600,
      result: false,
      caption: t(
        'Total = 11 (front) + 1 (Cassie) + 4 (back) = 16 people.',
        'Total = 11 (depan) + 1 (Cassie) + 4 (belakang) = 16 orang.',
      ),
    },

    // Beat 4 — trap
    {
      phase: 'trap',
      highlight: 'all',
      showTrap: true,
      showCount: false,
      hold: 2400,
      result: false,
      caption: t(
        'Common mistake: 12 + 5 = 17 — this counts Cassie twice! Subtract 1: 12 + 5 − 1 = 16.',
        'Kesalahan umum: 12 + 5 = 17 — ini menghitung Cassie dua kali! Kurangi 1: 12 + 5 − 1 = 16.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlight: 'all',
      showTrap: false,
      showCount: true,
      hold: 0,
      result: true,
      caption: t(
        '16 people are in the queue. Answer: A.',
        '16 orang dalam antrean. Jawaban: A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
