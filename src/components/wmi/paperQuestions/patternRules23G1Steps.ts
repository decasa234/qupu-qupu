import type { Lang } from '../concepts/explainers/makeTenSteps'
import { PATTERNS, ROW_KEYS, isValidPattern, type Glyph } from './PatternRules23G1Illustration'

// WMI-23F1A-Q24 (2023 G1 Final): which labelled rows follow the build rules?
// A valid pattern is a PALINDROME that grows symmetrically from a centre of one
// figure OR two identical figures, using at most three kinds of figures. The
// storyboard tests A → E one at a time, peeling matching end-pairs inward; if
// the ends ever disagree the row is rejected, otherwise it must land on a clean
// 1- or 2-identical-figure centre. Verdicts accumulate so the final beat can
// read off every passing letter: ABCE.

/** What a beat is doing. */
export type PatternPhase = 'intro' | 'test' | 'peel' | 'verdict' | 'result'

const GLYPH_EN: Record<Glyph, string> = {
  circle: 'circle',
  square: 'square',
  triangle: 'triangle',
}
const GLYPH_ID: Record<Glyph, string> = {
  circle: 'lingkaran',
  square: 'persegi',
  triangle: 'segitiga',
}
const GLYPH_SYM: Record<Glyph, string> = {
  circle: '○', // ○
  square: '□', // □
  triangle: '△', // △
}

const glyphName = (g: Glyph, lang: Lang) => (lang === 'id' ? GLYPH_ID[g] : GLYPH_EN[g])

export interface PatternStep {
  phase: PatternPhase
  /** Row label under test on this beat (null on result). */
  row: string | null
  /** Index range still "in play" after this beat's peel, inclusive [lo, hi]. */
  lo: number | null
  hi: number | null
  /** Verdicts known so far (drawn as ✓/✗ badges, accumulating). */
  verdicts: Record<string, boolean>
  caption: string
  /** True only on the very last (answer) beat. */
  result: boolean
  hold: number
}

export interface PatternStoryboard {
  /** Final answer string, e.g. "ABCE". */
  answer: string
  steps: PatternStep[]
  finalIndex: number
}

// A passing row lingers a touch; a failing row lingers longest so the rejection
// reads. The final answer beat holds 0 (it is the winner / last beat).
const HOLD_INTRO = 1700
const HOLD_TEST = 1500
const HOLD_PEEL = 1500
const HOLD_PASS = 1900
const HOLD_FAIL = 2200

/** Build the ordered beats for the five-row palindrome check. */
export function buildPatternRulesSteps(lang: Lang): PatternStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Resolve the final answer from the live rule check (never hardcode it).
  const passing = ROW_KEYS.filter((k) => isValidPattern(PATTERNS[k]))
  const answer = passing.join('')

  const steps: PatternStep[] = []
  const verdicts: Record<string, boolean> = {}

  steps.push({
    phase: 'intro',
    row: null,
    lo: null,
    hi: null,
    verdicts: {},
    result: false,
    hold: HOLD_INTRO,
    caption: t(
      'A good pattern reads the same both ways. Fold each row from both ends to the middle.',
      'Pola yang benar sama dibaca dari dua arah. Lipat tiap baris dari dua ujung ke tengah.',
    ),
  })

  for (const key of ROW_KEYS) {
    const seq = PATTERNS[key]
    const pass = isValidPattern(seq)

    // Test beat: light the row, announce we are folding it.
    steps.push({
      phase: 'test',
      row: key,
      lo: 0,
      hi: seq.length - 1,
      verdicts: { ...verdicts },
      result: false,
      hold: HOLD_TEST,
      caption: t(`Row (${key}): peel the two ends inward.`, `Baris (${key}): kupas dua ujung ke dalam.`),
    })

    // Peel matching end-pairs until ≤2 remain (or a mismatch breaks it).
    let lo = 0
    let hi = seq.length - 1
    let mismatch = false
    while (hi - lo + 1 > 2) {
      if (seq[lo] !== seq[hi]) {
        mismatch = true
        break
      }
      const peeled = seq[lo]
      lo++
      hi--
      steps.push({
        phase: 'peel',
        row: key,
        lo,
        hi,
        verdicts: { ...verdicts },
        result: false,
        hold: HOLD_PEEL,
        caption: t(
          `${GLYPH_SYM[peeled]} matches ${GLYPH_SYM[peeled]} — peel the ${glyphName(peeled, lang)} pair off.`,
          `${GLYPH_SYM[peeled]} cocok ${GLYPH_SYM[peeled]} — kupas pasangan ${glyphName(peeled, lang)}.`,
        ),
      })
    }

    // Verdict beat: explain why this row passes or fails, then bank the badge.
    verdicts[key] = pass
    let verdictCaption: string
    if (mismatch) {
      verdictCaption = t(
        `(${key}) ends differ: ${GLYPH_SYM[seq[lo]]} ≠ ${GLYPH_SYM[seq[hi]]}. Not the same both ways. ✗`,
        `(${key}) ujungnya beda: ${GLYPH_SYM[seq[lo]]} ≠ ${GLYPH_SYM[seq[hi]]}. Tidak sama dua arah. ✗`,
      )
    } else if (lo === hi) {
      verdictCaption = t(
        `(${key}) centre is one ${glyphName(seq[lo], lang)}. A clean fold. ✓`,
        `(${key}) tengahnya satu ${glyphName(seq[lo], lang)}. Lipatan rapi. ✓`,
      )
    } else if (seq[lo] === seq[hi]) {
      verdictCaption = t(
        `(${key}) centre is two ${glyphName(seq[lo], lang)}s, the same. A clean fold. ✓`,
        `(${key}) tengahnya dua ${glyphName(seq[lo], lang)} yang sama. Lipatan rapi. ✓`,
      )
    } else {
      // Two different figures left in the centre — invalid centre.
      verdictCaption = t(
        `(${key}) centre ${GLYPH_SYM[seq[lo]]} ${GLYPH_SYM[seq[hi]]} are not the same. ✗`,
        `(${key}) tengah ${GLYPH_SYM[seq[lo]]} ${GLYPH_SYM[seq[hi]]} tidak sama. ✗`,
      )
    }

    steps.push({
      phase: 'verdict',
      row: key,
      lo,
      hi,
      verdicts: { ...verdicts },
      result: false,
      hold: pass ? HOLD_PASS : HOLD_FAIL,
      caption: verdictCaption,
    })
  }

  // Result beat: all badges in, read off the passing letters.
  steps.push({
    phase: 'result',
    row: null,
    lo: null,
    hi: null,
    verdicts: { ...verdicts },
    result: true,
    hold: 0,
    caption: t(
      `Patterns that follow the rules: ${answer}.`,
      `Pola yang mengikuti aturan: ${answer}.`,
    ),
  })

  return { answer, steps, finalIndex: steps.length - 1 }
}
