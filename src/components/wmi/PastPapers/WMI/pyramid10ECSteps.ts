// IKMC-20-EC-Q10 — step storyboard for Pyramid10ECExplainer.
//
// Teaches "bird's-eye view of a square pyramid" in four beats:
//   0. intro     — show the 3D pyramid; label it as "seen from above"
//   1. base      — highlight the square base: "you see this outline"
//   2. laterals  — show the 4 lateral edges collapsing to 2 diagonals
//   3. result    — completed top-view: square + both diagonals = answer C

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type Pyramid10ECPhase = 'intro' | 'base' | 'laterals' | 'result'

export interface Pyramid10ECStep {
  phase:       Pyramid10ECPhase
  /** Highlight the square base outline */
  showBase:    boolean
  /** Highlight the 4 lateral edges (corners → apex) */
  showLaterals: boolean
  /** Reveal the completed top-view diagram */
  showTopView: boolean
  caption:     string
  hold:        number
  result:      boolean
}

export interface Pyramid10ECStoryboard {
  answer: string
  steps:  Pyramid10ECStep[]
  finalIndex: number
}

export function buildPyramid10ECSteps(lang: Lang): Pyramid10ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Pyramid10ECStep[] = [
    {
      phase: 'intro',
      showBase:     false,
      showLaterals: false,
      showTopView:  false,
      hold: 1800,
      result: false,
      caption: t(
        'Loes looks straight down at the pyramid from above — a bird\'s-eye view.',
        'Loes melihat langsung ke bawah pada piramida dari atas — tampilan mata burung.',
      ),
    },
    {
      phase: 'base',
      showBase:     true,
      showLaterals: false,
      showTopView:  false,
      hold: 2200,
      result: false,
      caption: t(
        'She sees the square base — four edges forming a square outline.',
        'Dia melihat alas persegi — empat sisi membentuk garis luar persegi.',
      ),
    },
    {
      phase: 'laterals',
      showBase:     true,
      showLaterals: true,
      showTopView:  false,
      hold: 2400,
      result: false,
      caption: t(
        'The four lateral edges (corners → apex) project straight down as two diagonal lines crossing at the center.',
        'Empat sisi lateral (sudut → puncak) memproyeksikan lurus ke bawah sebagai dua garis diagonal bersilangan di tengah.',
      ),
    },
    {
      phase: 'result',
      showBase:     true,
      showLaterals: true,
      showTopView:  true,
      hold: 0,
      result: true,
      caption: t(
        'Top-down view: a square with both diagonals drawn to the center. That is figure C.',
        'Tampilan dari atas: persegi dengan kedua diagonal menuju pusat. Itulah gambar C.',
      ),
    },
  ]

  return { answer: 'C', steps, finalIndex: steps.length - 1 }
}
