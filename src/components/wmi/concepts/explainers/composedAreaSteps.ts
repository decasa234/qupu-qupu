import type { Lang } from './makeTenSteps'

export interface ComposedAreaStep {
  /** Show the full W×H rectangle (all squares filled). */
  showFull: boolean
  /** Show / animate the cut-out corner (cw×ch squares in the top-right). */
  showCut: boolean
  caption: string
  /** How long to hold this beat in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface ComposedAreaStoryboard {
  W: number
  H: number
  cw: number
  ch: number
  full: number
  cut: number
  result: number
  steps: ComposedAreaStep[]
  finalIndex: number
}

function clampInt(n: unknown, lo: number, hi: number, fallback: number): number {
  const v = Number(n)
  if (!Number.isFinite(v)) return fallback
  return Math.max(lo, Math.min(hi, Math.round(v)))
}

export function buildComposedAreaSteps(
  WRaw: unknown,
  HRaw: unknown,
  cwRaw: unknown,
  chRaw: unknown,
  lang: Lang = 'en',
): ComposedAreaStoryboard {
  const W = clampInt(WRaw, 3, 8, 4)
  const H = clampInt(HRaw, 3, 7, 3)
  // cw and ch must be strictly less than W / H
  const cw = clampInt(cwRaw, 1, W - 1, 1)
  const ch = clampInt(chRaw, 1, H - 1, 1)

  const full = W * H
  const cut = cw * ch
  const result = full - cut

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ComposedAreaStep[] = [
    {
      showFull: true,
      showCut: false,
      caption: t(
        `Full rectangle: ${W} × ${H} = ${full}`,
        `Persegi panjang penuh: ${W} × ${H} = ${full}`,
      ),
      hold: 2200,
      result: false,
    },
    {
      showFull: true,
      showCut: true,
      caption: t(
        `Cut-out: ${cw} × ${ch} = ${cut}`,
        `Sudut yang dipotong: ${cw} × ${ch} = ${cut}`,
      ),
      hold: 2200,
      result: false,
    },
    {
      showFull: true,
      showCut: true,
      caption: t(
        `${full} − ${cut} = ${result}`,
        `${full} − ${cut} = ${result}`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return { W, H, cw, ch, full, cut, result, steps, finalIndex: steps.length - 1 }
}
