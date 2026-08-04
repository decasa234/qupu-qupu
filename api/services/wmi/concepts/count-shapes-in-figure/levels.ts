// Level ladder for count-shapes-in-figure. THIN SCHEMA: the only param is
// `segments` ∈ 2..5, so the concept admits exactly FOUR distinct instances.
// Levels 1–4 use each one; level 5 repeats level 4 (segments = 5, 15 triangles)
// because that is the hardest figure the schema can express — no fake fifth rung.
// Proxy: triangleCount = C(segments+1, 2) → 3, 6, 10, 15, 15.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function countShapesInFigureLevels(_rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: 2 sections → 3 triangles (2 small + 1 big) — the whole idea in miniature
    case 1: return { segments: 2 }
    // L2: 3 sections → 6 triangles; the combined ones now outnumber the small ones
    case 2: return { segments: 3 }
    // L3: 4 sections → 10 triangles across three widths
    case 3: return { segments: 4 }
    // L4: 5 sections → 15 triangles; the largest fan the schema allows
    case 4: return { segments: 5 }
    // L5: identical to L4 — the schema has no harder figure (documented, not faked)
    case 5: return { segments: 5 }
  }
}
