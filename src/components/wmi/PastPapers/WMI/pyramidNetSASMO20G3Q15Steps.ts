// SASMO-20-G3-Q15 — explanation storyboard.
//
// Strategy: spatial reasoning — identify the TWO key clown face types visible on
// the 3-D pyramid, then scan each net (A–E) to find which one contains BOTH faces
// in the correct positions.
//
// Face 1 (F1): green hat + RED DOT on tip | eyes right | NO bow tie.
// Face 2 (F2): green hat | NO hat dot     | eyes right | GREEN BOW TIE.
//
// Only option B has F1 (×3) + F2 at the bottom corner — proven by folding.
// Pure data: no random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PyrPhase = 'intro' | 'face1' | 'face2' | 'match' | 'result'

export interface PyrBeat {
  phase: PyrPhase
  /** Highlight the left pyramid face (Face 2 — bow tie). */
  highlightF2: boolean
  /** Highlight the right pyramid face (Face 1 — hat dot). */
  highlightF1: boolean
  /** Highlight the bottom triangle of the net (correct F2 position). */
  highlightNetBot: boolean
  /** Short equation / label shown below the figure. */
  label: string
  caption: string
  hold: number
  result: boolean
}

export interface PyrStoryboard {
  steps: PyrBeat[]
  finalIndex: number
}

export function buildPyramidNetSASMO20G3Q15Steps(lang: Lang): PyrStoryboard {
  const t = (en: string, id: string) => lang === 'id' ? id : en

  const steps: PyrBeat[] = [
    // Beat 0 — intro: show the static 3-D pyramid + net B side by side
    {
      phase: 'intro',
      highlightF2: false,
      highlightF1: false,
      highlightNetBot: false,
      label: '',
      hold: 2000,
      result: false,
      caption: t(
        'The pyramid has 2 distinctive clown faces. Study what makes each face unique.',
        'Piramida memiliki 2 wajah badut yang berbeda. Perhatikan ciri khas masing-masing wajah.',
      ),
    },

    // Beat 1 — identify Face 1 (hat dot, no bow tie)
    {
      phase: 'face1',
      highlightF2: false,
      highlightF1: true,
      highlightNetBot: false,
      label: t('Face 1: hat dot ● — no bow tie', 'Wajah 1: titik merah ● di topi — tanpa dasi'),
      hold: 2500,
      result: false,
      caption: t(
        'Face 1 (right side of pyramid): green hat with a RED DOT on top. Eyes look right. No bow tie.',
        'Wajah 1 (sisi kanan piramida): topi hijau dengan TITIK MERAH di atas. Mata melirik kanan. Tanpa dasi.',
      ),
    },

    // Beat 2 — identify Face 2 (bow tie, no hat dot)
    {
      phase: 'face2',
      highlightF2: true,
      highlightF1: false,
      highlightNetBot: false,
      label: t('Face 2: bow tie ✦ — no hat dot', 'Wajah 2: dasi kupu-kupu ✦ — tanpa titik topi'),
      hold: 2500,
      result: false,
      caption: t(
        'Face 2 (left side of pyramid): green hat with NO dot. Eyes look right. Has a GREEN BOW TIE.',
        'Wajah 2 (sisi kiri piramida): topi hijau TANPA titik. Mata melirik kanan. Ada DASI KUPU-KUPU HIJAU.',
      ),
    },

    // Beat 3 — locate F2 in net B (bottom corner)
    {
      phase: 'match',
      highlightF2: false,
      highlightF1: false,
      highlightNetBot: true,
      label: t('Net B: F2 at bottom corner ✓', 'Jaring B: Wajah 2 di sudut bawah ✓'),
      hold: 2500,
      result: false,
      caption: t(
        'In net B the bottom corner triangle has Face 2 (bow tie, no hat dot). The other three triangles have Face 1. This is the only net where BOTH faces are present and correctly placed.',
        'Pada jaring B, segitiga sudut bawah memiliki Wajah 2 (dasi, tanpa titik). Tiga segitiga lainnya memiliki Wajah 1. Ini satu-satunya jaring yang memiliki KEDUA wajah dengan posisi yang benar.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlightF2: false,
      highlightF1: false,
      highlightNetBot: true,
      label: t('Answer: B', 'Jawaban: B'),
      hold: 0,
      result: true,
      caption: t(
        'Option B is the only net containing both Face 1 (hat dot) and Face 2 (bow tie) that folds into the given pyramid. Answer: B.',
        'Pilihan B adalah satu-satunya jaring yang mengandung Wajah 1 (titik topi) dan Wajah 2 (dasi kupu-kupu) yang dapat dilipat menjadi piramida yang diberikan. Jawaban: B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
