import type { ComponentType } from 'react'
import AlternatingChainEvalExplainer from './AlternatingChainEvalExplainer'
import ArithmeticExpressionEvalExplainer from './ArithmeticExpressionEvalExplainer'
import CompareOrderExplainer from './CompareOrderExplainer'
import CountObjectsExplainer from './CountObjectsExplainer'
import CustomOperationExplainer from './CustomOperationExplainer'
import DigitSumExplainer from './DigitSumExplainer'
import MistakenDigitCorrectionExplainer from './MistakenDigitCorrectionExplainer'
import MultiplicationSmallExplainer from './MultiplicationSmallExplainer'
import PlaceValueExplainer from './PlaceValueExplainer'
import ShapePerimeterSquareExplainer from './ShapePerimeterSquareExplainer'
import SingleDigitAdditionExplainer from './SingleDigitAdditionExplainer'
import SingleDigitSubtractionExplainer from './SingleDigitSubtractionExplainer'
import StorySumExplainer from './StorySumExplainer'
import WhichExpressionEqualsExplainer from './WhichExpressionEqualsExplainer'

export interface ExplainerProps {
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'
}

export const EXPLAINERS: Record<string, ComponentType<ExplainerProps>> = {
  'alternating-chain-eval': AlternatingChainEvalExplainer,
  'arithmetic-expression-eval': ArithmeticExpressionEvalExplainer,
  'compare-order-numbers': CompareOrderExplainer,
  'count-objects': CountObjectsExplainer,
  'custom-operation': CustomOperationExplainer,
  'digit-sum': DigitSumExplainer,
  'mistaken-digit-correction': MistakenDigitCorrectionExplainer,
  'multiplication-small': MultiplicationSmallExplainer,
  'place-value': PlaceValueExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
  'single-digit-addition': SingleDigitAdditionExplainer,
  'single-digit-subtraction': SingleDigitSubtractionExplainer,
  'story-sum': StorySumExplainer,
  'which-expression-equals': WhichExpressionEqualsExplainer,
}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
