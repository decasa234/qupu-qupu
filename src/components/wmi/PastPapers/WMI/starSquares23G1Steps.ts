// WMI-23F1A-Q19 (2023 Grade 1 Final) — "How many squares contain exactly one ★?"
//
// Storyboard for the post-answer animation. ONE qualifying square per beat with
// a running counter: walk every size-1 square (6 of them, 1→6), then every
// size-2 square (8 of them, 7→14), then every size-3 square (4 of them, 15→18).
// Each beat highlights the current square and washes the already-counted ones;
// the caption carries the running total. The final beat states 6 + 8 + 4 = 18.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. Counts come from the enumeration co-exported by the
// illustration (QUALIFYING_SQUARES), never asserted here.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { QUALIFYING_SQUARES, ANSWER, type SquareRef } from './StarSquares23G1Illustration'

export interface StarSquaresStep {
  /** The square outlined on this beat (orange), or null on intro/result. */
  highlight: SquareRef | null
  /** Every square counted before this beat (faint wash behind the current one). */
  counted: SquareRef[]
  /** Side length being tallied on this beat (drives the accent colour), or null. */
  size: number | null
  /** Running total of qualifying squares found so far. */
  running: number
  caption: string
  hold: number
  /** True only on the final summary beat. */
  result: boolean
}

export interface StarSquaresStoryboard {
  total: number
  /** [size-1 count, size-2 count, size-3 count] for the summary line. */
  parts: number[]
  steps: StarSquaresStep[]
  finalIndex: number
}

// Group the enumerated qualifying squares by size, preserving enumeration order.
function groupBySize(): { size: number; items: SquareRef[] }[] {
  const groups: { size: number; items: SquareRef[] }[] = []
  for (const sq of QUALIFYING_SQUARES) {
    let g = groups.find((x) => x.size === sq.size)
    if (!g) {
      g = { size: sq.size, items: [] }
      groups.push(g)
    }
    g.items.push(sq)
  }
  groups.sort((a, b) => a.size - b.size)
  return groups
}

export function buildStarSquaresSteps(lang: Lang): StarSquaresStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const groups = groupBySize()
  const parts = groups.map((g) => g.items.length)

  const steps: StarSquaresStep[] = [
    {
      highlight: null,
      counted: [],
      size: null,
      running: 0,
      hold: 2600,
      result: false,
      caption: t(
        'A square counts only if it holds EXACTLY one ★. Let us hunt them by size, one at a time.',
        'Sebuah persegi dihitung hanya jika memuat TEPAT satu ★. Mari kita cari per ukuran, satu per satu.',
      ),
    },
  ]

  const counted: SquareRef[] = []
  let running = 0

  groups.forEach((g) => {
    g.items.forEach((sq, i) => {
      running += 1
      const sizeName = `${g.size}×${g.size}`
      steps.push({
        highlight: sq,
        counted: counted.slice(),
        size: g.size,
        running,
        hold: i === 0 ? 1800 : 1100,
        result: false,
        caption: t(
          `${sizeName} square — exactly one ★. That makes ${running}.`,
          `Persegi ${sizeName} — tepat satu ★. Jadi ${running}.`,
        ),
      })
      counted.push(sq)
    })
  })

  const sumParts = parts.join(' + ')
  steps.push({
    highlight: null,
    counted: counted.slice(),
    size: null,
    running: ANSWER,
    hold: 0,
    result: true,
    caption: t(
      `${sumParts} = ${ANSWER} squares with exactly one ★.`,
      `${sumParts} = ${ANSWER} persegi dengan tepat satu ★.`,
    ),
  })

  return { total: ANSWER, parts, steps, finalIndex: steps.length - 1 }
}
