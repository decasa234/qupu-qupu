import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import type { WmiChoice } from '../../../types/wmi'

type Loader<T> = () => Promise<{ default: T }>

interface QuestionVisualLoaders {
  illustration?: Loader<ComponentType>
  explainer?: Loader<ComponentType<ExplainerProps>>
}

// Lazy loader per paper-question code — each illustration/explainer pair is
// code-split out of the main bundle and only downloaded when that question
// renders (illustration) or is revealed (explainer). Components that live in
// shared barrel files load that barrel's chunk on first use and reuse it.
const VISUALS: Record<string, QuestionVisualLoaders> = {
  'WMI-19F1A-Q1': {
    illustration: () => import('./StarRowsIllustration'),
    explainer: () => import('./StarCountExplainer'),
  },
  'WMI-19F1A-Q2': { explainer: () => import('./tryCheckExplainers').then((m) => ({ default: m.LargestTensG1Explainer })) },
  'WMI-19F1A-Q3': { explainer: () => import('./sequenceFillExplainers').then((m) => ({ default: m.SequenceFillG1Q3Explainer })) },
  'WMI-19F1A-Q4': {
    illustration: () => import('./SecondLongestIllustration'),
    explainer: () => import('./SecondLongestExplainer'),
  },
  'WMI-19F1A-Q5': { explainer: () => import('./BirdsTreeG1Explainer') },
  'WMI-19F1A-Q6': {
    illustration: () => import('./ClockReadIllustration'),
    explainer: () => import('./ClockReadExplainer'),
  },
  'WMI-19F1A-Q7': { explainer: () => import('./tryCheckExplainers').then((m) => ({ default: m.EqualsNineG1Explainer })) },
  'WMI-19F1A-Q8': { explainer: () => import('./WhiteCircleSquareExplainer') },
  'WMI-19F1A-Q9': { explainer: () => import('./ElevatorRideG1Explainer') },
  'WMI-19F1A-Q10': {
    illustration: () => import('./NumberPatternIllustration'),
    explainer: () => import('./NumberPatternExplainer'),
  },
  'WMI-19F1A-Q11': {
    illustration: () => import('./BalanceScaleIllustration'),
    explainer: () => import('./BalanceScaleExplainer'),
  },
  'WMI-19F1A-Q12': { explainer: () => import('./tryCheckExplainers').then((m) => ({ default: m.DigitRuleG1Explainer })) },
  'WMI-19F1A-Q13': { explainer: () => import('./tryCheckExplainers').then((m) => ({ default: m.CountSixesG1Explainer })) },
  'WMI-19F1A-Q14': { explainer: () => import('./tryCheckExplainers').then((m) => ({ default: m.TwoSignsG1Explainer })) },
  'WMI-19F1A-Q15': {
    illustration: () => import('./ShapeCountChartIllustration'),
    explainer: () => import('./ShapeCountChartExplainer'),
  },
  'WMI-19F1A-Q16': { explainer: () => import('./SumSeriesG2Explainer').then((m) => ({ default: m.SumSeriesG1Explainer })) },
  'WMI-19F1A-Q17': {
    illustration: () => import('./CountSquaresIllustration'),
    explainer: () => import('./CountSquaresExplainer'),
  },
  'WMI-19F1A-Q18': {
    illustration: () => import('./ShapeEquationIllustration'),
    explainer: () => import('./ShapeEquationExplainer'),
  },
  'WMI-19F1A-Q19': {
    illustration: () => import('./PathGridIllustration'),
    explainer: () => import('./PathGridExplainer'),
  },
  'WMI-19F1A-Q20': { explainer: () => import('./DigitArrangeExplainer') },
  'WMI-19F1A-Q21': { explainer: () => import('./DeleteMisfitVisualG1Explainer') },
  'WMI-19F1A-Q22': {
    illustration: () => import('./NumberFlowIllustration'),
    explainer: () => import('./NumberFlowExplainer'),
  },
  'WMI-19F1A-Q23': {
    illustration: () => import('./LockCodeIllustration'),
    explainer: () => import('./LockCodeExplainer'),
  },
  'WMI-19F1A-Q24': {
    illustration: () => import('./KenKenGridIllustration'),
    explainer: () => import('./KenKenExplainer'),
  },
  'WMI-19F1A-Q25': {
    illustration: () => import('./ArrowGridIllustration'),
    explainer: () => import('./ArrowGridExplainer'),
  },
  'WMI-19F2A-Q1': { explainer: () => import('./sequenceFillExplainers').then((m) => ({ default: m.SequenceFillG2Q1Explainer })) },
  'WMI-19F2A-Q2': {
    illustration: () => import('./CardsSmallestNumberIllustration'),
    explainer: () => import('./CardsSmallestNumberExplainer'),
  },
  'WMI-19F2A-Q3': { explainer: () => import('./MuseumFlowG2Explainer') },
  'WMI-19F2A-Q4': {
    illustration: () => import('./ShapeCountG2Illustration'),
    explainer: () => import('./ShapeCountG2Explainer'),
  },
  'WMI-19F2A-Q5': {
    illustration: () => import('./PatternNinthG2Illustration'),
    explainer: () => import('./PatternNinthG2Explainer'),
  },
  'WMI-19F2A-Q6': { explainer: () => import('./tryCheckExplainers').then((m) => ({ default: m.ProductGapG2Explainer })) },
  'WMI-19F2A-Q7': { explainer: () => import('./tryCheckExplainers').then((m) => ({ default: m.EqualsTwentyEightG2Explainer })) },
  'WMI-19F2A-Q8': {
    illustration: () => import('./ClockReadG2Illustration'),
    explainer: () => import('./ClockReadG2Explainer'),
  },
  // Q9 is the identical shape-equation problem as G1 Q18 (○=6, ☆=5, △=8 → △+☆=13);
  // reuse that figure + explainer rather than rebuilding them.
  'WMI-19F2A-Q9': {
    illustration: () => import('./ShapeEquationIllustration'),
    explainer: () => import('./ShapeEquationExplainer'),
  },
  'WMI-19F2A-Q10': {
    illustration: () => import('./EqualPartsG2Illustration'),
    explainer: () => import('./EqualPartsG2Explainer'),
  },
  // Q11 & Q12 are non-figure — teaching animations only (no source illustration).
  'WMI-19F2A-Q11': { explainer: () => import('./OddUnitsG2Explainer') },
  'WMI-19F2A-Q12': { explainer: () => import('./RulerMeasureG2Explainer') },
  'WMI-19F2A-Q13': {
    illustration: () => import('./TrianglePatternG2Illustration'),
    explainer: () => import('./TrianglePatternG2Explainer'),
  },
  'WMI-19F2A-Q14': {
    illustration: () => import('./AnimalWeightsG2Illustration'),
    explainer: () => import('./AnimalWeightsG2Explainer'),
  },
  'WMI-19F2A-Q15': {
    illustration: () => import('./SubtractionShapesG2Illustration'),
    explainer: () => import('./SubtractionShapesG2Explainer'),
  },
  'WMI-19F2A-Q16': { explainer: () => import('./SumSeriesG2Explainer') },
  'WMI-19F2A-Q17': {
    illustration: () => import('./CountSquaresG2Illustration'),
    explainer: () => import('./CountSquaresG2Explainer'),
  },
  'WMI-19F2A-Q18': { explainer: () => import('./GoatCountG2Explainer') },
  'WMI-19F2A-Q19': { explainer: () => import('./FlagCircleG2Explainer') },
  'WMI-19F2A-Q20': {
    illustration: () => import('./BalanceTwoScalesG2Illustration'),
    explainer: () => import('./BalanceTwoScalesG2Explainer'),
  },
  'WMI-19F2A-Q21': { explainer: () => import('./TwoDigitListG2Explainer') },
  'WMI-19F2A-Q22': {
    illustration: () => import('./LockCodeG2Illustration'),
    explainer: () => import('./LockCodeG2Explainer'),
  },
  'WMI-19F2A-Q23': {
    illustration: () => import('./SumTo2019G2Illustration'),
    explainer: () => import('./SumTo2019G2Explainer'),
  },
  // Q24 is the same KenKen as G1 Q24 (same givens, labels, answer 2134; the G2
  // cage reconstruction was faulty — a 2-cell "10+" is impossible with 1–4).
  // Reuse the G1 figure + row-by-row solving explainer.
  'WMI-19F2A-Q24': {
    illustration: () => import('./KenKenGridIllustration'),
    explainer: () => import('./KenKenExplainer'),
  },
  // Q25 reuses the G1 arrow-grid figure + explainer (same answer 2211) per request.
  'WMI-19F2A-Q25': {
    illustration: () => import('./ArrowGridIllustration'),
    explainer: () => import('./ArrowGridExplainer'),
  },
  'WMI-19F3A-Q1': { explainer: () => import('./tryCheckExplainersG3').then((m) => ({ default: m.ComputeChainG3Explainer })) },
  'WMI-19F3A-Q2': { explainer: () => import('./FractionThirdG3Explainer') },
  'WMI-19F3A-Q3': {
    illustration: () => import('./TempChartG3Illustration'),
    explainer: () => import('./TempChartG3Explainer'),
  },
  'WMI-19F3A-Q4': { explainer: () => import('./RopeSquareG3Explainer') },
  'WMI-19F3A-Q5': { explainer: () => import('./tryCheckExplainersG3').then((m) => ({ default: m.AgesSumG3Explainer })) },
  'WMI-19F3A-Q6': { explainer: () => import('./tryCheckExplainersG3').then((m) => ({ default: m.SecondLargestResultG3Explainer })) },
  'WMI-19F3A-Q7': {
    illustration: () => import('./EqualFractionsG3Illustration'),
    explainer: () => import('./EqualFractionsG3VisualExplainer'),
  },
  'WMI-19F3A-Q8': { explainer: () => import('./TwoNumbersBarG3Explainer') },
  'WMI-19F3A-Q9': {
    illustration: () => import('./PatternCycleG3Illustration'),
    explainer: () => import('./PatternCycleG3VisualExplainer'),
  },
  'WMI-19F3A-Q10': { explainer: () => import('./groupBarExplainersG3').then((m) => ({ default: m.SharedFourVisualG3Explainer })) },
  'WMI-19F3A-Q11': {
    illustration: () => import('./ShadedTreeG3Illustration'),
    explainer: () => import('./ShadedTreeG3Explainer'),
  },
  'WMI-19F3A-Q12': {
    illustration: () => import('./ProductPyramidG3Illustration'),
    explainer: () => import('./ProductPyramidG3Explainer'),
  },
  'WMI-19F3A-Q13': { explainer: () => import('./tryCheckExplainersG3').then((m) => ({ default: m.MistakenSignG3Explainer })) },
  'WMI-19F3A-Q14': {
    illustration: () => import('./StairPerimeterG3Illustration'),
    explainer: () => import('./StairPerimeterG3Explainer'),
  },
  'WMI-19F3A-Q15': { explainer: () => import('./tryCheckExplainersG3').then((m) => ({ default: m.TwoEquationsG3Explainer })) },
  'WMI-19F3A-Q16': { explainer: () => import('./groupBarExplainersG3').then((m) => ({ default: m.SharedFortyFiveVisualG3Explainer })) },
  // Q18 is the identical sorted-list problem as G2 Q21 — reuse its explainer.
  'WMI-19F3A-Q18': { explainer: () => import('./TwoDigitListG2Explainer') },
  'WMI-19F3A-Q17': {
    illustration: () => import('./MShapeLinesG3Illustration'),
    explainer: () => import('./MShapeLinesG3Explainer'),
  },
  'WMI-19F3A-Q19': {
    illustration: () => import('./DotSquaresG3Illustration'),
    explainer: () => import('./DotSquaresG3Explainer'),
  },
  'WMI-19F3A-Q20': { explainer: () => import('./BalloonsVisualG3Explainer') },
  // Q21 is the identical lock puzzle as G2 Q22 (same five clues, code 527).
  'WMI-19F3A-Q21': {
    illustration: () => import('./LockCodeG2Illustration'),
    explainer: () => import('./LockCodeG2Explainer'),
  },
  'WMI-19F3A-Q22': {
    illustration: () => import('./VerticalMultG3Illustration'),
    explainer: () => import('./VerticalMultG3Explainer'),
  },
  'WMI-19F3A-Q23': {
    illustration: () => import('./DieSumsG3Illustration'),
    explainer: () => import('./DieSumsG3Explainer'),
  },
  'WMI-19F3A-Q24': {
    illustration: () => import('./Mathdoku5G3Illustration'),
    explainer: () => import('./Mathdoku5G3Explainer'),
  },
  'WMI-19F3A-Q25': {
    illustration: () => import('./SkyscraperG3Illustration'),
    explainer: () => import('./SkyscraperG3Explainer'),
  },
  'WMI-20F1A-Q1': { explainer: () => import('./MakeTenVisual20Explainer') },
  'WMI-20F1A-Q2': {
    illustration: () => import('./VerticalSub20Illustration'),
    explainer: () => import('./tryCheckExplainers20F1A').then((m) => ({ default: m.SubToTen20Explainer })),
  },
  'WMI-20F1A-Q3': {
    illustration: () => import('./RibbonClips20Illustration'),
    explainer: () => import('./RibbonClips20Explainer'),
  },
  'WMI-20F1A-Q4': {
    illustration: () => import('./ShapeGrid20Illustration'),
    explainer: () => import('./ShapeGrid20Explainer'),
  },
  'WMI-20F1A-Q5': { explainer: () => import('./tryCheckExplainers20F1A').then((m) => ({ default: m.EvenCount20Explainer })) },
  'WMI-20F1A-Q6': {
    illustration: () => import('./ClockMatch20Illustration'),
    explainer: () => import('./ClockMatch20Explainer'),
  },
  'WMI-20F1A-Q7': {
    illustration: () => import('./Thermometer20Illustration'),
    explainer: () => import('./Thermometer20Explainer'),
  },
  // Q8 deliberately has NO in-card calendar — kids must solve it with day
  // arithmetic; the explainer teaches the anchor-date ± 7 method.
  'WMI-20F1A-Q8': { explainer: () => import('./BalletCalendar20Explainer') },
  'WMI-20F1A-Q9': {
    illustration: () => import('./Spinner20Illustration'),
    explainer: () => import('./Spinner20Explainer'),
  },
  'WMI-20F1A-Q10': {
    illustration: () => import('./CherryCount20Illustration'),
    explainer: () => import('./CherryCount20Explainer'),
  },
  'WMI-20F1A-Q11': { explainer: () => import('./tryCheckExplainers20F1A').then((m) => ({ default: m.BoxToSixteen20Explainer })) },
  'WMI-20F1A-Q12': {
    illustration: () => import('./TrianglePattern20Illustration'),
    explainer: () => import('./TrianglePattern20Explainer'),
  },
  'WMI-20F1A-Q13': {
    illustration: () => import('./JoinPieces20Illustration'),
    explainer: () => import('./JoinPieces20Explainer'),
  },
  // Q14: SVG reproduction of the houses/bird/sun scene; the explainer is a
  // tally board, the options render as mini count-tables.
  'WMI-20F1A-Q14': {
    illustration: () => import('./HousesScene20Illustration'),
    explainer: () => import('./ShapeTally20Explainer'),
  },
  'WMI-20F1A-Q15': {
    illustration: () => import('./FruitMaze20Illustration'),
    explainer: () => import('./FruitMaze20Explainer'),
  },
  'WMI-20F1A-Q16': {
    illustration: () => import('./Matchstick20Illustration'),
    explainer: () => import('./Matchstick20Explainer'),
  },
  'WMI-20F1A-Q17': {
    illustration: () => import('./PieceHunt20Illustration'),
    explainer: () => import('./PieceHunt20Explainer'),
  },
  'WMI-20F1A-Q18': { explainer: () => import('./tryCheckExplainers20F1A').then((m) => ({ default: m.FriendlyPairs20Explainer })) },
  'WMI-20F1A-Q19': {
    illustration: () => import('./SumGrid20Illustration'),
    explainer: () => import('./SumGrid20Explainer'),
  },
  'WMI-20F1A-Q20': {
    illustration: () => import('./TriangleColors20Illustration'),
    explainer: () => import('./TriangleColors20Explainer'),
  },
  'WMI-20F1A-Q21': {
    illustration: () => import('./Pyramid20Illustration'),
    explainer: () => import('./Pyramid20Explainer'),
  },
  'WMI-20F1A-Q22': {
    illustration: () => import('./PaintRoll20Illustration'),
    explainer: () => import('./PaintRoll20Explainer'),
  },
  'WMI-20F1A-Q23': {
    illustration: () => import('./FruitSubtraction20Illustration'),
    explainer: () => import('./FruitSubtraction20Explainer'),
  },
  'WMI-20F1A-Q24': {
    illustration: () => import('./KenKen20Illustration'),
    explainer: () => import('./KenKen20Explainer'),
  },
  'WMI-20F1A-Q25': {
    illustration: () => import('./ThreeScales20Illustration'),
    explainer: () => import('./ThreeScales20Explainer'),
  },
  'WMI-20F2A-Q1': {
    illustration: () => import('./cards20G2Illustrations').then((m) => ({ default: m.SumCard20G2Illustration })),
    explainer: () => import('./tryCheckExplainers20G2').then((m) => ({ default: m.ComputeChain20G2Explainer })),
  },
  'WMI-20F2A-Q2': {
    illustration: () => import('./SchoolLettersG2Explainer').then((m) => ({ default: m.SchoolLettersG2Illustration })),
    explainer: () => import('./SchoolLettersG2Explainer'),
  },
  'WMI-20F2A-Q3': {
    illustration: () => import('./ShapesSquaresG2Illustration'),
    explainer: () => import('./ShapesSquaresG2Explainer'),
  },
  'WMI-20F2A-Q4': {
    illustration: () => import('./cards20G2Illustrations').then((m) => ({ default: m.BubblesG2Illustration })),
    explainer: () => import('./tryCheckExplainers20G2').then((m) => ({ default: m.OrderNumbers20G2Explainer })),
  },
  'WMI-20F2A-Q5': {
    illustration: () => import('./BaseTenBlocksG2Explainer').then((m) => ({ default: m.BaseTenBlocksG2Illustration })),
    explainer: () => import('./BaseTenBlocksG2Explainer'),
  },
  'WMI-20F2A-Q6': {
    illustration: () => import('./cards20G2Illustrations').then((m) => ({ default: m.MissingMinuendCard20G2Illustration })),
    explainer: () => import('./tryCheckExplainers20G2').then((m) => ({ default: m.MissingMinuend20G2Explainer })),
  },
  'WMI-20F2A-Q7': {
    illustration: () => import('./scenes20G2Illustrations').then((m) => ({ default: m.ClockSequenceG2Illustration })),
    explainer: () => import('./ClockTurnG2Explainer'),
  },
  'WMI-20F2A-Q8': {
    illustration: () => import('./scenes20G2Illustrations').then((m) => ({ default: m.FruitGridG2Illustration })),
    explainer: () => import('./FruitCountG2Explainer'),
  },
  'WMI-20F2A-Q9': {
    illustration: () => import('./cards20G2Illustrations').then((m) => ({ default: m.RangeCard20G2Illustration })),
    explainer: () => import('./tryCheckExplainers20G2').then((m) => ({ default: m.ProductRange20G2Explainer })),
  },
  'WMI-20F2A-Q10': { illustration: () => import('./scenes20G2Illustrations').then((m) => ({ default: m.RosesG2Illustration })) },
  'WMI-20F2A-Q11': {
    illustration: () => import('./scenes20G2Illustrations').then((m) => ({ default: m.MinuteSectionsG2Illustration })),
    explainer: () => import('./tryCheckExplainers20G2').then((m) => ({ default: m.MinuteTicks20G2Explainer })),
  },
  'WMI-20F2A-Q12': { illustration: () => import('./cards20G2Illustrations').then((m) => ({ default: m.HeartSpadeSeqG2Illustration })) },
  'WMI-20F2A-Q13': {
    illustration: () => import('./cards20G2Illustrations').then((m) => ({ default: m.DigitCluesG2Illustration })),
    explainer: () => import('./tryCheckExplainers20G2').then((m) => ({ default: m.DigitClues20G2Explainer })),
  },
  'WMI-20F2A-Q14': { illustration: () => import('./scenes20G2Illustrations').then((m) => ({ default: m.PatternRowsG2Illustration })) },
  'WMI-20F2A-Q15': { illustration: () => import('./scenes20G2Illustrations').then((m) => ({ default: m.NumberLineHopsG2Illustration })) },
  'WMI-20F2A-Q16': {
    illustration: () => import('./cards20G2Illustrations').then((m) => ({ default: m.FivesCard20G2Illustration })),
    explainer: () => import('./tryCheckExplainers20G2').then((m) => ({ default: m.OrderOps20G2Explainer })),
  },
  'WMI-20F2A-Q17': {
    illustration: () => import('./cards20G2Illustrations').then((m) => ({ default: m.DigitCards20G2Illustration })),
    explainer: () => import('./tryCheckExplainers20G2').then((m) => ({ default: m.EvenExtremes20G2Explainer })),
  },
  'WMI-20F2A-Q18': { illustration: () => import('./puzzles20G2Illustrations').then((m) => ({ default: m.GridSumsG2Illustration })) },
  'WMI-20F2A-Q19': { illustration: () => import('./puzzles20G2Illustrations').then((m) => ({ default: m.RepdigitAddG2Illustration })) },
  'WMI-20F2A-Q20': { illustration: () => import('./scenes20G2Illustrations').then((m) => ({ default: m.WeatherDaysG2Illustration })) },
  'WMI-20F2A-Q21': { illustration: () => import('./puzzles20G2Illustrations').then((m) => ({ default: m.CubeNetsG2Illustration })) },
  'WMI-20F2A-Q22': { illustration: () => import('./puzzles20G2Illustrations').then((m) => ({ default: m.BalanceScalesG2Illustration })) },
  'WMI-20F2A-Q23': { illustration: () => import('./puzzles20G2Illustrations').then((m) => ({ default: m.SudokuExprG2Illustration })) },
  'WMI-20F2A-Q24': {
    illustration: () => import('./cards20G2Illustrations').then((m) => ({ default: m.NineCards20G2Illustration })),
    explainer: () => import('./tryCheckExplainers20G2').then((m) => ({ default: m.CardCombos20G2Explainer })),
  },
  'WMI-20F2A-Q25': { illustration: () => import('./puzzles20G2Illustrations').then((m) => ({ default: m.DigitGridG2Illustration })) },
  'WMI-20F3A-Q1': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.SumCard20G3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.ComputeChain20G3Explainer })),
  },
  'WMI-20F3A-Q2': {
    illustration: () => import('./scenes20G3Illustrations').then((m) => ({ default: m.WGridsG3Illustration })),
    explainer: () => import('./visualExplainers20G3'),
  },
  'WMI-20F3A-Q3': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.BoxUnder300G3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.UnderThreeHundred20G3Explainer })),
  },
  'WMI-20F3A-Q4': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.FractionBarsG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.SmallestFraction20G3Explainer })),
  },
  'WMI-20F3A-Q5': {
    illustration: () => import('./scenes20G3Illustrations').then((m) => ({ default: m.LampRowG3Illustration })),
    explainer: () => import('./visualExplainers20G3').then((m) => ({ default: m.LampGapsG3Explainer })),
  },
  'WMI-20F3A-Q6': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.OddRunG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.OddRun20G3Explainer })),
  },
  'WMI-20F3A-Q7': {
    illustration: () => import('./scenes20G3Illustrations').then((m) => ({ default: m.BoatGridG3Illustration })),
    explainer: () => import('./visualExplainers20G3').then((m) => ({ default: m.BoatAreaG3Explainer })),
  },
  'WMI-20F3A-Q8': {
    illustration: () => import('./scenes20G3Illustrations').then((m) => ({ default: m.TempTableG3Illustration })),
    explainer: () => import('./visualExplainers20G3').then((m) => ({ default: m.TempChartsG3Explainer })),
  },
  'WMI-20F3A-Q9': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.TripTimeG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.ClockBridge20G3Explainer })),
  },
  'WMI-20F3A-Q10': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.PerimeterSquareG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.PerimeterSquare20G3Explainer })),
  },
  'WMI-20F3A-Q11': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.FourLawsG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.WhichWrong20G3Explainer })),
  },
  'WMI-20F3A-Q12': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.DivisionChipsG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.DivisionList20G3Explainer })),
  },
  'WMI-20F3A-Q13': {
    illustration: () => import('./scenes20G3Illustrations').then((m) => ({ default: m.ShapeAdditionG3Illustration })),
    explainer: () => import('./visualExplainers20G3').then((m) => ({ default: m.ShapeAddG3Explainer })),
  },
  'WMI-20F3A-Q14': {
    illustration: () => import('./scenes20G3Illustrations').then((m) => ({ default: m.CirclePatternG3Illustration })),
    explainer: () => import('./visualExplainers20G3').then((m) => ({ default: m.CirclePatternG3Explainer })),
  },
  'WMI-20F3A-Q15': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.DigitStripG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.GreedyDigits20G3Explainer })),
  },
  'WMI-20F3A-Q16': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.NinetyNinesG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.NinetyNines20G3Explainer })),
  },
  'WMI-20F3A-Q17': {
    illustration: () => import('./puzzles20G3Illustrations').then((m) => ({ default: m.QuiltSquaresG3Illustration })),
    explainer: () => import('./gridExplainers20G3'),
  },
  'WMI-20F3A-Q18': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.DigitErrorsG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.DigitErrors20G3Explainer })),
  },
  'WMI-20F3A-Q19': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.CryptarithmG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.Cryptarithm20G3Explainer })),
  },
  'WMI-20F3A-Q20': {
    illustration: () => import('./puzzles20G3Illustrations').then((m) => ({ default: m.ThreeRectanglesG3Illustration })),
    explainer: () => import('./visualExplainers20G3').then((m) => ({ default: m.ThreeRectanglesG3Explainer })),
  },
  // Q21 is the identical nine-cards puzzle as 2020 G2 Q24 (same cards, sum 62,
  // 4 ways via drop-3-sum-29) — reuse that figure + explainer.
  'WMI-20F3A-Q21': {
    illustration: () => import('./cards20G2Illustrations').then((m) => ({ default: m.NineCards20G2Illustration })),
    explainer: () => import('./tryCheckExplainers20G2').then((m) => ({ default: m.CardCombos20G2Explainer })),
  },
  'WMI-20F3A-Q22': {
    illustration: () => import('./puzzles20G3Illustrations').then((m) => ({ default: m.SpiralGridG3Illustration })),
    explainer: () => import('./gridExplainers20G3').then((m) => ({ default: m.SpiralGridG3Explainer })),
  },
  'WMI-20F3A-Q23': {
    illustration: () => import('./puzzles20G3Illustrations').then((m) => ({ default: m.FootballTableG3Illustration })),
    explainer: () => import('./gridExplainers20G3').then((m) => ({ default: m.FootballG3Explainer })),
  },
  'WMI-20F3A-Q24': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.PasswordCluesG3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.PasswordFigures20G3Explainer })),
  },
  'WMI-20F3A-Q25': {
    illustration: () => import('./cards20G3Illustrations').then((m) => ({ default: m.SumGrid999G3Illustration })),
    explainer: () => import('./tryCheckExplainers20G3').then((m) => ({ default: m.SumTo999G3Explainer })),
  },
  'WMI-21F1A-Q1': {
    illustration: () => import('./cards21G1Illustrations').then((m) => ({ default: m.FourSubtractions21Illustration })),
    explainer: () => import('./tryCheckExplainers21G1').then((m) => ({ default: m.LargestResult21G1Explainer })),
  },
  'WMI-21F1A-Q2': {
    illustration: () => import('./scenes21G1Illustrations').then((m) => ({ default: m.AppleGrid21Illustration })),
    explainer: () => import('./visualExplainers21G1').then((m) => ({ default: m.AppleGrid21Explainer })),
  },
  'WMI-21F1A-Q3': { explainer: () => import('./puzzleExplainers21G1').then((m) => ({ default: m.Solids21Explainer })) },
  'WMI-21F1A-Q4': {
    illustration: () => import('./scenes21G1Illustrations').then((m) => ({ default: m.FruitRow21Illustration })),
    explainer: () => import('./visualExplainers21G1').then((m) => ({ default: m.FruitPattern21Explainer })),
  },
  'WMI-21F1A-Q5': {
    illustration: () => import('./scenes21G1Illustrations').then((m) => ({ default: m.Baskets21Illustration })),
    explainer: () => import('./visualExplainers21G1').then((m) => ({ default: m.Baskets21Explainer })),
  },
  'WMI-21F1A-Q6': {
    illustration: () => import('./cards21G1Illustrations').then((m) => ({ default: m.NumberStrip21Illustration })),
    explainer: () => import('./visualExplainers21G1').then((m) => ({ default: m.NumberStrip21Explainer })),
  },
  'WMI-21F1A-Q7': {
    illustration: () => import('./scenes21G1Illustrations').then((m) => ({ default: m.PaintGrid21Illustration })),
    explainer: () => import('./visualExplainers21G1').then((m) => ({ default: m.PaintGrid21Explainer })),
  },
  'WMI-21F1A-Q8': {
    illustration: () => import('./scenes21G1Illustrations').then((m) => ({ default: m.TriangleGrid21Illustration })),
    explainer: () => import('./visualExplainers21G1').then((m) => ({ default: m.TriangleFill21Explainer })),
  },
  'WMI-21F1A-Q9': { explainer: () => import('./tryCheckExplainers21G1').then((m) => ({ default: m.BusStop21G1Explainer })) },
  'WMI-21F1A-Q10': {
    illustration: () => import('./scenes21G1Illustrations').then((m) => ({ default: m.RopeBars21Illustration })),
    explainer: () => import('./visualExplainers21G1').then((m) => ({ default: m.RopePairs21Explainer })),
  },
  'WMI-21F1A-Q11': { explainer: () => import('./visualExplainers21G1').then((m) => ({ default: m.TicketQueue21Explainer })) },
  'WMI-21F1A-Q12': { explainer: () => import('./tryCheckExplainers21G1').then((m) => ({ default: m.DigitCount21G1Explainer })) },
  'WMI-21F1A-Q13': { explainer: () => import('./tryCheckExplainers21G1').then((m) => ({ default: m.ParkingLot21G1Explainer })) },
  'WMI-21F1A-Q14': {
    illustration: () => import('./scenes21G1Illustrations').then((m) => ({ default: m.Scales21Illustration })),
    explainer: () => import('./visualExplainers21G1').then((m) => ({ default: m.Seesaws21Explainer })),
  },
  'WMI-21F1A-Q15': { explainer: () => import('./tryCheckExplainers21G1').then((m) => ({ default: m.OddBox21G1Explainer })) },
  'WMI-21F1A-Q16': { explainer: () => import('./tryCheckExplainers21G1').then((m) => ({ default: m.ComputeChain21G1Explainer })) },
  'WMI-21F1A-Q17': { explainer: () => import('./tryCheckExplainers21G1').then((m) => ({ default: m.TensUnits21G1Explainer })) },
  'WMI-21F1A-Q18': {
    illustration: () => import('./puzzles21G1Illustrations').then((m) => ({ default: m.Balloons21Illustration })),
    explainer: () => import('./puzzleExplainers21G1').then((m) => ({ default: m.Balloons21Explainer })),
  },
  'WMI-21F1A-Q19': {
    illustration: () => import('./puzzles21G1Illustrations').then((m) => ({ default: m.ChainDiagram21Illustration })),
    explainer: () => import('./puzzleExplainers21G1').then((m) => ({ default: m.Chains21Explainer })),
  },
  'WMI-21F1A-Q20': { explainer: () => import('./visualExplainers21G1').then((m) => ({ default: m.QueueMiddle21Explainer })) },
  'WMI-21F1A-Q21': {
    illustration: () => import('./puzzles21G1Illustrations').then((m) => ({ default: m.BigCube21Illustration })),
    explainer: () => import('./puzzleExplainers21G1').then((m) => ({ default: m.BigCube21Explainer })),
  },
  'WMI-21F1A-Q22': {
    illustration: () => import('./puzzles21G1Illustrations').then((m) => ({ default: m.Circles22Illustration })),
    explainer: () => import('./puzzleExplainers21G1').then((m) => ({ default: m.Circles22Explainer })),
  },
  'WMI-21F1A-Q23': {
    illustration: () => import('./cards21G1Illustrations').then((m) => ({ default: m.ShapeCross21Illustration })),
    explainer: () => import('./tryCheckExplainers21G1').then((m) => ({ default: m.ShapeCross21G1Explainer })),
  },
  'WMI-21F1A-Q24': {
    illustration: () => import('./puzzles21G1Illustrations').then((m) => ({ default: m.Mobile21Illustration })),
    explainer: () => import('./puzzleExplainers21G1').then((m) => ({ default: m.Mobile21Explainer })),
  },
  'WMI-21F1A-Q25': {
    illustration: () => import('./puzzles21G1Illustrations').then((m) => ({ default: m.RabbitMaze21Illustration })),
    explainer: () => import('./puzzleExplainers21G1').then((m) => ({ default: m.RabbitMaze21Explainer })),
  },
  'WMI-21F2A-Q1': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.MatchProduct21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.MatchProduct21G2Explainer })),
  },
  'WMI-21F2A-Q2': {
    illustration: () => import('./scenes21G2Illustrations').then((m) => ({ default: m.Lines21G2Illustration })),
    explainer: () => import('./visualExplainers21G2').then((m) => ({ default: m.Lines21G2Explainer })),
  },
  'WMI-21F2A-Q3': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.CrossArray21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.CrossCount21G2Explainer })),
  },
  'WMI-21F2A-Q4': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.Calendar21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.CalendarDays21G2Explainer })),
  },
  'WMI-21F2A-Q5': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.SkipCount21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.SkipCount21G2Explainer })),
  },
  'WMI-21F2A-Q6': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.TwoClocks21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.TwoClocks21G2Explainer })),
  },
  'WMI-21F2A-Q7': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.TripleBox21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.TripleBox21G2Explainer })),
  },
  'WMI-21F2A-Q8': {
    illustration: () => import('./cards21G1Illustrations').then((m) => ({ default: m.TicketQueue21Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.BobQueue21G2Explainer })),
  },
  // Q9 reuses the 2021 G1 apple-grid figure (same printed grid); the explainer
  // marks the left and top-right neighbours instead.
  'WMI-21F2A-Q9': {
    illustration: () => import('./scenes21G1Illustrations').then((m) => ({ default: m.AppleGrid21Illustration })),
    explainer: () => import('./visualExplainers21G2').then((m) => ({ default: m.AppleProduct21G2Explainer })),
  },
  'WMI-21F2A-Q10': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.Pillars21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.TwoPillars21G2Explainer })),
  },
  'WMI-21F2A-Q11': {
    illustration: () => import('./scenes21G2Illustrations').then((m) => ({ default: m.Money21G2Illustration })),
    explainer: () => import('./visualExplainers21G2').then((m) => ({ default: m.Money21G2Explainer })),
  },
  'WMI-21F2A-Q12': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.BeeButterfly21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.BeeButterfly21G2Explainer })),
  },
  'WMI-21F2A-Q13': {
    illustration: () => import('./scenes21G2Illustrations').then((m) => ({ default: m.Words21G2Illustration })),
    explainer: () => import('./visualExplainers21G2').then((m) => ({ default: m.Letters21G2Explainer })),
  },
  'WMI-21F2A-Q14': {
    illustration: () => import('./scenes21G2Illustrations').then((m) => ({ default: m.Pieces21G2Illustration })),
    explainer: () => import('./visualExplainers21G2').then((m) => ({ default: m.Pieces21G2Explainer })),
  },
  'WMI-21F2A-Q15': {
    illustration: () => import('./scenes21G2Illustrations').then((m) => ({ default: m.BoxNet21G2Illustration })),
    explainer: () => import('./visualExplainers21G2').then((m) => ({ default: m.BoxNet21G2Explainer })),
  },
  'WMI-21F2A-Q16': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.RunningTotal21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.RunningTotal21G2Explainer })),
  },
  'WMI-21F2A-Q17': {
    illustration: () => import('./puzzles21G2Illustrations').then((m) => ({ default: m.ChainDiagram21G2Illustration })),
    explainer: () => import('./puzzleExplainers21G2').then((m) => ({ default: m.Chains21G2Explainer })),
  },
  'WMI-21F2A-Q18': {
    illustration: () => import('./puzzles21G2Illustrations').then((m) => ({ default: m.BigCube21G2Illustration })),
    explainer: () => import('./puzzleExplainers21G2').then((m) => ({ default: m.BigCube21G2Explainer })),
  },
  'WMI-21F2A-Q19': {
    illustration: () => import('./puzzles21G2Illustrations').then((m) => ({ default: m.Hexagons21G2Illustration })),
    explainer: () => import('./puzzleExplainers21G2').then((m) => ({ default: m.Hexagons21G2Explainer })),
  },
  'WMI-21F2A-Q20': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.FiveCards21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.FiveCards21G2Explainer })),
  },
  'WMI-21F2A-Q21': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.Staircase21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.Repdigit21G2Explainer })),
  },
  'WMI-21F2A-Q22': {
    illustration: () => import('./cards21G2Illustrations').then((m) => ({ default: m.CubeFaces21G2Illustration })),
    explainer: () => import('./tryCheckExplainers21G2').then((m) => ({ default: m.CubeFaces21G2Explainer })),
  },
  'WMI-21F2A-Q23': {
    illustration: () => import('./puzzles21G2Illustrations').then((m) => ({ default: m.Tower21G2Illustration })),
    explainer: () => import('./puzzleExplainers21G2').then((m) => ({ default: m.Tower21G2Explainer })),
  },
  'WMI-21F2A-Q24': {
    illustration: () => import('./puzzles21G2Illustrations').then((m) => ({ default: m.RabbitMaze21G2Illustration })),
    explainer: () => import('./puzzleExplainers21G2').then((m) => ({ default: m.RabbitMaze21G2Explainer })),
  },
  'WMI-21F2A-Q25': {
    illustration: () => import('./puzzles21G2Illustrations').then((m) => ({ default: m.Sudoku21G2Illustration })),
    explainer: () => import('./puzzleExplainers21G2').then((m) => ({ default: m.Sudoku21G2Explainer })),
  },
  'WMI-21F3A-Q1': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.Compute21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.Compute21G3Explainer })),
  },
  'WMI-21F3A-Q2': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.DigitsAB21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.DigitsAB21G3Explainer })),
  },
  'WMI-21F3A-Q3': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.FactorNine21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.FactorNine21G3Explainer })),
  },
  'WMI-21F3A-Q4': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.Bundles21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.Bundles21G3Explainer })),
  },
  'WMI-21F3A-Q5': {
    illustration: () => import('./scenes21G3Illustrations').then((m) => ({ default: m.StarGrid21G3Illustration })),
    explainer: () => import('./visualExplainers21G3').then((m) => ({ default: m.Star21G3Explainer })),
  },
  'WMI-21F3A-Q6': {
    illustration: () => import('./scenes21G3Illustrations').then((m) => ({ default: m.ChocolateBar21G3Illustration })),
    explainer: () => import('./visualExplainers21G3').then((m) => ({ default: m.Chocolate21G3Explainer })),
  },
  'WMI-21F3A-Q7': {
    illustration: () => import('./scenes21G3Illustrations').then((m) => ({ default: m.NotchedSquare21G3Illustration })),
    explainer: () => import('./visualExplainers21G3').then((m) => ({ default: m.Notch21G3Explainer })),
  },
  'WMI-21F3A-Q8': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.ClockTrip21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.ClockTrip21G3Explainer })),
  },
  'WMI-21F3A-Q9': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.Starfish21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.Starfish21G3Explainer })),
  },
  'WMI-21F3A-Q10': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.Archery21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.Archery21G3Explainer })),
  },
  'WMI-21F3A-Q11': {
    illustration: () => import('./scenes21G3Illustrations').then((m) => ({ default: m.DivingTable21G3Illustration })),
    explainer: () => import('./visualExplainers21G3').then((m) => ({ default: m.Diving21G3Explainer })),
  },
  'WMI-21F3A-Q12': {
    illustration: () => import('./scenes21G3Illustrations').then((m) => ({ default: m.ShadedGrids21G3Illustration })),
    explainer: () => import('./visualExplainers21G3').then((m) => ({ default: m.ShadedGrids21G3Explainer })),
  },
  'WMI-21F3A-Q13': {
    illustration: () => import('./scenes21G3Illustrations').then((m) => ({ default: m.Shelves21G3Illustration })),
    explainer: () => import('./visualExplainers21G3').then((m) => ({ default: m.Shelves21G3Explainer })),
  },
  'WMI-21F3A-Q14': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.SnakeDeal21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.SnakeDeal21G3Explainer })),
  },
  'WMI-21F3A-Q15': {
    illustration: () => import('./scenes21G3Illustrations').then((m) => ({ default: m.TallyMoney21G3Illustration })),
    explainer: () => import('./visualExplainers21G3').then((m) => ({ default: m.Tally21G3Explainer })),
  },
  'WMI-21F3A-Q16': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.SevenChain21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.SevenChain21G3Explainer })),
  },
  'WMI-21F3A-Q17': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.EvenSum21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.EvenSum21G3Explainer })),
  },
  'WMI-21F3A-Q18': {
    illustration: () => import('./scenes21G3Illustrations').then((m) => ({ default: m.FruitEquations21G3Illustration })),
    explainer: () => import('./visualExplainers21G3').then((m) => ({ default: m.Fruits21G3Explainer })),
  },
  'WMI-21F3A-Q19': {
    illustration: () => import('./puzzles21G3Illustrations').then((m) => ({ default: m.StreetMap21G3Illustration })),
    explainer: () => import('./puzzleExplainers21G3').then((m) => ({ default: m.StreetMap21G3Explainer })),
  },
  'WMI-21F3A-Q20': {
    illustration: () => import('./scenes21G3Illustrations').then((m) => ({ default: m.HexRings21G3Illustration })),
    explainer: () => import('./visualExplainers21G3').then((m) => ({ default: m.Hex21G3Explainer })),
  },
  'WMI-21F3A-Q21': {
    illustration: () => import('./scenes21G3Illustrations').then((m) => ({ default: m.SixRectangles21G3Illustration })),
    explainer: () => import('./visualExplainers21G3').then((m) => ({ default: m.SixRects21G3Explainer })),
  },
  'WMI-21F3A-Q22': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.Factor202121G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.Factor202121G3Explainer })),
  },
  'WMI-21F3A-Q23': {
    illustration: () => import('./cards21G3Illustrations').then((m) => ({ default: m.TripleABC21G3Illustration })),
    explainer: () => import('./tryCheckExplainers21G3').then((m) => ({ default: m.TripleABC21G3Explainer })),
  },
  'WMI-21F3A-Q24': {
    illustration: () => import('./puzzles21G3Illustrations').then((m) => ({ default: m.RabbitMaze21G3Illustration })),
    explainer: () => import('./puzzleExplainers21G3').then((m) => ({ default: m.RabbitMaze21G3Explainer })),
  },
  // Q25 is the IDENTICAL quadruple-clue sudoku printed in the G2 paper (same
  // givens, same quads, same answer 54123) — reuse those components.
  'WMI-21F3A-Q25': {
    illustration: () => import('./puzzles21G2Illustrations').then((m) => ({ default: m.Sudoku21G2Illustration })),
    explainer: () => import('./puzzleExplainers21G2').then((m) => ({ default: m.Sudoku21G2Explainer })),
  },
  'WMI-22F2A-Q1': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.Shark22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.Shark22G2Explainer })),
  },
  'WMI-22F2A-Q3': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.PaperStack22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.PaperStack22G2Explainer })),
  },
  'WMI-22F2A-Q5': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.Balls22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.Balls22G2Explainer })),
  },
  'WMI-22F2A-Q8': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.ThickLines22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.ThickLines22G2Explainer })),
  },
  'WMI-22F2A-Q10': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.ChildrenOrder22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.ChildrenOrder22G2Explainer })),
  },
  'WMI-22F2A-Q11': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.Targets22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.Targets22G2Explainer })),
  },
  'WMI-22F2A-Q12': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.EggPath22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.EggPath22G2Explainer })),
  },
  'WMI-22F2A-Q15': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.Cups22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.Cups22G2Explainer })),
  },
  'WMI-22F2A-Q16': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.Flowchart22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.Flowchart22G2Explainer })),
  },
  'WMI-22F2A-Q17': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.Balance22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.Balance22G2Explainer })),
  },
  'WMI-22F2A-Q18': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.SeatGrid22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.SeatGrid22G2Explainer })),
  },
  'WMI-22F2A-Q19': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.ShapeAddition22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.ShapeAddition22G2Explainer })),
  },
  'WMI-22F2A-Q20': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.PasswordDial22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.PasswordDial22G2Explainer })),
  },
  'WMI-22F2A-Q21': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.CardHands22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.CardHands22G2Explainer })),
  },
  'WMI-22F2A-Q23': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.Soldiers22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.Soldiers22G2Explainer })),
  },
  'WMI-22F2A-Q24': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.MirrorBlocks22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.MirrorBlocks22G2Explainer })),
  },
  'WMI-22F2A-Q25': {
    illustration: () => import('./paper22G2Visuals').then((m) => ({ default: m.TCover22G2Illustration })),
    explainer: () => import('./paper22G2Explainers').then((m) => ({ default: m.TCover22G2Explainer })),
  },
  // 2022 G3 (WMI-22F3A) — Paper A batch
  'WMI-22F3A-Q2': {
    illustration: () => import('./PieThirds22G3Illustration'),
    explainer: () => import('./PieThirds22G3Explainer'),
  },
  'WMI-22F3A-Q3': {
    illustration: () => import('./NestedTri22G3Illustration'),
    explainer: () => import('./NestedTri22G3Explainer'),
  },
  'WMI-22F3A-Q4': {
    illustration: () => import('./StreetMap22G3Illustration'),
    explainer: () => import('./StreetMap22G3Explainer'),
  },
  'WMI-22F3A-Q5': {
    illustration: () => import('./PaintedArea22G3Illustration'),
    explainer: () => import('./PaintedArea22G3Explainer'),
  },
  'WMI-22F3A-Q8': {
    illustration: () => import('./HalfShadeGrid22G3Illustration'),
    explainer: () => import('./HalfShadeGrid22G3Explainer'),
  },
  'WMI-22F3A-Q11': {
    illustration: () => import('./CubeNet22G3Illustration'),
    explainer: () => import('./CubeNet22G3Explainer'),
  },
  'WMI-22F3A-Q13': {
    illustration: () => import('./ChampionMedian22G3Illustration'),
    explainer: () => import('./ChampionMedian22G3Explainer'),
  },
}

// Optional per-question renderer for the A/B/C/D choice content. When present,
// it replaces the plain choice text (e.g. shape-count options drawn as bar
// charts). The renderer binds to the choice's own text so it can't drift.
type ChoiceRenderer = ComponentType<{ choice: WmiChoice }>

const CHOICE_RENDERERS: Record<string, Loader<ChoiceRenderer>> = {
  // 2022 G3: Q5 painted-area options, Q8 half-shade grid options.
  'WMI-22F3A-Q5': () => import('./PaintedArea22G3Illustration').then((m) => ({ default: m.PaintedArea22G3Option })),
  'WMI-22F3A-Q8': () => import('./HalfShadeGrid22G3Illustration').then((m) => ({ default: m.HalfShade22G3Option })),
  'WMI-19F1A-Q15': () => import('./ShapeCountOption'),
  'WMI-19F1A-Q8': () => import('./WhiteCircleSquareOption'),
  // G2 Q4 is the same shape-tally task — render its A–D options as bar charts too.
  'WMI-19F2A-Q4': () => import('./ShapeCountOption'),
  // G2 Q5 options are foods, not letters — draw the picture each option stands for.
  'WMI-19F2A-Q5': () => import('./PatternNinthG2Option'),
  // G3 Q2 options are shaded-fraction pictures.
  'WMI-19F3A-Q2': () => import('./FractionThirdG3Option'),
  // 2020 G1: Q4 options are the named shapes, Q6 options are analog clocks,
  // Q9 options are pattern swatches, Q13 options are polyomino shapes,
  // Q14 options are shape-count tables.
  'WMI-20F1A-Q4': () => import('./ShapeGridOption20'),
  'WMI-20F1A-Q6': () => import('./ClockOption20'),
  'WMI-20F1A-Q9': () => import('./SpinnerOption20'),
  'WMI-20F1A-Q13': () => import('./JoinPiecesOption20'),
  'WMI-20F1A-Q14': () => import('./ShapeTallyOption20'),
  // Q15 options are the circled fruit icons from the maze.
  'WMI-20F1A-Q15': () => import('./FruitMazeOption20'),
  // 2020 G2: Q7 options are clock faces with the pink arrow in four directions.
  'WMI-20F2A-Q7': () => import('./ClockTurnG2Option'),
  // 2020 G3: Q2 options are letter grids, Q8 options are line charts,
  // Q14 options are shape triples.
  'WMI-20F3A-Q2': () => import('./options20G3').then((m) => ({ default: m.WGridOption20G3 })),
  'WMI-20F3A-Q8': () => import('./options20G3').then((m) => ({ default: m.TempChartOption20G3 })),
  'WMI-20F3A-Q14': () => import('./options20G3').then((m) => ({ default: m.PatternOption20G3 })),
  // 2021 G1: Q3 options are cube solids, Q4 fruit pairs, Q10 rope pairs,
  // Q14 seesaw claims.
  'WMI-21F1A-Q3': () => import('./options21G1').then((m) => ({ default: m.SolidOption21 })),
  'WMI-21F1A-Q4': () => import('./options21G1').then((m) => ({ default: m.FruitPairOption21 })),
  'WMI-21F1A-Q10': () => import('./options21G1').then((m) => ({ default: m.RopePairOption21 })),
  'WMI-21F1A-Q14': () => import('./options21G1').then((m) => ({ default: m.SeesawOption21 })),
  // 2021 G2: Q2 options are the zigzag line figures.
  'WMI-21F2A-Q2': () => import('./options21G2').then((m) => ({ default: m.LineOption21G2 })),
  // 2021 G3: Q12 options are the shaded 3×3 grids.
  'WMI-21F3A-Q12': () => import('./options21G3').then((m) => ({ default: m.ShadedOption21G3 })),
  'WMI-22F2A-Q5': () => import('./paper22G2Visuals').then((m) => ({ default: m.BallOption22G2 })),
  'WMI-22F2A-Q8': () => import('./paper22G2Visuals').then((m) => ({ default: m.ThickLineOption22G2 })),
}

// Memoize lazy wrappers per question code so re-renders get the same component
// identity (a fresh lazy() each render would remount + reflow the visual).
const illustrationCache = new Map<string, LazyExoticComponent<ComponentType>>()
const explainerCache = new Map<string, LazyExoticComponent<ComponentType<ExplainerProps>>>()
const choiceRendererCache = new Map<string, LazyExoticComponent<ChoiceRenderer>>()

// Chunk-load resilience: retry the import once (transient network blip), and
// on a second failure EVICT the code from the cache so a later render gets a
// fresh lazy() instead of React's cached rejection — one failed fetch must
// not permanently kill the visual for the whole tab session.
function withRetryAndEviction<T>(
  code: string,
  load: Loader<T>,
  cache: Map<string, unknown>,
): Loader<T> {
  return () =>
    load()
      .catch(() => load())
      .catch((err) => {
        cache.delete(code)
        throw err
      })
}

export function getQuestionChoiceRenderer(code?: string): ChoiceRenderer | null {
  const load = code ? CHOICE_RENDERERS[code] : undefined
  if (!code || !load) return null
  let component = choiceRendererCache.get(code)
  if (!component) {
    component = lazy(withRetryAndEviction(code, load, choiceRendererCache))
    choiceRendererCache.set(code, component)
  }
  return component
}

export function getQuestionIllustration(code?: string): ComponentType | null {
  const load = code ? VISUALS[code]?.illustration : undefined
  if (!code || !load) return null
  let component = illustrationCache.get(code)
  if (!component) {
    component = lazy(withRetryAndEviction(code, load, illustrationCache))
    illustrationCache.set(code, component)
  }
  return component
}

export function getQuestionExplainer(code?: string): ComponentType<ExplainerProps> | null {
  const load = code ? VISUALS[code]?.explainer : undefined
  if (!code || !load) return null
  let component = explainerCache.get(code)
  if (!component) {
    component = lazy(withRetryAndEviction(code, load, explainerCache))
    explainerCache.set(code, component)
  }
  return component
}
