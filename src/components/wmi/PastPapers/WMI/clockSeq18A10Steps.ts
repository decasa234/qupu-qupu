// SEAMO-18-A-Q10 — clock sequence storyboard.
//
// "What time should come next in the sequence below?"
// Sequence: 2:30 → 3:30 → 4:30 → ?   (each +60 min / +1 hour)
// Answer: C = 5:30 PM.
//
// Beat-by-beat strategy:
//   0. Intro  — show all 3 clocks; prompt: find the pattern.
//   1. Clock1 — highlight clock 1 (2:30); read the time.
//   2. Clock2 — highlight clock 2 (3:30); spot +1 h jump.
//   3. Clock3 — highlight clock 3 (4:30); confirm the rule.
//   4. Apply  — the pattern continues; add 1 hour.
//   5. Result — 4:30 + 1 h = 5:30 → answer C.
//
// Bound quantities from breakdown.quantities:
//   pattern = "each clock advances by the same interval (+1 hour)"
//   answer  = "C = 5:30 PM"

export type Lang = 'en' | 'id'

export type SeqTone = 'intro' | 'info' | 'check' | 'win'

export interface ClockSeq18A10Step {
  /** Which slot to highlight (0-2 = visible clocks, 3 = answer slot, null = none). */
  highlightSlot: number | null
  /** Reveal the answer in the 4th slot? */
  revealAnswer: boolean
  tone: SeqTone
  result: boolean
  math: string | null
  caption: string
  hold: number
}

export interface ClockSeq18A10Storyboard {
  steps: ClockSeq18A10Step[]
  finalIndex: number
}

export function buildClockSeq18A10Steps(lang: Lang): ClockSeq18A10Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClockSeq18A10Step[] = [
    // Beat 0 — intro: display the full puzzle
    {
      highlightSlot: null,
      revealAnswer: false,
      tone: 'intro',
      result: false,
      math: null,
      caption: t(
        'Three clocks are shown in order. What time comes next?',
        'Tiga jam ditampilkan secara berurutan. Waktu apa yang muncul berikutnya?',
      ),
      hold: 2200,
    },

    // Beat 1 — read clock 1
    {
      highlightSlot: 0,
      revealAnswer: false,
      tone: 'info',
      result: false,
      math: t('Clock 1: 2:30', 'Jam 1: 2:30'),
      caption: t(
        'The first clock shows 2:30 — minute hand at the 6, hour between 2 and 3.',
        'Jam pertama menunjukkan pukul 2:30 — jarum menit di angka 6, jarum jam antara 2 dan 3.',
      ),
      hold: 2400,
    },

    // Beat 2 — read clock 2, spot the +1 h gap
    {
      highlightSlot: 1,
      revealAnswer: false,
      tone: 'info',
      result: false,
      math: t('2:30 → 3:30: +1 hour', '2:30 → 3:30: +1 jam'),
      caption: t(
        'The second clock shows 3:30 — exactly 1 hour later. The minute hand stays at the 6.',
        'Jam kedua menunjukkan pukul 3:30 — tepat 1 jam kemudian. Jarum menit tetap di angka 6.',
      ),
      hold: 2600,
    },

    // Beat 3 — read clock 3, confirm the rule
    {
      highlightSlot: 2,
      revealAnswer: false,
      tone: 'check',
      result: false,
      math: t('3:30 → 4:30: +1 hour ✓', '3:30 → 4:30: +1 jam ✓'),
      caption: t(
        'The third clock shows 4:30 — 1 hour later again. The rule: each clock advances by +1 hour.',
        'Jam ketiga menunjukkan pukul 4:30 — 1 jam kemudian lagi. Aturannya: setiap jam maju +1 jam.',
      ),
      hold: 2600,
    },

    // Beat 4 — apply the rule
    {
      highlightSlot: 3,
      revealAnswer: false,
      tone: 'check',
      result: false,
      math: t('4:30 + 1 hour = 5:30', '4:30 + 1 jam = 5:30'),
      caption: t(
        'Apply the rule one more time: 4:30 + 1 hour = 5:30.',
        'Terapkan aturan sekali lagi: 4:30 + 1 jam = 5:30.',
      ),
      hold: 2400,
    },

    // Beat 5 — reveal answer
    {
      highlightSlot: 3,
      revealAnswer: true,
      tone: 'win',
      result: true,
      math: t('5:30 PM ✓', '17:30 ✓'),
      caption: t(
        'The next time in the sequence is 5:30 PM — answer C.',
        'Waktu berikutnya dalam urutan adalah pukul 17:30 — jawaban C.',
      ),
      hold: 0,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
