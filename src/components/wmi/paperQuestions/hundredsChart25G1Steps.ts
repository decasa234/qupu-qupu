import type { Lang } from '../concepts/explainers/makeTenSteps'

/**
 * Storyboard for WMI-25F1A-Q8 (2025 Grade 1 Final).
 *
 * Question: each option is a fragment cut from a 1–100 hundreds chart, and one
 * square is blank. In which option is 35 NOT the number that belongs in the
 * blank? In a hundreds chart RIGHT = +1 and DOWN = +10. Walking that rule from a
 * printed anchor to the blank:
 *
 *   A  34 → right +1 → 35              ✓
 *   B  53 → up-right (-10 +1) twice → 44 → 35  ✓
 *   C  25 → down +10 → 35              ✓
 *   D  46 → up-left (-10 -1) → 45 → 35 ✓
 *   E  37 → left -1 → 36 → up -10 → 26 ✗  (the rule forces 26, not 35)
 *
 * So E is the only fragment where 35 does NOT belong — that's the answer. The
 * builder is a pure function of `lang`: one beat states the rule, five beats
 * check the options one at a time (each shows the move arithmetic), and the
 * final beat lands on E. Deterministic and SSR-safe.
 */

export type HundredsChartPhase = 'rule' | 'check' | 'result'
export type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

export interface HundredsChartStep {
  phase: HundredsChartPhase
  /** Option fragment shown on this beat, or null on the opening rule beat. */
  label: OptionLabel | null
  /** Value the +1 / +10 rule forces into the blank (35 for A–D, 26 for E). */
  resolved: number | null
  /** Does the resolved value equal 35? false on the rejected option (E). */
  ok: boolean
  caption: string
  hold: number
  result: boolean
}

export interface HundredsChartStoryboard {
  /** The target value the question asks about. */
  target: number
  /** The label that fails the test (the answer). */
  answer: OptionLabel
  steps: HundredsChartStep[]
  finalIndex: number
}

const TARGET = 35
const ANSWER: OptionLabel = 'E'

// How the +1 / +10 rule walks from a printed anchor to the blank, per option.
const MOVES: Record<OptionLabel, { en: string; id: string; resolved: number }> = {
  A: {
    en: '34, then one step right: 34 + 1 = 35.',
    id: '34, lalu satu langkah ke kanan: 34 + 1 = 35.',
    resolved: 35,
  },
  B: {
    en: '53 up-and-right twice: 53 → 44 → 35.',
    id: '53 naik ke kanan dua kali: 53 → 44 → 35.',
    resolved: 35,
  },
  C: {
    en: '25, then one step down: 25 + 10 = 35.',
    id: '25, lalu satu langkah ke bawah: 25 + 10 = 35.',
    resolved: 35,
  },
  D: {
    en: '46 up-and-left: 46 → 45 → 35.',
    id: '46 naik ke kiri: 46 → 45 → 35.',
    resolved: 35,
  },
  E: {
    en: '37 left then up: 37 → 36 → 26 — not 35!',
    id: '37 ke kiri lalu ke atas: 37 → 36 → 26 — bukan 35!',
    resolved: 26,
  },
}

const ORDER: OptionLabel[] = ['A', 'B', 'C', 'D', 'E']

export function buildHundredsChart25G1Steps(lang: Lang): HundredsChartStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HundredsChartStep[] = [
    {
      phase: 'rule',
      label: null,
      resolved: null,
      ok: true,
      hold: 2200,
      result: false,
      caption: t(
        'In a hundreds chart, one step right is +1 and one step down is +10.',
        'Di papan seratus, satu langkah ke kanan +1 dan satu langkah ke bawah +10.',
      ),
    },
  ]

  ORDER.forEach((label) => {
    const move = MOVES[label]
    const ok = move.resolved === TARGET
    steps.push({
      phase: 'check',
      label,
      resolved: move.resolved,
      ok,
      // The rejected option lingers a touch longer so the mismatch reads.
      hold: ok ? 2000 : 2400,
      result: false,
      caption: ok
        ? t(`${label}: ${move.en} The blank is 35. ✓`, `${label}: ${move.id} Kotaknya 35. ✓`)
        : t(`${label}: ${move.en} The blank is ${move.resolved}, not 35. ✗`, `${label}: ${move.id} Kotaknya ${move.resolved}, bukan 35. ✗`),
    })
  })

  steps.push({
    phase: 'result',
    label: ANSWER,
    resolved: MOVES[ANSWER].resolved,
    ok: false,
    hold: 0,
    result: true,
    caption: t(
      `Only ${ANSWER} forces ${MOVES[ANSWER].resolved}, so 35 does not belong — the answer is ${ANSWER}.`,
      `Hanya ${ANSWER} yang memaksa ${MOVES[ANSWER].resolved}, jadi 35 tak cocok — jawabannya ${ANSWER}.`,
    ),
  })

  return { target: TARGET, answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
