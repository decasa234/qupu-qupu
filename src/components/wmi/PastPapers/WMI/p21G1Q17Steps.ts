import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Storyboard for WMI-21P1A-Q17 — fold the notched sheet along the dotted crease.
// Beats: show the sheet → name the notch + crease → fold the left part over →
// the notch is covered, leaving a clean rectangle → that is option D.

export interface Q17Step {
  /** Show the dotted fold lines. */
  showFolds: boolean
  /** Highlight the notch. */
  showNotch: boolean
  /** Fold progress 0..1 (the left part rotating over the vertical crease). */
  fold: number
  /** Reveal the clean folded silhouette (a rectangle). */
  showResult: boolean
  /** Show the option-D badge. */
  showOption: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q17Storyboard {
  answerLabel: 'A' | 'B' | 'C' | 'D'
  steps: Q17Step[]
  finalIndex: number
}

export const Q17_ANSWER: 'A' | 'B' | 'C' | 'D' = 'D'

export function buildP21G1Q17Steps(lang: Lang): Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q17Step[] = [
    {
      showFolds: true,
      showNotch: false,
      fold: 0,
      showResult: false,
      showOption: false,
      hold: 2000,
      result: false,
      caption: t(
        'Here is the sheet: a rectangle with a notch cut out of the left edge.',
        'Ini kertasnya: persegi panjang dengan takik di tepi kiri.',
      ),
    },
    {
      showFolds: true,
      showNotch: true,
      fold: 0,
      showResult: false,
      showOption: false,
      hold: 2200,
      result: false,
      caption: t(
        'Fold along the upright dotted line — the left part swings onto the right part.',
        'Lipat sepanjang garis putus-putus tegak — bagian kiri menutup ke bagian kanan.',
      ),
    },
    {
      showFolds: true,
      showNotch: true,
      fold: 1,
      showResult: false,
      showOption: false,
      hold: 2400,
      result: false,
      caption: t(
        'The folded-over left part lands on top of the solid right part.',
        'Bagian kiri yang dilipat mendarat di atas bagian kanan yang utuh.',
      ),
    },
    {
      showFolds: false,
      showNotch: false,
      fold: 1,
      showResult: true,
      showOption: false,
      hold: 2400,
      result: false,
      caption: t(
        'The notch is now covered — the outline is a clean rectangle.',
        'Takiknya kini tertutup — garis luarnya menjadi persegi panjang utuh.',
      ),
    },
    {
      showFolds: false,
      showNotch: false,
      fold: 1,
      showResult: true,
      showOption: true,
      hold: 0,
      result: true,
      caption: t(
        'A clean rectangle — that is shape (D).',
        'Persegi panjang utuh — itulah bentuk (D).',
      ),
    },
  ]

  return { answerLabel: Q17_ANSWER, steps, finalIndex: steps.length - 1 }
}
