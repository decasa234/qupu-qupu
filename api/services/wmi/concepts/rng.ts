import type { Rng } from './types.js'

// Public-domain mulberry32; tiny, deterministic, sufficient for question generation.
function mulberry32Raw(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function mulberry32(seed: number): Rng {
  const next = mulberry32Raw(seed)

  function int(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive < minInclusive) {
      throw new Error('rng.int: max < min')
    }
    const span = maxInclusive - minInclusive + 1
    return minInclusive + Math.floor(next() * span)
  }

  function pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('rng.pick: empty array')
    return items[int(0, items.length - 1)]
  }

  function shuffle<T>(items: readonly T[]): T[] {
    const out = items.slice()
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(0, i)
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  return { int, pick, shuffle }
}
