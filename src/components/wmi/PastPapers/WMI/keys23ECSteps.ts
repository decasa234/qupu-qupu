// IKMC-20-EC-Q23 — storyboard for the key-cutting explainer.
//
// Question: "Which key cannot be cut into three different figures of five
// shaded squares?"  Answer: B.
//
// Each key has 15 shaded squares (= 3 pentominoes of 5).  We must cut it into
// three *different* pentomino shapes. Key B's shape forces two of the three
// pieces to be identical, making it impossible.
//
// Teaching walk (one idea per beat):
//   0. intro     — each key has 15 squares = 3 × 5.
//   1. pentomino — a pentomino = 5 connected squares; cut must yield 3 different shapes.
//   2. keyA      — A can be cut into 3 different pentominoes (valid).
//   3. keyC      — C can be cut (valid).
//   4. keyD      — D can be cut (valid).
//   5. keyE      — E can be cut (valid).
//   6. keyB      — B always forces two identical pieces → impossible.
//   7. result    — answer B.
//
// Pure builder: (lang) → storyboard.  No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type KeyPhaseId =
  | 'intro'
  | 'pentomino'
  | 'keyA'
  | 'keyC'
  | 'keyD'
  | 'keyE'
  | 'keyB'
  | 'result'

export interface KeyBeat {
  phase: KeyPhaseId
  /** Which option is currently spotlighted ('A'–'E', null for non-key beats). */
  focus: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Whether the focused key is valid (true) or impossible (false). */
  valid: boolean | null
  /** Short equation / chip text ('', e.g. '15 = 3 × 5'). */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the answer beat. */
  result: boolean
}

export interface KeyStoryboard {
  steps: KeyBeat[]
  finalIndex: number
}

export function buildKeys23ECSteps(lang: Lang): KeyStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: KeyBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      focus: null,
      valid: null,
      equation: '15 = 3 × 5',
      hold: 2400,
      result: false,
      caption: t(
        'Each key shape has exactly 15 shaded squares — that is 3 groups of 5.',
        'Setiap bentuk kunci memiliki tepat 15 kotak arsir — yaitu 3 kelompok 5.',
      ),
    },

    // Beat 1 — what is a pentomino / cutting rule
    {
      phase: 'pentomino',
      focus: null,
      valid: null,
      equation: '3 × ▩▩▩▩▩',
      hold: 2600,
      result: false,
      caption: t(
        'We need to cut each key into 3 connected pieces of 5 squares each — and ALL THREE pieces must look different.',
        'Kita perlu memotong setiap kunci menjadi 3 bagian yang masing-masing terdiri dari 5 kotak terhubung — dan KETIGA bagian harus berbeda bentuk.',
      ),
    },

    // Beat 2 — key A valid
    {
      phase: 'keyA',
      focus: 'A',
      valid: true,
      equation: '✓ 3 different',
      hold: 2200,
      result: false,
      caption: t(
        'Key A can be cut into 3 different pentomino shapes — possible!',
        'Kunci A bisa dipotong menjadi 3 bentuk pentomino berbeda — mungkin!',
      ),
    },

    // Beat 3 — key C valid
    {
      phase: 'keyC',
      focus: 'C',
      valid: true,
      equation: '✓ 3 different',
      hold: 2200,
      result: false,
      caption: t(
        'Key C can also be cut into 3 different pentomino shapes — possible!',
        'Kunci C juga bisa dipotong menjadi 3 bentuk pentomino berbeda — mungkin!',
      ),
    },

    // Beat 4 — key D valid
    {
      phase: 'keyD',
      focus: 'D',
      valid: true,
      equation: '✓ 3 different',
      hold: 2200,
      result: false,
      caption: t(
        'Key D works too — 3 different pentomino pieces — possible!',
        'Kunci D pun bisa — 3 potongan pentomino berbeda — mungkin!',
      ),
    },

    // Beat 5 — key E valid
    {
      phase: 'keyE',
      focus: 'E',
      valid: true,
      equation: '✓ 3 different',
      hold: 2200,
      result: false,
      caption: t(
        'Key E can be cut into 3 different pentomino shapes — possible!',
        'Kunci E bisa dipotong menjadi 3 bentuk pentomino berbeda — mungkin!',
      ),
    },

    // Beat 6 — key B impossible
    {
      phase: 'keyB',
      focus: 'B',
      valid: false,
      equation: '✗ 2 same shape',
      hold: 2600,
      result: false,
      caption: t(
        'Key B is different: no matter how you try to cut it, two of the three pieces always end up the same shape — impossible!',
        'Kunci B berbeda: tidak peduli bagaimana kamu memotongnya, dua dari tiga bagian selalu berakhir dengan bentuk yang sama — tidak mungkin!',
      ),
    },

    // Beat 7 — result
    {
      phase: 'result',
      focus: 'B',
      valid: false,
      equation: 'B → impossible',
      hold: 0,
      result: true,
      caption: t(
        'Key B cannot be divided into three DIFFERENT pentomino shapes — the answer is B.',
        'Kunci B tidak dapat dibagi menjadi tiga bentuk pentomino BERBEDA — jawabannya adalah B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
