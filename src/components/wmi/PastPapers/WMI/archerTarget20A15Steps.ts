/**
 * SEAMO-20-A-Q15 — beat steps for the archery-target explainer.
 *
 * Strategy: read the figure → all 5 arrows hit the middle ring (3 pts each)
 *   → 5 × 3 = 15 pts (answer C).
 *
 * Beats
 *   0 — intro: show the three rings and their point values.
 *   1 — highlight middle ring (score 3): "All arrows land here."
 *   2 — count: 5 arrows × 3 pts.
 *   3 — result: total = 15 pts → answer C.
 */

export interface ArcherTarget20A15Step {
  caption:       string
  equation:      string
  highlightRing: 1 | 3 | 5 | null
  showArrows:    boolean
  result:        boolean
  hold:          number
}

export interface ArcherTarget20A15Story {
  steps:      ArcherTarget20A15Step[]
  finalIndex: number
}

export function buildArcherTarget20A15Steps(lang: 'en' | 'id'): ArcherTarget20A15Story {
  const t = TRANSLATIONS[lang]

  const steps: ArcherTarget20A15Step[] = [
    // Beat 0 — intro: show target with ring labels, no highlight
    {
      caption:       t.intro,
      equation:      '',
      highlightRing: null,
      showArrows:    false,
      result:        false,
      hold:          2200,
    },
    // Beat 1 — highlight middle ring (3 pts)
    {
      caption:       t.middleRing,
      equation:      '3 pts',
      highlightRing: 3,
      showArrows:    false,
      result:        false,
      hold:          2000,
    },
    // Beat 2 — show the arrows landing in the middle ring
    {
      caption:       t.arrows,
      equation:      '5 × 3',
      highlightRing: 3,
      showArrows:    true,
      result:        false,
      hold:          2400,
    },
    // Beat 3 — result
    {
      caption:       t.result,
      equation:      '5 × 3 = 15',
      highlightRing: null,
      showArrows:    true,
      result:        true,
      hold:          3200,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}

// ── translations ──────────────────────────────────────────────────────────────

const TRANSLATIONS: Record<'en' | 'id', {
  intro:      string
  middleRing: string
  arrows:     string
  result:     string
}> = {
  en: {
    intro:      'The target has three rings: outer = 1 pt, middle = 3 pts, inner = 5 pts.',
    middleRing: 'The middle ring scores 3 points per arrow.',
    arrows:     'All 5 arrows land in the middle ring.',
    result:     '5 arrows × 3 pts = 15 pts — answer C!',
  },
  id: {
    intro:      'Target memiliki tiga cincin: luar = 1 poin, tengah = 3 poin, dalam = 5 poin.',
    middleRing: 'Cincin tengah bernilai 3 poin per anak panah.',
    arrows:     'Semua 5 anak panah mendarat di cincin tengah.',
    result:     '5 anak panah × 3 poin = 15 poin — jawaban C!',
  },
}
