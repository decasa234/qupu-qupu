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
import ReverseArithmeticExplainer from './ReverseArithmeticExplainer'
import ShapePerimeterSquareExplainer from './ShapePerimeterSquareExplainer'
import SingleDigitAdditionExplainer from './SingleDigitAdditionExplainer'
import SingleDigitSubtractionExplainer from './SingleDigitSubtractionExplainer'
import StorySumExplainer from './StorySumExplainer'
import WhichExpressionEqualsExplainer from './WhichExpressionEqualsExplainer'

export interface ExplainerProps {
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'
  /** Controlled current beat (used when not playing). */
  step?: number
  /** When true, auto-advance from `step` toward the last beat (user-triggered play / autostart). */
  playing?: boolean
  /** Reports the explainer's total beat count (for the carousel dots). */
  onStepCount?: (count: number) => void
  /** Reports the current beat index as it changes. */
  onStepChange?: (index: number) => void
  /** Called when a play-through reaches the last beat. */
  onPlayEnd?: () => void
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
  'reverse-arithmetic-puzzle': ReverseArithmeticExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
  'single-digit-addition': SingleDigitAdditionExplainer,
  'single-digit-subtraction': SingleDigitSubtractionExplainer,
  'story-sum': StorySumExplainer,
  'which-expression-equals': WhichExpressionEqualsExplainer,
}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
