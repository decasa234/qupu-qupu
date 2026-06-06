import type { Lang } from './makeTenSteps'

export interface RectPerimeterStep {
  /** How many edges have been traced so far (0 = none, 1 = top, 2 = top+right, 3 = top+right+bottom, 4 = all). */
  edgesTraced: number
  /** Running perimeter total shown at this beat. */
  running: number
  caption: string
  /** Hold duration in ms (0 on the final beat). */
  hold: number
  result: boolean
}

export interface RectPerimeterStoryboard {
  w: number
  h: number
  answer: number
  steps: RectPerimeterStep[]
  finalIndex: number
}

/**
 * Build the storyboard for the rectangle-perimeter explainer.
 * Traces edges in order: top (w), right (h), bottom (w), left (h).
 * Defensive: clamps non-finite or out-of-range w/h to [2, 15].
 */
export function buildRectPerimeterSteps(
  rawW: number,
  rawH: number,
  lang: Lang,
): RectPerimeterStoryboard {
  const clamp = (v: number) => (Number.isFinite(v) ? Math.max(2, Math.min(15, Math.round(v))) : 5)
  const w = clamp(rawW)
  const h = clamp(rawH)
  const answer = 2 * (w + h)

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Edge sequence: top=w, right=h, bottom=w, left=h
  const edgeLengths = [w, h, w, h]
  const edgeNames_en = ['top', 'right', 'bottom', 'left']
  const edgeNames_id = ['atas', 'kanan', 'bawah', 'kiri']

  const steps: RectPerimeterStep[] = []

  // Beat 0: show the bare rectangle, nothing traced yet
  steps.push({
    edgesTraced: 0,
    running: 0,
    caption: t(
      `A rectangle has 4 sides. We trace all the way around.`,
      `Persegi panjang punya 4 sisi. Kita keliling semuanya.`,
    ),
    hold: 1600,
    result: false,
  })

  // Beats 1–4: reveal each edge one at a time
  let running = 0
  for (let i = 0; i < 4; i++) {
    running += edgeLengths[i]
    const nameParts_en = edgeNames_en.slice(0, i + 1).join(', ')
    const nameParts_id = edgeNames_id.slice(0, i + 1).join(', ')
    const isLast = i === 3

    steps.push({
      edgesTraced: i + 1,
      running,
      caption: isLast
        ? t(
            `Last side (left): ${edgeLengths[i]} cm — total so far: ${running} cm.`,
            `Sisi terakhir (kiri): ${edgeLengths[i]} cm — total sejauh ini: ${running} cm.`,
          )
        : t(
            `${edgeNames_en[i].charAt(0).toUpperCase() + edgeNames_en[i].slice(1)} side: ${edgeLengths[i]} cm — ${nameParts_en}: ${running} cm.`,
            `Sisi ${edgeNames_id[i]}: ${edgeLengths[i]} cm — ${nameParts_id}: ${running} cm.`,
          ),
      hold: isLast ? 1800 : 1400,
      result: false,
    })
  }

  // Beat 5: result — formula summary
  steps.push({
    edgesTraced: 4,
    running: answer,
    caption: t(
      `2 × (${w} + ${h}) = ${answer} cm`,
      `2 × (${w} + ${h}) = ${answer} cm`,
    ),
    hold: 0,
    result: true,
  })

  return { w, h, answer, steps, finalIndex: steps.length - 1 }
}
