// Storyboard for WMI-23F2A-Q24 (2023 Grade-2 Final).
//
// A valid pattern is built by choosing a CORE of 1–2 figures ONCE, then
// repeatedly wrapping a same-figure pair on BOTH ends. That is *exactly* a
// palindrome whose innermost 1–2 figures are the core. So the method is:
//   1. Peel equal end-pairs off both sides, step by step.
//   2. If at every peel the two ends match, and you finally land on a 1- or
//      2-token core, the pattern is buildable.
//   3. Equivalently: the row must read the same forwards and backwards
//      (palindrome). Option D fails because reversed it differs.
//
// This builder is a PURE function of OPTIONS24G2 + lang. The ABCE result is
// computed here by the actual peel/palindrome check — never asserted — so the
// component just renders whatever the code decides.

import { OPTIONS24G2, type PatternToken } from './Pattern23G2Illustration'

export type Lang = 'en' | 'id'
export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E'

// One "peel" layer: the matched (or mismatched) outer pair plus the inner slice
// that remains after removing it.
export interface PeelLayer {
  left: PatternToken
  right: PatternToken
  matched: boolean
  /** tokens still inside after this pair is peeled away */
  inner: PatternToken[]
}

export interface PeelResult {
  tokens: PatternToken[]
  layers: PeelLayer[]
  /** the 1–2 token core left when peeling succeeds (empty if it failed) */
  core: PatternToken[]
  valid: boolean
}

// Peel equal end-pairs repeatedly. Valid when every removed pair matched AND
// the leftover core is 1 or 2 tokens. A palindrome of odd length leaves a
// single token; even length leaves two equal tokens — both legal cores.
export function peelPattern(tokens: PatternToken[]): PeelResult {
  const layers: PeelLayer[] = []
  let lo = 0
  let hi = tokens.length - 1
  let valid = true

  while (hi - lo >= 2) {
    const left = tokens[lo]
    const right = tokens[hi]
    const matched = left === right
    const inner = tokens.slice(lo + 1, hi)
    layers.push({ left, right, matched, inner })
    if (!matched) {
      valid = false
      break
    }
    lo += 1
    hi -= 1
  }

  const core = valid ? tokens.slice(lo, hi + 1) : []
  // Belt-and-braces: a legal core is exactly 1 or 2 tokens, and a 2-token core
  // must be the same figure twice (Step 1 draws ONE figure once or twice).
  if (valid) {
    if (core.length < 1 || core.length > 2) valid = false
    else if (core.length === 2 && core[0] !== core[1]) valid = false
  }

  return { tokens, layers, core, valid }
}

const TOKEN_EN: Record<PatternToken, string> = { a: 'circle', b: 'diamond', c: 'triangle' }
const TOKEN_ID: Record<PatternToken, string> = { a: 'lingkaran', b: 'belah ketupat', c: 'segitiga' }

function coreWords(core: PatternToken[], lang: Lang): string {
  const dict = lang === 'id' ? TOKEN_ID : TOKEN_EN
  return core.map((tk) => dict[tk]).join(lang === 'id' ? ' ' : ' ')
}

export interface PatternStep {
  /** null on the intro beat; otherwise the option under test. */
  key: OptionKey | null
  tokens: PatternToken[]
  /** how many outer pairs to show peeled away so far (drives the animation). */
  peeledPairs: number
  /** the core to spotlight once fully peeled (null while still peeling). */
  core: PatternToken[] | null
  /** true once the peel for this option is fully resolved (pass or fail). */
  resolved: boolean
  valid: boolean | null
  caption: string
  /** green winner-style box for the final answer beat. */
  result: boolean
  hold: number
}

export interface PatternStoryboard {
  steps: PatternStep[]
  finalIndex: number
  /** validity per option, straight from the peel check. */
  validity: Record<OptionKey, boolean>
  /** the keys that passed, in A→E order, joined: e.g. "ABCE". */
  answer: string
}

const ORDER: OptionKey[] = ['A', 'B', 'C', 'D', 'E']

export function buildPatternSteps(lang: Lang): PatternStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Run the real check for every option up front.
  const peeled: Record<OptionKey, PeelResult> = {} as Record<OptionKey, PeelResult>
  for (const k of ORDER) peeled[k] = peelPattern(OPTIONS24G2[k])

  const validity = {} as Record<OptionKey, boolean>
  for (const k of ORDER) validity[k] = peeled[k].valid
  const answer = ORDER.filter((k) => validity[k]).join('')

  const steps: PatternStep[] = []

  // Intro: explain the peel idea.
  steps.push({
    key: null,
    tokens: [],
    peeledPairs: 0,
    core: null,
    resolved: false,
    valid: null,
    caption: t(
      'Peel matching end-pairs off both sides. A good pattern is a mirror with a 1–2 figure middle.',
      'Kupas pasangan ujung yang sama dari kedua sisi. Pola yang benar itu cermin dengan inti 1–2 gambar.',
    ),
    result: false,
    hold: 2600,
  })

  // One beat per option, fully peeled in a single beat (the SVG animates the
  // bracket peeling); the caption states the verdict from the code check.
  for (const k of ORDER) {
    const pr = peeled[k]
    const valid = pr.valid
    const peeledPairs = pr.layers.filter((l) => l.matched).length

    let caption: string
    if (valid) {
      caption = t(
        `${k}: peels to a ${coreWords(pr.core, 'en')} core — same both ways ✓`,
        `${k}: terkupas jadi inti ${coreWords(pr.core, 'id')} — sama dari dua arah ✓`,
      )
    } else {
      // D fails: the first mismatched outer pair.
      const bad = pr.layers.find((l) => !l.matched)
      const le = bad ? TOKEN_EN[bad.left] : ''
      const re = bad ? TOKEN_EN[bad.right] : ''
      const li = bad ? TOKEN_ID[bad.left] : ''
      const ri = bad ? TOKEN_ID[bad.right] : ''
      caption = t(
        `${k}: ends differ — ${le} ≠ ${re}. Not a mirror ✗`,
        `${k}: ujungnya beda — ${li} ≠ ${ri}. Bukan cermin ✗`,
      )
    }

    steps.push({
      key: k,
      tokens: pr.tokens,
      peeledPairs,
      core: valid ? pr.core : null,
      resolved: true,
      valid,
      caption,
      result: false,
      // Failing options linger a touch longer so the rejection reads.
      hold: valid ? 1900 : 2200,
    })
  }

  // Final answer beat (result: true), built from the code check.
  const validKeys = ORDER.filter((k) => validity[k])
  steps.push({
    key: null,
    tokens: [],
    peeledPairs: 0,
    core: null,
    resolved: true,
    valid: true,
    caption: t(
      `Mirrors: ${validKeys.join(', ')} → answer ${answer}.`,
      `Yang cermin: ${validKeys.join(', ')} → jawaban ${answer}.`,
    ),
    result: true,
    hold: 0,
  })

  return { steps, finalIndex: steps.length - 1, validity, answer }
}
