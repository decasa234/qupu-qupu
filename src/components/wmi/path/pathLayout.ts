// src/components/wmi/path/pathLayout.ts
//
// Pure layout math for the Belajar skill-tree path. Each node occupies one
// row; the x offset zigzags through a gentle repeating S-curve so the trail
// winds like a garden path instead of a straight column. x is a 0..1 lane
// fraction (the renderer multiplies by container width); y is the row index.

export interface PathPoint {
  x: number
  y: number
}

// Gentle S-curve repeating: center → left → center → right.
const LANE = [0.5, 0.22, 0.5, 0.78]

export function nodeOffsets(count: number): PathPoint[] {
  return Array.from({ length: count }, (_, i) => ({ x: LANE[i % LANE.length], y: i }))
}
