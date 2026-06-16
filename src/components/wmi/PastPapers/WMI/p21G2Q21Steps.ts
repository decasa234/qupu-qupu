import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  ACHIEVABLE_TOTALS,
  ANSWER_LABEL,
  IMPOSSIBLE_TOTAL,
  LEFT_BOTTOM_TREES,
  LEFT_TOP_TREES,
  MIDDLE_TREES,
  RIGHT_BOTTOM_TREES,
  RIGHT_TOP_TREES,
  ROUTES_Q21,
  type RouteQ21,
} from './P21G2Q21Illustration'

export type Q21Phase = 'show' | 'route' | 'collect' | 'result'

export interface Q21Step {
  phase: Q21Phase
  /** Route to highlight on the map (null = show the whole map). */
  highlight: RouteQ21 | null
  /** Running total to show in the badge, or null. */
  runningTotal: number | null
  /** Custom badge label (overrides the "= N" default), or null. */
  totalLabel: string | null
  caption: string
  hold: number
  result: boolean
}

export interface Q21Storyboard {
  answerLabel: string
  impossible: number
  achievable: number[]
  steps: Q21Step[]
  finalIndex: number
}

export function buildP21G2Q21Steps(lang: Lang): Q21Storyboard {
  const tr = (en: string, id: string) => (lang === 'id' ? id : en)

  // tree counts per arc, for the route captions
  const leftCount = (r: RouteQ21) => (r.left === 'top' ? LEFT_TOP_TREES : LEFT_BOTTOM_TREES)
  const rightCount = (r: RouteQ21) => (r.right === 'top' ? RIGHT_TOP_TREES : RIGHT_BOTTOM_TREES)
  const leftName = (r: RouteQ21, l: Lang) =>
    r.left === 'top' ? (l === 'id' ? 'lengkung kiri-atas' : 'top-left arc') : l === 'id' ? 'lengkung kiri-bawah' : 'bottom-left arc'
  const rightName = (r: RouteQ21, l: Lang) =>
    r.right === 'top' ? (l === 'id' ? 'lengkung kanan-atas' : 'top-right arc') : l === 'id' ? 'lengkung kanan-bawah' : 'bottom-right arc'

  const steps: Q21Step[] = []

  // intro
  steps.push({
    phase: 'show',
    highlight: null,
    runningTotal: null,
    totalLabel: null,
    hold: 2000,
    result: false,
    caption: tr(
      'Every route is: one LEFT arc + the middle (3 trees) + one RIGHT arc.',
      'Setiap rute: satu lengkung KIRI + bagian tengah (3 pohon) + satu lengkung KANAN.',
    ),
  })

  // one beat per route, in descending-total order (15, 13, 10, 8)
  const ordered = [...ROUTES_Q21].sort((a, b) => b.total - a.total)
  for (const { route, total } of ordered) {
    const lc = leftCount(route)
    const rc = rightCount(route)
    steps.push({
      phase: 'route',
      highlight: route,
      runningTotal: total,
      totalLabel: null,
      hold: 2100,
      result: false,
      caption: tr(
        `${leftName(route, 'en')} (${lc}) + middle (${MIDDLE_TREES}) + ${rightName(route, 'en')} (${rc}) = ${total}.`,
        `${leftName(route, 'id')} (${lc}) + tengah (${MIDDLE_TREES}) + ${rightName(route, 'id')} (${rc}) = ${total}.`,
      ),
    })
  }

  // collect achievable set
  const setText = ACHIEVABLE_TOTALS.join(', ')
  steps.push({
    phase: 'collect',
    highlight: null,
    runningTotal: null,
    totalLabel: null,
    hold: 2200,
    result: false,
    caption: tr(
      `So the only possible tree counts are {${setText}}.`,
      `Jadi jumlah pohon yang mungkin hanya {${setText}}.`,
    ),
  })

  // result: 11 is missing -> answer C
  steps.push({
    phase: 'result',
    highlight: null,
    runningTotal: null,
    totalLabel: null,
    hold: 0,
    result: true,
    caption: tr(
      `15, 13 and 10 are all possible, but ${IMPOSSIBLE_TOTAL} never appears — so "${IMPOSSIBLE_TOTAL}" is wrong. Answer ${ANSWER_LABEL}.`,
      `15, 13, dan 10 semuanya mungkin, tetapi ${IMPOSSIBLE_TOTAL} tidak pernah muncul — jadi "${IMPOSSIBLE_TOTAL}" salah. Jawaban ${ANSWER_LABEL}.`,
    ),
  })

  return {
    answerLabel: ANSWER_LABEL,
    impossible: IMPOSSIBLE_TOTAL,
    achievable: ACHIEVABLE_TOTALS,
    steps,
    finalIndex: steps.length - 1,
  }
}
