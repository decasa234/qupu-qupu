// IKMC-21-PE-Q1 — storyboard for the "3 sticks → which shape?" animation.
//
// The question: a kangaroo has 3 equal-length straight sticks.  It lays them
// down WITHOUT breaking or bending them.  Which of the five picture shapes
// could it make?
//
// Key insight — count the sticks needed for each option:
//   A (8-armed star):  4 sticks × 2 arms each = 4 sticks ✗
//   B (H-shape):       3 sticks, BUT the horizontal bar is shorter than the
//                      verticals — you would need to cut it, so impossible. ✗
//   C (cross-diagonal):3 segments, but different lengths — impossible with
//                      3 equal sticks. ✗
//   D (diamond+cross): 6 sticks ✗
//   E (6-armed star):  3 sticks, each passing through the centre at
//                      0°, 60°, 120° — ALL the same length, no cutting,
//                      no bending. ✓
//
// Teaching walk (one idea per beat):
//   0. intro      — "We have 3 straight sticks. Rules: no breaking, no bending."
//   1. countSticks — "Each arm of a crossing-point figure comes from ONE stick
//                     going both ways. Count arms ÷ 2 = sticks needed."
//   2. checkA     — "A has 8 arms → 4 sticks. ✗"
//   3. checkB     — "B has 3 segments, BUT the middle bar is shorter. ✗"
//   4. checkCD    — "C has unequal lengths. D needs 6 sticks. Both ✗."
//   5. checkE     — "E has 6 arms → 3 sticks, all equal. ✓"
//   6. result     — "Answer: E."
//
// Pure builder: (lang) → storyboard.  No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Sticks1PhaseId =
  | 'intro'
  | 'countSticks'
  | 'checkA'
  | 'checkB'
  | 'checkCD'
  | 'checkE'
  | 'result'

export interface Sticks1Beat {
  /** Animation phase identifier. */
  phase: Sticks1PhaseId
  /**
   * Which option label(s) are spotlit this beat.
   * Empty set = no spotlight (intro / concept beats).
   */
  spotlight: ReadonlyArray<'A' | 'B' | 'C' | 'D' | 'E'>
  /**
   * Options that are highlighted as WRONG (red outline).
   * Accumulated across beats.
   */
  eliminated: ReadonlyArray<'A' | 'B' | 'C' | 'D' | 'E'>
  /** Equation or tally string shown below the figure; '' to hide. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface Sticks1Storyboard {
  steps: Sticks1Beat[]
  finalIndex: number
}

export function buildSticks1PESteps(lang: Lang): Sticks1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Sticks1Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      spotlight: [],
      eliminated: [],
      equation: t('3 sticks', '3 batang'),
      hold: 2200,
      result: false,
      caption: t(
        'The kangaroo has 3 straight sticks — all the SAME length. No breaking, no bending!',
        'Kanguru punya 3 batang lurus — semua SAMA PANJANG. Tidak boleh dipatahkan atau dibengkokkan!',
      ),
    },

    // Beat 1 — key idea: count sticks from arm count
    {
      phase: 'countSticks',
      spotlight: [],
      eliminated: [],
      equation: t('arms ÷ 2 = sticks', 'lengan ÷ 2 = batang'),
      hold: 2400,
      result: false,
      caption: t(
        'A stick laid across the centre makes 2 arms. So: count the arms, divide by 2 → sticks needed.',
        'Satu batang yang melewati titik tengah membentuk 2 lengan. Jadi: hitung lengan, bagi 2 → jumlah batang.',
      ),
    },

    // Beat 2 — option A eliminated
    {
      phase: 'checkA',
      spotlight: ['A'],
      eliminated: ['A'],
      equation: '8 ÷ 2 = 4',
      hold: 2000,
      result: false,
      caption: t(
        'A has 8 arms → needs 4 sticks. Too many! ✗',
        'A punya 8 lengan → butuh 4 batang. Terlalu banyak! ✗',
      ),
    },

    // Beat 3 — option B eliminated
    {
      phase: 'checkB',
      spotlight: ['B'],
      eliminated: ['A', 'B'],
      equation: t('unequal lengths', 'panjang tidak sama'),
      hold: 2200,
      result: false,
      caption: t(
        'B has 3 sticks, BUT the crossbar is shorter than the uprights — you\'d have to cut one. ✗',
        'B punya 3 batang, TAPI batang tengahnya lebih pendek dari batang tegak — harus dipotong. ✗',
      ),
    },

    // Beat 4 — options C and D eliminated
    {
      phase: 'checkCD',
      spotlight: ['C', 'D'],
      eliminated: ['A', 'B', 'C', 'D'],
      equation: t('C: unequal  D: 6 sticks', 'C: tidak sama  D: 6 batang'),
      hold: 2200,
      result: false,
      caption: t(
        'C uses segments of different lengths (impossible with equal sticks). D needs 6 sticks. Both ✗.',
        'C menggunakan segmen dengan panjang berbeda (tidak mungkin dengan batang sama). D butuh 6 batang. Keduanya ✗.',
      ),
    },

    // Beat 5 — option E confirmed
    {
      phase: 'checkE',
      spotlight: ['E'],
      eliminated: ['A', 'B', 'C', 'D'],
      equation: '6 ÷ 2 = 3 ✓',
      hold: 2200,
      result: false,
      caption: t(
        'E has 6 arms → 3 sticks, all the same length, crossing at one point (at 0°, 60°, 120°). ✓',
        'E punya 6 lengan → 3 batang, semua sama panjang, bersilang di satu titik (0°, 60°, 120°). ✓',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      spotlight: ['E'],
      eliminated: ['A', 'B', 'C', 'D'],
      equation: t('Answer: E', 'Jawaban: E'),
      hold: 0,
      result: true,
      caption: t(
        'The 6-armed star uses exactly 3 equal, straight, unbroken sticks — answer E.',
        'Bintang 6 lengan menggunakan tepat 3 batang lurus sama panjang tanpa memotong — jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
