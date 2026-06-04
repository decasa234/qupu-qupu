import countObjects from './count-objects/index.js'
import singleDigitAddition from './single-digit-addition/index.js'
import singleDigitSubtraction from './single-digit-subtraction/index.js'
import patternNext from './pattern-next/index.js'
import digitSum from './digit-sum/index.js'
import shapePerimeterSquare from './shape-perimeter-square/index.js'
import placeValue from './place-value/index.js'
import multiplicationSmall from './multiplication-small/index.js'
import storySum from './story-sum/index.js'
import arithmeticExpressionEval from './arithmetic-expression-eval/index.js'
import compareOrderNumbers from './compare-order-numbers/index.js'
import clockTimeAfter from './clock-time-after/index.js'
import legsItemsRate from './legs-items-rate/index.js'
import whichExpressionEquals from './which-expression-equals/index.js'
import reverseArithmeticPuzzle from './reverse-arithmetic-puzzle/index.js'
import moneyShoppingChange from './money-shopping-change/index.js'
import findNumberByDigitSum from './find-number-by-digit-sum/index.js'
import customOperation from './custom-operation/index.js'
import alternatingChainEval from './alternating-chain-eval/index.js'
import mistakenDigitCorrection from './mistaken-digit-correction/index.js'
import buildNumberFromDigitClues from './build-number-from-digit-clues/index.js'
import moreOrLessByK from './more-or-less-by-k/index.js'
import divisibilityMultipleProperty from './divisibility-multiple-property/index.js'
import positionInLine from './position-in-line/index.js'
import assignmentCycle from './assignment-cycle/index.js'
import distanceRateTime from './distance-rate-time/index.js'
import operatorFill from './operator-fill/index.js'
import whichMightBe from './which-might-be/index.js'
import rangeCountEvaluate from './range-count-evaluate/index.js'
import unitConversion from './unit-conversion/index.js'
import weightBalanceWord from './weight-balance-word/index.js'
import lackingMoneyShared from './lacking-money-shared/index.js'
import digitFrequency from './digit-frequency/index.js'
import oddEvenReasoning from './odd-even-reasoning/index.js'
import numberPyramid from './number-pyramid/index.js'
import diceOppositeFaces from './dice-opposite-faces/index.js'
import directionOrientation from './direction-orientation/index.js'
import combinationProductSum from './combination-product-sum/index.js'
import perfectSquareSearch from './perfect-square-search/index.js'
import productOfConsecutive from './product-of-consecutive/index.js'
import budgetSelection from './budget-selection/index.js'
import sumPartitionSplit from './sum-partition-split/index.js'
import clockReadTime from './clock-read-time/index.js'
import shapePerimeterRectangle from './shape-perimeter-rectangle/index.js'
import barChartCompare from './bar-chart-compare/index.js'
import rectangleAreaGrid from './rectangle-area-grid/index.js'
import perimeterAreaComposed from './perimeter-area-composed/index.js'
import vennSetMembership from './venn-set-membership/index.js'
import blockCount3d from './block-count-3d/index.js'
import numberLineJumps from './number-line-jumps/index.js'
import countPolygonSides from './count-polygon-sides/index.js'
import symmetryCount from './symmetry-count/index.js'
import angleType from './angle-type/index.js'
import tallyMarksCount from './tally-marks-count/index.js'
import gridPathSteps from './grid-path-steps/index.js'
import moneyCoinsTotal from './money-coins-total/index.js'
import sameFigureIdentify from './same-figure-identify/index.js'
import diceNetFold from './dice-net-fold/index.js'
import scaleRead from './scale-read/index.js'
import fractionOfRegion from './fraction-of-region/index.js'
import mazePathShortest from './maze-path-shortest/index.js'
import countShapesInFigure from './count-shapes-in-figure/index.js'
import countRectanglesGrid from './count-rectangles-grid/index.js'
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
  'arithmetic-expression-eval': arithmeticExpressionEval,
  'compare-order-numbers': compareOrderNumbers,
  'clock-time-after': clockTimeAfter,
  'legs-items-rate': legsItemsRate,
  'which-expression-equals': whichExpressionEquals,
  'reverse-arithmetic-puzzle': reverseArithmeticPuzzle,
  'money-shopping-change': moneyShoppingChange,
  'find-number-by-digit-sum': findNumberByDigitSum,
  'custom-operation': customOperation,
  'alternating-chain-eval': alternatingChainEval,
  'mistaken-digit-correction': mistakenDigitCorrection,
  'build-number-from-digit-clues': buildNumberFromDigitClues,
  'more-or-less-by-k': moreOrLessByK,
  'divisibility-multiple-property': divisibilityMultipleProperty,
  'position-in-line': positionInLine,
  'assignment-cycle': assignmentCycle,
  'distance-rate-time': distanceRateTime,
  'operator-fill': operatorFill,
  'which-might-be': whichMightBe,
  'range-count-evaluate': rangeCountEvaluate,
  'unit-conversion': unitConversion,
  'weight-balance-word': weightBalanceWord,
  'lacking-money-shared': lackingMoneyShared,
  'digit-frequency': digitFrequency,
  'odd-even-reasoning': oddEvenReasoning,
  'number-pyramid': numberPyramid,
  'dice-opposite-faces': diceOppositeFaces,
  'direction-orientation': directionOrientation,
  'combination-product-sum': combinationProductSum,
  'perfect-square-search': perfectSquareSearch,
  'product-of-consecutive': productOfConsecutive,
  'budget-selection': budgetSelection,
  'sum-partition-split': sumPartitionSplit,
  'clock-read-time': clockReadTime,
  'shape-perimeter-rectangle': shapePerimeterRectangle,
  'bar-chart-compare': barChartCompare,
  'rectangle-area-grid': rectangleAreaGrid,
  'perimeter-area-composed': perimeterAreaComposed,
  'venn-set-membership': vennSetMembership,
  'block-count-3d': blockCount3d,
  'number-line-jumps': numberLineJumps,
  'count-polygon-sides': countPolygonSides,
  'symmetry-count': symmetryCount,
  'angle-type': angleType,
  'tally-marks-count': tallyMarksCount,
  'grid-path-steps': gridPathSteps,
  'money-coins-total': moneyCoinsTotal,
  'same-figure-identify': sameFigureIdentify,
  'dice-net-fold': diceNetFold,
  'scale-read': scaleRead,
  'fraction-of-region': fractionOfRegion,
  'maze-path-shortest': mazePathShortest,
  'count-shapes-in-figure': countShapesInFigure,
  'count-rectangles-grid': countRectanglesGrid,
} as const

export type ConceptSlug = keyof typeof CONCEPTS

export function getConcept(slug: string): ConceptLogic<unknown> | undefined {
  return (CONCEPTS as Record<string, ConceptLogic<unknown>>)[slug]
}

export const ALL_SLUGS = Object.keys(CONCEPTS) as ConceptSlug[]
