// IKMC-19-EC-Q20 — Hallway path explainer storyboard
//
// The cat walks along the dashed midline through the centre of the Z-shaped
// hallway. The midline has three segments:
//
//   Segment 1 (bottom horizontal): 36 m
//   Segment 2 (vertical step)    : 20 m
//   Segment 3 (top horizontal)   : 27 m
//   Total                        : 83 m  →  Answer E
//
// The segment values shown in the explainer come directly from the two labelled
// inner dimensions in the figure (36 m inner horizontal, 20 m inner vertical)
// plus the computed top-arm midline (27 m).  The inner dimensions are exactly
// what the figure labels indicate; they represent the distances the cat travels
// through the centre of each corridor section.
//
// Beat structure (5 beats):
//   0 intro    — show the full hallway silhouette + midline, no highlight
//   1 seg1     — highlight bottom-arm midline (36 m)
//   2 seg2     — highlight vertical step midline (20 m)
//   3 seg3     — highlight top-arm midline (27 m)
//   4 result   — show full midline highlighted + "36 + 20 + 27 = 83 m"
//
// Pure builder — no DOM, no React, no side-effects.

// ── Types ─────────────────────────────────────────────────────────────────────

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'seg1' | 'seg2' | 'seg3' | 'result'

/** Which midline segment(s) are actively highlighted in this beat. */
export interface SegmentHighlight {
  seg1: boolean  // bottom horizontal
  seg2: boolean  // vertical step
  seg3: boolean  // top horizontal
}

export interface HallwayBeat {
  phase: PhaseId
  /** Which segments are highlighted (in amber/gold). */
  highlight: SegmentHighlight
  /** Label displayed below the highlighted segment(s), e.g. "36 m". */
  segLabel: string | null
  /** Running-total or answer label, e.g. "36 + 20 + 27 = 83 m". */
  equation: string | null
  /** Caption text shown below the figure. */
  caption: string
  /** Auto-advance hold in ms (0 = final beat, stays until user advances). */
  hold: number
  /** True only on the result beat (for green-pill / green-caption styling). */
  isResult: boolean
}

export interface HallwayStoryboard {
  steps: HallwayBeat[]
  finalIndex: number
}

// ── Captions (bilingual) ──────────────────────────────────────────────────────

const CAPTIONS: Record<PhaseId, Record<Lang, string>> = {
  intro: {
    en: 'The cat walks along the dashed line through the middle of the hallway.',
    id: 'Kucing berjalan sepanjang garis putus-putus di tengah-tengah koridor.',
  },
  seg1: {
    en: 'Bottom arm: the midline spans 36 m (from the left opening to the inner corner).',
    id: 'Lengan bawah: garis tengah membentang 36 m (dari ujung kiri hingga sudut dalam).',
  },
  seg2: {
    en: 'Vertical step: the midline rises 20 m (from the lower inner corner to the upper inner corner).',
    id: 'Bagian vertikal: garis tengah naik 20 m (dari sudut bawah ke sudut atas).',
  },
  seg3: {
    en: 'Top arm: the midline spans 27 m (from the upper inner corner to the right opening).',
    id: 'Lengan atas: garis tengah membentang 27 m (dari sudut atas ke ujung kanan).',
  },
  result: {
    en: 'Total path = 36 + 20 + 27 = 83 m. The cat walks 83 metres. Answer: E.',
    id: 'Total jalur = 36 + 20 + 27 = 83 m. Kucing berjalan sejauh 83 meter. Jawaban: E.',
  },
}

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * buildHallway20ECSteps
 *
 * Returns a 5-beat storyboard for the IKMC-19-EC-Q20 explainer animation.
 *
 * @param lang  'en' (default) or 'id' for bilingual captions
 */
export function buildHallway20ECSteps(lang: Lang = 'en'): HallwayStoryboard {
  const c = (phase: PhaseId) => CAPTIONS[phase][lang]

  const steps: HallwayBeat[] = [
    // ── Beat 0: intro ─────────────────────────────────────────────────────────
    {
      phase:    'intro',
      highlight: { seg1: false, seg2: false, seg3: false },
      segLabel:  null,
      equation:  null,
      caption:   c('intro'),
      hold:      2400,
      isResult:  false,
    },

    // ── Beat 1: segment 1 (bottom horizontal, 36 m) ───────────────────────────
    {
      phase:    'seg1',
      highlight: { seg1: true,  seg2: false, seg3: false },
      segLabel:  '36 m',
      equation:  '36',
      caption:   c('seg1'),
      hold:      2600,
      isResult:  false,
    },

    // ── Beat 2: segment 2 (vertical step, 20 m) ───────────────────────────────
    {
      phase:    'seg2',
      highlight: { seg1: false, seg2: true,  seg3: false },
      segLabel:  '20 m',
      equation:  '36 + 20',
      caption:   c('seg2'),
      hold:      2600,
      isResult:  false,
    },

    // ── Beat 3: segment 3 (top horizontal, 27 m) ──────────────────────────────
    {
      phase:    'seg3',
      highlight: { seg1: false, seg2: false, seg3: true  },
      segLabel:  '27 m',
      equation:  '36 + 20 + 27',
      caption:   c('seg3'),
      hold:      2600,
      isResult:  false,
    },

    // ── Beat 4: result ────────────────────────────────────────────────────────
    {
      phase:    'result',
      highlight: { seg1: true,  seg2: true,  seg3: true  },
      segLabel:  null,
      equation:  '36 + 20 + 27 = 83 m',
      caption:   c('result'),
      hold:      0,          // final beat — stays until user advances
      isResult:  true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
