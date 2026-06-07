import type { ComponentType } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import StarRowsIllustration from './StarRowsIllustration'
import StarCountExplainer from './StarCountExplainer'
import ClockReadIllustration from './ClockReadIllustration'
import ClockReadExplainer from './ClockReadExplainer'
import WhiteCircleSquareIllustration from './WhiteCircleSquareIllustration'
import WhiteCircleSquareExplainer from './WhiteCircleSquareExplainer'
import BalanceScaleIllustration from './BalanceScaleIllustration'
import BalanceScaleExplainer from './BalanceScaleExplainer'
import ShapeCountChartIllustration from './ShapeCountChartIllustration'
import ShapeCountChartExplainer from './ShapeCountChartExplainer'
import SecondLongestIllustration from './SecondLongestIllustration'
import SecondLongestExplainer from './SecondLongestExplainer'
import CountSquaresIllustration from './CountSquaresIllustration'
import CountSquaresExplainer from './CountSquaresExplainer'
import NumberPatternIllustration from './NumberPatternIllustration'
import NumberPatternExplainer from './NumberPatternExplainer'
import PathGridIllustration from './PathGridIllustration'
import PathGridExplainer from './PathGridExplainer'
import NumberFlowIllustration from './NumberFlowIllustration'
import NumberFlowExplainer from './NumberFlowExplainer'
import LockCodeIllustration from './LockCodeIllustration'
import LockCodeExplainer from './LockCodeExplainer'
import KenKenGridIllustration from './KenKenGridIllustration'
import KenKenExplainer from './KenKenExplainer'
import ArrowGridIllustration from './ArrowGridIllustration'
import ArrowGridExplainer from './ArrowGridExplainer'

interface QuestionVisual {
  Illustration?: ComponentType
  Explainer?: ComponentType<ExplainerProps>
}

const VISUALS: Record<string, QuestionVisual> = {
  'WMI-19F1-Q1': { Illustration: StarRowsIllustration, Explainer: StarCountExplainer },
  'WMI-19F1-Q4': { Illustration: SecondLongestIllustration, Explainer: SecondLongestExplainer },
  'WMI-19F1-Q6': { Illustration: ClockReadIllustration, Explainer: ClockReadExplainer },
  'WMI-19F1-Q8': { Illustration: WhiteCircleSquareIllustration, Explainer: WhiteCircleSquareExplainer },
  'WMI-19F1-Q10': { Illustration: NumberPatternIllustration, Explainer: NumberPatternExplainer },
  'WMI-19F1-Q11': { Illustration: BalanceScaleIllustration, Explainer: BalanceScaleExplainer },
  'WMI-19F1-Q15': { Illustration: ShapeCountChartIllustration, Explainer: ShapeCountChartExplainer },
  'WMI-19F1-Q17': { Illustration: CountSquaresIllustration, Explainer: CountSquaresExplainer },
  'WMI-19F1-Q19': { Illustration: PathGridIllustration, Explainer: PathGridExplainer },
  'WMI-19F1-Q22': { Illustration: NumberFlowIllustration, Explainer: NumberFlowExplainer },
  'WMI-19F1-Q23': { Illustration: LockCodeIllustration, Explainer: LockCodeExplainer },
  'WMI-19F1-Q24': { Illustration: KenKenGridIllustration, Explainer: KenKenExplainer },
  'WMI-19F1-Q25': { Illustration: ArrowGridIllustration, Explainer: ArrowGridExplainer },
}

export function getQuestionIllustration(code?: string): ComponentType | null {
  return (code && VISUALS[code]?.Illustration) || null
}

export function getQuestionExplainer(code?: string): ComponentType<ExplainerProps> | null {
  return (code && VISUALS[code]?.Explainer) || null
}
