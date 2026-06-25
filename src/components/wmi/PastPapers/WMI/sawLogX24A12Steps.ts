/**
 * SEAMOX-24-A-Q12 — Beat-by-beat storyboard for the log-sawing explainer.
 *
 * Walk-through:
 *  Beat 0 (intro)   — 1 cut shown; establish "1 cut = 2 min".
 *  Beat 1–3 (count) — add cuts one at a time toward 4 pieces.
 *  Beat 4 (result)  — 3 cuts × 2 min = 6 min revealed.
 */

export type SawLogPhase = 'intro' | 'count' | 'result'

export interface SawLogStep {
  phase: SawLogPhase
  /** Number of cuts shown on the log (pieces = cuts + 1). */
  cuts: number
  /** Which cut index to highlight red, null = none. */
  highlightCut: number | null
  caption: string
  hold: number
  result: boolean
}

export interface SawLogStoryboard {
  steps: SawLogStep[]
  finalIndex: number
}

export function buildSawLogX24A12Steps(lang: 'en' | 'id'): SawLogStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SawLogStep[] = [
    {
      phase: 'intro',
      cuts: 1,
      highlightCut: 0,
      hold: 1800,
      result: false,
      caption: t(
        '1 cut → 2 pieces. That 1 cut takes 2 minutes, so each cut = 2 min.',
        '1 potongan → 2 bagian. 1 potongan itu membutuhkan 2 menit, jadi setiap potongan = 2 menit.',
      ),
    },
    {
      phase: 'count',
      cuts: 1,
      highlightCut: 0,
      hold: 1400,
      result: false,
      caption: t(
        'To get 4 pieces we need 3 cuts. Cut #1: 2 pieces so far.',
        'Untuk 4 bagian kita perlu 3 potongan. Potongan ke-1: 2 bagian sejauh ini.',
      ),
    },
    {
      phase: 'count',
      cuts: 2,
      highlightCut: 1,
      hold: 1400,
      result: false,
      caption: t(
        'Cut #2: 3 pieces so far.',
        'Potongan ke-2: 3 bagian sejauh ini.',
      ),
    },
    {
      phase: 'count',
      cuts: 3,
      highlightCut: 2,
      hold: 1400,
      result: false,
      caption: t(
        'Cut #3: 4 pieces! We made 3 cuts in total.',
        'Potongan ke-3: 4 bagian! Total 3 potongan dibuat.',
      ),
    },
    {
      phase: 'result',
      cuts: 3,
      highlightCut: null,
      hold: 0,
      result: true,
      caption: t(
        '3 cuts × 2 min/cut = 6 minutes ✓',
        '3 potongan × 2 menit/potongan = 6 menit ✓',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
