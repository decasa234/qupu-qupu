export type Lang = 'en' | 'id'

export interface MakeTenStep {
  /** First-addend chips currently sitting in the ten-frame (blue). */
  blue: number
  /** Bridge chips that have moved into the ten-frame (orange). */
  orange: number
  /** Second-addend chips not yet in the frame (shown in the loose pile). */
  loose: number
  /** Number-bond split of the second addend `[completes, leftover]`, when shown. */
  split: [number, number] | null
  /** Glow the empty cells (the "needs N more to fill the ten" beat). */
  highlightEmpty: boolean
  caption: string
  result: boolean
}

export interface MakeTenStoryboard {
  big: number
  small: number
  sum: number
  /** Chips needed to fill the ten once `big` is placed (= `bridge` when sum > 10). */
  completesTen: number
  /** Portion of `small` that completes the ten. */
  bridge: number
  /** Chips left after the ten is full (0 unless the sum crosses ten). */
  leftover: number
  /** True when the sum crosses ten and the bridge animation plays. */
  bridges: boolean
  steps: MakeTenStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.max(1, Math.min(9, Math.round(n)))
}

export function buildMakeTenSteps(aRaw: number, bRaw: number, lang: Lang): MakeTenStoryboard {
  const a = clamp(aRaw)
  const b = clamp(bRaw)
  const big = Math.max(a, b)
  const small = Math.min(a, b)
  const sum = a + b
  const completesTen = Math.max(0, 10 - big)
  const bridge = Math.min(small, completesTen)
  const leftover = Math.max(0, sum - 10)
  const bridges = sum > 10

  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: MakeTenStep[] = []

  // Steps 1 and 2 are intentionally state-identical — two caption beats
  // ("start with N" → "add M") before any chips move. The component advances
  // by step index and renders each caption, so both beats are shown.

  // 1. The bigger number fills the frame first.
  steps.push({
    blue: big, orange: 0, loose: small, split: null, highlightEmpty: bridges,
    caption: t(
      big > small ? `start with the bigger number: ${big}` : `start with ${big}`,
      big > small ? `mulai dari yang besar: ${big}` : `mulai dari ${big}`,
    ),
    result: false,
  })

  // 2. Introduce the second addend as loose chips.
  steps.push({
    blue: big, orange: 0, loose: small, split: null, highlightEmpty: bridges,
    caption: t(`add ${small}`, `tambah ${small}`),
    result: false,
  })

  if (bridges) {
    // 3. Split the second addend into "completes the ten" + "leftover".
    steps.push({
      blue: big, orange: 0, loose: small, split: [bridge, leftover], highlightEmpty: true,
      caption: t(`${small} = ${bridge} + ${leftover}`, `${small} = ${bridge} + ${leftover}`),
      result: false,
    })
    // 4. Slide the bridge chips in — the ten is now full.
    steps.push({
      blue: big, orange: bridge, loose: leftover, split: [bridge, leftover], highlightEmpty: false,
      caption: t(`${bridge} completes the ten → 10`, `${bridge} melengkapi sepuluh → 10`),
      result: false,
    })
    // 5. The leftover chips remain.
    steps.push({
      blue: big, orange: bridge, loose: leftover, split: null, highlightEmpty: false,
      caption: t(`${leftover} left over`, `sisa ${leftover}`),
      result: false,
    })
    // 6. Result: 10 + leftover = sum.
    steps.push({
      blue: big, orange: bridge, loose: leftover, split: null, highlightEmpty: false,
      caption: t(`10 + ${leftover} = ${sum}`, `10 + ${leftover} = ${sum}`),
      result: true,
    })
  } else if (sum === 10) {
    // Perfect ten: the two parts fill the frame exactly.
    steps.push({
      blue: big, orange: small, loose: 0, split: null, highlightEmpty: false,
      caption: t(`they make exactly ten → 10`, `pas sepuluh → 10`),
      result: true,
    })
  } else {
    // Under ten: combine in one frame, no bridge needed.
    steps.push({
      blue: big, orange: small, loose: 0, split: null, highlightEmpty: false,
      caption: t(`still room in the ten → ${sum}`, `masih muat dalam sepuluh → ${sum}`),
      result: true,
    })
  }

  return { big, small, sum, completesTen, bridge, leftover, bridges, steps, finalIndex: steps.length - 1 }
}
