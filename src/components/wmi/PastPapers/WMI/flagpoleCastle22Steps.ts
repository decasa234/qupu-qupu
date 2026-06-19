// IKMC-19-PE-Q22 — storyboard for the flagpole / sandcastle animation.
//
// The question: Tim and Tom stuck half the flagpole into the castle top.
// Upper tip = 80 cm above ground, lower tip = 20 cm above ground.
// How tall was the sandcastle? → Answer C (50 cm).
//
// Teaching walk, one idea per beat:
//   0. intro    — show the static scene; state the two given heights.
//   1. pole-len — total pole length = 80 − 20 = 60 cm.
//   2. half     — half is inside the castle; half is above → each half = 30 cm.
//   3. castle   — castle top is 30 cm below the upper tip: 80 − 30 = 50 cm.
//   4. result   — 50 cm → answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type FlagphaseId = 'intro' | 'pole-len' | 'half' | 'castle' | 'result'

export interface FlagBeat {
  /** Which animation phase this beat belongs to. */
  phase: FlagphaseId
  /** Show the brace that spans the full pole (80 − 20 = 60 cm). */
  showFullPole: boolean
  /** Show the midpoint tick on the pole (castle top position). */
  showMidpoint: boolean
  /** Show the upper half annotation (30 cm above castle). */
  showUpperHalf: boolean
  /** Show the castle-height dimension arrow + label. */
  showCastleHeight: boolean
  /** Equation / maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface FlagStoryboard {
  steps: FlagBeat[]
  finalIndex: number
}

export function buildFlagpoleCastle22Steps(lang: Lang): FlagStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FlagBeat[] = [
    // Beat 0 — intro: show the static scene, state the two facts
    {
      phase: 'intro',
      showFullPole: false,
      showMidpoint: false,
      showUpperHalf: false,
      showCastleHeight: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Upper tip: 80 cm above ground. Lower tip: 20 cm above ground. Half the pole is inside the castle.',
        'Ujung atas: 80 cm di atas tanah. Ujung bawah: 20 cm di atas tanah. Setengah tiang ada di dalam istana.',
      ),
    },

    // Beat 1 — pole total length
    {
      phase: 'pole-len',
      showFullPole: true,
      showMidpoint: false,
      showUpperHalf: false,
      showCastleHeight: false,
      equation: '80 − 20 = 60 cm',
      hold: 2200,
      result: false,
      caption: t(
        'The flagpole spans from 20 cm to 80 cm — total length = 60 cm.',
        'Tiang bendera membentang dari 20 cm hingga 80 cm — panjang total = 60 cm.',
      ),
    },

    // Beat 2 — half the pole
    {
      phase: 'half',
      showFullPole: true,
      showMidpoint: true,
      showUpperHalf: true,
      showCastleHeight: false,
      equation: '60 ÷ 2 = 30 cm',
      hold: 2200,
      result: false,
      caption: t(
        'Half is inside the castle, half sticks out above → each half = 30 cm.',
        'Setengah ada di dalam istana, setengah menjulang di atas → tiap bagian = 30 cm.',
      ),
    },

    // Beat 3 — locate castle top
    {
      phase: 'castle',
      showFullPole: true,
      showMidpoint: true,
      showUpperHalf: false,
      showCastleHeight: true,
      equation: '80 − 30 = 50 cm',
      hold: 2200,
      result: false,
      caption: t(
        'Castle top is 30 cm below the upper tip: 80 − 30 = 50 cm above the ground.',
        'Puncak istana 30 cm di bawah ujung atas: 80 − 30 = 50 cm di atas tanah.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      showFullPole: false,
      showMidpoint: true,
      showUpperHalf: false,
      showCastleHeight: true,
      equation: '50 cm → C',
      hold: 0,
      result: true,
      caption: t(
        'The sandcastle is 50 cm tall — answer C.',
        'Tinggi istana pasir adalah 50 cm — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
