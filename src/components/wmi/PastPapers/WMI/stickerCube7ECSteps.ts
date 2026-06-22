// IKMC-20-EC-Q7 — storyboard for the sticker-cube explainer.
//
// The question: 6 animal stickers on a cube; shown in 2 positions.
// Which sticker is opposite the duck? Answer: E (fly / lalat).
//
// Strategy: any sticker visible in the SAME VIEW as the duck cannot be opposite it.
//   Position 1: duck visible with mouse and ladybug.
//   Position 2: duck visible with elephant and dog.
//   Fly is NEVER shown alongside duck → fly must be on the opposite face.
//
// Teaching walk, one beat per idea:
//   0. intro    — a cube has 6 faces → 3 pairs of opposite faces.
//   1. rule     — two faces in the same view cannot be opposite.
//   2. view1    — position 1: duck shares a view with mouse + ladybug.
//   3. view2    — position 2: duck shares a view with elephant + dog.
//   4. deduced  — 4 of 5 stickers ruled out; only fly remains.
//   5. result   — fly is on the opposite face → answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type StickerPhaseId =
  | 'intro'
  | 'rule'
  | 'view1'
  | 'view2'
  | 'deduced'
  | 'result'

/** Labels for each animal sticker. */
export type Animal = 'duck' | 'elephant' | 'mouse' | 'ladybug' | 'dog' | 'fly'

export interface StickerCubeBeat {
  phase: StickerPhaseId
  /** Which cube view to highlight (1, 2, or 0 = none). */
  view: 0 | 1 | 2
  /** Which animals are highlighted / ruled out this beat. */
  highlighted: Animal[]
  /** Animals ruled out (crossed-out styling). */
  ruledOut: Animal[]
  /** Whether this is the answer reveal beat. */
  isResult: boolean
  /** Caption text. */
  caption: string
  /** Short chip label; '' to hide. */
  chip: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
}

export interface StickerCubeStoryboard {
  steps: StickerCubeBeat[]
  finalIndex: number
}

export function buildStickerCube7ECSteps(lang: Lang): StickerCubeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StickerCubeBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      view: 0,
      highlighted: [],
      ruledOut: [],
      isResult: false,
      chip: t('6 stickers, 6 faces', '6 stiker, 6 sisi'),
      hold: 2400,
      caption: t(
        'A cube has 6 faces. Jorge glues one animal sticker on each face, making 3 pairs of opposite faces.',
        'Kubus punya 6 sisi. Jorge menempel satu stiker hewan di setiap sisi, membentuk 3 pasang sisi yang berhadapan.',
      ),
    },

    // Beat 1 — key rule
    {
      phase: 'rule',
      view: 0,
      highlighted: [],
      ruledOut: [],
      isResult: false,
      chip: t('Same view ≠ opposite', 'Tampilan sama ≠ berhadapan'),
      hold: 2400,
      caption: t(
        'Key rule: if two stickers appear in the same view, they cannot be on opposite faces.',
        'Aturan kunci: jika dua stiker muncul dalam tampilan yang sama, keduanya tidak mungkin berada di sisi yang berhadapan.',
      ),
    },

    // Beat 2 — position 1
    {
      phase: 'view1',
      view: 1,
      highlighted: ['mouse', 'ladybug', 'duck'],
      ruledOut: [],
      isResult: false,
      chip: t('Position 1', 'Posisi 1'),
      hold: 2400,
      caption: t(
        'Position 1: the duck is visible alongside the mouse and the ladybug. So mouse and ladybug are NOT opposite the duck.',
        'Posisi 1: bebek terlihat bersama tikus dan kumbang. Jadi tikus dan kumbang BUKAN sisi yang berhadapan dengan bebek.',
      ),
    },

    // Beat 3 — position 2
    {
      phase: 'view2',
      view: 2,
      highlighted: ['elephant', 'dog', 'duck'],
      ruledOut: ['mouse', 'ladybug'],
      isResult: false,
      chip: t('Position 2', 'Posisi 2'),
      hold: 2400,
      caption: t(
        'Position 2: the duck is visible alongside the elephant and the dog. So elephant and dog are NOT opposite the duck either.',
        'Posisi 2: bebek terlihat bersama gajah dan anjing. Jadi gajah dan anjing juga BUKAN sisi yang berhadapan dengan bebek.',
      ),
    },

    // Beat 4 — deduction
    {
      phase: 'deduced',
      view: 0,
      highlighted: ['fly'],
      ruledOut: ['elephant', 'mouse', 'ladybug', 'dog'],
      isResult: false,
      chip: t('4 ruled out → fly!', '4 gugur → lalat!'),
      hold: 2200,
      caption: t(
        'Elephant, mouse, ladybug, and dog are all ruled out. The only sticker that was NEVER seen alongside the duck is the fly.',
        'Gajah, tikus, kumbang, dan anjing semuanya gugur. Satu-satunya stiker yang TIDAK PERNAH terlihat bersama bebek adalah lalat.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      view: 0,
      highlighted: ['duck', 'fly'],
      ruledOut: ['elephant', 'mouse', 'ladybug', 'dog'],
      isResult: true,
      chip: t('Duck ↔ Fly → E', 'Bebek ↔ Lalat → E'),
      hold: 0,
      caption: t(
        'The fly is on the opposite face to the duck. Answer: E.',
        'Lalat berada di sisi yang berhadapan dengan bebek. Jawaban: E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
