import type { ComponentType } from 'react'
import CountObjectsExplainer from './CountObjectsExplainer'
import ShapePerimeterSquareExplainer from './ShapePerimeterSquareExplainer'
import StorySumExplainer from './StorySumExplainer'

export interface ExplainerProps {
  params: unknown
  correctAnswer: string
  lang?: 'en' | 'id'
}

export const EXPLAINERS: Record<string, ComponentType<ExplainerProps>> = {
  'count-objects': CountObjectsExplainer,
  'shape-perimeter-square': ShapePerimeterSquareExplainer,
  'story-sum': StorySumExplainer,
}

export function getExplainer(slug: string): ComponentType<ExplainerProps> | null {
  return EXPLAINERS[slug] ?? null
}
