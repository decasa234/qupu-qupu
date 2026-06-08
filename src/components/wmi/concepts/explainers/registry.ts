import type { ComponentType } from 'react'
import AlternatingChainEvalExplainer from './AlternatingChainEvalExplainer'
import AngleTypeExplainer from './AngleTypeExplainer'
import ArithmeticExpressionEvalExplainer from './ArithmeticExpressionEvalExplainer'
import AssignmentCycleExplainer from './AssignmentCycleExplainer'
import BarChartCompareExplainer from './BarChartCompareExplainer'
import BlockCount3dExplainer from './BlockCount3dExplainer'
import BudgetSelectionExplainer from './BudgetSelectionExplainer'
import BuildNumberExplainer from './BuildNumberExplainer'
import ClockReadTimeExplainer from './ClockReadTimeExplainer'
import ClockTimeAfterExplainer from './ClockTimeAfterExplainer'
import CombinationProductSumExplainer from './CombinationProductSumExplainer'
import CompareOrderExplainer from './CompareOrderExplainer'
import CountObjectsExplainer from './CountObjectsExplainer'
import CountPolygonSidesExplainer from './CountPolygonSidesExplainer'
import CountRectanglesGridExplainer from './CountRectanglesGridExplainer'
import CountShapesInFigureExplainer from './CountShapesInFigureExplainer'
import CustomOperationExplainer from './CustomOperationExplainer'
import DiceNetFoldExplainer from './DiceNetFoldExplainer'
import DiceOppositeFacesExplainer from './DiceOppositeFacesExplainer'
import DigitFrequencyExplainer from './DigitFrequencyExplainer'
import DigitSumExplainer from './DigitSumExplainer'
import DirectionOrientationExplainer from './DirectionOrientationExplainer'
import DistanceRateTimeExplainer from './DistanceRateTimeExplainer'
import FindDigitSumExplainer from './FindDigitSumExplainer'
import FindMultipleExplainer from './FindMultipleExplainer'
import FractionRegionExplainer from './FractionRegionExplainer'
import GridPathStepsExplainer from './GridPathStepsExplainer'
import LackingMoneyExplainer from './LackingMoneyExplainer'
import LegsExplainer from './LegsExplainer'
import MazePathShortestExplainer from './MazePathShortestExplainer'
import MistakenDigitCorrectionExplainer from './MistakenDigitCorrectionExplainer'
import MoneyChangeExplainer from './MoneyChangeExplainer'
import MoneyCoinsTotalExplainer from './MoneyCoinsTotalExplainer'
import MoreLessExplainer from './MoreLessExplainer'
import MultiplicationSmallExplainer from './MultiplicationSmallExplainer'
import {
  ArrangeDigitsExplainer,
  EquivalentFractionFillExplainer,
  MakeGroupsLeftoverExplainer,
  MissingAddendExplainer,
  NetProgressCyclesExplainer,
  RopeWrapsRatioExplainer,
  TableLookupCombineExplainer,
  TruthOrderCluesExplainer,
  VisualPatternNextExplainer,
} from './NewConceptCardExplainers'
import ShapeTransformationRuleExplainer from './ShapeTransformationRuleExplainer'
import NumberLineJumpsExplainer from './NumberLineJumpsExplainer'
import NumberPyramidExplainer from './NumberPyramidExplainer'
import OddEvenExplainer from './OddEvenExplainer'
import OperatorFillExplainer from './OperatorFillExplainer'
import PatternNextExplainer from './PatternNextExplainer'
import PerfectSquareExplainer from './PerfectSquareExplainer'
import PerimeterAreaComposedExplainer from './PerimeterAreaComposedExplainer'
import PlaceValueExplainer from './PlaceValueExplainer'
import PositionInLineExplainer from './PositionInLineExplainer'
import ProductConsecutiveExplainer from './ProductConsecutiveExplainer'
import RangeCountEvaluateExplainer from './RangeCountEvaluateExplainer'
import RectangleAreaGridExplainer from './RectangleAreaGridExplainer'
import ReverseArithmeticExplainer from './ReverseArithmeticExplainer'
import SameFigureIdentifyExplainer from './SameFigureIdentifyExplainer'
import ScaleReadExplainer from './ScaleReadExplainer'
import ShapePerimeterRectangleExplainer from './ShapePerimeterRectangleExplainer'
import ShapePerimeterSquareExplainer from './ShapePerimeterSquareExplainer'
import SingleDigitAdditionExplainer from './SingleDigitAdditionExplainer'
import SingleDigitSubtractionExplainer from './SingleDigitSubtractionExplainer'
import StorySumExplainer from './StorySumExplainer'
import SymmetryCountExplainer from './SymmetryCountExplainer'
import SumPartitionSplitExplainer from './SumPartitionSplitExplainer'
import TallyMarksCountExplainer from './TallyMarksCountExplainer'
import UnitConversionExplainer from './UnitConversionExplainer'
import VennSetMembershipExplainer from './VennSetMembershipExplainer'
import WeightBalanceExplainer from './WeightBalanceExplainer'
import WhichExpressionEqualsExplainer from './WhichExpressionEqualsExplainer'
import WhichMightBeExplainer from './WhichMightBeExplainer'

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
  'angle-type': AngleTypeExplainer,
  'arrange-digits-to-form-number': ArrangeDigitsExplainer,
  'arithmetic-expression-eval': ArithmeticExpressionEvalExplainer,
  'assignment-cycle': AssignmentCycleExplainer,
  'bar-chart-compare': BarChartCompareExplainer,
  'block-count-3d': BlockCount3dExplainer,
  'budget-selection': BudgetSelectionExplainer,
  'build-number-from-digit-clues': BuildNumberExplainer,
  'clock-read-time': ClockReadTimeExplainer,
  'clock-time-after': ClockTimeAfterExplainer,
  'combination-product-sum': CombinationProductSumExplainer,
  'compare-order-numbers': CompareOrderExplainer,
  'count-objects': CountObjectsExplainer,
  'count-polygon-sides': CountPolygonSidesExplainer,
  'count-rectangles-grid': CountRectanglesGridExplainer,
  'count-shapes-in-figure': CountShapesInFigureExplainer,
  'custom-operation': CustomOperationExplainer,
  'dice-net-fold': DiceNetFoldExplainer,
  'dice-opposite-faces': DiceOppositeFacesExplainer,
  'digit-frequency': DigitFrequencyExplainer,
  'digit-sum': DigitSumExplainer,
  'direction-orientation': DirectionOrientationExplainer,
  'distance-rate-time': DistanceRateTimeExplainer,
  'divisibility-multiple-property': FindMultipleExplainer,
  'equivalent-fraction-fill': EquivalentFractionFillExplainer,
  'find-number-by-digit-sum': FindDigitSumExplainer,
  'fraction-of-region': FractionRegionExplainer,
  'grid-path-steps': GridPathStepsExplainer,
  'lacking-money-shared': LackingMoneyExplainer,
  'legs-items-rate': LegsExplainer,
  'make-groups-leftover': MakeGroupsLeftoverExplainer,
  'maze-path-shortest': MazePathShortestExplainer,
  'mistaken-digit-correction': MistakenDigitCorrectionExplainer,
  'missing-addend': MissingAddendExplainer,
  'money-coins-total': MoneyCoinsTotalExplainer,
  'money-shopping-change': MoneyChangeExplainer,
  'more-or-less-by-k': MoreLessExplainer,
  'multiplication-small': MultiplicationSmallExplainer,
  'net-progress-cycles': NetProgressCyclesExplainer,
  'number-line-jumps': NumberLineJumpsExplainer,
  'number-pyramid': NumberPyramidExplainer,
  'odd-even-reasoning': OddEvenExplainer,
  'operator-fill': OperatorFillExplainer,
  'pattern-next': PatternNextExplainer,
  'perfect-square-search': PerfectSquareExplainer,
  'perimeter-area-composed': PerimeterAreaComposedExplainer,
  'place-value': PlaceValueExplainer,
  'position-in-line': PositionInLineExplainer,
  'product-of-consecutive': ProductConsecutiveExplainer,
  'range-count-evaluate': RangeCountEvaluateExplainer,
  'rectangle-area-grid': RectangleAreaGridExplainer,
  'reverse-arithmetic-puzzle': ReverseArithmeticExplainer,
  'rope-wraps-ratio': RopeWrapsRatioExplainer,
  'same-figure-identify': SameFigureIdentifyExplainer,
  'scale-read': ScaleReadExplainer,
  'shape-perimeter-rectangle': ShapePerimeterRectangleExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
  'shape-transformation-rule': ShapeTransformationRuleExplainer,
  'single-digit-addition': SingleDigitAdditionExplainer,
  'single-digit-subtraction': SingleDigitSubtractionExplainer,
  'story-sum': StorySumExplainer,
  'symmetry-count': SymmetryCountExplainer,
  'sum-partition-split': SumPartitionSplitExplainer,
  'table-lookup-combine': TableLookupCombineExplainer,
  'tally-marks-count': TallyMarksCountExplainer,
  'unit-conversion': UnitConversionExplainer,
  'venn-set-membership': VennSetMembershipExplainer,
  'truth-order-clues': TruthOrderCluesExplainer,
  'visual-pattern-next': VisualPatternNextExplainer,
  'weight-balance-word': WeightBalanceExplainer,
  'which-might-be': WhichMightBeExplainer,
  'which-expression-equals': WhichExpressionEqualsExplainer,
}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
