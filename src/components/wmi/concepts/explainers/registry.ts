import type { ComponentType } from 'react'
import CountObjectsExplainer from './CountObjectsExplainer'
import CustomOperationExplainer from './CustomOperationExplainer'
import DigitSumExplainer from './DigitSumExplainer'
import MultiplicationSmallExplainer from './MultiplicationSmallExplainer'
import PlaceValueExplainer from './PlaceValueExplainer'
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
  'custom-operation': CustomOperationExplainer,
  'digit-sum': DigitSumExplainer,
  'multiplication-small': MultiplicationSmallExplainer,
  'place-value': PlaceValueExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
  'single-digit-addition': SingleDigitAdditionExplainer,
  'single-digit-subtraction': SingleDigitSubtractionExplainer,
  'story-sum': StorySumExplainer,
}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
