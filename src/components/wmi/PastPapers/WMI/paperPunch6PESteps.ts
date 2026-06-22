// IKMC-21-PE-Q6 — storyboard for the four-papers punch-hole animation.
//
// Question: Four identical pieces of paper are placed as shown. Michael wants
// to punch a hole that goes through all four pieces. At which point should
// Michael punch the hole?
// Answer: D.
//
// Key insight: the point must lie in the overlapping region covered by all four
// sheets simultaneously. Only point D sits in that central intersection.
//
// Teaching walk, one idea per beat:
//   0. intro    — show all four sheets with the five points A–E.
//   1. rule     — a hole through ALL four means the point must be on every sheet.
//   2. check-A  — point A: only on some sheets, not all four.
//   3. check-B  — point B: only on some sheets, not all four.
//   4. check-C  — point C: only on some sheets, not all four.
//   5. check-E  — point E: only on one sheet, not all four.
//   6. overlap  — reveal the overlap region where all four sheets coincide.
//   7. check-D  — point D lies exactly in that overlap — it goes through all four.
//   8. result   — answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PointLabel = 'A' | 'B' | 'C' | 'D' | 'E' | null

export interface PaperPunch6PEBeat {
  /** Point to spotlight with amber ring (null = none). */
  activePoint: PointLabel
  /** Whether to shade the 4-sheet overlap region. */
  showOverlap: boolean
  /** Whether to mark point D in green (final answer). */
  showAnswer: boolean
  /** Caption text for this beat. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the last result beat. */
  result: boolean
}

export interface PaperPunch6PEStoryboard {
  steps: PaperPunch6PEBeat[]
  finalIndex: number
  answer: string
}

export function buildPaperPunch6PESteps(lang: Lang): PaperPunch6PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PaperPunch6PEBeat[] = [
    // Beat 0 — intro
    {
      activePoint: null,
      showOverlap: false,
      showAnswer:  false,
      hold: 2400,
      result: false,
      caption: t(
        'Four identical sheets of paper are stacked in a staircase. Points A–E are marked. Which point goes through ALL four sheets?',
        'Empat lembar kertas identik ditumpuk seperti tangga. Titik A–E ditandai. Titik mana yang menembus KEEMPAT lembar?',
      ),
    },

    // Beat 1 — rule
    {
      activePoint: null,
      showOverlap: false,
      showAnswer:  false,
      hold: 2400,
      result: false,
      caption: t(
        'The hole must go through ALL four sheets at once — the point must lie on every single sheet.',
        'Lubang harus menembus KEEMPAT lembar sekaligus — titik tersebut harus berada di setiap lembar.',
      ),
    },

    // Beat 2 — check A
    {
      activePoint: 'A',
      showOverlap: false,
      showAnswer:  false,
      hold: 2000,
      result: false,
      caption: t(
        'Point A is near the top-left — it is not on all four sheets.',
        'Titik A di pojok kiri atas — tidak berada di keempat lembar.',
      ),
    },

    // Beat 3 — check B
    {
      activePoint: 'B',
      showOverlap: false,
      showAnswer:  false,
      hold: 2000,
      result: false,
      caption: t(
        'Point B is near the top-right — it is not on all four sheets.',
        'Titik B di pojok kanan atas — tidak berada di keempat lembar.',
      ),
    },

    // Beat 4 — check C
    {
      activePoint: 'C',
      showOverlap: false,
      showAnswer:  false,
      hold: 2000,
      result: false,
      caption: t(
        'Point C is near the bottom-left — it is not on all four sheets.',
        'Titik C di pojok kiri bawah — tidak berada di keempat lembar.',
      ),
    },

    // Beat 5 — check E
    {
      activePoint: 'E',
      showOverlap: false,
      showAnswer:  false,
      hold: 2000,
      result: false,
      caption: t(
        'Point E is near the bottom-right — it is not on all four sheets either.',
        'Titik E di pojok kanan bawah — juga tidak berada di keempat lembar.',
      ),
    },

    // Beat 6 — reveal overlap
    {
      activePoint: null,
      showOverlap: true,
      showAnswer:  false,
      hold: 2200,
      result: false,
      caption: t(
        'The shaded region is where ALL four sheets overlap — this is the only area covered by every sheet.',
        'Area yang diarsir adalah tempat KEEMPAT lembar bertemu — satu-satunya area yang tertutup oleh setiap lembar.',
      ),
    },

    // Beat 7 — check D
    {
      activePoint: 'D',
      showOverlap: true,
      showAnswer:  false,
      hold: 2200,
      result: false,
      caption: t(
        'Point D lies inside the overlap region — it is on every single one of the four sheets!',
        'Titik D berada di dalam area irisan — titik ini ada di setiap lembar dari keempat lembar!',
      ),
    },

    // Beat 8 — result
    {
      activePoint: 'D',
      showOverlap: true,
      showAnswer:  true,
      hold: 0,
      result: true,
      caption: t(
        'Only point D goes through all four sheets. Answer: D.',
        'Hanya titik D yang menembus keempat lembar. Jawaban: D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'D' }
}
