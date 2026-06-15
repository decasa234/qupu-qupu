/**
 * WMI-24F3A-Q12 — storyboard for the "paint 2 more triangles, keep line
 * symmetry" explainer (Grade 3, 2024 final, answer C = 9 ways).
 *
 * The big equilateral triangle is split into 9 small triangles A–I; B and D
 * are already painted (symmetric across the vertical axis). The learner must
 * paint 2 MORE of the same colour so the 4-triangle picture is still a
 * line-symmetry figure across one of the equilateral triangle's 3 axes.
 *
 * Method shown beat-by-beat:
 *   1. State the goal + recall the 3 axes.
 *   2. Build the mirror map for each axis (which small triangle reflects to
 *      which) — purely from the equilateral geometry, NOT hardcoded.
 *   3. For each axis, walk every valid extra pair, shading it with `extraShaded`
 *      and bumping a running counter.
 *   4. Land on 9 → C.
 *
 * Deterministic & SSR-safe: a pure function of `lang` only. No random, no Date.
 */

export type Axis = 'V' | 'L' | 'R'

export interface SubTriStep {
  /** Extra triangle labels to shade beyond the given B and D. */
  extra: string[]
  /** Axis being demonstrated on this beat (null on intro/summary beats). */
  axis: Axis | null
  /** Running count of valid pairs found so far (shown in the tally). */
  count: number
  /** Pair label like "AC" when this beat reveals a winning pair. */
  pair: string | null
  hold: number
  result: boolean
  caption: string
}

export interface SubTriStoryboard {
  steps: SubTriStep[]
  finalIndex: number
  /** The 9 derived winning pairs, grouped per axis (for the aria-label / tests). */
  pairsByAxis: Record<Axis, string[]>
  total: number
}

const AXIS_NAME: Record<Axis, [string, string]> = {
  V: ['the up–down axis', 'sumbu tegak'],
  L: ['the bottom-left axis', 'sumbu kiri-bawah'],
  R: ['the bottom-right axis', 'sumbu kanan-bawah'],
}

/**
 * Mirror maps derived once from a TRUE equilateral subdivision (same A–I
 * labelling as the figure). Each map sends a small triangle to the triangle it
 * lands on when the whole picture is folded across that axis. Computed offline
 * with the centroid/vertex reflection of the equilateral grid and frozen here
 * so the builder stays a cheap pure function — the values are a property of the
 * geometry, not of the answer key.
 *
 *   V: A↔A B↔D C↔C E↔I F↔H G↔G   (vertical fold through the top vertex)
 *   L: A↔I B↔G C↔H D↔D E↔E F↔F   (fold through the bottom-left vertex)
 *   R: A↔E B↔B C↔F D↔G H↔H I↔I   (fold through the bottom-right vertex)
 */
export const MIRROR: Record<Axis, Record<string, string>> = {
  V: { A: 'A', B: 'D', C: 'C', D: 'B', E: 'I', F: 'H', G: 'G', H: 'F', I: 'E' },
  L: { A: 'I', B: 'G', C: 'H', D: 'D', E: 'E', F: 'F', G: 'B', H: 'C', I: 'A' },
  R: { A: 'E', B: 'B', C: 'F', D: 'G', E: 'A', F: 'C', G: 'D', H: 'H', I: 'I' },
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const GIVEN = ['B', 'D']

/** True when shading set `s` folds onto itself across `axis`. */
function isSymmetric(s: Set<string>, axis: Axis): boolean {
  for (const k of s) if (!s.has(MIRROR[axis][k])) return false
  return true
}

/**
 * Derive every valid {extra-pair → axis}. An extra pair {x,y} works on `axis`
 * when {B,D,x,y} folds onto itself across that axis. To avoid double counting,
 * a pair is credited to the FIRST axis (V → L → R) that validates it — this is
 * exactly the count a careful checker reaches and yields the 9 winners
 * AC AG CG EI FH (V), EG FG (L), GH GI (R).
 */
function derivePairs(): { pair: string; axis: Axis }[] {
  const extras = LABELS.filter((l) => !GIVEN.includes(l))
  const order: Axis[] = ['V', 'L', 'R']
  const seen = new Set<string>()
  const out: { pair: string; axis: Axis }[] = []
  for (let i = 0; i < extras.length; i++) {
    for (let j = i + 1; j < extras.length; j++) {
      const pair = extras[i] + extras[j]
      const full = new Set([...GIVEN, extras[i], extras[j]])
      for (const axis of order) {
        if (isSymmetric(full, axis)) {
          if (!seen.has(pair)) {
            seen.add(pair)
            out.push({ pair, axis })
          }
          break
        }
      }
    }
  }
  return out
}

export function buildSubTriStoryboard(lang: 'en' | 'id'): SubTriStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const derived = derivePairs()
  const pairsByAxis: Record<Axis, string[]> = { V: [], L: [], R: [] }
  for (const { pair, axis } of derived) pairsByAxis[axis].push(pair)
  const total = derived.length

  const steps: SubTriStep[] = []

  // Beat 0 — the goal.
  steps.push({
    extra: [],
    axis: null,
    count: 0,
    pair: null,
    hold: 2600,
    result: false,
    caption: t(
      'B and D are already painted — a mirror pair. Paint 2 MORE so the picture still has a fold line.',
      'B dan D sudah dicat — pasangan cermin. Cat 2 LAGI agar gambar tetap punya garis lipat.',
    ),
  })

  // Beat 1 — recall the 3 axes.
  steps.push({
    extra: [],
    axis: null,
    count: 0,
    pair: null,
    hold: 2600,
    result: false,
    caption: t(
      'A triangle has 3 fold lines, one through each corner. We test all 3, not just the up–down one.',
      'Segitiga punya 3 garis lipat, satu lewat tiap sudut. Uji ketiganya, bukan hanya yang tegak.',
    ),
  })

  // Walk each axis; reveal its winning pairs with a running counter.
  let count = 0
  const order: Axis[] = ['V', 'L', 'R']
  for (const axis of order) {
    const [axEn, axId] = AXIS_NAME[axis]
    // Axis header beat.
    steps.push({
      extra: [],
      axis,
      count,
      pair: null,
      hold: 2200,
      result: false,
      caption: t(
        `Fold across ${axEn}. Which extra pair lands B and D back on a painted triangle?`,
        `Lipat di ${axId}. Pasangan tambahan mana yang membuat B dan D jatuh pada segitiga tercat?`,
      ),
    })
    for (const pair of pairsByAxis[axis]) {
      count += 1
      const [x, y] = pair.split('')
      steps.push({
        extra: [x, y],
        axis,
        count,
        pair,
        hold: 1900,
        result: false,
        caption: t(
          `Paint ${x} and ${y}: it folds onto itself across ${axEn}. ✓ — that makes ${count}.`,
          `Cat ${x} dan ${y}: melipat pas di ${axId}. ✓ — jadi ${count}.`,
        ),
      })
    }
  }

  // Trap beat — the 5-only mistake.
  steps.push({
    extra: [],
    axis: null,
    count,
    pair: null,
    hold: 2400,
    result: false,
    caption: t(
      `Only the up–down axis gives ${pairsByAxis.V.length}. Stopping there is the trap that says 5.`,
      `Hanya sumbu tegak memberi ${pairsByAxis.V.length}. Berhenti di situ adalah jebakan yang menjawab 5.`,
    ),
  })

  // Winning beat — the last beat, hold 0.
  steps.push({
    extra: [],
    axis: null,
    count: total,
    pair: null,
    hold: 0,
    result: true,
    caption: t(
      `${pairsByAxis.V.length} + ${pairsByAxis.L.length} + ${pairsByAxis.R.length} = ${total} ways → C.`,
      `${pairsByAxis.V.length} + ${pairsByAxis.L.length} + ${pairsByAxis.R.length} = ${total} cara → C.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1, pairsByAxis, total }
}
