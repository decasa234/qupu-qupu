// IKMC-20-PE-Q2 — storyboard for the castle selfie orientation explainer.
//
// The question: Mordka took a selfie in front of this castle. Which photo is Mordka's?
// Answer: E — the only photo where the castle is correctly oriented as seen from the front
//             AND Mordka (the photographer) is on the right side facing the camera.
//
// Key insight: in a selfie, the photographer faces the camera.
// The castle appears BEHIND the photographer exactly as it looks from the front.
// So the left-right layout of the castle does NOT get mirrored.
//
// Teaching walk (one idea per beat):
//   0. intro     — show the reference castle; state the viewing direction.
//   1. selfie    — explain what a selfie means for orientation.
//   2. check-lr  — focus on the centre spire position relative to the face.
//   3. options   — walk through wrong options (A, B, C, D show wrong layout).
//   4. result    — only E has the spire to the LEFT of the face → answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CastlePhaseId = 'intro' | 'selfie' | 'check-lr' | 'options' | 'result'

export interface CastelBeat {
  phase: CastlePhaseId
  /** Highlight the reference castle's centre spire. */
  showSpire: boolean
  /** Which option label is currently being examined ('A' | 'B' | 'C' | 'D' | 'E' | null). */
  focusOption: string | null
  /** True if the focused option is the correct answer. */
  focusCorrect: boolean
  /** Equation / key phrase chip text ('' to hide). */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CastleStoryboard {
  steps: CastelBeat[]
  finalIndex: number
}

export function buildCastle2PESteps(lang: Lang): CastleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CastelBeat[] = [
    // Beat 0 — intro: show the reference castle
    {
      phase: 'intro',
      showSpire: false,
      focusOption: null,
      focusCorrect: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'This is the reference castle. Study where the tall centre spire is.',
        'Ini adalah kastil referensi. Perhatikan di mana menara tinggi di tengah berada.',
      ),
    },

    // Beat 1 — selfie explanation
    {
      phase: 'selfie',
      showSpire: true,
      focusOption: null,
      focusCorrect: false,
      equation: t('selfie = face the camera', 'selfie = hadap kamera'),
      hold: 2400,
      result: false,
      caption: t(
        'In a selfie, Mordka faces the camera — the castle appears behind Mordka just as it looks from the front, with NO left-right flip.',
        'Dalam selfie, Mordka menghadap kamera — kastil muncul di belakang Mordka persis seperti tampak dari depan, TANPA pembalikan kiri-kanan.',
      ),
    },

    // Beat 2 — left-right check strategy
    {
      phase: 'check-lr',
      showSpire: true,
      focusOption: null,
      focusCorrect: false,
      equation: t('spire should be LEFT of face?', 'menara harus di KIRI wajah?'),
      hold: 2400,
      result: false,
      caption: t(
        'If Mordka stands on the RIGHT side of the castle, the spire appears to Mordka\'s LEFT in the photo. Find the option where the spire is to the LEFT of the face.',
        'Jika Mordka berdiri di sisi KANAN kastil, menara akan muncul di KIRI Mordka dalam foto. Temukan pilihan di mana menara berada di KIRI wajah.',
      ),
    },

    // Beat 3 — check option E
    {
      phase: 'options',
      showSpire: false,
      focusOption: 'E',
      focusCorrect: true,
      equation: t('E: spire LEFT of face ✓', 'E: menara di KIRI wajah ✓'),
      hold: 2400,
      result: false,
      caption: t(
        'In option E, Mordka is on the right and the castle (with its spire) extends to the left — this matches the front view of the reference castle.',
        'Pada pilihan E, Mordka berada di kanan dan kastil (dengan menaranya) memanjang ke kiri — ini sesuai dengan tampak depan kastil referensi.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      showSpire: false,
      focusOption: 'E',
      focusCorrect: true,
      equation: t('Answer: E', 'Jawaban: E'),
      hold: 0,
      result: true,
      caption: t(
        'Only picture E shows the castle with the correct left-right orientation for a selfie taken in front of it — answer E.',
        'Hanya gambar E yang menunjukkan kastil dengan orientasi kiri-kanan yang benar untuk selfie yang diambil di depannya — jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
