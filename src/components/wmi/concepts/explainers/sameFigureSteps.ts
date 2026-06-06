import type { Lang } from './makeTenSteps'

// ─── types ────────────────────────────────────────────────────────────────────

type Cell = [number, number]

export interface SameFigureParams {
  target: Cell[]
  options: Cell[][]
  validIndex: number
}

export interface SameFigureStep {
  /** Which beat phase this is: 'intro' | 'rotate' | 'result' */
  phase: 'intro' | 'rotate' | 'result'
  /** Rotation in degrees to apply to the reference figure (used on the rotate beat). */
  rotateDeg: number
  /** Whether to highlight the correct option with a green ring. */
  highlightCorrect: boolean
  /** Index of a mirror distractor to call out (or -1 if none). */
  mirrorIndex: number
  caption: string
  hold: number
  result: boolean
}

export interface SameFigureStoryboard {
  /** Validated params (or safe defaults). */
  params: SameFigureParams
  /** Index of the correct option (0-3). */
  validIndex: number
  /** Label of the correct option: A / B / C / D. */
  answerLabel: string
  /** Index of the final (result) beat — steps.length − 1. */
  finalIndex: number
  steps: SameFigureStep[]
}

// ─── builder ─────────────────────────────────────────────────────────────────

const LABELS = ['A', 'B', 'C', 'D'] as const

/**
 * Builds the same-figure-identify animation storyboard.
 *
 * Strategy taught:
 *   1. Intro  — show reference figure alone; explain rotation is allowed.
 *   2. Rotate — spin the reference to line it up with the correct option;
 *               caption explains that a pure rotation confirms it is the same.
 *   3. Result — highlight the correct option; optionally note that the other
 *               options are mirror images (reflections), which disqualify them.
 *
 * Defensive: any missing / malformed param falls back to safe defaults so the
 * component never crashes even on a partial params object.
 */
export function buildSameFigureSteps(rawParams: unknown, lang: Lang): SameFigureStoryboard {
  // ── defensive normalisation ────────────────────────────────────────────────
  const raw = (rawParams ?? {}) as Partial<SameFigureParams>

  const target: Cell[] = Array.isArray(raw.target) ? (raw.target as Cell[]) : [[0, 0], [0, 1], [0, 2], [1, 2]]
  const options: Cell[][] = Array.isArray(raw.options) && raw.options.length === 4
    ? (raw.options as Cell[][])
    : [target, target, target, target]

  const validIndex: number =
    typeof raw.validIndex === 'number' && raw.validIndex >= 0 && raw.validIndex <= 3
      ? raw.validIndex
      : 0

  const params: SameFigureParams = { target, options, validIndex }

  // ── helpers ────────────────────────────────────────────────────────────────
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)
  const answerLabel = LABELS[validIndex]

  // Find a distractor index to name (first non-correct option, i.e. a mirror).
  const mirrorIndex = [0, 1, 2, 3].find((i) => i !== validIndex) ?? -1

  // Choose a rotation amount to illustrate the alignment (90° looks clean).
  const rotateDeg = 90

  // ── beats ─────────────────────────────────────────────────────────────────
  const steps: SameFigureStep[] = [
    // Beat 0 — intro: show reference, explain the task
    {
      phase: 'intro',
      rotateDeg: 0,
      highlightCorrect: false,
      mirrorIndex: -1,
      caption: t(
        'This is the reference figure. Rotating it to any angle is allowed.',
        'Ini adalah bangun acuan. Memutar ke sudut mana pun diperbolehkan.',
      ),
      hold: 2000,
      result: false,
    },

    // Beat 1 — rotate: spin the reference to show it matches the correct option
    {
      phase: 'rotate',
      rotateDeg,
      highlightCorrect: false,
      mirrorIndex: -1,
      caption: t(
        `Rotate it — after turning, it lines up exactly with option ${answerLabel}. Same shape!`,
        `Putar bangunnya — setelah diputar, cocok persis dengan pilihan ${answerLabel}. Bentuk sama!`,
      ),
      hold: 2200,
      result: false,
    },

    // Beat 2 — result: highlight the correct option, note mirror options
    {
      phase: 'result',
      rotateDeg,
      highlightCorrect: true,
      mirrorIndex,
      caption: t(
        `Option ${answerLabel} is the same figure — only rotated, never flipped. Mirror options are wrong.`,
        `Pilihan ${answerLabel} adalah bangun yang sama — hanya diputar, tidak dibalik. Pilihan cermin salah.`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return {
    params,
    validIndex,
    answerLabel,
    finalIndex: steps.length - 1,
    steps,
  }
}
