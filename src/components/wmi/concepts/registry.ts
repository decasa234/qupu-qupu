import type { ComponentType } from 'react'
import ShapePerimeterSquare from './shape-perimeter-square'
import ClockReadTime from './clock-read-time'
import ShapePerimeterRectangle from './shape-perimeter-rectangle'
import BarChartCompare from './bar-chart-compare'
import RectangleAreaGrid from './rectangle-area-grid'
import PerimeterAreaComposed from './perimeter-area-composed'
import VennSetMembership from './venn-set-membership'
import BlockCount3d from './block-count-3d'
import NumberLineJumps from './number-line-jumps'
import CountPolygonSides from './count-polygon-sides'
import SymmetryCount from './symmetry-count'
import AngleType from './angle-type'
import TallyMarksCount from './tally-marks-count'
import GridPathSteps from './grid-path-steps'
import MoneyCoinsTotal from './money-coins-total'
import SameFigureIdentify from './same-figure-identify'
import DiceNetFold from './dice-net-fold'
import ScaleRead from './scale-read'
import FractionOfRegion from './fraction-of-region'
import MazePathShortest from './maze-path-shortest'
import CountShapesInFigure from './count-shapes-in-figure'
import CountRectanglesGrid from './count-rectangles-grid'
import BudgetSelection from './budget-selection'

export const ILLUSTRATIONS: Record<string, ComponentType<{ params: unknown }>> = {
  'shape-perimeter-square': ShapePerimeterSquare,
  'clock-read-time': ClockReadTime,
  'shape-perimeter-rectangle': ShapePerimeterRectangle,
  'bar-chart-compare': BarChartCompare,
  'rectangle-area-grid': RectangleAreaGrid,
  'perimeter-area-composed': PerimeterAreaComposed,
  'venn-set-membership': VennSetMembership,
  'block-count-3d': BlockCount3d,
  'number-line-jumps': NumberLineJumps,
  'count-polygon-sides': CountPolygonSides,
  'symmetry-count': SymmetryCount,
  'angle-type': AngleType,
  'tally-marks-count': TallyMarksCount,
  'grid-path-steps': GridPathSteps,
  'money-coins-total': MoneyCoinsTotal,
  'same-figure-identify': SameFigureIdentify,
  'dice-net-fold': DiceNetFold,
  'scale-read': ScaleRead,
  'fraction-of-region': FractionOfRegion,
  'maze-path-shortest': MazePathShortest,
  'count-shapes-in-figure': CountShapesInFigure,
  'count-rectangles-grid': CountRectanglesGrid,
  'budget-selection': BudgetSelection,
}

export function getIllustration(slug: string): ComponentType<{ params: unknown }> | null {
  return ILLUSTRATIONS[slug] ?? null
}
