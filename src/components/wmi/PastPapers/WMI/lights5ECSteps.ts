// IKMC-23-EC-Q5 — storyboard for the theatre-lights timeline animation.
//
// The question: Green [2,5],[7,10]; Orange [2,7],[8,12]; Blue [0,3],[6,8],[10,12].
// How many minutes are exactly 2 lights on at the same time? → Answer C (8 minutes).
//
// Teaching walk, one idea per beat:
//   0. intro        — show the static schedule; prompt to scan minute by minute.
//   1. scan-0-2     — min 0–2: only Blue on → 1 light, skip.
//   2. scan-2-3     — min 2–3: G+O+B → 3 lights, skip.
//   3. hi-3-5       — min 3–5: G+O → exactly 2! (+2 min).
//   4. hi-6-7       — min 6–7: O+B → exactly 2! (+1 min → total 3).
//   5. hi-7-8       — min 7–8: G+B → exactly 2! (+1 min → total 4).
//   6. scan-8-10    — min 8–10: G+O+B → 3 lights, skip.
//   7. hi-10-12     — min 10–12: O+B → exactly 2! (+2 min → total 6, but…).
//   8. result       — Tally: 2+1+1+2 + correct segment = 8 min → answer C.
//
// Wait — with segments 3-5 (2), 6-7 (1), 7-8 (1), 10-12 (2) = 6 only.
// Also 8-10: Green [7,10] still on, Orange [8,12] on, Blue [6,8] off at 8.
// So 8-10: G+O → exactly 2! (+2 min). Total = 2+1+1+2+2 = 8. ✓
//
// Revised beats:
//   3. hi-3-5     — G+O → 2 lights (+2 min, running=2)
//   4. hi-6-7     — O+B → 2 lights (+1 min, running=3)
//   5. hi-7-8     — G+B → 2 lights (+1 min, running=4)
//   6. hi-8-10    — G+O → 2 lights (+2 min, running=6)
//   7. hi-10-12   — O+B → 2 lights (+2 min, running=8)
//   8. result     — total = 8 min → answer C
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type LightsPhaseId =
  | 'intro'
  | 'scan-0-2'
  | 'scan-2-3'
  | 'hi-3-5'
  | 'hi-6-7'
  | 'hi-7-8'
  | 'hi-8-10'
  | 'hi-10-12'
  | 'result'

/**
 * One animation beat for the lights timeline explainer.
 *
 * `highlightMinutes` — list of [start, end) minute intervals to highlight
 *   as "exactly 2 lights" (green tint overlay on the timeline).
 * `dimMinutes` — list of [start, end) intervals to dim / mark as skipped.
 * `runningTotal` — current running tally of "exactly 2" minutes (shown in counter).
 * `equation` — maths line to display; '' to hide.
 * `caption` — explanation text for the caption box.
 * `hold` — auto-hold in ms (0 = final / manual).
 * `result` — true only on the result beat.
 */
export interface LightsBeat {
  phase: LightsPhaseId
  highlightMinutes: Array<[number, number]>
  dimMinutes: Array<[number, number]>
  runningTotal: number
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface LightsStoryboard {
  steps: LightsBeat[]
  finalIndex: number
}

export function buildLights5ECSteps(lang: Lang): LightsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: LightsBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightMinutes: [],
      dimMinutes: [],
      runningTotal: 0,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Three lights have different ON/OFF schedules. We need to find every minute interval where exactly 2 are on at the same time.',
        'Tiga lampu memiliki jadwal nyala/mati yang berbeda. Kita perlu menemukan setiap interval menit di mana tepat 2 lampu menyala bersamaan.',
      ),
    },

    // Beat 1 — min 0–2: Blue only → skip
    {
      phase: 'scan-0-2',
      highlightMinutes: [],
      dimMinutes: [[0, 2]],
      runningTotal: 0,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'min 0–2: only Blue is on → 1 light. Skip.',
        'menit 0–2: hanya Biru yang menyala → 1 lampu. Lewati.',
      ),
    },

    // Beat 2 — min 2–3: G+O+B → skip
    {
      phase: 'scan-2-3',
      highlightMinutes: [],
      dimMinutes: [[0, 3]],
      runningTotal: 0,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'min 2–3: Green + Orange + Blue → 3 lights at once. Skip.',
        'menit 2–3: Hijau + Oranye + Biru → 3 lampu sekaligus. Lewati.',
      ),
    },

    // Beat 3 — min 3–5: Green + Orange → exactly 2 (+2 min)
    {
      phase: 'hi-3-5',
      highlightMinutes: [[3, 5]],
      dimMinutes: [[0, 3]],
      runningTotal: 2,
      equation: '2 min',
      hold: 2400,
      result: false,
      caption: t(
        'min 3–5: Green + Orange on, Blue off → exactly 2! (+2 min)',
        'menit 3–5: Hijau + Oranye menyala, Biru mati → tepat 2! (+2 menit)',
      ),
    },

    // Beat 4 — min 6–7: Orange + Blue → exactly 2 (+1 min)
    {
      phase: 'hi-6-7',
      highlightMinutes: [[3, 5], [6, 7]],
      dimMinutes: [[0, 3], [5, 6]],
      runningTotal: 3,
      equation: '2 + 1 = 3 min',
      hold: 2400,
      result: false,
      caption: t(
        'min 6–7: Orange + Blue on, Green off → exactly 2! (+1 min)',
        'menit 6–7: Oranye + Biru menyala, Hijau mati → tepat 2! (+1 menit)',
      ),
    },

    // Beat 5 — min 7–8: Green + Blue → exactly 2 (+1 min)
    {
      phase: 'hi-7-8',
      highlightMinutes: [[3, 5], [6, 7], [7, 8]],
      dimMinutes: [[0, 3], [5, 6]],
      runningTotal: 4,
      equation: '3 + 1 = 4 min',
      hold: 2400,
      result: false,
      caption: t(
        'min 7–8: Green + Blue on, Orange off → exactly 2! (+1 min)',
        'menit 7–8: Hijau + Biru menyala, Oranye mati → tepat 2! (+1 menit)',
      ),
    },

    // Beat 6 — min 8–10: Green + Orange → exactly 2 (+2 min)
    {
      phase: 'hi-8-10',
      highlightMinutes: [[3, 5], [6, 7], [7, 8], [8, 10]],
      dimMinutes: [[0, 3], [5, 6]],
      runningTotal: 6,
      equation: '4 + 2 = 6 min',
      hold: 2400,
      result: false,
      caption: t(
        'min 8–10: Green + Orange on, Blue off → exactly 2! (+2 min)',
        'menit 8–10: Hijau + Oranye menyala, Biru mati → tepat 2! (+2 menit)',
      ),
    },

    // Beat 7 — min 10–12: Orange + Blue → exactly 2 (+2 min)
    {
      phase: 'hi-10-12',
      highlightMinutes: [[3, 5], [6, 7], [7, 8], [8, 10], [10, 12]],
      dimMinutes: [[0, 3], [5, 6]],
      runningTotal: 8,
      equation: '6 + 2 = 8 min',
      hold: 2400,
      result: false,
      caption: t(
        'min 10–12: Orange + Blue on, Green off → exactly 2! (+2 min)',
        'menit 10–12: Oranye + Biru menyala, Hijau mati → tepat 2! (+2 menit)',
      ),
    },

    // Beat 8 — result
    {
      phase: 'result',
      highlightMinutes: [[3, 5], [6, 7], [7, 8], [8, 10], [10, 12]],
      dimMinutes: [[0, 3], [5, 6]],
      runningTotal: 8,
      equation: '2 + 1 + 1 + 2 + 2 = 8 min → C',
      hold: 0,
      result: true,
      caption: t(
        'Total: 8 minutes have exactly 2 lights on at the same time — answer C.',
        'Total: 8 menit memiliki tepat 2 lampu yang menyala bersamaan — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
