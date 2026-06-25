// SEAMOX-20-A-Q3 — storyboard for the stick-figure pattern animation.
//
// Question: Three stick figures have a number in the head and four limb-tip numbers.
// Rule: head = (upper-left + upper-right) − (lower-left + lower-right)
// Fig 3 limbs: UL=6, UR=4, LL=2, LR=3 → (6+4)−(2+3) = 10−5 = 5
//
// Teaching walk, one idea per beat:
//   0. intro   — show all three figures; identify the pattern challenge.
//   1. fig1    — verify Fig 1: (8+5)−(2+4) = 13−6 = 7 ✓
//   2. fig2    — verify Fig 2: (9+2)−(5+3) = 11−8 = 3 ✓
//   3. rule    — rule confirmed: head = upper sum − lower sum.
//   4. apply   — apply to Fig 3: upper sum = 6+4 = 10; lower sum = 2+3 = 5.
//   5. result  — head = 10−5 = 5.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type StickFigPhase = 'intro' | 'fig1' | 'fig2' | 'rule' | 'apply' | 'result'

export interface StickFigBeat {
  phase: StickFigPhase
  /** Which figures to highlight (0=none, 1=fig1, 2=fig2, 3=fig3). */
  highlight: 0 | 1 | 2 | 3
  /** Show upper-sum annotation on the highlighted figure. */
  showUpperSum: boolean
  /** Show lower-sum annotation on the highlighted figure. */
  showLowerSum: boolean
  /** Show the rule label. */
  showRule: boolean
  /** Show the answer in the Fig 3 head. */
  showAnswer: boolean
  /** Equation text to display; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface StickFigStoryboard {
  steps: StickFigBeat[]
  finalIndex: number
}

export function buildStickFigX20A3Steps(lang: Lang): StickFigStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StickFigBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlight: 0,
      showUpperSum: false,
      showLowerSum: false,
      showRule: false,
      showAnswer: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Each stick figure has a number in its head and four limb-tip numbers. Find the rule!',
        'Setiap gambar orang-orangan memiliki angka di kepala dan empat angka di ujung anggota tubuh. Temukan polanya!',
      ),
    },

    // Beat 1 — verify Figure 1
    {
      phase: 'fig1',
      highlight: 1,
      showUpperSum: true,
      showLowerSum: true,
      showRule: false,
      showAnswer: false,
      equation: '(8 + 5) − (2 + 4) = 13 − 6 = 7',
      hold: 2400,
      result: false,
      caption: t(
        'Figure 1: upper arms sum to 8+5=13; lower legs sum to 2+4=6. Head = 13−6 = 7 ✓',
        'Gambar 1: jumlah lengan atas 8+5=13; jumlah kaki bawah 2+4=6. Kepala = 13−6 = 7 ✓',
      ),
    },

    // Beat 2 — verify Figure 2
    {
      phase: 'fig2',
      highlight: 2,
      showUpperSum: true,
      showLowerSum: true,
      showRule: false,
      showAnswer: false,
      equation: '(9 + 2) − (5 + 3) = 11 − 8 = 3',
      hold: 2400,
      result: false,
      caption: t(
        'Figure 2: upper sum = 9+2=11; lower sum = 5+3=8. Head = 11−8 = 3 ✓ — pattern confirmed!',
        'Gambar 2: jumlah atas = 9+2=11; jumlah bawah = 5+3=8. Kepala = 11−8 = 3 ✓ — pola terkonfirmasi!',
      ),
    },

    // Beat 3 — state the rule
    {
      phase: 'rule',
      highlight: 0,
      showUpperSum: false,
      showLowerSum: false,
      showRule: true,
      showAnswer: false,
      equation: 'Head = (UL + UR) − (LL + LR)',
      hold: 2200,
      result: false,
      caption: t(
        'Rule: head number = (upper-left + upper-right) minus (lower-left + lower-right).',
        'Aturan: angka kepala = (atas-kiri + atas-kanan) dikurangi (bawah-kiri + bawah-kanan).',
      ),
    },

    // Beat 4 — apply to Figure 3
    {
      phase: 'apply',
      highlight: 3,
      showUpperSum: true,
      showLowerSum: true,
      showRule: false,
      showAnswer: false,
      equation: '(6 + 4) − (2 + 3) = 10 − 5',
      hold: 2400,
      result: false,
      caption: t(
        'Figure 3: upper sum = 6+4 = 10; lower sum = 2+3 = 5. So head = 10−5 = …',
        'Gambar 3: jumlah atas = 6+4 = 10; jumlah bawah = 2+3 = 5. Jadi kepala = 10−5 = …',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlight: 3,
      showUpperSum: false,
      showLowerSum: false,
      showRule: false,
      showAnswer: true,
      equation: '10 − 5 = 5',
      hold: 0,
      result: true,
      caption: t(
        'The missing number is 5.',
        'Angka yang hilang adalah 5.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
