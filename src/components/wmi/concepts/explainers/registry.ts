import type { ComponentType } from 'react'
import CountObjectsExplainer from './CountObjectsExplainer'
import ShapePerimeterSquareExplainer from './ShapePerimeterSquareExplainer'

export interface ExplainerProps {
  params: unknown
  correctAnswer: string
}

export const EXPLAINERS: Record<string, ComponentType<ExplainerProps>> = {
  'count-objects': CountObjectsExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
