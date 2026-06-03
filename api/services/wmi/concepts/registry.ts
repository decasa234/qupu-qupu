import countObjects from './count-objects/index.js'
import singleDigitAddition from './single-digit-addition/index.js'
import singleDigitSubtraction from './single-digit-subtraction/index.js'
import patternNext from './pattern-next/index.js'
import digitSum from './digit-sum/index.js'
import shapePerimeterSquare from './shape-perimeter-square/index.js'
import placeValue from './place-value/index.js'
import multiplicationSmall from './multiplication-small/index.js'
import storySum from './story-sum/index.js'
import type { ConceptLogic } from './types.js'

export const CONCEPTS = {
  'count-objects': countObjects,
  'single-digit-addition': singleDigitAddition,
  'single-digit-subtraction': singleDigitSubtraction,
  'pattern-next': patternNext,
  'digit-sum': digitSum,
  'shape-perimeter-square': shapePerimeterSquare,
  'place-value': placeValue,
  'multiplication-small': multiplicationSmall,
  'story-sum': storySum,
} as const

export type ConceptSlug = keyof typeof CONCEPTS

export function getConcept(slug: string): ConceptLogic<unknown> | undefined {
  return (CONCEPTS as Record<string, ConceptLogic<unknown>>)[slug]
}

export const ALL_SLUGS = Object.keys(CONCEPTS) as ConceptSlug[]
