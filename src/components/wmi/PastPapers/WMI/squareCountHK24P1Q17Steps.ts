import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type SquareCountPhase = 'intro' | 'unit' | 'sq2a' | 'sq2b' | 'result'

export interface SquareCountStep {
  phase: SquareCountPhase
  highlightA: boolean
  highlightB: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SquareCountStoryboard {
  steps: SquareCountStep[]
  finalIndex: number
}

// Bound to seed breakdown.quantities
export const UNIT_SQUARES = 9  // 1×1 squares (trap answer)
export const SQUARES_2X2 = 2   // 2×2 squares
export const TOTAL = 11        // grand total (answer)

export function buildSquareCountHK24P1Q17Steps(lang: Lang): SquareCountStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SquareCountStep[] = [
    {
      phase: 'intro',
      highlightA: false,
      highlightB: false,
      caption: t(
        'Count ALL squares — 1×1 unit squares AND larger squares formed by cells.',
        'Hitung SEMUA persegi — persegi satuan 1×1 DAN persegi yang lebih besar.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'unit',
      highlightA: false,
      highlightB: false,
      caption: t(
        '1×1 squares: each individual cell counts — 9 unit squares.',
        'Persegi 1×1: setiap sel dihitung satu — ada 9 persegi satuan.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'sq2a',
      highlightA: true,
      highlightB: false,
      caption: t(
        '2×2 square #1 (orange): the top 2×2 block — 4 cells form one bigger square.',
        'Persegi 2×2 ke-1 (oranye): blok 2×2 atas — 4 sel membentuk satu persegi lebih besar.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'sq2b',
      highlightA: true,
      highlightB: true,
      caption: t(
        '2×2 square #2 (blue): the bottom 2×2 block — another bigger square.',
        'Persegi 2×2 ke-2 (biru): blok 2×2 bawah — satu persegi lebih besar lagi.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'result',
      highlightA: true,
      highlightB: true,
      caption: t(
        '9 (1×1) + 2 (2×2) = 11 squares in total.',
        '9 (1×1) + 2 (2×2) = 11 persegi seluruhnya.',
      ),
      hold: 3000,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
