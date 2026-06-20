// IKMC-19-PE-Q7 — storyboard for the socks-pairing animation.
//
// The question: Jorge has 12 socks labelled 1–8.  Two socks with the same
// number make a pair.  Which numbers have TWO socks?
//   Numbers and their counts: 1×2  2×2  3×2  5×2  7×2  6×1  8×1
//   → 5 pairs (numbers 1,2,3,5,7). Answer C.
//
// Animation walk — one beat per pair found, then result:
//   0. intro   — full pile, "find matching numbers"
//   1. pair-1  — highlight both 1s (1st pair)
//   2. pair-2  — highlight both 2s (2nd pair, counter shows 2)
//   3. pair-3  — highlight both 3s (3rd pair, counter shows 3)
//   4. pair-4  — highlight both 5s (4th pair, counter shows 4)
//   5. pair-5  — highlight both 7s (5th pair, counter shows 5)
//   6. result  — all 5 pairs visible, "5 pairs → answer C"
//
// Pure builder: (lang) → storyboard.  No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type SockPhaseId =
  | 'intro'
  | 'pair-1'
  | 'pair-2'
  | 'pair-3'
  | 'pair-4'
  | 'pair-5'
  | 'result'

export interface SockBeat {
  phase: SockPhaseId
  /** Numbers to highlight (both socks of the pair found so far). */
  litNumbers: number[]
  /** Running pair count to show (0 = none). */
  pairCount: number
  /** Equation / label chip; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface SockStoryboard {
  steps: SockBeat[]
  finalIndex: number
}

export function buildSocks7Steps(lang: Lang): SockStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SockBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      litNumbers: [],
      pairCount: 0,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Find all the socks that share the same number — those make a pair!',
        'Cari semua kaus kaki yang memiliki angka yang sama — itulah sepasang!',
      ),
    },

    // Beat 1 — pair 1: number 1
    {
      phase: 'pair-1',
      litNumbers: [1],
      pairCount: 1,
      equation: t('1 + 1 → pair 1', '1 + 1 → pasang ke-1'),
      hold: 2000,
      result: false,
      caption: t(
        'Two socks labelled 1 — that\'s pair 1!',
        'Dua kaus kaki berlabel 1 — itu pasang ke-1!',
      ),
    },

    // Beat 2 — pair 2: number 2
    {
      phase: 'pair-2',
      litNumbers: [1, 2],
      pairCount: 2,
      equation: t('2 + 2 → pair 2', '2 + 2 → pasang ke-2'),
      hold: 2000,
      result: false,
      caption: t(
        'Two socks labelled 2 — that\'s pair 2!',
        'Dua kaus kaki berlabel 2 — itu pasang ke-2!',
      ),
    },

    // Beat 3 — pair 3: number 3
    {
      phase: 'pair-3',
      litNumbers: [1, 2, 3],
      pairCount: 3,
      equation: t('3 + 3 → pair 3', '3 + 3 → pasang ke-3'),
      hold: 2000,
      result: false,
      caption: t(
        'Two socks labelled 3 — that\'s pair 3!',
        'Dua kaus kaki berlabel 3 — itu pasang ke-3!',
      ),
    },

    // Beat 4 — pair 4: number 5
    {
      phase: 'pair-4',
      litNumbers: [1, 2, 3, 5],
      pairCount: 4,
      equation: t('5 + 5 → pair 4', '5 + 5 → pasang ke-4'),
      hold: 2000,
      result: false,
      caption: t(
        'Two socks labelled 5 — that\'s pair 4! (Numbers 6 and 8 appear only once — no pair.)',
        'Dua kaus kaki berlabel 5 — itu pasang ke-4! (Angka 6 dan 8 hanya ada satu — tidak berpasangan.)',
      ),
    },

    // Beat 5 — pair 5: number 7
    {
      phase: 'pair-5',
      litNumbers: [1, 2, 3, 5, 7],
      pairCount: 5,
      equation: t('7 + 7 → pair 5', '7 + 7 → pasang ke-5'),
      hold: 2000,
      result: false,
      caption: t(
        'Two socks labelled 7 — that\'s pair 5! We found all 5 pairs.',
        'Dua kaus kaki berlabel 7 — itu pasang ke-5! Kita sudah menemukan 5 pasang.',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      litNumbers: [1, 2, 3, 5, 7],
      pairCount: 5,
      equation: t('5 pairs → C', '5 pasang → C'),
      hold: 0,
      result: true,
      caption: t(
        'Jorge can make 5 pairs: numbers 1, 2, 3, 5, and 7 each have two socks. Answer C.',
        'Jorge bisa membuat 5 pasang: angka 1, 2, 3, 5, dan 7 masing-masing memiliki dua kaus kaki. Jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
