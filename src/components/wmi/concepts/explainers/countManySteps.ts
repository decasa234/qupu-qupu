import {
  countManyFigure,
  normalizeCountManyFigureParams,
  scatterCols,
  type Dot as FigureDot,
  type Figure as FigureGeometry,
  type IconKind,
  type Layout,
} from '../count-many-objects/index'

export type Lang = 'en' | 'id'
export type CountManyLayout = Layout
export type CountManyIcon = IconKind

export interface CountManyParams {
  icon: CountManyIcon
  layout: CountManyLayout
  total: number
  perRow: number
  distractorDeltas?: number[]
}

export type Dot = FigureDot
export type CountManyFigure = FigureGeometry

// The figure module owns the geometry; re-exported here so callers that already
// speak to the storyboard keep one import.
export { countManyFigure, scatterCols }

/** A ring is either an axis-aligned rounded box or a rounded "rope" lasso. */
export type CountManyRing =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx: number }
  | { kind: 'rope'; d: string; points: Dot[]; width: number }

export interface CountManyGroup {
  /** 0-based position in the skip-count; the leftover group has index = chunks. */
  index: number
  /** Indices into `dots` — every icon belongs to exactly one group. */
  members: number[]
  size: number
  /** Running total once this group has been counted (leftover group: the total). */
  running: number
  ring: CountManyRing
  isLeftover: boolean
}

export type CountManyBeatId = 'intro' | 'slip' | 'plan' | 'count' | 'rest' | 'total'

export interface CountManyBeat {
  id: CountManyBeatId
  caption: string
  /** Secondary line — the near-miss note, only on the landing beat. */
  note: string | null
  /** How many full-group rings are drawn (faint until counted). */
  ringsDrawn: number
  /** How many full groups have been counted (drawn in the "done" colour). */
  counted: number
  /** The group(s) being counted this beat — one, or a pair/triple once the
   * pile is long enough that counting them one at a time would drag. Empty
   * when no group is in the spotlight. */
  activeGroups: number[]
  /** Running total on screen, null before the skip-count starts. */
  running: number | null
  /** Draw the leftover lasso. */
  showLeftover: boolean
  /** Light the leftover lasso up (it is being named / added). */
  leftoverLit: boolean
  /** "55 + 3 = 58", only on the landing beat. */
  equation: string | null
  /** Show the one-by-one slip overlay. */
  slip: boolean
  result: boolean
  /** The choice label — populated on the landing beat and nowhere else. */
  answerLabel: string | null
  hold: number
}

export interface CountManyStoryboard {
  icon: CountManyIcon
  layout: CountManyLayout
  total: number
  perRow: number
  /** Icons per group, from the same rule the hint steps use. */
  step: number
  /** Number of full groups. */
  chunks: number
  /** Icons outside the full groups. */
  leftover: number
  /** step * chunks — what the skip-count lands on before the leftover. */
  fromChunks: number
  /** How many groups one skip-count beat covers (1, 2 or 3). */
  groupsPerBeat: number
  /** The running total after each skip-count beat, in beat order. */
  stops: number[]
  dots: Dot[]
  r: number
  width: number
  height: number
  /** The full groups, in counting order. */
  groups: CountManyGroup[]
  /** The odd ones out, or null when the groups use every icon. */
  leftoverGroup: CountManyGroup | null
  /** The four option values, ascending. */
  options: number[]
  /** The label of the correct option. */
  answerLabel: string | null
  /** The near-miss a one-by-one count lands on. */
  trap: number | null
  /** Icons the wandering one-by-one pointer visits (one index appears twice). */
  slipPath: number[]
  /** The icon the pointer never reaches. */
  slipMissed: number | null
  /** The icon the pointer visits twice. */
  slipDoubled: number | null
  steps: CountManyBeat[]
  finalIndex: number
}

/**
 * The figure's own clamps plus the option deltas the storyboard needs. The
 * clamping itself comes from the figure module, so the animation can never
 * normalize params differently from the picture it is annotating.
 */
export function normalizeCountManyParams(raw: unknown): CountManyParams & { distractorDeltas: number[] } {
  const p = (raw ?? {}) as Partial<CountManyParams>
  const deltas = Array.isArray(p.distractorDeltas)
    ? p.distractorDeltas.filter((d) => typeof d === 'number' && Number.isFinite(d) && d !== 0).map((d) => Math.round(d))
    : []
  return { ...normalizeCountManyFigureParams(raw), distractorDeltas: deltas }
}

// ---------------------------------------------------------------------------
// Grouping — the same {step, chunks, leftover} the concept's hint_steps use
// (api/services/wmi/concepts/count-many-objects/index.ts `grouping`).
// ---------------------------------------------------------------------------

export function countManyGrouping(
  layout: CountManyLayout,
  total: number,
  perRow: number,
): { step: number; chunks: number; leftover: number } {
  if (layout === 'rows') {
    return { step: perRow, chunks: Math.floor(total / perRow), leftover: total % perRow }
  }
  if (layout === 'grouped-tens') {
    return { step: 10, chunks: Math.floor(total / 10), leftover: total % 10 }
  }
  return { step: 5, chunks: Math.floor(total / 5), leftover: total % 5 }
}

/**
 * Scanning order for the scatter lattice. Icons are laid out row-major, but a
 * child rings off five NEIGHBOURS, so we walk the lattice boustrophedon-style:
 * a tiny two-state DP picks the direction of each row so the column distance
 * paid at every row turn is minimal. That keeps each run of five geometrically
 * contiguous (measured worst-case hop: 42px, i.e. one lattice step) — which is
 * what lets the lasso hug exactly its own five icons and nothing else.
 */
export function scatterScanOrder(total: number, cols: number): number[] {
  const rows = Math.ceil(total / cols)
  if (rows <= 0) return []
  const len: number[] = []
  for (let r = 0; r < rows; r++) len.push(Math.min(cols, total - r * cols))
  const startCol = (r: number, d: number) => (d === 0 ? 0 : len[r] - 1)
  const endCol = (r: number, d: number) => (d === 0 ? len[r] - 1 : 0)

  const cost: number[][] = Array.from({ length: rows }, () => [0, 0])
  const next: number[][] = Array.from({ length: rows }, () => [0, 0])
  for (let r = rows - 2; r >= 0; r--) {
    for (let d = 0; d < 2; d++) {
      let best = Infinity
      let bd = 0
      for (let d2 = 0; d2 < 2; d2++) {
        const c = Math.abs(endCol(r, d) - startCol(r + 1, d2)) + cost[r + 1][d2]
        if (c < best) {
          best = c
          bd = d2
        }
      }
      cost[r][d] = best
      next[r][d] = bd
    }
  }

  let d = cost[0][0] <= cost[0][1] ? 0 : 1
  const order: number[] = []
  for (let r = 0; r < rows; r++) {
    for (let j = 0; j < len[r]; j++) order.push(r * cols + (d === 0 ? j : len[r] - 1 - j))
    if (r < rows - 1) d = next[r][d]
  }
  return order
}

/** Rounded box hugging exactly the given icons. */
function rectRing(dots: Dot[], members: number[], pad: number): CountManyRing {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const i of members) {
    const d = dots[i]
    if (!d) continue
    if (d.x < minX) minX = d.x
    if (d.x > maxX) maxX = d.x
    if (d.y < minY) minY = d.y
    if (d.y > maxY) maxY = d.y
  }
  if (!Number.isFinite(minX)) return { kind: 'rect', x: 0, y: 0, w: 0, h: 0, rx: 0 }
  const w = maxX - minX + pad * 2
  const h = maxY - minY + pad * 2
  return { kind: 'rect', x: minX - pad, y: minY - pad, w, h, rx: Math.min(pad, w / 2, h / 2) }
}

/** Rounded rope threading exactly the given icons, in scanning order. */
function ropeRing(dots: Dot[], members: number[], width: number): CountManyRing {
  const points = members.map((i) => dots[i]).filter(Boolean)
  if (points.length === 0) return { kind: 'rope', d: '', points: [], width }
  const head = points[0]
  let d = `M ${head.x.toFixed(2)} ${head.y.toFixed(2)}`
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`
  if (points.length === 1) d += ` L ${head.x.toFixed(2)} ${head.y.toFixed(2)}`
  return { kind: 'rope', d, points, width }
}

/**
 * Split every icon into the groups the strategy rings off, plus the leftovers.
 * Layout decides both the partition and the ring shape:
 *  - rows          → one whole row per group, boxed
 *  - grouped-tens  → the piles the figure already drew, boxed
 *  - scatter       → five neighbours along the scan order, lassoed
 */
export function buildCountManyGroups(
  layout: CountManyLayout,
  total: number,
  perRow: number,
  fig: CountManyFigure,
): { groups: CountManyGroup[]; leftoverGroup: CountManyGroup | null } {
  const { step, chunks, leftover } = countManyGrouping(layout, total, perRow)

  let order: number[]
  if (layout === 'scatter') {
    order = scatterScanOrder(total, scatterCols(total, perRow))
  } else {
    order = Array.from({ length: total }, (_, i) => i)
  }

  const ringFor = (members: number[]): CountManyRing => {
    if (layout === 'scatter') return ropeRing(fig.dots, members, 2 * (fig.r + 1.5))
    // Boxed layouts: rows sit 30 apart and piles at least 68 apart, so a box
    // padded past the glyph radius still clears its neighbours.
    return rectRing(fig.dots, members, fig.r + (layout === 'rows' ? 4 : 5))
  }

  const groups: CountManyGroup[] = []
  for (let g = 0; g < chunks; g++) {
    const members = order.slice(g * step, g * step + step)
    groups.push({
      index: g,
      members,
      size: members.length,
      running: step * (g + 1),
      ring: ringFor(members),
      isLeftover: false,
    })
  }

  let leftoverGroup: CountManyGroup | null = null
  if (leftover > 0) {
    const members = order.slice(chunks * step)
    leftoverGroup = {
      index: chunks,
      members,
      size: members.length,
      running: total,
      ring: ringFor(members),
      isLeftover: true,
    }
  }

  return { groups, leftoverGroup }
}

// ---------------------------------------------------------------------------
// Options / near-miss — mirrors the concept's optionValues + trapValue.
// ---------------------------------------------------------------------------

const LABELS = ['A', 'B', 'C', 'D'] as const

function optionValues(total: number, deltas: number[]): number[] {
  if (deltas.length === 0) return []
  return [total, ...deltas.map((d) => total + d)].sort((a, b) => a - b)
}

function trapValue(total: number, deltas: number[]): number | null {
  if (deltas.length === 0) return null
  if (deltas.includes(-2)) return total - 2
  if (deltas.includes(2)) return total + 2
  const nearest = [...deltas].sort((a, b) => Math.abs(a) - Math.abs(b))[0]
  return total + nearest
}

function labelFor(total: number, deltas: number[]): string | null {
  const values = optionValues(total, deltas)
  const at = values.indexOf(total)
  if (at < 0 || at >= LABELS.length) return null
  return LABELS[at]
}

// ---------------------------------------------------------------------------
// Words
// ---------------------------------------------------------------------------

const ICON_WORDS: Record<CountManyIcon, { id: string; en_p: string }> = {
  star: { id: 'bintang', en_p: 'stars' },
  apple: { id: 'apel', en_p: 'apples' },
  ball: { id: 'bola', en_p: 'balls' },
  leaf: { id: 'daun', en_p: 'leaves' },
  fish: { id: 'ikan', en_p: 'fish' },
}

const GROUP_NOUN: Record<CountManyLayout, { id: string; en: string; en_p: string }> = {
  rows: { id: 'Baris', en: 'Row', en_p: 'Rows' },
  'grouped-tens': { id: 'Kelompok', en: 'Group', en_p: 'Groups' },
  scatter: { id: 'Lingkaran', en: 'Ring', en_p: 'Rings' },
}

// ---------------------------------------------------------------------------
// Beat budget — a six-year-old's post-answer moment has to stay short.
//
// A play-through is 3 fixed beats (intro, slip, plan) + the skip-count + the
// leftover beat + the landing, i.e. at most 5 beats that are not counting. So
// capping the skip-count at MAX_COUNT_BEATS = 5 caps the whole storyboard at
// 10 beats. Past that the groups are counted several rings per beat — the
// running total still moves, and it still skip-counts (by 10s instead of 5s,
// by 20s instead of 10s), it just takes fewer stops to get there.
// ---------------------------------------------------------------------------

const MAX_COUNT_BEATS = 5

/** How many groups one skip-count beat should swallow. */
export function countManyGroupsPerBeat(chunks: number): number {
  return chunks > MAX_COUNT_BEATS ? Math.ceil(chunks / MAX_COUNT_BEATS) : 1
}

// ---------------------------------------------------------------------------
// The wandering one-by-one pointer (beat 2) — deterministic, no Math.random.
// ---------------------------------------------------------------------------

function buildSlip(total: number): {
  path: number[]
  missed: number | null
  doubled: number | null
} {
  if (total < 6) return { path: Array.from({ length: total }, (_, i) => i), missed: null, doubled: null }
  // A believable pointing finger: it travels in reading order across the whole
  // board (a stride, so the trail spans the pile instead of tangling in one
  // corner), walks straight past one icon, then loops back to an earlier one.
  const want = Math.min(10, total)
  const stride = Math.max(1, Math.floor(total / want))
  const picks: number[] = []
  for (let k = 0; k < want && k * stride < total; k++) picks.push(k * stride)
  const visited = new Set(picks)
  const mid = picks[Math.floor(picks.length / 2)]
  const missed = mid + 1 < total && !visited.has(mid + 1) ? mid + 1 : null
  const doubled = picks.length >= 5 ? picks[2] : null
  const path = [...picks]
  if (doubled !== null) path.splice(path.length - 1, 0, doubled)
  return { path, missed, doubled }
}

// ---------------------------------------------------------------------------
// Storyboard
// ---------------------------------------------------------------------------

/**
 * count-many-objects — the post-answer explainer storyboard.
 *
 * The lesson is COUNT IN GROUPS, not one by one: the four options are all
 * within a couple of the truth precisely to catch a pointing finger that slips.
 * So the beats go: see the pile → watch one-by-one fail → organise the board
 * into the groups the layout affords → skip-count them with a running total →
 * add the leftovers → only then land the total and the option letter.
 *
 * Nothing is asserted: every number on screen is either counted or added, and
 * the answer appears on the last beat alone.
 *
 * The skip-count is capped at MAX_COUNT_BEATS stops (see countManyGroupsPerBeat)
 * so no pile can drag the play-through past 10 beats: a long pile counts two or
 * three rings per stop instead of one.
 */
export function buildCountManySteps(
  rawParams: unknown,
  lang: Lang = 'id',
  correctAnswer?: string,
): CountManyStoryboard {
  const p = normalizeCountManyParams(rawParams)
  const { icon, layout, total, perRow, distractorDeltas } = p
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const fig = countManyFigure(layout, total, perRow)
  const { step, chunks, leftover } = countManyGrouping(layout, total, perRow)
  const fromChunks = step * chunks
  const { groups, leftoverGroup } = buildCountManyGroups(layout, total, perRow, fig)

  const noun = ICON_WORDS[icon]
  const gn = GROUP_NOUN[layout]

  // How the skip-count is chopped into beats: one group per beat while the pile
  // is short, two or three per beat once counting them singly would run long.
  const groupsPerBeat = countManyGroupsPerBeat(chunks)
  const spans: { from: number; to: number }[] = []
  for (let start = 1; start <= chunks; start += groupsPerBeat) {
    spans.push({ from: start, to: Math.min(chunks, start + groupsPerBeat - 1) })
  }
  const stops = spans.map((s) => step * s.to)
  const membersOf = (span: { from: number; to: number }): number[] => {
    const out: number[] = []
    for (let g = span.from; g <= span.to; g++) out.push(g - 1)
    return out
  }
  /** "Ring 3" / "Rings 3 and 4" / "Rings 3 to 5" — never a bare list of numbers. */
  const spanWord = (span: { from: number; to: number }): string => {
    if (span.from === span.to) return t(`${gn.en} ${span.from}`, `${gn.id} ke-${span.from}`)
    if (span.to === span.from + 1) {
      return t(`${gn.en_p} ${span.from} and ${span.to}`, `${gn.id} ke-${span.from} dan ke-${span.to}`)
    }
    return t(`${gn.en_p} ${span.from} to ${span.to}`, `${gn.id} ke-${span.from} sampai ke-${span.to}`)
  }

  const options = optionValues(total, distractorDeltas)
  const trap = trapValue(total, distractorDeltas)
  const answered = typeof correctAnswer === 'string' ? correctAnswer.trim().toUpperCase() : ''
  const answerLabel =
    (LABELS as readonly string[]).includes(answered) ? answered : labelFor(total, distractorDeltas)

  const slip = buildSlip(total)

  // A beat that lights two or three rings at once carries more to read.
  const countHold = groupsPerBeat > 1 ? 1050 : 950

  const steps: CountManyBeat[] = []
  const push = (beat: Partial<CountManyBeat> & { id: CountManyBeatId; caption: string; hold: number }) => {
    steps.push({
      note: null,
      ringsDrawn: 0,
      counted: 0,
      activeGroups: [],
      running: null,
      showLeftover: false,
      leftoverLit: false,
      equation: null,
      slip: false,
      result: false,
      answerLabel: null,
      ...beat,
    })
  }

  // 1 — name what we are looking at.
  push({
    id: 'intro',
    caption: t(`Wow, that is a lot of ${noun.en_p}!`, `Wah, ${noun.id}nya banyak!`),
    hold: 1700,
  })

  // 2 — name the problem: one by one is where you slip.
  push({
    id: 'slip',
    caption: t(
      'Count one by one? Some get skipped, some get counted twice.',
      'Hitung satu-satu? Ada yang terlewat, ada yang dobel.',
    ),
    slip: true,
    hold: 2400,
  })

  // 3 — organise the board: draw the grouping the layout affords.
  const planCaption = {
    rows: t(`Group them: one row holds ${step}.`, `Kelompokkan: satu baris isinya ${step}.`),
    'grouped-tens': t(
      'Group them: one full pile holds 10.',
      'Kelompokkan: satu tumpukan penuh isinya 10.',
    ),
    scatter: t('Ring off 5 at a time.', 'Lingkari 5-5 dulu.'),
  }[layout]
  push({ id: 'plan', caption: planCaption, ringsDrawn: groups.length, hold: 2200 })

  // 4 — skip-count the groups. With no leftover the last jump IS the landing
  // beat, so the total never shows up before the answer does.
  const countSpans = leftover > 0 ? spans : spans.slice(0, Math.max(0, spans.length - 1))
  for (const span of countSpans) {
    const running = step * span.to
    push({
      id: 'count',
      caption: `${spanWord(span)}: ${running}.`,
      ringsDrawn: groups.length,
      counted: span.to,
      activeGroups: membersOf(span),
      running,
      hold: countHold,
    })
  }

  // 5 — the odd ones out.
  if (leftover > 0 && chunks > 0) {
    const restCaption = {
      rows: t(`The last row is short: ${leftover} left.`, `Baris terakhir belum penuh: sisa ${leftover}.`),
      'grouped-tens': t(
        `${leftover} sit outside the piles.`,
        `Di luar tumpukan masih ada ${leftover}.`,
      ),
      scatter: t(`${leftover} are not ringed yet.`, `Sisa ${leftover} belum dilingkari.`),
    }[layout]
    push({
      id: 'rest',
      caption: restCaption,
      ringsDrawn: groups.length,
      counted: chunks,
      running: fromChunks,
      showLeftover: true,
      leftoverLit: true,
      hold: 2200,
    })
  }

  // 6 — land the total, and only now the option letter.
  const answerTail = answerLabel ? t(` The answer is ${answerLabel}.`, ` Jawabannya ${answerLabel}.`) : ''
  let landing: string
  let equation: string | null = null
  if (chunks === 0) {
    landing = t(`Just count these ${total}.`, `Tinggal hitung yang ${total} ini.`) + answerTail
  } else if (leftover > 0) {
    equation = `${fromChunks} + ${leftover} = ${total}`
    landing = `${equation}.` + answerTail
  } else {
    const lastSpan = spans[spans.length - 1]
    landing =
      `${spanWord(lastSpan)}: ${total}. ` + t('Nothing left over.', 'Tidak ada sisa.') + answerTail
  }

  let note: string | null = null
  if (trap !== null && trap !== total) {
    const missedBy = Math.abs(trap - total)
    note =
      trap < total
        ? t(
            `One by one it is easy to skip ${missedBy} — that gives ${trap}.`,
            `Kalau satu-satu, ${missedBy} gampang terlewat — jadinya ${trap}.`,
          )
        : t(
            `One by one, ${missedBy} can be counted twice — that gives ${trap}.`,
            `Kalau satu-satu, ${missedBy} bisa dobel — jadinya ${trap}.`,
          )
  }

  push({
    id: 'total',
    caption: landing,
    note,
    ringsDrawn: groups.length,
    counted: chunks,
    activeGroups: leftover > 0 || spans.length === 0 ? [] : membersOf(spans[spans.length - 1]),
    running: total,
    showLeftover: leftover > 0,
    leftoverLit: leftover > 0,
    equation,
    result: true,
    answerLabel,
    hold: 0,
  })

  return {
    icon,
    layout,
    total,
    perRow,
    step,
    chunks,
    leftover,
    fromChunks,
    groupsPerBeat,
    stops,
    dots: fig.dots,
    r: fig.r,
    width: fig.width,
    height: fig.height,
    groups,
    leftoverGroup,
    options,
    answerLabel,
    trap,
    slipPath: slip.path,
    slipMissed: slip.missed,
    slipDoubled: slip.doubled,
    steps,
    finalIndex: steps.length - 1,
  }
}
