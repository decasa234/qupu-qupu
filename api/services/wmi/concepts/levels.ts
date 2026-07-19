// Per-level generation support. A concept opts into the 5-level ladder by
// registering a levelled generator here: level (1–5) → params within the
// concept's existing zod schema. Concepts NOT registered here cannot appear
// in a track (the validator refuses them). BROWSER-SAFE.
import type { Rng } from './types.js'
import { singleDigitAdditionLevels } from './single-digit-addition/levels.js'
import { singleDigitSubtractionLevels } from './single-digit-subtraction/levels.js'

export type LevelledGenerate = (rng: Rng, level: 1 | 2 | 3 | 4 | 5) => unknown

const LEVELLED: Record<string, LevelledGenerate> = {
  'single-digit-addition': singleDigitAdditionLevels,
  'single-digit-subtraction': singleDigitSubtractionLevels,
}

export function hasLevelGeneration(slug: string): boolean {
  return slug in LEVELLED
}

export function getLevelGeneration(slug: string): LevelledGenerate | undefined {
  return LEVELLED[slug]
}
