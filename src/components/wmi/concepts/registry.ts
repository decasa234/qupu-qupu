import type { ComponentType } from 'react'
import CountObjects from './count-objects'
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

export const ILLUSTRATIONS: Record<string, ComponentType<{ params: unknown }>> = {
  'count-objects': CountObjects,
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
}

export function getIllustration(slug: string): ComponentType<{ params: unknown }> | null {
  return ILLUSTRATIONS[slug] ?? null
}
