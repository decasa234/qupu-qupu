/**
 * SEAMOX-23-B-Q4 — Beat-by-beat storyboard for the circle-division explainer.
 *
 * Demonstrates the maximum-region formula for n lines in a circle:
 *   R(n) = 1 + n + C(n, 2) = 1 + n + n(n−1)/2
 *
 * Each beat adds one more chord and shows how many new regions it creates.
 * The k-th chord crosses all k−1 previous chords inside the circle,
 * so it adds exactly k new regions.
 *
 *   n=0 →  1   (the uncut circle)
 *   n=1 →  2   (+1)
 *   n=2 →  4   (+2)
 *   n=3 →  7   (+3)
 *   n=4 → 11   (+4)
 *   n=5 → 16   (+5)
 *   n=6 → 22   (+6) ← answer
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CircleDivPhase = 'intro' | 'addline' | 'result'

export interface CircleDivStep {
  phase: CircleDivPhase
  lineCount: number    // chords visible in this beat
  regionCount: number  // total regions at this beat
  caption: string
  hold: number         // ms before advancing (0 = final / stays)
  result: boolean
}

export interface CircleDivStoryboard {
  steps: CircleDivStep[]
  finalIndex: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function regions(n: number): number {
  return 1 + n + (n * (n - 1)) / 2
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildCircleDivX23B4Steps(lang: 'en' | 'id'): CircleDivStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CircleDivStep[] = [
    // Beat 0 — stem: 1 line → 2 parts
    {
      phase: 'intro',
      lineCount: 1,
      regionCount: 2,
      hold: 1500,
      result: false,
      caption: t(
        '1 line divides a circle into 2 parts. Can we do better with more lines?',
        '1 garis membagi lingkaran menjadi 2 bagian. Bisakah lebih banyak dengan lebih banyak garis?',
      ),
    },
  ]

  // Beats 1–5: add lines 2 through 6
  for (let n = 2; n <= 6; n++) {
    const r     = regions(n)
    const added = n   // the n-th line crosses n−1 earlier lines → adds n regions
    const intersections = n - 1

    const isLast = n === 6
    steps.push({
      phase: isLast ? 'result' : 'addline',
      lineCount: n,
      regionCount: r,
      hold: isLast ? 0 : 1000,
      result: isLast,
      caption: t(
        `Line ${n} crosses ${intersections} previous line${intersections === 1 ? '' : 's'} inside → +${added} parts. Total: ${r}.`,
        `Garis ke-${n} memotong ${intersections} garis sebelumnya di dalam lingkaran → +${added} bagian. Total: ${r}.`,
      ),
    })
  }

  // Final result beat — show formula
  steps.push({
    phase: 'result',
    lineCount: 6,
    regionCount: 22,
    hold: 0,
    result: true,
    caption: t(
      '1 + 6 + C(6,2) = 1 + 6 + 15 = 22 parts.',
      '1 + 6 + C(6,2) = 1 + 6 + 15 = 22 bagian.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
