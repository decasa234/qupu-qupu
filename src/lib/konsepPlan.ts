// Session plan builders for the Konsep practice session.
//
// Two modes:
// - Default: SESSION_SIZE weighted questions across the whole chapter
//   (weaker concepts appear more often; never the same concept twice in a row).
// - Focus (`?fokus=<slug>` from the Belajar skill tree): a shorter
//   FOCUS_SESSION_SIZE session that is ~80% the focused concept with the rest
//   drawn as weighted review from the chapter's other concepts.

import type { WmiGardenConcept } from '../types/wmi'

export const SESSION_SIZE = 20
export const FOCUS_SESSION_SIZE = 10
const FOCUS_SHARE = 0.8

// Weighted random plan over the whole pool: weight = how far the concept is
// from mastery, and (when the pool allows it) never the same slug twice in a
// row. This is the original WmiKonsepSession buildPlan body, size-agnostic.
function weightedPlan(concepts: WmiGardenConcept[], size: number): WmiGardenConcept[] {
  const plan: WmiGardenConcept[] = []
  let prev: string | null = null
  for (let i = 0; i < size; i++) {
    const pool = concepts.length > 1 ? concepts.filter((c) => c.slug !== prev) : concepts
    const weights = pool.map((c) => Math.max(1, 100 - c.pct))
    let r = Math.random() * weights.reduce((a, b) => a + b, 0)
    let pick = pool[0]
    for (let j = 0; j < pool.length; j++) {
      r -= weights[j]
      if (r <= 0) {
        pick = pool[j]
        break
      }
    }
    plan.push(pick)
    prev = pick.slug
  }
  return plan
}

// Spread review items evenly through the focus run: split the focus items
// into review.length + 1 chunks and place one review item between chunks.
// With an 8/2 split this yields runs of at most 3 consecutive focus items.
function interleave(
  focus: WmiGardenConcept[],
  review: WmiGardenConcept[],
): WmiGardenConcept[] {
  if (review.length === 0) return focus
  const out: WmiGardenConcept[] = []
  const chunks = review.length + 1
  const base = Math.floor(focus.length / chunks)
  let extra = focus.length % chunks
  let cursor = 0
  for (let i = 0; i < chunks; i++) {
    const take = base + (extra > 0 ? 1 : 0)
    if (extra > 0) extra--
    out.push(...focus.slice(cursor, cursor + take))
    cursor += take
    if (i < review.length) out.push(review[i])
  }
  return out
}

export function buildPlan(
  concepts: WmiGardenConcept[],
  opts?: { focusSlug?: string; size?: number },
): WmiGardenConcept[] {
  const size = opts?.size ?? SESSION_SIZE
  const focus = opts?.focusSlug ? concepts.find((c) => c.slug === opts.focusSlug) : undefined
  if (!focus) return weightedPlan(concepts, size)

  const focusCount = Math.max(1, Math.round(size * FOCUS_SHARE))
  const others = concepts.filter((c) => c.slug !== focus.slug)
  // Single-concept chapter: every question is the focus concept.
  const review = others.length > 0 ? weightedPlan(others, size - focusCount) : []
  const focusItems: WmiGardenConcept[] =
    review.length > 0
      ? Array.from({ length: focusCount }, () => focus)
      : Array.from({ length: size }, () => focus)
  return interleave(focusItems, review)
}
