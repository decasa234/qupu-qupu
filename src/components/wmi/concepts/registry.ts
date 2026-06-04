import type { ComponentType } from 'react'
import CountObjects from './count-objects'
import ShapePerimeterSquare from './shape-perimeter-square'
import ClockReadTime from './clock-read-time'
import ShapePerimeterRectangle from './shape-perimeter-rectangle'
import BarChartCompare from './bar-chart-compare'

export const ILLUSTRATIONS: Record<string, ComponentType<{ params: unknown }>> = {
  'count-objects': CountObjects,
  'shape-perimeter-square': ShapePerimeterSquare,
  'clock-read-time': ClockReadTime,
  'shape-perimeter-rectangle': ShapePerimeterRectangle,
  'bar-chart-compare': BarChartCompare,
}

export function getIllustration(slug: string): ComponentType<{ params: unknown }> | null {
  return ILLUSTRATIONS[slug] ?? null
}
