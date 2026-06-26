// SIMOC-19-G3-Q6 — storyboard for the cube-net animation.
//
// Question: "Which figure CANNOT be folded into a cube?"  Answer: C
//
// Key insight:
//   A cube net needs exactly 6 squares. When folded, each square covers
//   one unique face. In Net C the rightmost column contains 3 squares
//   (top: (0,1); right arm: (1,2); and two further: (2,2),(3,2)).
//   Folding (1,2) to the right face, then (2,2) becomes the front face,
//   then (3,2) wraps back to the TOP — the same face as (0,1) → overlap.
//
// Teaching walk:
//   0. intro   — a cube has 6 faces; the net must have 6 squares, no overlap.
//   1. checkAB — A (S-shape) and B (cross) fold fine.
//   2. checkC  — C: two squares land on the same face → invalid.
//   3. checkD  — D (staircase) folds fine.
//   4. result  — answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type NetPhaseId = 'intro' | 'checkAB' | 'checkC' | 'checkD' | 'result'

export interface CubeNetBeat {
  phase: NetPhaseId
  /** Net letter highlighted this beat, or null. */
  activeNet: 'A' | 'B' | 'C' | 'D' | null
  /** True when the highlighted net is the invalid one. */
  invalid: boolean
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface CubeNetStoryboard {
  steps: CubeNetBeat[]
  finalIndex: number
}

export function buildCubeNetsSIMOC19G3Q6Steps(lang: Lang): CubeNetStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeNetBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      activeNet: null,
      invalid: false,
      hold: 2400,
      result: false,
      caption: t(
        'A cube net must have exactly 6 squares that fold to cover all 6 faces without any overlap.',
        'Jaring kubus harus memiliki tepat 6 kotak yang dilipat untuk menutupi semua 6 sisi tanpa tumpang tindih.',
      ),
    },

    // Beat 1 — check A and B
    {
      phase: 'checkAB',
      activeNet: null,
      invalid: false,
      hold: 2400,
      result: false,
      caption: t(
        'Net A (S-shape) and Net B (cross) each fold neatly into a cube — both are valid nets.',
        'Jaring A (bentuk S) dan Jaring B (salib) masing-masing dapat dilipat menjadi kubus — keduanya valid.',
      ),
    },

    // Beat 2 — highlight C as invalid
    {
      phase: 'checkC',
      activeNet: 'C',
      invalid: true,
      hold: 2800,
      result: false,
      caption: t(
        'Net C: fold the three-square horizontal row, then fold the two squares on the right down — they wrap around and land on the SAME face as the top square. Two faces overlap → invalid!',
        'Jaring C: lipat baris horizontal tiga kotak, lalu lipat dua kotak di kanan ke bawah — keduanya mengelilingi dan mendarat di sisi YANG SAMA dengan kotak atas. Dua sisi tumpang tindih → tidak valid!',
      ),
    },

    // Beat 3 — check D
    {
      phase: 'checkD',
      activeNet: 'D',
      invalid: false,
      hold: 2000,
      result: false,
      caption: t(
        'Net D (staircase) folds correctly — each square covers a unique face. Valid.',
        'Jaring D (tangga) dapat dilipat dengan benar — setiap kotak menutupi sisi unik. Valid.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      activeNet: 'C',
      invalid: true,
      hold: 0,
      result: true,
      caption: t(
        'Only Net C cannot fold into a cube — two faces would overlap. Answer: C.',
        'Hanya Jaring C yang tidak bisa dilipat menjadi kubus — dua sisi akan tumpang tindih. Jawaban: C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
