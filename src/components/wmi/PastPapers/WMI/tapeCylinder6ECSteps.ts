// IKMC-21-EC-Q6 — storyboard for the measuring-tape / cylinder animation.
//
// The question: A measuring tape is wrapped around a cylinder. Visible numbers:
//   bottom wrap: 3, 4, 5, 6
//   middle wrap: 18, 19, 20, 21
//   top wrap:    33, ?
// What number replaces "?"?  Answer C (48).
//
// Teaching walk, one idea per beat:
//   0. intro   — show the static figure; the tape spirals around.
//   1. col     — highlight a vertical column: 3, 18, 33 — same angular position.
//   2. diff    — 18 − 3 = 15 and 33 − 18 = 15 → increment per revolution = 15.
//   3. extend  — 33 + 15 = 48 → that is the missing number.
//   4. result  — 48 → answer C (green).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type TapePhaseId = 'intro' | 'col' | 'diff' | 'extend' | 'result'

export interface TapeBeat {
  phase: TapePhaseId
  /** Highlight the vertical column of matching tape positions. */
  showColumn: boolean
  /** Show the "+15" increment annotations between column values. */
  showIncrement: boolean
  /** Show the "33 + 15 = 48" extension arrow. */
  showExtend: boolean
  /** Equation / maths line shown below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TapeStoryboard {
  steps: TapeBeat[]
  finalIndex: number
}

export function buildTapeCylinder6ECSteps(lang: Lang): TapeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TapeBeat[] = [
    // Beat 0 — intro: show the static scene
    {
      phase: 'intro',
      showColumn: false,
      showIncrement: false,
      showExtend: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'A measuring tape spirals around the cylinder. Three wraps are visible, each showing a few numbers.',
        'Pita ukur melingkar mengelilingi silinder. Tiga lilitan terlihat, masing-masing menampilkan beberapa angka.',
      ),
    },

    // Beat 1 — pick the column: 3, 18, 33 are at the same angular position
    {
      phase: 'col',
      showColumn: true,
      showIncrement: false,
      showExtend: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Look at the same spot on each wrap: the numbers 3, 18, and 33 all line up vertically.',
        'Perhatikan posisi yang sama pada setiap lilitan: angka 3, 18, dan 33 semuanya sejajar secara vertikal.',
      ),
    },

    // Beat 2 — find the increment: 18 − 3 = 15, 33 − 18 = 15
    {
      phase: 'diff',
      showColumn: true,
      showIncrement: true,
      showExtend: false,
      equation: '18 − 3 = 15  |  33 − 18 = 15',
      hold: 2400,
      result: false,
      caption: t(
        'Each full revolution adds 15. The tape increases by 15 per wrap around the cylinder.',
        'Setiap putaran penuh menambah 15. Pita bertambah 15 per lilitan mengelilingi silinder.',
      ),
    },

    // Beat 3 — extend to find "?"
    {
      phase: 'extend',
      showColumn: true,
      showIncrement: false,
      showExtend: true,
      equation: '33 + 15 = 48',
      hold: 2200,
      result: false,
      caption: t(
        'The "?" is one step after 33 in the same column, so 33 + 15 = 48.',
        'Tanda "?" berada satu langkah setelah 33 dalam kolom yang sama, jadi 33 + 15 = 48.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      showColumn: false,
      showIncrement: false,
      showExtend: true,
      equation: '48 → C',
      hold: 0,
      result: true,
      caption: t(
        'The number at the "?" is 48 — answer C.',
        'Angka di tanda "?" adalah 48 — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
