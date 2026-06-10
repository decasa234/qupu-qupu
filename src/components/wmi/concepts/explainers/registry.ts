import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

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

type ExplainerComponent = ComponentType<ExplainerProps>
type ExplainerLoader = () => Promise<{ default: ExplainerComponent }>

// A handful of small explainers live as named exports in one shared module;
// re-shape them into the `{ default }` form lazy() expects.
const shared = (
  pick: (m: typeof import('./NewConceptCardExplainers')) => ExplainerComponent,
): ExplainerLoader => {
  return () => import('./NewConceptCardExplainers').then((m) => ({ default: pick(m) }))
}

// Lazy loader per concept slug — explainers (and their framer-motion heavy
// beat machinery) are code-split out of the main bundle and only downloaded
// when the feedback/penjelasan panel for that concept renders.
const EXPLAINER_LOADERS: Record<string, ExplainerLoader> = {
  'alternating-chain-eval': () => import('./AlternatingChainEvalExplainer'),
  'angle-type': () => import('./AngleTypeExplainer'),
  'arrange-digits-to-form-number': shared((m) => m.ArrangeDigitsExplainer),
  'arithmetic-expression-eval': () => import('./ArithmeticExpressionEvalExplainer'),
  'assignment-cycle': () => import('./AssignmentCycleExplainer'),
  'bar-chart-compare': () => import('./BarChartCompareExplainer'),
  'block-count-3d': () => import('./BlockCount3dExplainer'),
  'budget-selection': () => import('./BudgetSelectionExplainer'),
  'build-number-from-digit-clues': () => import('./BuildNumberExplainer'),
  'clock-read-time': () => import('./ClockReadTimeExplainer'),
  'clock-time-after': () => import('./ClockTimeAfterExplainer'),
  'combination-product-sum': () => import('./CombinationProductSumExplainer'),
  'compare-order-numbers': () => import('./CompareOrderExplainer'),
  'count-polygon-sides': () => import('./CountPolygonSidesExplainer'),
  'count-rectangles-grid': () => import('./CountRectanglesGridExplainer'),
  'count-shapes-in-figure': () => import('./CountShapesInFigureExplainer'),
  'custom-operation': () => import('./CustomOperationExplainer'),
  'dice-net-fold': () => import('./DiceNetFoldExplainer'),
  'dice-opposite-faces': () => import('./DiceOppositeFacesExplainer'),
  'digit-frequency': () => import('./DigitFrequencyExplainer'),
  'digit-sum': () => import('./DigitSumExplainer'),
  'direction-orientation': () => import('./DirectionOrientationExplainer'),
  'distance-rate-time': () => import('./DistanceRateTimeExplainer'),
  'divisibility-multiple-property': () => import('./FindMultipleExplainer'),
  'equivalent-fraction-fill': shared((m) => m.EquivalentFractionFillExplainer),
  'find-number-by-digit-sum': () => import('./FindDigitSumExplainer'),
  'fraction-of-region': () => import('./FractionRegionExplainer'),
  'grid-path-steps': () => import('./GridPathStepsExplainer'),
  'lacking-money-shared': () => import('./LackingMoneyExplainer'),
  'legs-items-rate': () => import('./LegsExplainer'),
  'make-groups-leftover': shared((m) => m.MakeGroupsLeftoverExplainer),
  'maze-path-shortest': () => import('./MazePathShortestExplainer'),
  'mistaken-digit-correction': () => import('./MistakenDigitCorrectionExplainer'),
  'missing-addend': shared((m) => m.MissingAddendExplainer),
  'money-coins-total': () => import('./MoneyCoinsTotalExplainer'),
  'money-shopping-change': () => import('./MoneyChangeExplainer'),
  'more-or-less-by-k': () => import('./MoreLessExplainer'),
  'multiplication-small': () => import('./MultiplicationSmallExplainer'),
  'net-progress-cycles': shared((m) => m.NetProgressCyclesExplainer),
  'number-line-jumps': () => import('./NumberLineJumpsExplainer'),
  'number-pyramid': () => import('./NumberPyramidExplainer'),
  'odd-even-reasoning': () => import('./OddEvenExplainer'),
  'operator-fill': () => import('./OperatorFillExplainer'),
  'pattern-next': () => import('./PatternNextExplainer'),
  'perfect-square-search': () => import('./PerfectSquareExplainer'),
  'perimeter-area-composed': () => import('./PerimeterAreaComposedExplainer'),
  'place-value': () => import('./PlaceValueExplainer'),
  'position-in-line': () => import('./PositionInLineExplainer'),
  'product-of-consecutive': () => import('./ProductConsecutiveExplainer'),
  'range-count-evaluate': () => import('./RangeCountEvaluateExplainer'),
  'rectangle-area-grid': () => import('./RectangleAreaGridExplainer'),
  'reverse-arithmetic-puzzle': () => import('./ReverseArithmeticExplainer'),
  'rope-wraps-ratio': () => import('./RopeWrapsRatioExplainer'),
  'same-figure-identify': () => import('./SameFigureIdentifyExplainer'),
  'scale-read': () => import('./ScaleReadExplainer'),
  'shape-perimeter-rectangle': () => import('./ShapePerimeterRectangleExplainer'),
  'shape-perimeter-square': () => import('./ShapePerimeterSquareExplainer'),
  'shape-transformation-rule': () => import('./ShapeTransformationRuleExplainer'),
  'single-digit-addition': () => import('./SingleDigitAdditionExplainer'),
  'single-digit-subtraction': () => import('./SingleDigitSubtractionExplainer'),
  'story-sum': () => import('./StorySumExplainer'),
  'symmetry-count': () => import('./SymmetryCountExplainer'),
  'sum-partition-split': () => import('./SumPartitionSplitExplainer'),
  'table-lookup-combine': shared((m) => m.TableLookupCombineExplainer),
  'tally-marks-count': () => import('./TallyMarksCountExplainer'),
  'unit-conversion': () => import('./UnitConversionExplainer'),
  'venn-set-membership': () => import('./VennSetMembershipExplainer'),
  'truth-order-clues': () => import('./TruthOrderCluesExplainer'),
  'visual-pattern-next': () => import('./VisualPatternNextExplainer'),
  'weight-balance-word': () => import('./WeightBalanceExplainer'),
  'which-might-be': () => import('./WhichMightBeExplainer'),
  'which-expression-equals': () => import('./WhichExpressionEqualsExplainer'),
}

// Memoize the lazy wrapper per slug so re-renders get the same component
// identity (a fresh lazy() each render would remount and restart the beats).
const explainerCache = new Map<string, LazyExoticComponent<ExplainerComponent>>()

export function getExplainer(slug: string): ExplainerComponent | null {
  const load = EXPLAINER_LOADERS[slug]
  if (!load) return null
  let component = explainerCache.get(slug)
  if (!component) {
    // Chunk-load resilience: one retry, then evict so a later render can
    // start fresh instead of replaying React's cached rejection forever.
    component = lazy(() =>
      load()
        .catch(() => load())
        .catch((err) => {
          explainerCache.delete(slug)
          throw err
        }),
    )
    explainerCache.set(slug, component)
  }
  return component
}
