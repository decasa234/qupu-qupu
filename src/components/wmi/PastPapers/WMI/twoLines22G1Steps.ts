import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-22F1A-Q12 (Grade 1) — two equal lines of students.
//
// Dan is in the LEFT line with 5 students in front of him → counting Dan, he is
// the 6th from the front. Paul is in the RIGHT line, in the SAME row as Dan (so
// also 6th from the front) and has 4 students behind him. So each line is
// 6 + 4 = 10 long. Two equal lines → 10 + 10 = 20 students.
//
// We never assert "20"; the animation counts Dan's position (6), extends the
// line behind Paul (+4 = 10), copies it to the equal second line, then sums.

export const FRONT = 5 // students standing in front of Dan
export const DAN_POS = FRONT + 1 // 6 — Dan's place from the front (count Dan too)
export const BEHIND = 4 // students standing behind Paul
export const LINE_LEN = DAN_POS + BEHIND // 10 — length of one line
export const ANSWER = LINE_LEN * 2 // 20 — both lines

/** Which figure mark the StudentLines primitive should show this beat. */
export type LineMark = undefined | 'dan' | 'paul' | 'front' | 'behind' | 'all'

export interface TwoLinesStep {
  /** Mark passed straight to the StudentLines primitive. */
  mark: LineMark
  /** Running arithmetic chip shown above the caption (empty = none). */
  build: string
  caption: string
  hold: number
  result: boolean
}

export interface TwoLinesStoryboard {
  answer: string
  steps: TwoLinesStep[]
  finalIndex: number
}

export function buildTwoLines22G1Steps(lang: Lang): TwoLinesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TwoLinesStep[] = [
    {
      // Beat 1 — set the scene: two equal lines, nothing marked yet.
      mark: undefined,
      build: '',
      hold: 2200,
      result: false,
      caption: t(
        'Two lines of students stand side by side, and the two lines are EQUAL.',
        'Dua barisan murid berdiri berdampingan, dan kedua barisan itu SAMA PANJANG.',
      ),
    },
    {
      // Beat 2 — count in front of Dan: 5 in front, so Dan is the 6th.
      mark: 'front',
      build: `5 + 1 = ${DAN_POS}`,
      hold: 2600,
      result: false,
      caption: t(
        'Dan has 5 students in FRONT of him. Counting Dan too, he is the 6th: 5 + 1 = 6.',
        'Dan punya 5 murid di DEPANnya. Hitung Dan juga, ia ada di urutan ke-6: 5 + 1 = 6.',
      ),
    },
    {
      // Beat 3 — Paul is in the same row (also 6th), with 4 behind him.
      mark: 'behind',
      build: `6 + 4 = ${LINE_LEN}`,
      hold: 2600,
      result: false,
      caption: t(
        'Paul is in the SAME row as Dan (also 6th), and 4 stand BEHIND him: 6 + 4 = 10. One line is 10 long.',
        'Paul ada di BARIS YANG SAMA dengan Dan (juga ke-6), dan 4 berdiri di BELAKANGnya: 6 + 4 = 10. Satu barisan panjangnya 10.',
      ),
    },
    {
      // Beat 4 — the two lines are equal, so the other line is also 10.
      mark: 'all',
      build: `10  &  10`,
      hold: 2400,
      result: false,
      caption: t(
        'The two lines are EQUAL, so the other line also has 10 students.',
        'Kedua barisan SAMA PANJANG, jadi barisan satunya juga punya 10 murid.',
      ),
    },
    {
      // Beat 5 — result: 10 + 10 = 20.
      mark: 'all',
      build: `10 + 10 = ${ANSWER}`,
      hold: 0,
      result: true,
      caption: t(
        `Both lines together: 10 + 10 = ${ANSWER} students (D).`,
        `Kedua barisan bersama: 10 + 10 = ${ANSWER} murid (D).`,
      ),
    },
  ]

  return {
    answer: String(ANSWER),
    steps,
    finalIndex: steps.length - 1,
  }
}
