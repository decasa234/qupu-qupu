// IKMC-20-PE-Q18 — storyboard for the "two trains in opposite directions" animation.
//
// The question: Two identical trains (31 cars each) travel in opposite directions.
// Car 19 (train A) is directly opposite car 19 (train B).
// Which car of train A is opposite car 12 of train B? → Answer D (26).
//
// Teaching walk, one idea per beat:
//   0. intro     — show the static two-train figure; state the given fact.
//   1. anchor    — highlight car 19 on both trains with an alignment line.
//   2. offset    — show car 12 on train B; mark the offset: 19 − 12 = 7.
//   3. mirror    — explain mirroring: 7 steps back in B = 7 steps forward in A.
//   4. answer    — highlight car 26 on train A; show 19 + 7 = 26.
//   5. result    — green result beat: car 26 → answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type TrainsPhaseId = 'intro' | 'anchor' | 'offset' | 'mirror' | 'answer' | 'result'

export interface TrainsBeat {
  /** Which animation phase this beat belongs to. */
  phase: TrainsPhaseId
  /** Highlight car 19 on both trains with an alignment line. */
  showAnchor: boolean
  /** Highlight car 12 on train B; show offset label "−7". */
  showOffset: boolean
  /** Show the mirroring arrow / "+7" label on train A side. */
  showMirror: boolean
  /** Highlight car 26 on train A as the answer. */
  showAnswer: boolean
  /** Equation / maths line shown below the figure; '' to hide. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = manual / final beat). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TrainsStoryboard {
  steps: TrainsBeat[]
  finalIndex: number
}

export function buildTrains18PESteps(lang: Lang): TrainsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TrainsBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showAnchor: false,
      showOffset: false,
      showMirror: false,
      showAnswer: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Two identical trains (31 cars each) travel in opposite directions — car numbers run the other way on each train.',
        'Dua kereta identik (31 gerbong masing-masing) berjalan ke arah berlawanan — nomor gerbong bertambah ke arah berlawanan.',
      ),
    },

    // Beat 1 — anchor alignment at car 19
    {
      phase: 'anchor',
      showAnchor: true,
      showOffset: false,
      showMirror: false,
      showAnswer: false,
      equation: 'car 19 (A) ↔ car 19 (B)',
      hold: 2400,
      result: false,
      caption: t(
        'We know car 19 of train A is directly opposite car 19 of train B — zero offset between them.',
        'Kita tahu gerbong 19 kereta A tepat berhadapan dengan gerbong 19 kereta B — selisih nol di posisi itu.',
      ),
    },

    // Beat 2 — show car 12 on train B and its offset from 19
    {
      phase: 'offset',
      showAnchor: true,
      showOffset: true,
      showMirror: false,
      showAnswer: false,
      equation: '19 − 12 = 7',
      hold: 2400,
      result: false,
      caption: t(
        'Car 12 in train B is 7 positions before car 19 (19 − 12 = 7).',
        'Gerbong 12 di kereta B adalah 7 posisi sebelum gerbong 19 (19 − 12 = 7).',
      ),
    },

    // Beat 3 — mirror: 7 steps back in B = 7 steps forward in A
    {
      phase: 'mirror',
      showAnchor: true,
      showOffset: true,
      showMirror: true,
      showAnswer: false,
      equation: '19 + 7 = 26',
      hold: 2400,
      result: false,
      caption: t(
        'Opposite trains mirror each other: 7 steps back in train B = 7 steps forward in train A, so 19 + 7 = 26.',
        'Kereta berlawanan saling mencerminkan: 7 langkah ke belakang di kereta B = 7 langkah ke depan di kereta A, jadi 19 + 7 = 26.',
      ),
    },

    // Beat 4 — highlight car 26 on train A
    {
      phase: 'answer',
      showAnchor: false,
      showOffset: false,
      showMirror: false,
      showAnswer: true,
      equation: '19 + 7 = 26',
      hold: 2200,
      result: false,
      caption: t(
        'Car 26 in train A is directly opposite car 12 in train B.',
        'Gerbong 26 di kereta A tepat berhadapan dengan gerbong 12 di kereta B.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      showAnchor: false,
      showOffset: false,
      showMirror: false,
      showAnswer: true,
      equation: '26 → D',
      hold: 0,
      result: true,
      caption: t(
        'The answer is 26 — answer D.',
        'Jawabannya adalah 26 — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
