import type { Lang } from './makeTenSteps'

// number-figure-rule (P7) — post-answer storyboard.
//
// The question body carries NO numbers: the figure holds three number groups,
// two already finished and one with a single slot blanked out. The skill being
// taught is not arithmetic, it is HYPOTHESISE → TEST → APPLY:
//
//   1. guess  — try an operation out loud on the FIRST finished group
//   2. test   — run the same guess on the SECOND finished group (guess → rule)
//   3. rule   — only now name the rule, because it survived two checks
//   4. trap   — (when one exists) the tempting wrong move, disproved on screen
//   5. setup  — write the rule onto the blanked group, answer still "?"
//   6. answer — finish the arithmetic and land the missing number
//
// Nothing before the last beat resolves the blank: `step.answer` is null until
// then, and every equation involving the gap still shows "?".
//
// Pure data, no React, no randomness, no dates — unit-testable and SSR-safe.

export type Slot = 'a' | 'b' | 'c'
export type LayoutKind = 'row' | 'pyramid'
export type RuleKind = 'sum' | 'diff' | 'sum-minus-one'

export interface Triple {
  a: number
  b: number
  c: number
}

/** Colour/voice of a beat, shared by the work strip and the focus ring. */
export type Tone = 'try' | 'ok' | 'rule' | 'trap' | 'answer'

/** The little "working out" note under the figure — the arithmetic annotation. */
export interface WorkLine {
  /** Big line, e.g. "8 + 4 = 12" or "? + 4 = 12". */
  expr: string
  /** Small line under it, e.g. "cocok" / "bukan 12". */
  sub: string | null
  tone: Tone
}

export type StepKind = 'guess' | 'test' | 'rule' | 'trap' | 'setup' | 'answer'

export interface RuleStep {
  kind: StepKind
  caption: string
  work: WorkLine
  /** Which group card is spotlighted (0-2); null spotlights none. */
  focus: number | null
  badge: 'none' | 'check' | 'cross'
  /**
   * A candidate dropped into the gap to be tested and thrown away (the trap
   * beat). Never equal to the answer — the gap still has not been solved.
   */
  trial: number | null
  /** The missing number — null on every beat but the last. */
  answer: number | null
  result: boolean
  /** How long this beat holds on screen during a play-through, in ms. */
  hold: number
}

export interface RuleStoryboard {
  layout: LayoutKind
  rule: RuleKind
  groups: [Triple, Triple, Triple]
  blank: Slot
  answer: number
  steps: RuleStep[]
  finalIndex: number
}

// U+2212 MINUS SIGN — the same glyph the concept's solutionLine uses.
const MINUS = '−'

const RULES: RuleKind[] = ['sum', 'diff', 'sum-minus-one']

// Layout names from before the figures were simplified; instances pooled under
// the old shape still draw (and narrate) sensibly.
const LEGACY_LAYOUT: Record<string, LayoutKind> = {
  chain: 'row',
  triangle: 'pyramid',
  'quartered-circle': 'pyramid',
}

const SAMPLE: {
  layout: LayoutKind
  groups: [Triple, Triple, Triple]
  blank: Slot
} = {
  layout: 'row',
  groups: [
    { a: 3, b: 4, c: 7 },
    { a: 5, b: 2, c: 7 },
    { a: 6, b: 3, c: 9 },
  ],
  blank: 'c',
}

// ---------------------------------------------------------------------------
// Rule arithmetic (mirrors api/services/wmi/concepts/number-figure-rule)
// ---------------------------------------------------------------------------

export function applyRule(rule: RuleKind, a: number, b: number): number {
  if (rule === 'sum') return a + b
  if (rule === 'diff') return a - b
  return a + b - 1
}

function holds(rule: RuleKind, g: Triple): boolean {
  return applyRule(rule, g.a, g.b) === g.c
}

/** The value the rule forces into the blanked slot (works backwards for inputs). */
export function solveBlank(rule: RuleKind, g: Triple, blank: Slot): number {
  if (blank === 'c') return applyRule(rule, g.a, g.b)
  if (blank === 'a') {
    if (rule === 'sum') return g.c - g.b
    if (rule === 'diff') return g.c + g.b
    return g.c + 1 - g.b
  }
  if (rule === 'sum') return g.c - g.a
  if (rule === 'diff') return g.a - g.c
  return g.c + 1 - g.a
}

/** "8 + 4 = 12" / "? + 4 = 12" / "5 + 3 − 1 = 7". Operands may be "?". */
function ruleExpr(
  rule: RuleKind,
  x: number | string,
  y: number | string,
  res: number | string,
): string {
  if (rule === 'diff') return `${x} ${MINUS} ${y} = ${res}`
  if (rule === 'sum-minus-one') return `${x} + ${y} ${MINUS} 1 = ${res}`
  return `${x} + ${y} = ${res}`
}

function groupExpr(rule: RuleKind, g: Triple): string {
  return ruleExpr(rule, g.a, g.b, g.c)
}

/** The blanked group written out with the gap still open. */
function blankExpr(rule: RuleKind, g: Triple, blank: Slot): string {
  if (blank === 'a') return ruleExpr(rule, '?', g.b, g.c)
  if (blank === 'b') return ruleExpr(rule, g.a, '?', g.c)
  return ruleExpr(rule, g.a, g.b, '?')
}

/** The blanked group with the answer dropped in. */
function filledExpr(rule: RuleKind, g: Triple, blank: Slot, ans: number): string {
  const t: Triple = { ...g }
  t[blank] = ans
  return ruleExpr(rule, t.a, t.b, t.c)
}

// ---------------------------------------------------------------------------
// Params normalisation
// ---------------------------------------------------------------------------

function isTriple(value: unknown): value is Triple {
  const t = value as Triple | null
  return (
    !!t &&
    typeof t === 'object' &&
    Number.isInteger(t.a) &&
    Number.isInteger(t.b) &&
    Number.isInteger(t.c)
  )
}

/**
 * Prefer the authored rule, but only if the groups on screen actually obey it —
 * a stale instance must never make the animation narrate arithmetic that the
 * picture contradicts. Falls back to whichever rule the two finished groups fit.
 */
function resolveRule(groups: Triple[], given: unknown): RuleKind {
  const named = typeof given === 'string' && (RULES as string[]).includes(given)
  const order = named
    ? [given as RuleKind, ...RULES.filter((r) => r !== given)]
    : RULES
  for (const r of order) if (groups.every((g) => holds(r, g))) return r
  for (const r of order) if (holds(r, groups[0]) && holds(r, groups[1])) return r
  return order[0]
}

interface Normalized {
  layout: LayoutKind
  rule: RuleKind
  groups: [Triple, Triple, Triple]
  blank: Slot
}

function normalize(raw: unknown): Normalized {
  const p = (raw ?? {}) as Partial<{
    layout: string
    rule: string
    groups: unknown
    blankPosition: string
  }>

  const layout: LayoutKind =
    p.layout === 'row' || p.layout === 'pyramid' ? p.layout
    : p.layout && LEGACY_LAYOUT[p.layout] ? LEGACY_LAYOUT[p.layout]
    : SAMPLE.layout

  const groups: [Triple, Triple, Triple] =
    Array.isArray(p.groups) && p.groups.length === 3 && p.groups.every(isTriple)
      ? [p.groups[0], p.groups[1], p.groups[2]]
      : SAMPLE.groups

  const blank: Slot =
    p.blankPosition === 'a' || p.blankPosition === 'b' || p.blankPosition === 'c'
      ? p.blankPosition
      : SAMPLE.blank

  return { layout, rule: resolveRule(groups, p.rule), groups, blank }
}

// ---------------------------------------------------------------------------
// Wording
// ---------------------------------------------------------------------------

/** Long form, copied from the concept's ruleWords so the beats mirror hint_steps. */
function ruleWords(rule: RuleKind, lang: Lang): string {
  if (rule === 'sum') {
    return lang === 'id'
      ? 'angka pertama ditambah angka kedua'
      : 'add the first two numbers'
  }
  if (rule === 'diff') {
    return lang === 'id'
      ? 'angka pertama dikurangi angka kedua'
      : 'take the second number away from the first'
  }
  return lang === 'id'
    ? 'angka pertama ditambah angka kedua, lalu dikurangi 1'
    : 'add the first two numbers, then take away 1'
}

/** Short form for the work strip. */
function ruleShort(rule: RuleKind, lang: Lang): string {
  if (rule === 'sum') return lang === 'id' ? 'tambah' : 'add'
  if (rule === 'diff') return lang === 'id' ? 'kurang' : 'take away'
  return lang === 'id' ? 'tambah lalu kurang 1' : 'add then take 1'
}

function ruleSymbol(rule: RuleKind, lang: Lang): string {
  if (rule === 'sum') return '+'
  if (rule === 'diff') return MINUS
  return lang === 'id' ? `+ lalu ${MINUS} 1` : `+ then ${MINUS} 1`
}

// ---------------------------------------------------------------------------
// The trap beat
// ---------------------------------------------------------------------------

interface TrapPlan {
  wrong: number
  /** The tempting arithmetic itself, e.g. "12 + 4 = 16". */
  temptExpr: string
  /** Which lead-in names the slip. */
  lead: 'just-add' | 'sub-again' | 'forgot-one' | 'not-add'
  /**
   * The disproof: a finished check, a subtraction that cannot be done, or —
   * when finishing the check would need a number past 20 — the size argument
   * that the gap is one of the numbers being added, so it cannot beat the total.
   */
  check:
    | { ok: 'sum'; expr: string; got: number; want: number; onGroup: number }
    | { ok: 'cannot'; left: number; right: number; onGroup: number }
    | { ok: 'bigger'; wrong: number; than: number; onGroup: number }
}

/**
 * The tempting wrong number, mirroring the concept's `trapFor`, plus the
 * disproof that kills it ON SCREEN. For a blanked RESULT the slip is a wrong
 * operation, so it is disproved against a finished group. For a blanked INPUT
 * the slip is "just combine the two numbers you can see", so it is disproved by
 * dropping that number into the gap and watching the group stop working.
 *
 * Returns null when no honest trap exists, when the slip happens to be the
 * right answer, or when disproving it would need a number outside 0..20.
 */
function buildTrap(rule: RuleKind, groups: [Triple, Triple, Triple], blank: Slot, correct: number): TrapPlan | null {
  const g3 = groups[2]
  const { a, b, c } = g3

  let plan: TrapPlan | null = null

  if (blank === 'c') {
    // Blanked result: the slip is reaching for the wrong operation. Both traps
    // here are "add it", disproved on whichever finished group keeps the sum
    // inside 0..20.
    if (rule === 'sum') return null
    const on = [0, 1].find((i) => groups[i].a + groups[i].b <= 20)
    if (on === undefined) return null
    const gs = groups[on]
    const wrong = a + b
    plan = {
      wrong,
      temptExpr: `${a} + ${b} = ${wrong}`,
      lead: rule === 'diff' ? 'not-add' : 'forgot-one',
      check: {
        ok: 'sum',
        expr: `${gs.a} + ${gs.b} = ${gs.a + gs.b}`,
        got: gs.a + gs.b,
        want: gs.c,
        onGroup: on,
      },
    }
  } else if (rule === 'sum') {
    // Adds the two numbers it can see, even though the gap is an addend. The
    // forward check is best, but it doubles the seen number — when that runs
    // past 20 fall back to the size argument, which needs no big number.
    const seen = blank === 'a' ? b : a
    const wrong = c + seen
    const got = blank === 'a' ? wrong + b : a + wrong
    plan = {
      wrong,
      temptExpr: `${c} + ${seen} = ${wrong}`,
      lead: 'just-add',
      check:
        got <= 20
          ? {
              ok: 'sum',
              expr: blank === 'a' ? `${wrong} + ${b} = ${got}` : `${a} + ${wrong} = ${got}`,
              got,
              want: c,
              onGroup: 2,
            }
          : { ok: 'bigger', wrong, than: c, onGroup: 2 },
    }
  } else if (rule === 'sum-minus-one') {
    // Reads the rule as plain addition and forgets the "take away 1".
    const seen = blank === 'a' ? b : a
    const wrong = c - seen
    const got = wrong + seen - 1
    plan = {
      wrong,
      temptExpr: `${c} ${MINUS} ${seen} = ${wrong}`,
      lead: 'forgot-one',
      check: {
        ok: 'sum',
        expr:
          blank === 'a'
            ? `${wrong} + ${b} ${MINUS} 1 = ${got}`
            : `${a} + ${wrong} ${MINUS} 1 = ${got}`,
        got,
        want: c,
        onGroup: 2,
      },
    }
  } else if (blank === 'a') {
    // diff, first number missing: takes away again instead of putting back.
    const wrong = c - b
    plan = {
      wrong,
      temptExpr: `${c} ${MINUS} ${b} = ${wrong}`,
      lead: 'sub-again',
      check:
        wrong >= b
          ? { ok: 'sum', expr: `${wrong} ${MINUS} ${b} = ${wrong - b}`, got: wrong - b, want: c, onGroup: 2 }
          : { ok: 'cannot', left: wrong, right: b, onGroup: 2 },
    }
  } else {
    // diff, second number missing: adds instead of taking away — and you can
    // never take a number bigger than the first one away from it.
    const wrong = a + c
    plan = {
      wrong,
      temptExpr: `${a} + ${c} = ${wrong}`,
      lead: 'just-add',
      check:
        a >= wrong
          ? { ok: 'sum', expr: `${a} ${MINUS} ${wrong} = ${a - wrong}`, got: a - wrong, want: c, onGroup: 2 }
          : { ok: 'cannot', left: a, right: wrong, onGroup: 2 },
    }
  }

  if (plan.wrong === correct) return null

  // Everything the beat would put on screen has to be a sane grade-1 number.
  const shown = [plan.wrong]
  if (plan.check.ok === 'sum') shown.push(plan.check.got, plan.check.want)
  else if (plan.check.ok === 'cannot') shown.push(plan.check.left, plan.check.right)
  else shown.push(plan.check.wrong, plan.check.than)
  if (shown.some((n) => !Number.isInteger(n) || n < 0 || n > 20)) return null
  // A "disproof" that lands on the right value would prove nothing.
  if (plan.check.ok === 'sum' && plan.check.got === plan.check.want) return null
  if (plan.check.ok === 'bigger' && plan.check.wrong <= plan.check.than) return null

  return plan
}

// ---------------------------------------------------------------------------
// Storyboard
// ---------------------------------------------------------------------------

export function buildNumberFigureRuleSteps(params: unknown, lang: Lang): RuleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const { layout, rule, groups, blank } = normalize(params)
  const [g0, g1, g3] = groups
  const answer = solveBlank(rule, g3, blank)

  const steps: RuleStep[] = []

  // --- 1. guess: try an operation out loud on the first finished group ------
  const guessCaption =
    rule === 'sum'
      ? t(
          `${g0.a} and ${g0.b} make ${g0.c}. Try: ${g0.a} + ${g0.b} = ${g0.c}. Maybe it is add!`,
          `${g0.a} dan ${g0.b} jadi ${g0.c}. Coba: ${g0.a} + ${g0.b} = ${g0.c}. Mungkin tambah!`,
        )
      : rule === 'diff'
        ? t(
            `${g0.a} and ${g0.b} make ${g0.c}. Try: ${g0.a} ${MINUS} ${g0.b} = ${g0.c}. Maybe it is take away!`,
            `${g0.a} dan ${g0.b} jadi ${g0.c}. Coba: ${g0.a} ${MINUS} ${g0.b} = ${g0.c}. Mungkin kurang!`,
          )
        : t(
            `${g0.a} and ${g0.b} make ${g0.c}. But ${g0.a} + ${g0.b} = ${g0.a + g0.b}, one too many. Maybe add, then take 1.`,
            `${g0.a} dan ${g0.b} jadi ${g0.c}. Tapi ${g0.a} + ${g0.b} = ${g0.a + g0.b}, kelebihan 1. Mungkin tambah, lalu kurang 1.`,
          )
  steps.push({
    kind: 'guess',
    caption: guessCaption,
    work: {
      expr: groupExpr(rule, g0),
      sub: rule === 'sum-minus-one' ? t('add, then take 1', 'tambah, lalu kurang 1') : null,
      tone: 'try',
    },
    focus: 0,
    badge: 'none',
    trial: null,
    answer: null,
    result: false,
    hold: 2800,
  })

  // --- 2. test: the beat that turns a guess into a rule ---------------------
  steps.push({
    kind: 'test',
    caption: t(
      `Check figure 2: ${groupExpr(rule, g1)}. It works here too!`,
      `Cek gambar 2: ${groupExpr(rule, g1)}. Cocok juga!`,
    ),
    work: { expr: groupExpr(rule, g1), sub: t('it works', 'cocok'), tone: 'ok' },
    focus: 1,
    badge: 'check',
    trial: null,
    answer: null,
    result: false,
    hold: 2800,
  })

  // --- 3. rule: earned, so now it can be named -----------------------------
  steps.push({
    kind: 'rule',
    caption: t(
      `Two figures, same rule. The rule is: ${ruleWords(rule, lang)}.`,
      `Dua gambar cocok semua. Jadi aturannya: ${ruleWords(rule, lang)}.`,
    ),
    work: { expr: ruleSymbol(rule, lang), sub: ruleShort(rule, lang), tone: 'rule' },
    focus: null,
    badge: 'none',
    trial: null,
    answer: null,
    result: false,
    hold: 2600,
  })

  // --- 4. trap: the tempting wrong move, killed on screen -------------------
  const trap = buildTrap(rule, groups, blank, answer)
  if (trap) {
    const lead =
      trap.lead === 'just-add'
        ? t('Careful, do not just add', 'Awas, jangan langsung ditambah')
        : trap.lead === 'sub-again'
          ? t('Careful, do not take away again', 'Awas, jangan dikurangi lagi')
          : trap.lead === 'forgot-one'
            ? t(`Careful, do not drop the ${MINUS} 1`, `Awas, jangan lupa ${MINUS} 1 nya`)
            : t('Careful, this is not add', 'Awas, ini bukan tambah')
    const where =
      trap.check.onGroup === 2
        ? t('figure 3', 'gambar 3')
        : t(`figure ${trap.check.onGroup + 1}`, `gambar ${trap.check.onGroup + 1}`)
    const tail =
      trap.check.ok === 'sum'
        ? t(
            `Check ${where}: ${trap.check.expr}, not ${trap.check.want}.`,
            `Cek ${where}: ${trap.check.expr}, bukan ${trap.check.want}.`,
          )
        : trap.check.ok === 'cannot'
          ? t(
              `Check ${where}: ${trap.check.left} ${MINUS} ${trap.check.right} cannot be done.`,
              `Cek ${where}: ${trap.check.left} ${MINUS} ${trap.check.right} tidak bisa.`,
            )
          : t(
              `But ${trap.check.wrong} is bigger than ${trap.check.than}, and the gap is one of the numbers being added.`,
              `Tapi ${trap.check.wrong} lebih besar dari ${trap.check.than}, padahal yang kosong justru salah satu angka yang dijumlahkan.`,
            )
    steps.push({
      kind: 'trap',
      caption: `${lead}: ${trap.temptExpr}. ${tail}`,
      work: {
        expr:
          trap.check.ok === 'sum'
            ? trap.check.expr
            : trap.check.ok === 'cannot'
              ? `${trap.check.left} ${MINUS} ${trap.check.right}`
              : `${trap.check.wrong} > ${trap.check.than}`,
        sub:
          trap.check.ok === 'sum'
            ? t(`not ${trap.check.want}`, `bukan ${trap.check.want}`)
            : trap.check.ok === 'cannot'
              ? t('cannot be done', 'tidak bisa')
              : t('too big', 'kebesaran'),
        tone: 'trap',
      },
      focus: trap.check.onGroup,
      badge: 'cross',
      // When the disproof happens on the blanked group, drop the tempting
      // number into the gap so the child SEES it get thrown out.
      trial: trap.check.onGroup === 2 ? trap.wrong : null,
      answer: null,
      result: false,
      hold: 3200,
    })
  }

  // --- 5. setup: write the rule onto the blanked group, gap still open ------
  const setup = blankExpr(rule, g3, blank)
  const setupCaption =
    blank === 'c'
      ? // the expression already ends in "?", so no full stop after it
        t(`Now figure 3: ${setup} What do we get?`, `Sekarang gambar 3: ${setup} Berapa hasilnya?`)
      : rule === 'sum-minus-one'
        ? t(`Figure 3: ${setup}. Put the 1 back first.`, `Gambar 3: ${setup}. Kembalikan 1 dulu.`)
        : rule === 'sum'
          ? blank === 'a'
            ? t(
                `Figure 3: ${setup}. What plus ${g3.b} makes ${g3.c}?`,
                `Gambar 3: ${setup}. Berapa ditambah ${g3.b} jadi ${g3.c}?`,
              )
            : t(
                `Figure 3: ${setup}. ${g3.a} plus what makes ${g3.c}?`,
                `Gambar 3: ${setup}. ${g3.a} ditambah berapa jadi ${g3.c}?`,
              )
          : blank === 'a'
            ? t(
                `Figure 3: ${setup}. What take away ${g3.b} makes ${g3.c}?`,
                `Gambar 3: ${setup}. Berapa dikurangi ${g3.b} jadi ${g3.c}?`,
              )
            : t(
                `Figure 3: ${setup}. ${g3.a} take away what makes ${g3.c}?`,
                `Gambar 3: ${setup}. ${g3.a} dikurangi berapa jadi ${g3.c}?`,
              )
  steps.push({
    kind: 'setup',
    caption: setupCaption,
    work: { expr: setup, sub: null, tone: 'try' },
    focus: 2,
    badge: 'none',
    trial: null,
    answer: null,
    result: false,
    hold: 2800,
  })

  // --- 6. answer: finish the arithmetic and land the number ----------------
  const sum3 = g3.a + g3.b
  const back = g3.c + 1
  const seen = blank === 'a' ? g3.b : g3.a
  const finish =
    blank === 'c'
      ? rule === 'sum'
        ? `${g3.a} + ${g3.b} = ${answer}`
        : rule === 'diff'
          ? `${g3.a} ${MINUS} ${g3.b} = ${answer}`
          : t(
              `${g3.a} + ${g3.b} = ${sum3}, then ${sum3} ${MINUS} 1 = ${answer}`,
              `${g3.a} + ${g3.b} = ${sum3}, lalu ${sum3} ${MINUS} 1 = ${answer}`,
            )
      : rule === 'sum'
        ? `${g3.c} ${MINUS} ${seen} = ${answer}`
        : rule === 'diff'
          ? blank === 'a'
            ? `${g3.c} + ${g3.b} = ${answer}`
            : `${g3.a} ${MINUS} ${g3.c} = ${answer}`
          : t(
              `${g3.c} + 1 = ${back}, then ${back} ${MINUS} ${seen} = ${answer}`,
              `${g3.c} + 1 = ${back}, lalu ${back} ${MINUS} ${seen} = ${answer}`,
            )
  steps.push({
    kind: 'answer',
    caption:
      blank === 'c'
        ? t(
            `${finish}. The missing number is ${answer}.`,
            `${finish}. Angka yang hilang: ${answer}.`,
          )
        : t(`${finish}. So ? = ${answer}.`, `${finish}. Jadi ? = ${answer}.`),
    work: {
      expr: filledExpr(rule, g3, blank, answer),
      sub: `? = ${answer}`,
      tone: 'answer',
    },
    focus: 2,
    badge: 'none',
    trial: null,
    answer,
    result: true,
    hold: 0,
  })

  return { layout, rule, groups, blank, answer, steps, finalIndex: steps.length - 1 }
}
