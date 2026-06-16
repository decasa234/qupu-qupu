import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { EqualPartsLabel } from './EqualPartsG2Illustration'

export type EqualPartsPhase = 'intro' | 'check' | 'result'

export interface EqualPartsG2Step {
  phase: EqualPartsPhase
  /** Which figure to shade/check this beat (null on intro). */
  focus: EqualPartsLabel | null
  /** Per-figure verdict so far: 'equal' | 'unequal' | 'none'. */
  verdicts: Record<EqualPartsLabel, 'equal' | 'unequal' | 'none'>
  caption: string
  hold: number
  result: boolean
}

export interface EqualPartsG2Storyboard {
  answer: EqualPartsLabel
  steps: EqualPartsG2Step[]
  finalIndex: number
}

const ALL: EqualPartsLabel[] = ['A', 'B', 'C', 'D']

function verdictsAfter(checked: Partial<Record<EqualPartsLabel, 'equal' | 'unequal'>>) {
  const out = {} as Record<EqualPartsLabel, 'equal' | 'unequal' | 'none'>
  for (const l of ALL) out[l] = checked[l] ?? 'none'
  return out
}

/**
 * Storyboard for WMI-19F2A-Q10: walk through figures A→D, shade each one's four
 * parts, decide whether they are equal, and conclude that C is the odd one out.
 */
export function buildEqualPartsG2Steps(lang: Lang): EqualPartsG2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answer: EqualPartsLabel = 'C'

  const steps: EqualPartsG2Step[] = [
    {
      phase: 'intro',
      focus: null,
      verdicts: verdictsAfter({}),
      hold: 1700,
      result: false,
      caption: t(
        'Which square is NOT cut into four equal parts? Check each one.',
        'Persegi mana yang TIDAK dibagi menjadi empat bagian sama besar? Periksa satu per satu.',
      ),
    },
    {
      phase: 'check',
      focus: 'A',
      verdicts: verdictsAfter({ A: 'equal' }),
      hold: 1800,
      result: false,
      caption: t(
        'A: both diagonals make 4 matching triangles — 4 equal parts. ✓',
        'A: kedua diagonal membentuk 4 segitiga yang sama — 4 bagian sama besar. ✓',
      ),
    },
    {
      phase: 'check',
      focus: 'B',
      verdicts: verdictsAfter({ A: 'equal', B: 'equal' }),
      hold: 1800,
      result: false,
      caption: t(
        'B: 4 strips of the same height — 4 equal parts. ✓',
        'B: 4 jalur dengan tinggi yang sama — 4 bagian sama besar. ✓',
      ),
    },
    {
      phase: 'check',
      focus: 'C',
      verdicts: verdictsAfter({ A: 'equal', B: 'equal', C: 'unequal' }),
      hold: 2100,
      result: false,
      caption: t(
        'C: the strips have different widths — the parts are NOT equal. ✗',
        'C: jalur-jalurnya berbeda lebar — bagiannya TIDAK sama besar. ✗',
      ),
    },
    {
      phase: 'check',
      focus: 'D',
      verdicts: verdictsAfter({ A: 'equal', B: 'equal', C: 'unequal', D: 'equal' }),
      hold: 1800,
      result: false,
      caption: t(
        'D: a 2×2 grid of 4 identical squares — 4 equal parts. ✓',
        'D: kotak 2×2 berisi 4 persegi yang sama — 4 bagian sama besar. ✓',
      ),
    },
    {
      phase: 'result',
      focus: 'C',
      verdicts: verdictsAfter({ A: 'equal', B: 'equal', C: 'unequal', D: 'equal' }),
      hold: 0,
      result: true,
      caption: t(
        'Only C has unequal parts, so the answer is C.',
        'Hanya C yang bagiannya tidak sama, jadi jawabannya C.',
      ),
    },
  ]

  return { answer, steps, finalIndex: steps.length - 1 }
}
