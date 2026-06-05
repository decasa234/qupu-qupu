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
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
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

  // Beats are deliberately few and unhurried — each `hold` keeps a beat on
  // screen long enough to read. The split and the bridge-slide (the crux of
  // a sum over ten) get the most time.
  if (bridges) {
    // 1. The bigger number fills the frame; show how many cells still need it.
    steps.push({
      blue: big, orange: 0, loose: small, split: null, highlightEmpty: true,
      caption: t(
        `start with ${big} — ${completesTen} more makes ten`,
        `mulai dari ${big} — ${completesTen} lagi jadi sepuluh`,
      ),
      hold: 1800, result: false,
    })
    // 2. Split the second addend: the part that completes the ten + the rest.
    steps.push({
      blue: big, orange: 0, loose: small, split: [bridge, leftover], highlightEmpty: true,
      caption: t(
        `split ${small} into ${bridge} and ${leftover}`,
        `pecah ${small} jadi ${bridge} dan ${leftover}`,
      ),
      hold: 2400, result: false,
    })
    // 3. The completing part slides in — the ten is now full.
    steps.push({
      blue: big, orange: bridge, loose: leftover, split: [bridge, leftover], highlightEmpty: false,
      caption: t(
        `${bridge} fills the ten → now 10`,
        `${bridge} mengisi sepuluh → sekarang 10`,
      ),
      hold: 2400, result: false,
    })
    // 4. Result: the full ten plus the leftover.
    steps.push({
      blue: big, orange: bridge, loose: leftover, split: null, highlightEmpty: false,
      caption: t(`10 + ${leftover} = ${sum}`, `10 + ${leftover} = ${sum}`),
      hold: 0, result: true,
    })
  } else if (sum === 10) {
    // Perfect ten: the two parts fill the frame exactly.
    steps.push({
      blue: big, orange: 0, loose: small, split: null, highlightEmpty: true,
      caption: t(`start with ${big}, add ${small}`, `mulai dari ${big}, tambah ${small}`),
      hold: 1700, result: false,
    })
    steps.push({
      blue: big, orange: small, loose: 0, split: null, highlightEmpty: false,
      caption: t(`they make exactly ten → 10`, `pas jadi sepuluh → 10`),
      hold: 0, result: true,
    })
  } else {
    // Under ten: combine in one frame, no bridge needed.
    steps.push({
      blue: big, orange: 0, loose: small, split: null, highlightEmpty: false,
      caption: t(`start with ${big}, add ${small}`, `mulai dari ${big}, tambah ${small}`),
      hold: 1700, result: false,
    })
    steps.push({
      blue: big, orange: small, loose: 0, split: null, highlightEmpty: false,
      caption: t(`still under ten → ${sum}`, `masih di bawah sepuluh → ${sum}`),
      hold: 0, result: true,
    })
  }

  return { big, small, sum, completesTen, bridge, leftover, bridges, steps, finalIndex: steps.length - 1 }
}
