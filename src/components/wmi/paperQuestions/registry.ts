import type { ComponentType } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import CandyRowsIllustration from './CandyRowsIllustration'
import CandyCountExplainer from './CandyCountExplainer'

interface QuestionVisual {
  Illustration?: ComponentType
  Explainer?: ComponentType<ExplainerProps>
}

const VISUALS: Record<string, QuestionVisual> = {
  'WMI-19F1-Q1': { Illustration: CandyRowsIllustration, Explainer: CandyCountExplainer },
}

export function getQuestionIllustration(code?: string): ComponentType | null {
  return (code && VISUALS[code]?.Illustration) || null
}

export function getQuestionExplainer(code?: string): ComponentType<ExplainerProps> | null {
  return (code && VISUALS[code]?.Explainer) || null
}
