import type { ComponentType } from 'react'
import AlternatingChainEvalExplainer from './AlternatingChainEvalExplainer'
import ArithmeticExpressionEvalExplainer from './ArithmeticExpressionEvalExplainer'
import BarChartCompareExplainer from './BarChartCompareExplainer'
import BudgetSelectionExplainer from './BudgetSelectionExplainer'
import BuildNumberExplainer from './BuildNumberExplainer'
import ClockReadTimeExplainer from './ClockReadTimeExplainer'
import ClockTimeAfterExplainer from './ClockTimeAfterExplainer'
import CompareOrderExplainer from './CompareOrderExplainer'
import CountObjectsExplainer from './CountObjectsExplainer'
import CustomOperationExplainer from './CustomOperationExplainer'
import DigitFrequencyExplainer from './DigitFrequencyExplainer'
import DigitSumExplainer from './DigitSumExplainer'
import DistanceRateTimeExplainer from './DistanceRateTimeExplainer'
import FindDigitSumExplainer from './FindDigitSumExplainer'
import FindMultipleExplainer from './FindMultipleExplainer'
import FractionRegionExplainer from './FractionRegionExplainer'
import LackingMoneyExplainer from './LackingMoneyExplainer'
import LegsExplainer from './LegsExplainer'
import MistakenDigitCorrectionExplainer from './MistakenDigitCorrectionExplainer'
import MoneyChangeExplainer from './MoneyChangeExplainer'
import MoneyCoinsTotalExplainer from './MoneyCoinsTotalExplainer'
import MoreLessExplainer from './MoreLessExplainer'
import MultiplicationSmallExplainer from './MultiplicationSmallExplainer'
import NumberLineJumpsExplainer from './NumberLineJumpsExplainer'
import NumberPyramidExplainer from './NumberPyramidExplainer'
import OddEvenExplainer from './OddEvenExplainer'
import PatternNextExplainer from './PatternNextExplainer'
import PerfectSquareExplainer from './PerfectSquareExplainer'
import PlaceValueExplainer from './PlaceValueExplainer'
import ProductConsecutiveExplainer from './ProductConsecutiveExplainer'
import ReverseArithmeticExplainer from './ReverseArithmeticExplainer'
import ScaleReadExplainer from './ScaleReadExplainer'
import ShapePerimeterSquareExplainer from './ShapePerimeterSquareExplainer'
import SingleDigitAdditionExplainer from './SingleDigitAdditionExplainer'
import SingleDigitSubtractionExplainer from './SingleDigitSubtractionExplainer'
import StorySumExplainer from './StorySumExplainer'
import TallyMarksCountExplainer from './TallyMarksCountExplainer'
import UnitConversionExplainer from './UnitConversionExplainer'
import WeightBalanceExplainer from './WeightBalanceExplainer'
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
  'bar-chart-compare': BarChartCompareExplainer,
  'budget-selection': BudgetSelectionExplainer,
  'build-number-from-digit-clues': BuildNumberExplainer,
  'clock-read-time': ClockReadTimeExplainer,
  'clock-time-after': ClockTimeAfterExplainer,
  'compare-order-numbers': CompareOrderExplainer,
  'count-objects': CountObjectsExplainer,
  'custom-operation': CustomOperationExplainer,
  'digit-frequency': DigitFrequencyExplainer,
  'digit-sum': DigitSumExplainer,
  'distance-rate-time': DistanceRateTimeExplainer,
  'divisibility-multiple-property': FindMultipleExplainer,
  'find-number-by-digit-sum': FindDigitSumExplainer,
  'fraction-of-region': FractionRegionExplainer,
  'lacking-money-shared': LackingMoneyExplainer,
  'legs-items-rate': LegsExplainer,
  'mistaken-digit-correction': MistakenDigitCorrectionExplainer,
  'money-coins-total': MoneyCoinsTotalExplainer,
  'money-shopping-change': MoneyChangeExplainer,
  'more-or-less-by-k': MoreLessExplainer,
  'multiplication-small': MultiplicationSmallExplainer,
  'number-line-jumps': NumberLineJumpsExplainer,
  'number-pyramid': NumberPyramidExplainer,
  'odd-even-reasoning': OddEvenExplainer,
  'pattern-next': PatternNextExplainer,
  'perfect-square-search': PerfectSquareExplainer,
  'place-value': PlaceValueExplainer,
  'product-of-consecutive': ProductConsecutiveExplainer,
  'reverse-arithmetic-puzzle': ReverseArithmeticExplainer,
  'scale-read': ScaleReadExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
  'single-digit-addition': SingleDigitAdditionExplainer,
  'single-digit-subtraction': SingleDigitSubtractionExplainer,
  'story-sum': StorySumExplainer,
  'tally-marks-count': TallyMarksCountExplainer,
  'unit-conversion': UnitConversionExplainer,
  'weight-balance-word': WeightBalanceExplainer,
  'which-expression-equals': WhichExpressionEqualsExplainer,
}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
