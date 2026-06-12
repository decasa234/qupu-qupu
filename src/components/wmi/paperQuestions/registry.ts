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
import {
  ComputeChainG3Explainer,
  AgesSumG3Explainer,
  SecondLargestResultG3Explainer,
  MistakenSignG3Explainer,
  TwoEquationsG3Explainer,
} from './tryCheckExplainersG3'
import BalloonsVisualG3Explainer from './BalloonsVisualG3Explainer'
import MShapeLinesG3Illustration from './MShapeLinesG3Illustration'
import MShapeLinesG3Explainer from './MShapeLinesG3Explainer'
import Mathdoku5G3Illustration from './Mathdoku5G3Illustration'
import Mathdoku5G3Explainer from './Mathdoku5G3Explainer'
import SkyscraperG3Illustration from './SkyscraperG3Illustration'
import SkyscraperG3Explainer from './SkyscraperG3Explainer'
import DotSquaresG3Illustration from './DotSquaresG3Illustration'
import DotSquaresG3Explainer from './DotSquaresG3Explainer'
import VerticalMultG3Illustration from './VerticalMultG3Illustration'
import VerticalMultG3Explainer from './VerticalMultG3Explainer'
import DieSumsG3Illustration from './DieSumsG3Illustration'
import DieSumsG3Explainer from './DieSumsG3Explainer'
import PatternCycleG3Illustration from './PatternCycleG3Illustration'
import PatternCycleG3VisualExplainer from './PatternCycleG3VisualExplainer'
import { SharedFourVisualG3Explainer, SharedFortyFiveVisualG3Explainer } from './groupBarExplainersG3'
import ShadedTreeG3Illustration from './ShadedTreeG3Illustration'
import ShadedTreeG3Explainer from './ShadedTreeG3Explainer'
import ProductPyramidG3Illustration from './ProductPyramidG3Illustration'
import ProductPyramidG3Explainer from './ProductPyramidG3Explainer'
import StairPerimeterG3Illustration from './StairPerimeterG3Illustration'
import StairPerimeterG3Explainer from './StairPerimeterG3Explainer'
import EqualFractionsG3Illustration from './EqualFractionsG3Illustration'
import EqualFractionsG3VisualExplainer from './EqualFractionsG3VisualExplainer'
import TwoNumbersBarG3Explainer from './TwoNumbersBarG3Explainer'
import FractionThirdG3Option from './FractionThirdG3Option'
import FractionThirdG3Explainer from './FractionThirdG3Explainer'
import TempChartG3Illustration from './TempChartG3Illustration'
import TempChartG3Explainer from './TempChartG3Explainer'
import RopeSquareG3Explainer from './RopeSquareG3Explainer'
import {
  SubToTen20Explainer,
  EvenCount20Explainer,
  BoxToSixteen20Explainer,
  FriendlyPairs20Explainer,
} from './tryCheckExplainers20F1A'
import {
  ComputeChain20G2Explainer,
  OrderNumbers20G2Explainer,
  MissingMinuend20G2Explainer,
  ProductRange20G2Explainer,
  MinuteTicks20G2Explainer,
  DigitClues20G2Explainer,
  OrderOps20G2Explainer,
  EvenExtremes20G2Explainer,
  CardCombos20G2Explainer,
} from './tryCheckExplainers20G2'
import SchoolLettersG2Explainer, { SchoolLettersG2Illustration } from './SchoolLettersG2Explainer'
import ShapesSquaresG2Illustration from './ShapesSquaresG2Illustration'
import ShapesSquaresG2Explainer from './ShapesSquaresG2Explainer'
import BaseTenBlocksG2Explainer, { BaseTenBlocksG2Illustration } from './BaseTenBlocksG2Explainer'
import ClockTurnG2Explainer from './ClockTurnG2Explainer'
import ClockTurnG2Option from './ClockTurnG2Option'
import FruitCountG2Explainer from './FruitCountG2Explainer'
import {
  SumCard20G2Illustration,
  BubblesG2Illustration,
  MissingMinuendCard20G2Illustration,
  RangeCard20G2Illustration,
  HeartSpadeSeqG2Illustration,
  DigitCluesG2Illustration,
  FivesCard20G2Illustration,
  DigitCards20G2Illustration,
  NineCards20G2Illustration,
} from './cards20G2Illustrations'
import {
  ClockSequenceG2Illustration,
  FruitGridG2Illustration,
  RosesG2Illustration,
  MinuteSectionsG2Illustration,
  PatternRowsG2Illustration,
  NumberLineHopsG2Illustration,
  WeatherDaysG2Illustration,
} from './scenes20G2Illustrations'
import {
  GridSumsG2Illustration,
  RepdigitAddG2Illustration,
  CubeNetsG2Illustration,
  BalanceScalesG2Illustration,
  SudokuExprG2Illustration,
  DigitGridG2Illustration,
} from './puzzles20G2Illustrations'
import MakeTenVisual20Explainer from './MakeTenVisual20Explainer'
import VerticalSub20Illustration from './VerticalSub20Illustration'
import HousesScene20Illustration from './HousesScene20Illustration'
import ShapeGridOption20 from './ShapeGridOption20'
import SpinnerOption20 from './SpinnerOption20'
import FruitMazeOption20 from './FruitMazeOption20'
import RibbonClips20Illustration from './RibbonClips20Illustration'
import RibbonClips20Explainer from './RibbonClips20Explainer'
import ShapeGrid20Illustration from './ShapeGrid20Illustration'
import ShapeGrid20Explainer from './ShapeGrid20Explainer'
import ClockMatch20Illustration from './ClockMatch20Illustration'
import ClockMatch20Explainer from './ClockMatch20Explainer'
import ClockOption20 from './ClockOption20'
import Thermometer20Illustration from './Thermometer20Illustration'
import Thermometer20Explainer from './Thermometer20Explainer'
import BalletCalendar20Explainer from './BalletCalendar20Explainer'
import Spinner20Illustration from './Spinner20Illustration'
import Spinner20Explainer from './Spinner20Explainer'
import CherryCount20Illustration from './CherryCount20Illustration'
import CherryCount20Explainer from './CherryCount20Explainer'
import TrianglePattern20Illustration from './TrianglePattern20Illustration'
import TrianglePattern20Explainer from './TrianglePattern20Explainer'
import JoinPieces20Illustration from './JoinPieces20Illustration'
import JoinPieces20Explainer from './JoinPieces20Explainer'
import JoinPiecesOption20 from './JoinPiecesOption20'
import ShapeTally20Explainer from './ShapeTally20Explainer'
import ShapeTallyOption20 from './ShapeTallyOption20'
import FruitMaze20Illustration from './FruitMaze20Illustration'
import FruitMaze20Explainer from './FruitMaze20Explainer'
import Matchstick20Illustration from './Matchstick20Illustration'
import Matchstick20Explainer from './Matchstick20Explainer'
import PieceHunt20Illustration from './PieceHunt20Illustration'
import PieceHunt20Explainer from './PieceHunt20Explainer'
import SumGrid20Illustration from './SumGrid20Illustration'
import SumGrid20Explainer from './SumGrid20Explainer'
import TriangleColors20Illustration from './TriangleColors20Illustration'
import TriangleColors20Explainer from './TriangleColors20Explainer'
import Pyramid20Illustration from './Pyramid20Illustration'
import Pyramid20Explainer from './Pyramid20Explainer'
import PaintRoll20Illustration from './PaintRoll20Illustration'
import PaintRoll20Explainer from './PaintRoll20Explainer'
import FruitSubtraction20Illustration from './FruitSubtraction20Illustration'
import FruitSubtraction20Explainer from './FruitSubtraction20Explainer'
import KenKen20Illustration from './KenKen20Illustration'
import KenKen20Explainer from './KenKen20Explainer'
import ThreeScales20Illustration from './ThreeScales20Illustration'
import ThreeScales20Explainer from './ThreeScales20Explainer'
import {
  ComputeChain20G3Explainer,
  UnderThreeHundred20G3Explainer,
  SmallestFraction20G3Explainer,
  OddRun20G3Explainer,
  ClockBridge20G3Explainer,
  PerimeterSquare20G3Explainer,
  WhichWrong20G3Explainer,
  DivisionList20G3Explainer,
  GreedyDigits20G3Explainer,
  NinetyNines20G3Explainer,
  DigitErrors20G3Explainer,
  Cryptarithm20G3Explainer,
  PasswordFigures20G3Explainer,
  SumTo999G3Explainer,
} from './tryCheckExplainers20G3'
import {
  SumCard20G3Illustration,
  BoxUnder300G3Illustration,
  FractionBarsG3Illustration,
  OddRunG3Illustration,
  TripTimeG3Illustration,
  PerimeterSquareG3Illustration,
  FourLawsG3Illustration,
  DivisionChipsG3Illustration,
  DigitStripG3Illustration,
  NinetyNinesG3Illustration,
  DigitErrorsG3Illustration,
  CryptarithmG3Illustration,
  PasswordCluesG3Illustration,
  SumGrid999G3Illustration,
} from './cards20G3Illustrations'
import {
  WGridsG3Illustration,
  LampRowG3Illustration,
  BoatGridG3Illustration,
  TempTableG3Illustration,
  ShapeAdditionG3Illustration,
  CirclePatternG3Illustration,
} from './scenes20G3Illustrations'
import {
  QuiltSquaresG3Illustration,
  ThreeRectanglesG3Illustration,
  SpiralGridG3Illustration,
  FootballTableG3Illustration,
} from './puzzles20G3Illustrations'
import {
  LargestResult21G1Explainer,
  BusStop21G1Explainer,
  DigitCount21G1Explainer,
  ParkingLot21G1Explainer,
  OddBox21G1Explainer,
  ComputeChain21G1Explainer,
  TensUnits21G1Explainer,
  ShapeCross21G1Explainer,
} from './tryCheckExplainers21G1'
import {
  FourSubtractions21Illustration,
  NumberStrip21Illustration,
  TicketQueue21Illustration,
  ShapeCross21Illustration,
} from './cards21G1Illustrations'
import {
  AppleGrid21Illustration,
  FruitRow21Illustration,
  Baskets21Illustration,
  PaintGrid21Illustration,
  TriangleGrid21Illustration,
  RopeBars21Illustration,
  Scales21Illustration,
} from './scenes21G1Illustrations'
import {
  Balloons21Illustration,
  ChainDiagram21Illustration,
  BigCube21Illustration,
  Circles22Illustration,
  Mobile21Illustration,
  RabbitMaze21Illustration,
} from './puzzles21G1Illustrations'
import {
  AppleGrid21Explainer,
  FruitPattern21Explainer,
  Baskets21Explainer,
  NumberStrip21Explainer,
  PaintGrid21Explainer,
  TriangleFill21Explainer,
  RopePairs21Explainer,
  TicketQueue21Explainer,
  Seesaws21Explainer,
  QueueMiddle21Explainer,
} from './visualExplainers21G1'
import {
  Solids21Explainer,
  Balloons21Explainer,
  Chains21Explainer,
  BigCube21Explainer,
  Circles22Explainer,
  Mobile21Explainer,
  RabbitMaze21Explainer,
} from './puzzleExplainers21G1'
import { SolidOption21, FruitPairOption21, RopePairOption21, SeesawOption21 } from './options21G1'
import {
  MatchProduct21G2Explainer,
  CrossCount21G2Explainer,
  CalendarDays21G2Explainer,
  SkipCount21G2Explainer,
  TwoClocks21G2Explainer,
  TripleBox21G2Explainer,
  BobQueue21G2Explainer,
  TwoPillars21G2Explainer,
  BeeButterfly21G2Explainer,
  RunningTotal21G2Explainer,
  FiveCards21G2Explainer,
  Repdigit21G2Explainer,
  CubeFaces21G2Explainer,
} from './tryCheckExplainers21G2'
import {
  MatchProduct21G2Illustration,
  CrossArray21G2Illustration,
  Calendar21G2Illustration,
  SkipCount21G2Illustration,
  TwoClocks21G2Illustration,
  TripleBox21G2Illustration,
  Pillars21G2Illustration,
  BeeButterfly21G2Illustration,
  RunningTotal21G2Illustration,
  FiveCards21G2Illustration,
  Staircase21G2Illustration,
  CubeFaces21G2Illustration,
} from './cards21G2Illustrations'
import {
  Lines21G2Illustration,
  Money21G2Illustration,
  Words21G2Illustration,
  Pieces21G2Illustration,
  BoxNet21G2Illustration,
} from './scenes21G2Illustrations'
import {
  ChainDiagram21G2Illustration,
  BigCube21G2Illustration,
  Hexagons21G2Illustration,
  Tower21G2Illustration,
  RabbitMaze21G2Illustration,
  Sudoku21G2Illustration,
} from './puzzles21G2Illustrations'
import {
  Lines21G2Explainer,
  AppleProduct21G2Explainer,
  Money21G2Explainer,
  Letters21G2Explainer,
  Pieces21G2Explainer,
  BoxNet21G2Explainer,
} from './visualExplainers21G2'
import {
  Chains21G2Explainer,
  BigCube21G2Explainer,
  Hexagons21G2Explainer,
  Tower21G2Explainer,
  RabbitMaze21G2Explainer,
  Sudoku21G2Explainer,
} from './puzzleExplainers21G2'
import { LineOption21G2 } from './options21G2'
import {
  Compute21G3Explainer,
  DigitsAB21G3Explainer,
  FactorNine21G3Explainer,
  Bundles21G3Explainer,
  ClockTrip21G3Explainer,
  Starfish21G3Explainer,
  Archery21G3Explainer,
  SnakeDeal21G3Explainer,
  SevenChain21G3Explainer,
  EvenSum21G3Explainer,
  Factor202121G3Explainer,
  TripleABC21G3Explainer,
} from './tryCheckExplainers21G3'
import {
  Compute21G3Illustration,
  DigitsAB21G3Illustration,
  FactorNine21G3Illustration,
  Bundles21G3Illustration,
  ClockTrip21G3Illustration,
  Starfish21G3Illustration,
  Archery21G3Illustration,
  SnakeDeal21G3Illustration,
  SevenChain21G3Illustration,
  EvenSum21G3Illustration,
  Factor202121G3Illustration,
  TripleABC21G3Illustration,
} from './cards21G3Illustrations'
import {
  StarGrid21G3Illustration,
  ChocolateBar21G3Illustration,
  NotchedSquare21G3Illustration,
  DivingTable21G3Illustration,
  ShadedGrids21G3Illustration,
  Shelves21G3Illustration,
  TallyMoney21G3Illustration,
  FruitEquations21G3Illustration,
  HexRings21G3Illustration,
  SixRectangles21G3Illustration,
} from './scenes21G3Illustrations'
import { StreetMap21G3Illustration, RabbitMaze21G3Illustration } from './puzzles21G3Illustrations'
import {
  Star21G3Explainer,
  Chocolate21G3Explainer,
  Notch21G3Explainer,
  Diving21G3Explainer,
  ShadedGrids21G3Explainer,
  Shelves21G3Explainer,
  Tally21G3Explainer,
  Fruits21G3Explainer,
  Hex21G3Explainer,
  SixRects21G3Explainer,
} from './visualExplainers21G3'
import { StreetMap21G3Explainer, RabbitMaze21G3Explainer } from './puzzleExplainers21G3'
import { ShadedOption21G3 } from './options21G3'
import WGridCountG3Explainer, {
  LampGapsG3Explainer,
  BoatAreaG3Explainer,
  TempChartsG3Explainer,
  ShapeAddG3Explainer,
  CirclePatternG3Explainer,
  ThreeRectanglesG3Explainer,
} from './visualExplainers20G3'
import QuiltSquaresG3Explainer, { SpiralGridG3Explainer, FootballG3Explainer } from './gridExplainers20G3'
import { WGridOption20G3, TempChartOption20G3, PatternOption20G3 } from './options20G3'
import {
  Balance22G2Illustration,
  BallOption22G2,
  Balls22G2Illustration,
  CardHands22G2Illustration,
  ChildrenOrder22G2Illustration,
  Cups22G2Illustration,
  EggPath22G2Illustration,
  Flowchart22G2Illustration,
  MirrorBlocks22G2Illustration,
  PaperStack22G2Illustration,
  PasswordDial22G2Illustration,
  SeatGrid22G2Illustration,
  ShapeAddition22G2Illustration,
  Shark22G2Illustration,
  Soldiers22G2Illustration,
  Targets22G2Illustration,
  TCover22G2Illustration,
  ThickLineOption22G2,
  ThickLines22G2Illustration,
} from './paper22G2Visuals'
import {
  Balance22G2Explainer,
  Balls22G2Explainer,
  CardHands22G2Explainer,
  ChildrenOrder22G2Explainer,
  Cups22G2Explainer,
  EggPath22G2Explainer,
  Flowchart22G2Explainer,
  MirrorBlocks22G2Explainer,
  PaperStack22G2Explainer,
  PasswordDial22G2Explainer,
  SeatGrid22G2Explainer,
  ShapeAddition22G2Explainer,
  Shark22G2Explainer,
  Soldiers22G2Explainer,
  Targets22G2Explainer,
  TCover22G2Explainer,
  ThickLines22G2Explainer,
} from './paper22G2Explainers'
// 2022 G3 (WMI-22F3A) — Paper A batch
import PieThirds22G3Illustration from './PieThirds22G3Illustration'
import NestedTri22G3Illustration from './NestedTri22G3Illustration'
import StreetMap22G3Illustration from './StreetMap22G3Illustration'
import PaintedArea22G3Illustration, { PaintedArea22G3Option } from './PaintedArea22G3Illustration'
import HalfShadeGrid22G3Illustration, { HalfShade22G3Option } from './HalfShadeGrid22G3Illustration'
import CubeNet22G3Illustration from './CubeNet22G3Illustration'
import ChampionMedian22G3Illustration from './ChampionMedian22G3Illustration'
import PieThirds22G3Explainer from './PieThirds22G3Explainer'
import NestedTri22G3Explainer from './NestedTri22G3Explainer'
import StreetMap22G3Explainer from './StreetMap22G3Explainer'
import PaintedArea22G3Explainer from './PaintedArea22G3Explainer'
import HalfShadeGrid22G3Explainer from './HalfShadeGrid22G3Explainer'
import CubeNet22G3Explainer from './CubeNet22G3Explainer'
import ChampionMedian22G3Explainer from './ChampionMedian22G3Explainer'

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
  'WMI-19F3A-Q1': { Explainer: ComputeChainG3Explainer },
  'WMI-19F3A-Q2': { Explainer: FractionThirdG3Explainer },
  'WMI-19F3A-Q3': { Illustration: TempChartG3Illustration, Explainer: TempChartG3Explainer },
  'WMI-19F3A-Q4': { Explainer: RopeSquareG3Explainer },
  'WMI-19F3A-Q5': { Explainer: AgesSumG3Explainer },
  'WMI-19F3A-Q6': { Explainer: SecondLargestResultG3Explainer },
  'WMI-19F3A-Q7': { Illustration: EqualFractionsG3Illustration, Explainer: EqualFractionsG3VisualExplainer },
  'WMI-19F3A-Q8': { Explainer: TwoNumbersBarG3Explainer },
  'WMI-19F3A-Q9': { Illustration: PatternCycleG3Illustration, Explainer: PatternCycleG3VisualExplainer },
  'WMI-19F3A-Q10': { Explainer: SharedFourVisualG3Explainer },
  'WMI-19F3A-Q11': { Illustration: ShadedTreeG3Illustration, Explainer: ShadedTreeG3Explainer },
  'WMI-19F3A-Q12': { Illustration: ProductPyramidG3Illustration, Explainer: ProductPyramidG3Explainer },
  'WMI-19F3A-Q13': { Explainer: MistakenSignG3Explainer },
  'WMI-19F3A-Q14': { Illustration: StairPerimeterG3Illustration, Explainer: StairPerimeterG3Explainer },
  'WMI-19F3A-Q15': { Explainer: TwoEquationsG3Explainer },
  'WMI-19F3A-Q16': { Explainer: SharedFortyFiveVisualG3Explainer },
  // Q18 is the identical sorted-list problem as G2 Q21 — reuse its explainer.
  'WMI-19F3A-Q18': { Explainer: TwoDigitListG2Explainer },
  'WMI-19F3A-Q17': { Illustration: MShapeLinesG3Illustration, Explainer: MShapeLinesG3Explainer },
  'WMI-19F3A-Q19': { Illustration: DotSquaresG3Illustration, Explainer: DotSquaresG3Explainer },
  'WMI-19F3A-Q20': { Explainer: BalloonsVisualG3Explainer },
  // Q21 is the identical lock puzzle as G2 Q22 (same five clues, code 527).
  'WMI-19F3A-Q21': { Illustration: LockCodeG2Illustration, Explainer: LockCodeG2Explainer },
  'WMI-19F3A-Q22': { Illustration: VerticalMultG3Illustration, Explainer: VerticalMultG3Explainer },
  'WMI-19F3A-Q23': { Illustration: DieSumsG3Illustration, Explainer: DieSumsG3Explainer },
  'WMI-19F3A-Q24': { Illustration: Mathdoku5G3Illustration, Explainer: Mathdoku5G3Explainer },
  'WMI-19F3A-Q25': { Illustration: SkyscraperG3Illustration, Explainer: SkyscraperG3Explainer },
  'WMI-20F1A-Q1': { Explainer: MakeTenVisual20Explainer },
  'WMI-20F1A-Q2': { Illustration: VerticalSub20Illustration, Explainer: SubToTen20Explainer },
  'WMI-20F1A-Q3': { Illustration: RibbonClips20Illustration, Explainer: RibbonClips20Explainer },
  'WMI-20F1A-Q4': { Illustration: ShapeGrid20Illustration, Explainer: ShapeGrid20Explainer },
  'WMI-20F1A-Q5': { Explainer: EvenCount20Explainer },
  'WMI-20F1A-Q6': { Illustration: ClockMatch20Illustration, Explainer: ClockMatch20Explainer },
  'WMI-20F1A-Q7': { Illustration: Thermometer20Illustration, Explainer: Thermometer20Explainer },
  // Q8 deliberately has NO in-card calendar — kids must solve it with day
  // arithmetic; the explainer teaches the anchor-date ± 7 method.
  'WMI-20F1A-Q8': { Explainer: BalletCalendar20Explainer },
  'WMI-20F1A-Q9': { Illustration: Spinner20Illustration, Explainer: Spinner20Explainer },
  'WMI-20F1A-Q10': { Illustration: CherryCount20Illustration, Explainer: CherryCount20Explainer },
  'WMI-20F1A-Q11': { Explainer: BoxToSixteen20Explainer },
  'WMI-20F1A-Q12': { Illustration: TrianglePattern20Illustration, Explainer: TrianglePattern20Explainer },
  'WMI-20F1A-Q13': { Illustration: JoinPieces20Illustration, Explainer: JoinPieces20Explainer },
  // Q14: SVG reproduction of the houses/bird/sun scene; the explainer is a
  // tally board, the options render as mini count-tables.
  'WMI-20F1A-Q14': { Illustration: HousesScene20Illustration, Explainer: ShapeTally20Explainer },
  'WMI-20F1A-Q15': { Illustration: FruitMaze20Illustration, Explainer: FruitMaze20Explainer },
  'WMI-20F1A-Q16': { Illustration: Matchstick20Illustration, Explainer: Matchstick20Explainer },
  'WMI-20F1A-Q17': { Illustration: PieceHunt20Illustration, Explainer: PieceHunt20Explainer },
  'WMI-20F1A-Q18': { Explainer: FriendlyPairs20Explainer },
  'WMI-20F1A-Q19': { Illustration: SumGrid20Illustration, Explainer: SumGrid20Explainer },
  'WMI-20F1A-Q20': { Illustration: TriangleColors20Illustration, Explainer: TriangleColors20Explainer },
  'WMI-20F1A-Q21': { Illustration: Pyramid20Illustration, Explainer: Pyramid20Explainer },
  'WMI-20F1A-Q22': { Illustration: PaintRoll20Illustration, Explainer: PaintRoll20Explainer },
  'WMI-20F1A-Q23': { Illustration: FruitSubtraction20Illustration, Explainer: FruitSubtraction20Explainer },
  'WMI-20F1A-Q24': { Illustration: KenKen20Illustration, Explainer: KenKen20Explainer },
  'WMI-20F1A-Q25': { Illustration: ThreeScales20Illustration, Explainer: ThreeScales20Explainer },
  'WMI-20F2A-Q1': { Illustration: SumCard20G2Illustration, Explainer: ComputeChain20G2Explainer },
  'WMI-20F2A-Q2': { Illustration: SchoolLettersG2Illustration, Explainer: SchoolLettersG2Explainer },
  'WMI-20F2A-Q3': { Illustration: ShapesSquaresG2Illustration, Explainer: ShapesSquaresG2Explainer },
  'WMI-20F2A-Q4': { Illustration: BubblesG2Illustration, Explainer: OrderNumbers20G2Explainer },
  'WMI-20F2A-Q5': { Illustration: BaseTenBlocksG2Illustration, Explainer: BaseTenBlocksG2Explainer },
  'WMI-20F2A-Q6': { Illustration: MissingMinuendCard20G2Illustration, Explainer: MissingMinuend20G2Explainer },
  'WMI-20F2A-Q7': { Illustration: ClockSequenceG2Illustration, Explainer: ClockTurnG2Explainer },
  'WMI-20F2A-Q8': { Illustration: FruitGridG2Illustration, Explainer: FruitCountG2Explainer },
  'WMI-20F2A-Q9': { Illustration: RangeCard20G2Illustration, Explainer: ProductRange20G2Explainer },
  'WMI-20F2A-Q10': { Illustration: RosesG2Illustration },
  'WMI-20F2A-Q11': { Illustration: MinuteSectionsG2Illustration, Explainer: MinuteTicks20G2Explainer },
  'WMI-20F2A-Q12': { Illustration: HeartSpadeSeqG2Illustration },
  'WMI-20F2A-Q13': { Illustration: DigitCluesG2Illustration, Explainer: DigitClues20G2Explainer },
  'WMI-20F2A-Q14': { Illustration: PatternRowsG2Illustration },
  'WMI-20F2A-Q15': { Illustration: NumberLineHopsG2Illustration },
  'WMI-20F2A-Q16': { Illustration: FivesCard20G2Illustration, Explainer: OrderOps20G2Explainer },
  'WMI-20F2A-Q17': { Illustration: DigitCards20G2Illustration, Explainer: EvenExtremes20G2Explainer },
  'WMI-20F2A-Q18': { Illustration: GridSumsG2Illustration },
  'WMI-20F2A-Q19': { Illustration: RepdigitAddG2Illustration },
  'WMI-20F2A-Q20': { Illustration: WeatherDaysG2Illustration },
  'WMI-20F2A-Q21': { Illustration: CubeNetsG2Illustration },
  'WMI-20F2A-Q22': { Illustration: BalanceScalesG2Illustration },
  'WMI-20F2A-Q23': { Illustration: SudokuExprG2Illustration },
  'WMI-20F2A-Q24': { Illustration: NineCards20G2Illustration, Explainer: CardCombos20G2Explainer },
  'WMI-20F2A-Q25': { Illustration: DigitGridG2Illustration },
  'WMI-20F3A-Q1': { Illustration: SumCard20G3Illustration, Explainer: ComputeChain20G3Explainer },
  'WMI-20F3A-Q2': { Illustration: WGridsG3Illustration, Explainer: WGridCountG3Explainer },
  'WMI-20F3A-Q3': { Illustration: BoxUnder300G3Illustration, Explainer: UnderThreeHundred20G3Explainer },
  'WMI-20F3A-Q4': { Illustration: FractionBarsG3Illustration, Explainer: SmallestFraction20G3Explainer },
  'WMI-20F3A-Q5': { Illustration: LampRowG3Illustration, Explainer: LampGapsG3Explainer },
  'WMI-20F3A-Q6': { Illustration: OddRunG3Illustration, Explainer: OddRun20G3Explainer },
  'WMI-20F3A-Q7': { Illustration: BoatGridG3Illustration, Explainer: BoatAreaG3Explainer },
  'WMI-20F3A-Q8': { Illustration: TempTableG3Illustration, Explainer: TempChartsG3Explainer },
  'WMI-20F3A-Q9': { Illustration: TripTimeG3Illustration, Explainer: ClockBridge20G3Explainer },
  'WMI-20F3A-Q10': { Illustration: PerimeterSquareG3Illustration, Explainer: PerimeterSquare20G3Explainer },
  'WMI-20F3A-Q11': { Illustration: FourLawsG3Illustration, Explainer: WhichWrong20G3Explainer },
  'WMI-20F3A-Q12': { Illustration: DivisionChipsG3Illustration, Explainer: DivisionList20G3Explainer },
  'WMI-20F3A-Q13': { Illustration: ShapeAdditionG3Illustration, Explainer: ShapeAddG3Explainer },
  'WMI-20F3A-Q14': { Illustration: CirclePatternG3Illustration, Explainer: CirclePatternG3Explainer },
  'WMI-20F3A-Q15': { Illustration: DigitStripG3Illustration, Explainer: GreedyDigits20G3Explainer },
  'WMI-20F3A-Q16': { Illustration: NinetyNinesG3Illustration, Explainer: NinetyNines20G3Explainer },
  'WMI-20F3A-Q17': { Illustration: QuiltSquaresG3Illustration, Explainer: QuiltSquaresG3Explainer },
  'WMI-20F3A-Q18': { Illustration: DigitErrorsG3Illustration, Explainer: DigitErrors20G3Explainer },
  'WMI-20F3A-Q19': { Illustration: CryptarithmG3Illustration, Explainer: Cryptarithm20G3Explainer },
  'WMI-20F3A-Q20': { Illustration: ThreeRectanglesG3Illustration, Explainer: ThreeRectanglesG3Explainer },
  // Q21 is the identical nine-cards puzzle as 2020 G2 Q24 (same cards, sum 62,
  // 4 ways via drop-3-sum-29) — reuse that figure + explainer.
  'WMI-20F3A-Q21': { Illustration: NineCards20G2Illustration, Explainer: CardCombos20G2Explainer },
  'WMI-20F3A-Q22': { Illustration: SpiralGridG3Illustration, Explainer: SpiralGridG3Explainer },
  'WMI-20F3A-Q23': { Illustration: FootballTableG3Illustration, Explainer: FootballG3Explainer },
  'WMI-20F3A-Q24': { Illustration: PasswordCluesG3Illustration, Explainer: PasswordFigures20G3Explainer },
  'WMI-20F3A-Q25': { Illustration: SumGrid999G3Illustration, Explainer: SumTo999G3Explainer },
  'WMI-21F1A-Q1': { Illustration: FourSubtractions21Illustration, Explainer: LargestResult21G1Explainer },
  'WMI-21F1A-Q2': { Illustration: AppleGrid21Illustration, Explainer: AppleGrid21Explainer },
  'WMI-21F1A-Q3': { Explainer: Solids21Explainer },
  'WMI-21F1A-Q4': { Illustration: FruitRow21Illustration, Explainer: FruitPattern21Explainer },
  'WMI-21F1A-Q5': { Illustration: Baskets21Illustration, Explainer: Baskets21Explainer },
  'WMI-21F1A-Q6': { Illustration: NumberStrip21Illustration, Explainer: NumberStrip21Explainer },
  'WMI-21F1A-Q7': { Illustration: PaintGrid21Illustration, Explainer: PaintGrid21Explainer },
  'WMI-21F1A-Q8': { Illustration: TriangleGrid21Illustration, Explainer: TriangleFill21Explainer },
  'WMI-21F1A-Q9': { Explainer: BusStop21G1Explainer },
  'WMI-21F1A-Q10': { Illustration: RopeBars21Illustration, Explainer: RopePairs21Explainer },
  'WMI-21F1A-Q11': { Explainer: TicketQueue21Explainer },
  'WMI-21F1A-Q12': { Explainer: DigitCount21G1Explainer },
  'WMI-21F1A-Q13': { Explainer: ParkingLot21G1Explainer },
  'WMI-21F1A-Q14': { Illustration: Scales21Illustration, Explainer: Seesaws21Explainer },
  'WMI-21F1A-Q15': { Explainer: OddBox21G1Explainer },
  'WMI-21F1A-Q16': { Explainer: ComputeChain21G1Explainer },
  'WMI-21F1A-Q17': { Explainer: TensUnits21G1Explainer },
  'WMI-21F1A-Q18': { Illustration: Balloons21Illustration, Explainer: Balloons21Explainer },
  'WMI-21F1A-Q19': { Illustration: ChainDiagram21Illustration, Explainer: Chains21Explainer },
  'WMI-21F1A-Q20': { Explainer: QueueMiddle21Explainer },
  'WMI-21F1A-Q21': { Illustration: BigCube21Illustration, Explainer: BigCube21Explainer },
  'WMI-21F1A-Q22': { Illustration: Circles22Illustration, Explainer: Circles22Explainer },
  'WMI-21F1A-Q23': { Illustration: ShapeCross21Illustration, Explainer: ShapeCross21G1Explainer },
  'WMI-21F1A-Q24': { Illustration: Mobile21Illustration, Explainer: Mobile21Explainer },
  'WMI-21F1A-Q25': { Illustration: RabbitMaze21Illustration, Explainer: RabbitMaze21Explainer },
  'WMI-21F2A-Q1': { Illustration: MatchProduct21G2Illustration, Explainer: MatchProduct21G2Explainer },
  'WMI-21F2A-Q2': { Illustration: Lines21G2Illustration, Explainer: Lines21G2Explainer },
  'WMI-21F2A-Q3': { Illustration: CrossArray21G2Illustration, Explainer: CrossCount21G2Explainer },
  'WMI-21F2A-Q4': { Illustration: Calendar21G2Illustration, Explainer: CalendarDays21G2Explainer },
  'WMI-21F2A-Q5': { Illustration: SkipCount21G2Illustration, Explainer: SkipCount21G2Explainer },
  'WMI-21F2A-Q6': { Illustration: TwoClocks21G2Illustration, Explainer: TwoClocks21G2Explainer },
  'WMI-21F2A-Q7': { Illustration: TripleBox21G2Illustration, Explainer: TripleBox21G2Explainer },
  'WMI-21F2A-Q8': { Illustration: TicketQueue21Illustration, Explainer: BobQueue21G2Explainer },
  // Q9 reuses the 2021 G1 apple-grid figure (same printed grid); the explainer
  // marks the left and top-right neighbours instead.
  'WMI-21F2A-Q9': { Illustration: AppleGrid21Illustration, Explainer: AppleProduct21G2Explainer },
  'WMI-21F2A-Q10': { Illustration: Pillars21G2Illustration, Explainer: TwoPillars21G2Explainer },
  'WMI-21F2A-Q11': { Illustration: Money21G2Illustration, Explainer: Money21G2Explainer },
  'WMI-21F2A-Q12': { Illustration: BeeButterfly21G2Illustration, Explainer: BeeButterfly21G2Explainer },
  'WMI-21F2A-Q13': { Illustration: Words21G2Illustration, Explainer: Letters21G2Explainer },
  'WMI-21F2A-Q14': { Illustration: Pieces21G2Illustration, Explainer: Pieces21G2Explainer },
  'WMI-21F2A-Q15': { Illustration: BoxNet21G2Illustration, Explainer: BoxNet21G2Explainer },
  'WMI-21F2A-Q16': { Illustration: RunningTotal21G2Illustration, Explainer: RunningTotal21G2Explainer },
  'WMI-21F2A-Q17': { Illustration: ChainDiagram21G2Illustration, Explainer: Chains21G2Explainer },
  'WMI-21F2A-Q18': { Illustration: BigCube21G2Illustration, Explainer: BigCube21G2Explainer },
  'WMI-21F2A-Q19': { Illustration: Hexagons21G2Illustration, Explainer: Hexagons21G2Explainer },
  'WMI-21F2A-Q20': { Illustration: FiveCards21G2Illustration, Explainer: FiveCards21G2Explainer },
  'WMI-21F2A-Q21': { Illustration: Staircase21G2Illustration, Explainer: Repdigit21G2Explainer },
  'WMI-21F2A-Q22': { Illustration: CubeFaces21G2Illustration, Explainer: CubeFaces21G2Explainer },
  'WMI-21F2A-Q23': { Illustration: Tower21G2Illustration, Explainer: Tower21G2Explainer },
  'WMI-21F2A-Q24': { Illustration: RabbitMaze21G2Illustration, Explainer: RabbitMaze21G2Explainer },
  'WMI-21F2A-Q25': { Illustration: Sudoku21G2Illustration, Explainer: Sudoku21G2Explainer },
  'WMI-21F3A-Q1': { Illustration: Compute21G3Illustration, Explainer: Compute21G3Explainer },
  'WMI-21F3A-Q2': { Illustration: DigitsAB21G3Illustration, Explainer: DigitsAB21G3Explainer },
  'WMI-21F3A-Q3': { Illustration: FactorNine21G3Illustration, Explainer: FactorNine21G3Explainer },
  'WMI-21F3A-Q4': { Illustration: Bundles21G3Illustration, Explainer: Bundles21G3Explainer },
  'WMI-21F3A-Q5': { Illustration: StarGrid21G3Illustration, Explainer: Star21G3Explainer },
  'WMI-21F3A-Q6': { Illustration: ChocolateBar21G3Illustration, Explainer: Chocolate21G3Explainer },
  'WMI-21F3A-Q7': { Illustration: NotchedSquare21G3Illustration, Explainer: Notch21G3Explainer },
  'WMI-21F3A-Q8': { Illustration: ClockTrip21G3Illustration, Explainer: ClockTrip21G3Explainer },
  'WMI-21F3A-Q9': { Illustration: Starfish21G3Illustration, Explainer: Starfish21G3Explainer },
  'WMI-21F3A-Q10': { Illustration: Archery21G3Illustration, Explainer: Archery21G3Explainer },
  'WMI-21F3A-Q11': { Illustration: DivingTable21G3Illustration, Explainer: Diving21G3Explainer },
  'WMI-21F3A-Q12': { Illustration: ShadedGrids21G3Illustration, Explainer: ShadedGrids21G3Explainer },
  'WMI-21F3A-Q13': { Illustration: Shelves21G3Illustration, Explainer: Shelves21G3Explainer },
  'WMI-21F3A-Q14': { Illustration: SnakeDeal21G3Illustration, Explainer: SnakeDeal21G3Explainer },
  'WMI-21F3A-Q15': { Illustration: TallyMoney21G3Illustration, Explainer: Tally21G3Explainer },
  'WMI-21F3A-Q16': { Illustration: SevenChain21G3Illustration, Explainer: SevenChain21G3Explainer },
  'WMI-21F3A-Q17': { Illustration: EvenSum21G3Illustration, Explainer: EvenSum21G3Explainer },
  'WMI-21F3A-Q18': { Illustration: FruitEquations21G3Illustration, Explainer: Fruits21G3Explainer },
  'WMI-21F3A-Q19': { Illustration: StreetMap21G3Illustration, Explainer: StreetMap21G3Explainer },
  'WMI-21F3A-Q20': { Illustration: HexRings21G3Illustration, Explainer: Hex21G3Explainer },
  'WMI-21F3A-Q21': { Illustration: SixRectangles21G3Illustration, Explainer: SixRects21G3Explainer },
  'WMI-21F3A-Q22': { Illustration: Factor202121G3Illustration, Explainer: Factor202121G3Explainer },
  'WMI-21F3A-Q23': { Illustration: TripleABC21G3Illustration, Explainer: TripleABC21G3Explainer },
  'WMI-21F3A-Q24': { Illustration: RabbitMaze21G3Illustration, Explainer: RabbitMaze21G3Explainer },
  // Q25 is the IDENTICAL quadruple-clue sudoku printed in the G2 paper (same
  // givens, same quads, same answer 54123) — reuse those components.
  'WMI-21F3A-Q25': { Illustration: Sudoku21G2Illustration, Explainer: Sudoku21G2Explainer },
  'WMI-22F2A-Q1': { Illustration: Shark22G2Illustration, Explainer: Shark22G2Explainer },
  'WMI-22F2A-Q3': { Illustration: PaperStack22G2Illustration, Explainer: PaperStack22G2Explainer },
  'WMI-22F2A-Q5': { Illustration: Balls22G2Illustration, Explainer: Balls22G2Explainer },
  'WMI-22F2A-Q8': { Illustration: ThickLines22G2Illustration, Explainer: ThickLines22G2Explainer },
  'WMI-22F2A-Q10': { Illustration: ChildrenOrder22G2Illustration, Explainer: ChildrenOrder22G2Explainer },
  'WMI-22F2A-Q11': { Illustration: Targets22G2Illustration, Explainer: Targets22G2Explainer },
  'WMI-22F2A-Q12': { Illustration: EggPath22G2Illustration, Explainer: EggPath22G2Explainer },
  'WMI-22F2A-Q15': { Illustration: Cups22G2Illustration, Explainer: Cups22G2Explainer },
  'WMI-22F2A-Q16': { Illustration: Flowchart22G2Illustration, Explainer: Flowchart22G2Explainer },
  'WMI-22F2A-Q17': { Illustration: Balance22G2Illustration, Explainer: Balance22G2Explainer },
  'WMI-22F2A-Q18': { Illustration: SeatGrid22G2Illustration, Explainer: SeatGrid22G2Explainer },
  'WMI-22F2A-Q19': { Illustration: ShapeAddition22G2Illustration, Explainer: ShapeAddition22G2Explainer },
  'WMI-22F2A-Q20': { Illustration: PasswordDial22G2Illustration, Explainer: PasswordDial22G2Explainer },
  'WMI-22F2A-Q21': { Illustration: CardHands22G2Illustration, Explainer: CardHands22G2Explainer },
  'WMI-22F2A-Q23': { Illustration: Soldiers22G2Illustration, Explainer: Soldiers22G2Explainer },
  'WMI-22F2A-Q24': { Illustration: MirrorBlocks22G2Illustration, Explainer: MirrorBlocks22G2Explainer },
  'WMI-22F2A-Q25': { Illustration: TCover22G2Illustration, Explainer: TCover22G2Explainer },
  // 2022 G3 (WMI-22F3A) — Paper A batch
  'WMI-22F3A-Q2': { Illustration: PieThirds22G3Illustration, Explainer: PieThirds22G3Explainer },
  'WMI-22F3A-Q3': { Illustration: NestedTri22G3Illustration, Explainer: NestedTri22G3Explainer },
  'WMI-22F3A-Q4': { Illustration: StreetMap22G3Illustration, Explainer: StreetMap22G3Explainer },
  'WMI-22F3A-Q5': { Illustration: PaintedArea22G3Illustration, Explainer: PaintedArea22G3Explainer },
  'WMI-22F3A-Q8': { Illustration: HalfShadeGrid22G3Illustration, Explainer: HalfShadeGrid22G3Explainer },
  'WMI-22F3A-Q11': { Illustration: CubeNet22G3Illustration, Explainer: CubeNet22G3Explainer },
  'WMI-22F3A-Q13': { Illustration: ChampionMedian22G3Illustration, Explainer: ChampionMedian22G3Explainer },
}

// Optional per-question renderer for the A/B/C/D choice content. When present,
// it replaces the plain choice text (e.g. shape-count options drawn as bar
// charts). The renderer binds to the choice's own text so it can't drift.
type ChoiceRenderer = ComponentType<{ choice: WmiChoice }>

const CHOICE_RENDERERS: Record<string, ChoiceRenderer> = {
  // 2022 G3: Q5 painted-area options, Q8 half-shade grid options.
  'WMI-22F3A-Q5': PaintedArea22G3Option,
  'WMI-22F3A-Q8': HalfShade22G3Option,
  'WMI-19F1A-Q15': ShapeCountOption,
  'WMI-19F1A-Q8': WhiteCircleSquareOption,
  // G2 Q4 is the same shape-tally task — render its A–D options as bar charts too.
  'WMI-19F2A-Q4': ShapeCountOption,
  // G2 Q5 options are foods, not letters — draw the picture each option stands for.
  'WMI-19F2A-Q5': PatternNinthG2Option,
  // G3 Q2 options are shaded-fraction pictures.
  'WMI-19F3A-Q2': FractionThirdG3Option,
  // 2020 G1: Q4 options are the named shapes, Q6 options are analog clocks,
  // Q9 options are pattern swatches, Q13 options are polyomino shapes,
  // Q14 options are shape-count tables.
  'WMI-20F1A-Q4': ShapeGridOption20,
  'WMI-20F1A-Q6': ClockOption20,
  'WMI-20F1A-Q9': SpinnerOption20,
  'WMI-20F1A-Q13': JoinPiecesOption20,
  'WMI-20F1A-Q14': ShapeTallyOption20,
  // Q15 options are the circled fruit icons from the maze.
  'WMI-20F1A-Q15': FruitMazeOption20,
  // 2020 G2: Q7 options are clock faces with the pink arrow in four directions.
  'WMI-20F2A-Q7': ClockTurnG2Option,
  // 2020 G3: Q2 options are letter grids, Q8 options are line charts,
  // Q14 options are shape triples.
  'WMI-20F3A-Q2': WGridOption20G3,
  'WMI-20F3A-Q8': TempChartOption20G3,
  'WMI-20F3A-Q14': PatternOption20G3,
  // 2021 G1: Q3 options are cube solids, Q4 fruit pairs, Q10 rope pairs,
  // Q14 seesaw claims.
  'WMI-21F1A-Q3': SolidOption21,
  'WMI-21F1A-Q4': FruitPairOption21,
  'WMI-21F1A-Q10': RopePairOption21,
  'WMI-21F1A-Q14': SeesawOption21,
  // 2021 G2: Q2 options are the zigzag line figures.
  'WMI-21F2A-Q2': LineOption21G2,
  // 2021 G3: Q12 options are the shaded 3×3 grids.
  'WMI-21F3A-Q12': ShadedOption21G3,
  'WMI-22F2A-Q5': BallOption22G2,
  'WMI-22F2A-Q8': ThickLineOption22G2,
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
