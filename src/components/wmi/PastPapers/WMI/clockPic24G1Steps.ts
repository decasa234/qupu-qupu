// WMI-24F1A-Q13 (2024 Grade 1 Final) — storyboard for the post-answer animation.
//
// A picture is painted on the minute hand of a clock at 11:50. We are asked how
// it looks at 3:30. Answer: D.
//
// The anti-drift spine (shared with the illustration primitive ClockPic24G1):
//   - At 11:50 the minute hand points to the 10  → 300° clockwise from 12.
//   - At  3:30 the minute hand points to the  6  → 180° clockwise from 12.
//   - The hand turns 300° → 180°, i.e. -120° (120° counter-clockwise). The
//     picture is painted ON the hand, so it rides along and turns the same -120°,
//     landing in option D's orientation.
//
// This builder is a PURE function of `lang` (the question has no free params —
// the clock times are fixed by the source). It emits ordered beats that walk the
// method one idea at a time, never asserting the answer before deducing it.

export type Lang = 'en' | 'id'

export interface ClockPicStep {
  /** Which clock state to show: false = 11:50 (hand at 10), true = 3:30 (hand at 6). */
  rotated: boolean
  /** Fraction 0..1 of the -120° turn to render the rotation arc/sweep at (0 = none). */
  sweep: number
  /** Highlight the minute hand's target number this beat (10, 6, or null). */
  mark: 10 | 6 | null
  /** True on the winning beat (the D-orientation reveal). */
  result: boolean
  caption: string
  /** Time on screen in ms before auto-advancing (the winner holds = 0). */
  hold: number
}

export interface ClockPicStoryboard {
  /** Total turn of the hand + picture, in degrees (negative = counter-clockwise). */
  turnDeg: number
  answer: string
  steps: ClockPicStep[]
  finalIndex: number
}

export function buildClockPic24G1Steps(lang: Lang): ClockPicStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClockPicStep[] = [
    // Beat 1 — read the start: 11:50, the minute hand points at the 10.
    {
      rotated: false,
      sweep: 0,
      mark: 10,
      result: false,
      hold: 2600,
      caption: t(
        'At 11:50 the long minute hand points at the 10. The picture rides on this hand.',
        'Pada pukul 11.50 jarum menit yang panjang menunjuk ke angka 10. Gambar menempel di jarum ini.',
      ),
    },
    // Beat 2 — read the finish: 3:30, the minute hand is at the 6 → it turned 120° CCW.
    {
      rotated: false,
      sweep: 1,
      mark: 6,
      result: false,
      hold: 3000,
      caption: t(
        'At 3:30 the minute hand is at the 6. From the 10 to the 6, it turned 120° backwards (counter-clockwise).',
        'Pada pukul 3.30 jarum menit ada di angka 6. Dari angka 10 ke 6, ia berputar 120° ke belakang (berlawanan arah jarum jam).',
      ),
    },
    // Beat 3 — the key idea: the picture is glued to the hand, so it turns the same 120°.
    {
      rotated: true,
      sweep: 1,
      mark: 6,
      result: false,
      hold: 2400,
      caption: t(
        'The picture is glued to the hand, so it turns the SAME 120° backwards along with it.',
        'Gambar menempel di jarum, jadi ia ikut berputar 120° ke belakang yang SAMA.',
      ),
    },
    // Beat 4 (result) — the picture now matches option D.
    {
      rotated: true,
      sweep: 0,
      mark: null,
      result: true,
      hold: 0,
      caption: t(
        'Now the picture sits like this — it matches option D.',
        'Sekarang gambar tampak seperti ini — cocok dengan pilihan D.',
      ),
    },
  ]

  return {
    turnDeg: -120,
    answer: 'D',
    steps,
    finalIndex: steps.length - 1,
  }
}
