// Per-level generation support. A concept opts into the 5-level ladder by
// registering a levelled generator here: level (1–5) → params within the
// concept's existing zod schema. Concepts NOT registered here cannot appear
// in a track (the validator refuses them). BROWSER-SAFE.
//
// Generated from the per-concept levels.ts files; keep it that way rather than
// hand-editing, so a new ladder is never half-registered.
import type { Rng } from './types.js'
import { alternatingChainEvalLevels } from './alternating-chain-eval/levels.js'
import { angleTypeLevels } from './angle-type/levels.js'
import { arithmeticExpressionEvalLevels } from './arithmetic-expression-eval/levels.js'
import { arrangeDigitsToFormNumberLevels } from './arrange-digits-to-form-number/levels.js'
import { assignmentCycleLevels } from './assignment-cycle/levels.js'
import { balanceSubstitutionLevels } from './balance-substitution/levels.js'
import { barChartCompareLevels } from './bar-chart-compare/levels.js'
import { blockCount3dLevels } from './block-count-3d/levels.js'
import { bookSheetPagesLevels } from './book-sheet-pages/levels.js'
import { budgetSelectionLevels } from './budget-selection/levels.js'
import { buildNumberFromDigitCluesLevels } from './build-number-from-digit-clues/levels.js'
import { calendarDayReasoningLevels } from './calendar-day-reasoning/levels.js'
import { clockReadTimeLevels } from './clock-read-time/levels.js'
import { clockTimeAfterLevels } from './clock-time-after/levels.js'
import { combinationProductSumLevels } from './combination-product-sum/levels.js'
import { commonFactorShortcutLevels } from './common-factor-shortcut/levels.js'
import { compareFractionsLevels } from './compare-fractions/levels.js'
import { compareOrderNumbersLevels } from './compare-order-numbers/levels.js'
import { comparisonChainSolveLevels } from './comparison-chain-solve/levels.js'
import { consecutiveIntegerSumLevels } from './consecutive-integer-sum/levels.js'
import { containerCapacityAllocationLevels } from './container-capacity-allocation/levels.js'
import { countManyObjectsLevels } from './count-many-objects/levels.js'
import { countPolygonSidesLevels } from './count-polygon-sides/levels.js'
import { countRectanglesGridLevels } from './count-rectangles-grid/levels.js'
import { countShapesInFigureLevels } from './count-shapes-in-figure/levels.js'
import { countTwoDigitNumbersLevels } from './count-two-digit-numbers/levels.js'
import { cryptarithmeticAdditionLevels } from './cryptarithmetic-addition/levels.js'
import { customOperationLevels } from './custom-operation/levels.js'
import { deleteDigitsExtremiseLevels } from './delete-digits-extremise/levels.js'
import { diceNetFoldLevels } from './dice-net-fold/levels.js'
import { diceOppositeFacesLevels } from './dice-opposite-faces/levels.js'
import { digitFrequencyLevels } from './digit-frequency/levels.js'
import { digitSumLevels } from './digit-sum/levels.js'
import { digitsIntoEquationFillLevels } from './digits-into-equation-fill/levels.js'
import { directionOrientationLevels } from './direction-orientation/levels.js'
import { distanceRateTimeLevels } from './distance-rate-time/levels.js'
import { divisibilityMultiplePropertyLevels } from './divisibility-multiple-property/levels.js'
import { equivalentFractionFillLevels } from './equivalent-fraction-fill/levels.js'
import { findNumberByDigitSumLevels } from './find-number-by-digit-sum/levels.js'
import { fractionOfRegionLevels } from './fraction-of-region/levels.js'
import { gridPathStepsLevels } from './grid-path-steps/levels.js'
import { growingFigureNthTermLevels } from './growing-figure-nth-term/levels.js'
import { lackingMoneySharedLevels } from './lacking-money-shared/levels.js'
import { legsItemsRateLevels } from './legs-items-rate/levels.js'
import { lengthMeasureCompareLevels } from './length-measure-compare/levels.js'
import { makeGroupsLeftoverLevels } from './make-groups-leftover/levels.js'
import { mazePathShortestLevels } from './maze-path-shortest/levels.js'
import { missingAddendLevels } from './missing-addend/levels.js'
import { mistakenDigitCorrectionLevels } from './mistaken-digit-correction/levels.js'
import { moneyCoinsTotalLevels } from './money-coins-total/levels.js'
import { moneyShoppingChangeLevels } from './money-shopping-change/levels.js'
import { moreOrLessByKLevels } from './more-or-less-by-k/levels.js'
import { multiplicationSmallLevels } from './multiplication-small/levels.js'
import { netProgressCyclesLevels } from './net-progress-cycles/levels.js'
import { numberFigureRuleLevels } from './number-figure-rule/levels.js'
import { numberLineJumpsLevels } from './number-line-jumps/levels.js'
import { numberPyramidLevels } from './number-pyramid/levels.js'
import { oddEvenReasoningLevels } from './odd-even-reasoning/levels.js'
import { operatorFillLevels } from './operator-fill/levels.js'
import { ordinalPositionReadLevels } from './ordinal-position-read/levels.js'
import { paintedCubeFacesCountLevels } from './painted-cube-faces-count/levels.js'
import { patternNextLevels } from './pattern-next/levels.js'
import { perfectSquareSearchLevels } from './perfect-square-search/levels.js'
import { perimeterAreaComposedLevels } from './perimeter-area-composed/levels.js'
import { placeValueLevels } from './place-value/levels.js'
import { positionInLineLevels } from './position-in-line/levels.js'
import { productOfConsecutiveLevels } from './product-of-consecutive/levels.js'
import { rangeCountEvaluateLevels } from './range-count-evaluate/levels.js'
import { rankComputedExpressionsLevels } from './rank-computed-expressions/levels.js'
import { rectangleAreaGridLevels } from './rectangle-area-grid/levels.js'
import { reverseArithmeticPuzzleLevels } from './reverse-arithmetic-puzzle/levels.js'
import { ropeWrapsRatioLevels } from './rope-wraps-ratio/levels.js'
import { rowColumnSumGridLevels } from './row-column-sum-grid/levels.js'
import { sameFigureIdentifyLevels } from './same-figure-identify/levels.js'
import { scaleReadLevels } from './scale-read/levels.js'
import { sequenceRepairLevels } from './sequence-repair/levels.js'
import { shapePerimeterRectangleLevels } from './shape-perimeter-rectangle/levels.js'
import { shapePerimeterSquareLevels } from './shape-perimeter-square/levels.js'
import { shapeTransformationRuleLevels } from './shape-transformation-rule/levels.js'
import { singleDigitAdditionLevels } from './single-digit-addition/levels.js'
import { singleDigitSubtractionLevels } from './single-digit-subtraction/levels.js'
import { solveSymbolEquationsLevels } from './solve-symbol-equations/levels.js'
import { sortCountByAttributeLevels } from './sort-count-by-attribute/levels.js'
import { storySumLevels } from './story-sum/levels.js'
import { sumPartitionSplitLevels } from './sum-partition-split/levels.js'
import { symmetryCountLevels } from './symmetry-count/levels.js'
import { tableLookupCombineLevels } from './table-lookup-combine/levels.js'
import { tallyMarksCountLevels } from './tally-marks-count/levels.js'
import { transferToEqualizeLevels } from './transfer-to-equalize/levels.js'
import { truthOrderCluesLevels } from './truth-order-clues/levels.js'
import { unitConversionLevels } from './unit-conversion/levels.js'
import { visualPatternNextLevels } from './visual-pattern-next/levels.js'
import { weightBalanceWordLevels } from './weight-balance-word/levels.js'
import { whichExpressionEqualsLevels } from './which-expression-equals/levels.js'
import { whichMightBeLevels } from './which-might-be/levels.js'

export type LevelledGenerate = (rng: Rng, level: 1 | 2 | 3 | 4 | 5) => unknown

const LEVELLED: Record<string, LevelledGenerate> = {
  'alternating-chain-eval': alternatingChainEvalLevels,
  'angle-type': angleTypeLevels,
  'arithmetic-expression-eval': arithmeticExpressionEvalLevels,
  'arrange-digits-to-form-number': arrangeDigitsToFormNumberLevels,
  'assignment-cycle': assignmentCycleLevels,
  'balance-substitution': balanceSubstitutionLevels,
  'bar-chart-compare': barChartCompareLevels,
  'block-count-3d': blockCount3dLevels,
  'book-sheet-pages': bookSheetPagesLevels,
  'budget-selection': budgetSelectionLevels,
  'build-number-from-digit-clues': buildNumberFromDigitCluesLevels,
  'calendar-day-reasoning': calendarDayReasoningLevels,
  'clock-read-time': clockReadTimeLevels,
  'clock-time-after': clockTimeAfterLevels,
  'combination-product-sum': combinationProductSumLevels,
  'common-factor-shortcut': commonFactorShortcutLevels,
  'compare-fractions': compareFractionsLevels,
  'compare-order-numbers': compareOrderNumbersLevels,
  'comparison-chain-solve': comparisonChainSolveLevels,
  'consecutive-integer-sum': consecutiveIntegerSumLevels,
  'container-capacity-allocation': containerCapacityAllocationLevels,
  'count-many-objects': countManyObjectsLevels,
  'count-polygon-sides': countPolygonSidesLevels,
  'count-rectangles-grid': countRectanglesGridLevels,
  'count-shapes-in-figure': countShapesInFigureLevels,
  'count-two-digit-numbers': countTwoDigitNumbersLevels,
  'cryptarithmetic-addition': cryptarithmeticAdditionLevels,
  'custom-operation': customOperationLevels,
  'delete-digits-extremise': deleteDigitsExtremiseLevels,
  'dice-net-fold': diceNetFoldLevels,
  'dice-opposite-faces': diceOppositeFacesLevels,
  'digit-frequency': digitFrequencyLevels,
  'digit-sum': digitSumLevels,
  'digits-into-equation-fill': digitsIntoEquationFillLevels,
  'direction-orientation': directionOrientationLevels,
  'distance-rate-time': distanceRateTimeLevels,
  'divisibility-multiple-property': divisibilityMultiplePropertyLevels,
  'equivalent-fraction-fill': equivalentFractionFillLevels,
  'find-number-by-digit-sum': findNumberByDigitSumLevels,
  'fraction-of-region': fractionOfRegionLevels,
  'grid-path-steps': gridPathStepsLevels,
  'growing-figure-nth-term': growingFigureNthTermLevels,
  'lacking-money-shared': lackingMoneySharedLevels,
  'legs-items-rate': legsItemsRateLevels,
  'length-measure-compare': lengthMeasureCompareLevels,
  'make-groups-leftover': makeGroupsLeftoverLevels,
  'maze-path-shortest': mazePathShortestLevels,
  'missing-addend': missingAddendLevels,
  'mistaken-digit-correction': mistakenDigitCorrectionLevels,
  'money-coins-total': moneyCoinsTotalLevels,
  'money-shopping-change': moneyShoppingChangeLevels,
  'more-or-less-by-k': moreOrLessByKLevels,
  'multiplication-small': multiplicationSmallLevels,
  'net-progress-cycles': netProgressCyclesLevels,
  'number-figure-rule': numberFigureRuleLevels,
  'number-line-jumps': numberLineJumpsLevels,
  'number-pyramid': numberPyramidLevels,
  'odd-even-reasoning': oddEvenReasoningLevels,
  'operator-fill': operatorFillLevels,
  'ordinal-position-read': ordinalPositionReadLevels,
  'painted-cube-faces-count': paintedCubeFacesCountLevels,
  'pattern-next': patternNextLevels,
  'perfect-square-search': perfectSquareSearchLevels,
  'perimeter-area-composed': perimeterAreaComposedLevels,
  'place-value': placeValueLevels,
  'position-in-line': positionInLineLevels,
  'product-of-consecutive': productOfConsecutiveLevels,
  'range-count-evaluate': rangeCountEvaluateLevels,
  'rank-computed-expressions': rankComputedExpressionsLevels,
  'rectangle-area-grid': rectangleAreaGridLevels,
  'reverse-arithmetic-puzzle': reverseArithmeticPuzzleLevels,
  'rope-wraps-ratio': ropeWrapsRatioLevels,
  'row-column-sum-grid': rowColumnSumGridLevels,
  'same-figure-identify': sameFigureIdentifyLevels,
  'scale-read': scaleReadLevels,
  'sequence-repair': sequenceRepairLevels,
  'shape-perimeter-rectangle': shapePerimeterRectangleLevels,
  'shape-perimeter-square': shapePerimeterSquareLevels,
  'shape-transformation-rule': shapeTransformationRuleLevels,
  'single-digit-addition': singleDigitAdditionLevels,
  'single-digit-subtraction': singleDigitSubtractionLevels,
  'solve-symbol-equations': solveSymbolEquationsLevels,
  'sort-count-by-attribute': sortCountByAttributeLevels,
  'story-sum': storySumLevels,
  'sum-partition-split': sumPartitionSplitLevels,
  'symmetry-count': symmetryCountLevels,
  'table-lookup-combine': tableLookupCombineLevels,
  'tally-marks-count': tallyMarksCountLevels,
  'transfer-to-equalize': transferToEqualizeLevels,
  'truth-order-clues': truthOrderCluesLevels,
  'unit-conversion': unitConversionLevels,
  'visual-pattern-next': visualPatternNextLevels,
  'weight-balance-word': weightBalanceWordLevels,
  'which-expression-equals': whichExpressionEqualsLevels,
  'which-might-be': whichMightBeLevels,
}

export function hasLevelGeneration(slug: string): boolean {
  return slug in LEVELLED
}

export function getLevelGeneration(slug: string): LevelledGenerate | undefined {
  return LEVELLED[slug]
}
