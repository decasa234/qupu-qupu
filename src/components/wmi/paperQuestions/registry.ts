import type { ComponentType } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import type { WmiChoice } from '../../../types/wmi'
import ShapeCountOption from './ShapeCountOption'
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
import ShapeEquationIllustration from './ShapeEquationIllustration'
import ShapeEquationExplainer from './ShapeEquationExplainer'
import CardsSmallestNumberIllustration from './CardsSmallestNumberIllustration'
import CardsSmallestNumberExplainer from './CardsSmallestNumberExplainer'
import ShapeCountG2Illustration from './ShapeCountG2Illustration'
import ShapeCountG2Explainer from './ShapeCountG2Explainer'
import PatternNinthG2Illustration from './PatternNinthG2Illustration'
import PatternNinthG2Explainer from './PatternNinthG2Explainer'
import ClockReadG2Illustration from './ClockReadG2Illustration'
import ClockReadG2Explainer from './ClockReadG2Explainer'
import EqualPartsG2Illustration from './EqualPartsG2Illustration'
import EqualPartsG2Explainer from './EqualPartsG2Explainer'
import TrianglePatternG2Illustration from './TrianglePatternG2Illustration'
import TrianglePatternG2Explainer from './TrianglePatternG2Explainer'
import AnimalWeightsG2Illustration from './AnimalWeightsG2Illustration'
import AnimalWeightsG2Explainer from './AnimalWeightsG2Explainer'
import SubtractionShapesG2Illustration from './SubtractionShapesG2Illustration'
import SubtractionShapesG2Explainer from './SubtractionShapesG2Explainer'
import CountSquaresG2Illustration from './CountSquaresG2Illustration'
import CountSquaresG2Explainer from './CountSquaresG2Explainer'
import BalanceTwoScalesG2Illustration from './BalanceTwoScalesG2Illustration'
import BalanceTwoScalesG2Explainer from './BalanceTwoScalesG2Explainer'
import LockCodeG2Illustration from './LockCodeG2Illustration'
import LockCodeG2Explainer from './LockCodeG2Explainer'
import SumTo2019G2Illustration from './SumTo2019G2Illustration'
import SumTo2019G2Explainer from './SumTo2019G2Explainer'
import KenKenG2Illustration from './KenKenG2Illustration'
import KenKenG2Explainer from './KenKenG2Explainer'
import ArrowGridG2Illustration from './ArrowGridG2Illustration'
import ArrowGridG2Explainer from './ArrowGridG2Explainer'

interface QuestionVisual {
  Illustration?: ComponentType
  Explainer?: ComponentType<ExplainerProps>
}

const VISUALS: Record<string, QuestionVisual> = {
  'WMI-19F1A-Q1': { Illustration: StarRowsIllustration, Explainer: StarCountExplainer },
  'WMI-19F1A-Q4': { Illustration: SecondLongestIllustration, Explainer: SecondLongestExplainer },
  'WMI-19F1A-Q6': { Illustration: ClockReadIllustration, Explainer: ClockReadExplainer },
  'WMI-19F1A-Q8': { Illustration: WhiteCircleSquareIllustration, Explainer: WhiteCircleSquareExplainer },
  'WMI-19F1A-Q10': { Illustration: NumberPatternIllustration, Explainer: NumberPatternExplainer },
  'WMI-19F1A-Q11': { Illustration: BalanceScaleIllustration, Explainer: BalanceScaleExplainer },
  'WMI-19F1A-Q15': { Illustration: ShapeCountChartIllustration, Explainer: ShapeCountChartExplainer },
  'WMI-19F1A-Q17': { Illustration: CountSquaresIllustration, Explainer: CountSquaresExplainer },
  'WMI-19F1A-Q18': { Illustration: ShapeEquationIllustration, Explainer: ShapeEquationExplainer },
  'WMI-19F1A-Q19': { Illustration: PathGridIllustration, Explainer: PathGridExplainer },
  'WMI-19F1A-Q22': { Illustration: NumberFlowIllustration, Explainer: NumberFlowExplainer },
  'WMI-19F1A-Q23': { Illustration: LockCodeIllustration, Explainer: LockCodeExplainer },
  'WMI-19F1A-Q24': { Illustration: KenKenGridIllustration, Explainer: KenKenExplainer },
  'WMI-19F1A-Q25': { Illustration: ArrowGridIllustration, Explainer: ArrowGridExplainer },
  'WMI-19F2A-Q2': { Illustration: CardsSmallestNumberIllustration, Explainer: CardsSmallestNumberExplainer },
  'WMI-19F2A-Q4': { Illustration: ShapeCountG2Illustration, Explainer: ShapeCountG2Explainer },
  'WMI-19F2A-Q5': { Illustration: PatternNinthG2Illustration, Explainer: PatternNinthG2Explainer },
  'WMI-19F2A-Q8': { Illustration: ClockReadG2Illustration, Explainer: ClockReadG2Explainer },
  'WMI-19F2A-Q10': { Illustration: EqualPartsG2Illustration, Explainer: EqualPartsG2Explainer },
  'WMI-19F2A-Q13': { Illustration: TrianglePatternG2Illustration, Explainer: TrianglePatternG2Explainer },
  'WMI-19F2A-Q14': { Illustration: AnimalWeightsG2Illustration, Explainer: AnimalWeightsG2Explainer },
  'WMI-19F2A-Q15': { Illustration: SubtractionShapesG2Illustration, Explainer: SubtractionShapesG2Explainer },
  'WMI-19F2A-Q17': { Illustration: CountSquaresG2Illustration, Explainer: CountSquaresG2Explainer },
  'WMI-19F2A-Q20': { Illustration: BalanceTwoScalesG2Illustration, Explainer: BalanceTwoScalesG2Explainer },
  'WMI-19F2A-Q22': { Illustration: LockCodeG2Illustration, Explainer: LockCodeG2Explainer },
  'WMI-19F2A-Q23': { Illustration: SumTo2019G2Illustration, Explainer: SumTo2019G2Explainer },
  'WMI-19F2A-Q24': { Illustration: KenKenG2Illustration, Explainer: KenKenG2Explainer },
  'WMI-19F2A-Q25': { Illustration: ArrowGridG2Illustration, Explainer: ArrowGridG2Explainer },
}

// Optional per-question renderer for the A/B/C/D choice content. When present,
// it replaces the plain choice text (e.g. shape-count options drawn as bar
// charts). The renderer binds to the choice's own text so it can't drift.
type ChoiceRenderer = ComponentType<{ choice: WmiChoice }>

const CHOICE_RENDERERS: Record<string, ChoiceRenderer> = {
  'WMI-19F1A-Q15': ShapeCountOption,
}

export function getQuestionChoiceRenderer(code?: string): ChoiceRenderer | null {
  return (code && CHOICE_RENDERERS[code]) || null
}

export function getQuestionIllustration(code?: string): ComponentType | null {
  return (code && VISUALS[code]?.Illustration) || null
}

export function getQuestionExplainer(code?: string): ComponentType<ExplainerProps> | null {
  return (code && VISUALS[code]?.Explainer) || null
}
