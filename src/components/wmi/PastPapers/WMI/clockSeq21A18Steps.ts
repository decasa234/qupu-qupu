// SEAMO-21-A-Q18 — clock sequence storyboard.
//
// "What comes next?"
// Sequence: 9:05 → 9:40 → 10:15 → ?   (each +35 minutes)
// Answer: C = 10:50 a.m.
//
// Beat-by-beat strategy:
//   0. Intro  — show all 3 clocks; prompt: find the pattern.
//   1. Clock1 — highlight clock 1 (9:05); read the time.
//   2. Clock2 — highlight clock 2 (9:40); spot the +35 min gap.
//   3. Clock3 — highlight clock 3 (10:15); confirm the rule.
//   4. Apply  — the pattern continues; add 35 minutes.
//   5. Result — 10:15 + 35 min = 10:50 → answer C.
//
// Bound quantities from breakdown.quantities:
//   pattern = "from clock sequence in figure"
//   answer  = "10.50 a.m." (choice C)

export type Lang = 'en' | 'id'

export type SeqTone = 'intro' | 'info' | 'check' | 'win'

export interface ClockSeq21A18Step {
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

export interface ClockSeq21A18Storyboard {
  steps: ClockSeq21A18Step[]
  finalIndex: number
}

export function buildClockSeq21A18Steps(lang: Lang): ClockSeq21A18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClockSeq21A18Step[] = [
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
      math: t('Clock 1: 9:05', 'Jam 1: 9:05'),
      caption: t(
        'The first clock shows 9:05 — minute hand at the 1, hour just past 9.',
        'Jam pertama menunjukkan pukul 9:05 — jarum menit di angka 1, jarum jam baru lewat 9.',
      ),
      hold: 2400,
    },

    // Beat 2 — read clock 2, spot the +35 min gap
    {
      highlightSlot: 1,
      revealAnswer: false,
      tone: 'info',
      result: false,
      math: t('9:05 → 9:40: +35 min', '9:05 → 9:40: +35 menit'),
      caption: t(
        'The second clock shows 9:40 — 35 minutes later. The minute hand moved forward by 35 minutes.',
        'Jam kedua menunjukkan pukul 9:40 — 35 menit kemudian. Jarum menit maju 35 menit.',
      ),
      hold: 2600,
    },

    // Beat 3 — read clock 3, confirm the rule
    {
      highlightSlot: 2,
      revealAnswer: false,
      tone: 'check',
      result: false,
      math: t('9:40 → 10:15: +35 min ✓', '9:40 → 10:15: +35 menit ✓'),
      caption: t(
        'The third clock shows 10:15 — 35 minutes later again. The rule: each clock advances by +35 minutes.',
        'Jam ketiga menunjukkan pukul 10:15 — 35 menit kemudian lagi. Aturannya: setiap jam maju +35 menit.',
      ),
      hold: 2600,
    },

    // Beat 4 — apply the rule
    {
      highlightSlot: 3,
      revealAnswer: false,
      tone: 'check',
      result: false,
      math: t('10:15 + 35 min = 10:50', '10:15 + 35 menit = 10:50'),
      caption: t(
        'Apply the rule one more time: 10:15 + 35 minutes = 10:50.',
        'Terapkan aturan sekali lagi: 10:15 + 35 menit = 10:50.',
      ),
      hold: 2400,
    },

    // Beat 5 — reveal answer
    {
      highlightSlot: 3,
      revealAnswer: true,
      tone: 'win',
      result: true,
      math: t('10:50 a.m. ✓', '10.50 pagi ✓'),
      caption: t(
        'The next time in the sequence is 10:50 a.m. — answer C.',
        'Waktu berikutnya dalam urutan adalah pukul 10.50 pagi — jawaban C.',
      ),
      hold: 0,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
