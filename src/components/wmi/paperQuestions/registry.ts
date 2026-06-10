import type { ComponentType } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import type { WmiChoice } from '../../../types/wmi'
import ShapeCountOption from './ShapeCountOption'
import WhiteCircleSquareOption from './WhiteCircleSquareOption'
import StarRowsIllustration from './StarRowsIllustration'
import StarCountExplainer from './StarCountExplainer'
import ClockReadIllustration from './ClockReadIllustration'
import ClockReadExplainer from './ClockReadExplainer'
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
import DigitArrangeExplainer from './DigitArrangeExplainer'
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
import OddUnitsG2Explainer from './OddUnitsG2Explainer'
import RulerMeasureG2Explainer from './RulerMeasureG2Explainer'
import PatternNinthG2Option from './PatternNinthG2Option'
import SumSeriesG2Explainer from './SumSeriesG2Explainer'
import GoatCountG2Explainer from './GoatCountG2Explainer'
import FlagCircleG2Explainer from './FlagCircleG2Explainer'
import TwoDigitListG2Explainer from './TwoDigitListG2Explainer'
import {
  LargestTensG1Explainer,
  EqualsNineG1Explainer,
  DigitRuleG1Explainer,
  CountSixesG1Explainer,
  TwoSignsG1Explainer,
  ProductGapG2Explainer,
  EqualsTwentyEightG2Explainer,
} from './tryCheckExplainers'
import BirdsTreeG1Explainer from './BirdsTreeG1Explainer'
import ElevatorRideG1Explainer from './ElevatorRideG1Explainer'
import DeleteMisfitVisualG1Explainer from './DeleteMisfitVisualG1Explainer'
import MuseumFlowG2Explainer from './MuseumFlowG2Explainer'
import { SequenceFillG1Q3Explainer, SequenceFillG2Q1Explainer } from './sequenceFillExplainers'
import { SumSeriesG1Explainer } from './SumSeriesG2Explainer'

interface QuestionVisual {
  Illustration?: ComponentType
  Explainer?: ComponentType<ExplainerProps>
}

const VISUALS: Record<string, QuestionVisual> = {
  'WMI-19F1A-Q1': { Illustration: StarRowsIllustration, Explainer: StarCountExplainer },
  'WMI-19F1A-Q2': { Explainer: LargestTensG1Explainer },
  'WMI-19F1A-Q3': { Explainer: SequenceFillG1Q3Explainer },
  'WMI-19F1A-Q4': { Illustration: SecondLongestIllustration, Explainer: SecondLongestExplainer },
  'WMI-19F1A-Q5': { Explainer: BirdsTreeG1Explainer },
  'WMI-19F1A-Q6': { Illustration: ClockReadIllustration, Explainer: ClockReadExplainer },
  'WMI-19F1A-Q7': { Explainer: EqualsNineG1Explainer },
  'WMI-19F1A-Q8': { Explainer: WhiteCircleSquareExplainer },
  'WMI-19F1A-Q9': { Explainer: ElevatorRideG1Explainer },
  'WMI-19F1A-Q10': { Illustration: NumberPatternIllustration, Explainer: NumberPatternExplainer },
  'WMI-19F1A-Q11': { Illustration: BalanceScaleIllustration, Explainer: BalanceScaleExplainer },
  'WMI-19F1A-Q12': { Explainer: DigitRuleG1Explainer },
  'WMI-19F1A-Q13': { Explainer: CountSixesG1Explainer },
  'WMI-19F1A-Q14': { Explainer: TwoSignsG1Explainer },
  'WMI-19F1A-Q15': { Illustration: ShapeCountChartIllustration, Explainer: ShapeCountChartExplainer },
  'WMI-19F1A-Q16': { Explainer: SumSeriesG1Explainer },
  'WMI-19F1A-Q17': { Illustration: CountSquaresIllustration, Explainer: CountSquaresExplainer },
  'WMI-19F1A-Q18': { Illustration: ShapeEquationIllustration, Explainer: ShapeEquationExplainer },
  'WMI-19F1A-Q19': { Illustration: PathGridIllustration, Explainer: PathGridExplainer },
  'WMI-19F1A-Q20': { Explainer: DigitArrangeExplainer },
  'WMI-19F1A-Q21': { Explainer: DeleteMisfitVisualG1Explainer },
  'WMI-19F1A-Q22': { Illustration: NumberFlowIllustration, Explainer: NumberFlowExplainer },
  'WMI-19F1A-Q23': { Illustration: LockCodeIllustration, Explainer: LockCodeExplainer },
  'WMI-19F1A-Q24': { Illustration: KenKenGridIllustration, Explainer: KenKenExplainer },
  'WMI-19F1A-Q25': { Illustration: ArrowGridIllustration, Explainer: ArrowGridExplainer },
  'WMI-19F2A-Q1': { Explainer: SequenceFillG2Q1Explainer },
  'WMI-19F2A-Q2': { Illustration: CardsSmallestNumberIllustration, Explainer: CardsSmallestNumberExplainer },
  'WMI-19F2A-Q3': { Explainer: MuseumFlowG2Explainer },
  'WMI-19F2A-Q4': { Illustration: ShapeCountG2Illustration, Explainer: ShapeCountG2Explainer },
  'WMI-19F2A-Q5': { Illustration: PatternNinthG2Illustration, Explainer: PatternNinthG2Explainer },
  'WMI-19F2A-Q6': { Explainer: ProductGapG2Explainer },
  'WMI-19F2A-Q7': { Explainer: EqualsTwentyEightG2Explainer },
  'WMI-19F2A-Q8': { Illustration: ClockReadG2Illustration, Explainer: ClockReadG2Explainer },
  // Q9 is the identical shape-equation problem as G1 Q18 (○=6, ☆=5, △=8 → △+☆=13);
  // reuse that figure + explainer rather than rebuilding them.
  'WMI-19F2A-Q9': { Illustration: ShapeEquationIllustration, Explainer: ShapeEquationExplainer },
  'WMI-19F2A-Q10': { Illustration: EqualPartsG2Illustration, Explainer: EqualPartsG2Explainer },
  // Q11 & Q12 are non-figure — teaching animations only (no source illustration).
  'WMI-19F2A-Q11': { Explainer: OddUnitsG2Explainer },
  'WMI-19F2A-Q12': { Explainer: RulerMeasureG2Explainer },
  'WMI-19F2A-Q13': { Illustration: TrianglePatternG2Illustration, Explainer: TrianglePatternG2Explainer },
  'WMI-19F2A-Q14': { Illustration: AnimalWeightsG2Illustration, Explainer: AnimalWeightsG2Explainer },
  'WMI-19F2A-Q15': { Illustration: SubtractionShapesG2Illustration, Explainer: SubtractionShapesG2Explainer },
  'WMI-19F2A-Q16': { Explainer: SumSeriesG2Explainer },
  'WMI-19F2A-Q17': { Illustration: CountSquaresG2Illustration, Explainer: CountSquaresG2Explainer },
  'WMI-19F2A-Q18': { Explainer: GoatCountG2Explainer },
  'WMI-19F2A-Q19': { Explainer: FlagCircleG2Explainer },
  'WMI-19F2A-Q20': { Illustration: BalanceTwoScalesG2Illustration, Explainer: BalanceTwoScalesG2Explainer },
  'WMI-19F2A-Q21': { Explainer: TwoDigitListG2Explainer },
  'WMI-19F2A-Q22': { Illustration: LockCodeG2Illustration, Explainer: LockCodeG2Explainer },
  'WMI-19F2A-Q23': { Illustration: SumTo2019G2Illustration, Explainer: SumTo2019G2Explainer },
  // Q24 is the same KenKen as G1 Q24 (same givens, labels, answer 2134; the G2
  // cage reconstruction was faulty — a 2-cell "10+" is impossible with 1–4).
  // Reuse the G1 figure + row-by-row solving explainer.
  'WMI-19F2A-Q24': { Illustration: KenKenGridIllustration, Explainer: KenKenExplainer },
  // Q25 reuses the G1 arrow-grid figure + explainer (same answer 2211) per request.
  'WMI-19F2A-Q25': { Illustration: ArrowGridIllustration, Explainer: ArrowGridExplainer },
}

// Optional per-question renderer for the A/B/C/D choice content. When present,
// it replaces the plain choice text (e.g. shape-count options drawn as bar
// charts). The renderer binds to the choice's own text so it can't drift.
type ChoiceRenderer = ComponentType<{ choice: WmiChoice }>

const CHOICE_RENDERERS: Record<string, ChoiceRenderer> = {
  'WMI-19F1A-Q15': ShapeCountOption,
  'WMI-19F1A-Q8': WhiteCircleSquareOption,
  // G2 Q4 is the same shape-tally task — render its A–D options as bar charts too.
  'WMI-19F2A-Q4': ShapeCountOption,
  // G2 Q5 options are foods, not letters — draw the picture each option stands for.
  'WMI-19F2A-Q5': PatternNinthG2Option,
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
