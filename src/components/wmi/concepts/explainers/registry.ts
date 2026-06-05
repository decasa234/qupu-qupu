import type { ComponentType } from 'react'
import CountObjectsExplainer from './CountObjectsExplainer'
import DigitSumExplainer from './DigitSumExplainer'
import ShapePerimeterSquareExplainer from './ShapePerimeterSquareExplainer'
import SingleDigitAdditionExplainer from './SingleDigitAdditionExplainer'
import SingleDigitSubtractionExplainer from './SingleDigitSubtractionExplainer'
import StorySumExplainer from './StorySumExplainer'

export interface ExplainerProps {
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'
}

export const EXPLAINERS: Record<string, ComponentType<ExplainerProps>> = {
  'count-objects': CountObjectsExplainer,
  'digit-sum': DigitSumExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
  'single-digit-addition': SingleDigitAdditionExplainer,
  'single-digit-subtraction': SingleDigitSubtractionExplainer,
  'story-sum': StorySumExplainer,
}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
