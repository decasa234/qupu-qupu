// IKMC-21-EC-Q11 — storyboard for the grey-part animation.
//
// Problem: 18 cubes in a 3×3×2 solid, coloured white/grey/black.
//   WHITE (4): front-left 2×2 on the top layer (z=1)
//   BLACK (5): right column + back row of the bottom layer (z=0)
//   GREY  (9): everything else
//     z=0: (0,0,0), (1,0,0), (0,1,0), (1,1,0)  — front-left 2×2 at bottom
//     z=1: (2,0,1), (2,1,1), (2,2,1), (0,2,1), (1,2,1)  — right-col + back-row at top
//
// Strategy: 18 − white − black = grey.
// 18 − 4 white − 5 black = 9 grey cubes.
// The grey part matches option E.
//
// Teaching walk (one idea per beat):
//   0. intro   — show full solid with all three colours.
//   1. count   — count white cubes: 4.
//   2. black   — count black cubes: 5.
//   3. subtract— 18 − 4 − 5 = 9 grey cubes.
//   4. reveal  — highlight the grey cubes; their arrangement matches E.
//   5. result  — answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Cubes11Phase =
  | 'intro'
  | 'countWhite'
  | 'countBlack'
  | 'subtract'
  | 'reveal'
  | 'result'

export interface Cubes11Beat {
  phase: Cubes11Phase
  /** Highlight white cubes? */
  litWhite: boolean
  /** Highlight black cubes? */
  litBlack: boolean
  /** Highlight grey cubes? */
  litGrey: boolean
  /** Equation or tally string shown; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final/manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Cubes11Storyboard {
  steps: Cubes11Beat[]
  finalIndex: number
}

export function buildCubes11ECSteps(lang: Lang): Cubes11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Cubes11Beat[] = [
    // Beat 0 — intro: show full coloured solid
    {
      phase: 'intro',
      litWhite: false,
      litBlack: false,
      litGrey: false,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        '18 cubes arranged in a 3×3×2 block. Some are white, some black, some grey. Find the grey part!',
        '18 kubus disusun dalam blok 3×3×2. Sebagian putih, sebagian hitam, sebagian abu-abu. Temukan bagian abu-abu!',
      ),
    },

    // Beat 1 — highlight white cubes
    {
      phase: 'countWhite',
      litWhite: true,
      litBlack: false,
      litGrey: false,
      equation: '4 putih / white',
      hold: 2200,
      result: false,
      caption: t(
        'The WHITE part has 4 cubes — the front-left 2×2 on the top layer.',
        'Bagian PUTIH ada 4 kubus — kotak 2×2 depan-kiri di lapisan atas.',
      ),
    },

    // Beat 2 — highlight black cubes
    {
      phase: 'countBlack',
      litWhite: false,
      litBlack: true,
      litGrey: false,
      equation: '5 hitam / black',
      hold: 2200,
      result: false,
      caption: t(
        'The BLACK part has 5 cubes — the right column and back row of the bottom layer.',
        'Bagian HITAM ada 5 kubus — kolom kanan dan baris belakang lapisan bawah.',
      ),
    },

    // Beat 3 — subtract
    {
      phase: 'subtract',
      litWhite: false,
      litBlack: false,
      litGrey: false,
      equation: '18 − 4 − 5 = 9',
      hold: 2400,
      result: false,
      caption: t(
        '18 total cubes − 4 white − 5 black = 9 grey cubes remaining.',
        '18 kubus total − 4 putih − 5 hitam = 9 kubus abu-abu tersisa.',
      ),
    },

    // Beat 4 — reveal grey cubes
    {
      phase: 'reveal',
      litWhite: false,
      litBlack: false,
      litGrey: true,
      equation: '9 abu-abu / grey',
      hold: 2200,
      result: false,
      caption: t(
        'The 9 grey cubes form: the front-left 2×2 at the bottom + the right column and back row at the top.',
        '9 kubus abu-abu membentuk: 2×2 depan-kiri di bawah + kolom kanan dan baris belakang di atas.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      litWhite: false,
      litBlack: false,
      litGrey: true,
      equation: '→ E',
      hold: 0,
      result: true,
      caption: t(
        'This grey arrangement matches option E — the correct answer is E.',
        'Susunan abu-abu ini cocok dengan pilihan E — jawaban yang benar adalah E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
