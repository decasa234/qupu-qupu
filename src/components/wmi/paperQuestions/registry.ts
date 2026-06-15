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
import RosesG2Explainer from './RosesG2Explainer'
import HeartSpadeSeqG2Explainer from './HeartSpadeSeqG2Explainer'
import PatternRowsG2Explainer from './PatternRowsG2Explainer'
import NumberLineHopsG2Explainer from './NumberLineHopsG2Explainer'
import GridSumsG2Explainer from './GridSumsG2Explainer'
import RepdigitAddG2Explainer from './RepdigitAddG2Explainer'
import WeatherDaysG2Explainer from './WeatherDaysG2Explainer'
import CubeNetsG2Explainer from './CubeNetsG2Explainer'
import BalanceScalesG2Explainer from './BalanceScalesG2Explainer'
import SudokuExprG2Explainer from './SudokuExprG2Explainer'
import DigitGridG2Explainer from './DigitGridG2Explainer'
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
import {
  Compute22G2Explainer,
  ShareCandy22G2Explainer,
  Birthday22G2Explainer,
  DoubleTree22G2Explainer,
  BalanceEq22G2Explainer,
  CardsClosest22G2Explainer,
  DinoEggs22G2Explainer,
  BallShare22G2Explainer,
} from './tryCheckExplainers22G2'
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
// 2022 G3 (WMI-22F3A) — Paper B batch
import ProductTriangle22G3Illustration from './ProductTriangle22G3Illustration'
import ProductTriangle22G3Explainer from './ProductTriangle22G3Explainer'
import VerticalMult22G3Illustration from './VerticalMult22G3Illustration'
import VerticalMult22G3Explainer from './VerticalMult22G3Explainer'
import TilePieces22G3Illustration from './TilePieces22G3Illustration'
import TilePieces22G3Explainer from './TilePieces22G3Explainer'
import RectFrame22G3Illustration from './RectFrame22G3Illustration'
import RectFrame22G3Explainer from './RectFrame22G3Explainer'
import SoldierRoad22G3Illustration from './SoldierRoad22G3Illustration'
import SoldierRoad22G3Explainer from './SoldierRoad22G3Explainer'
import MirrorSolid22G3Illustration from './MirrorSolid22G3Illustration'
import MirrorSolid22G3Explainer from './MirrorSolid22G3Explainer'
import NumberGrid22G3Illustration from './NumberGrid22G3Illustration'
import NumberGrid22G3Explainer from './NumberGrid22G3Explainer'
import {
  Compute22G3Explainer,
  CakeBudget22G3Explainer,
  BlouseSkirt22G3Explainer,
  EvenCount22G3Explainer,
  MeetingTime22G3Explainer,
  Visitors22G3Explainer,
  DiffSeq22G3Explainer,
  NinesPattern22G3Explainer,
  NextYear22G3Explainer,
  OpenDoors22G3Explainer,
} from './tryCheckExplainers22G3'
import NumberSnake22G1Illustration from './NumberSnake22G1Illustration'
import NumberSnake22G1Explainer from './NumberSnake22G1Explainer'
import HexTree22G1Illustration from './HexTree22G1Illustration'
import HexTree22G1Explainer from './HexTree22G1Explainer'
import Money22G1Illustration from './Money22G1Illustration'
import Money22G1Explainer from './Money22G1Explainer'
import NumberVenn22G1Illustration from './NumberVenn22G1Illustration'
import NumberVenn22G1Explainer from './NumberVenn22G1Explainer'
import Vases22G1Illustration from './Vases22G1Illustration'
import Vases22G1Explainer from './Vases22G1Explainer'
import Letters22G1Illustration from './Letters22G1Illustration'
import Letters22G1Explainer from './Letters22G1Explainer'
import TwoLines22G1Illustration from './TwoLines22G1Illustration'
import TwoLines22G1Explainer from './TwoLines22G1Explainer'
import Locks22G1Illustration from './Locks22G1Illustration'
import Locks22G1Explainer from './Locks22G1Explainer'
import HeightOrder22G1Illustration from './HeightOrder22G1Illustration'
import HeightOrder22G1Explainer from './HeightOrder22G1Explainer'
import Balance22G1Illustration from './Balance22G1Illustration'
import Balance22G1Explainer from './Balance22G1Explainer'
import Dial22G1Illustration from './Dial22G1Illustration'
import Dial22G1Explainer from './Dial22G1Explainer'
import Balls22G1Option from './Balls22G1Option'
import Balls22G1Explainer from './Balls22G1Explainer'
import Fruit22G1Option from './Fruit22G1Option'
import Fruit22G1Explainer from './Fruit22G1Explainer'
import Solid22G1Option from './Solid22G1Option'
import Solid22G1Explainer from './Solid22G1Explainer'
import BracketGrid22G1Illustration from './BracketGrid22G1Illustration'
import BracketGrid22G1Explainer from './BracketGrid22G1Explainer'
import TriCount22G1Illustration from './TriCount22G1Illustration'
import TriCount22G1Explainer from './TriCount22G1Explainer'
import SoldierRoad22G1Illustration from './SoldierRoad22G1Illustration'
import SoldierRoad22G1Explainer from './SoldierRoad22G1Explainer'
import KnightTour22G1Illustration from './KnightTour22G1Illustration'
import KnightTour22G1Explainer from './KnightTour22G1Explainer'
import BlockPack22G1Illustration from './BlockPack22G1Illustration'
import BlockPack22G1Explainer from './BlockPack22G1Explainer'
import MirrorBlocks22G1Illustration from './MirrorBlocks22G1Illustration'
import MirrorBlocks22G1Explainer from './MirrorBlocks22G1Explainer'
import CircleRect22G1Option from './CircleRect22G1Option'
import CircleRect22G1Explainer from './CircleRect22G1Explainer'
import EdgeMatch22G1Illustration from './EdgeMatch22G1Illustration'
import EdgeMatch22G1Explainer from './EdgeMatch22G1Explainer'
import {
  AnimalLegs22G1Explainer,
  LuckyNumber22G1Explainer,
  CustomOp22G1Explainer,
} from './tryCheckExplainers22G1'
// 2023 G1 Final
import GoBoard23G1Illustration from './GoBoard23G1Illustration'
import GoBoard23G1Explainer from './GoBoard23G1Explainer'
import NumberStrip23G1Illustration from './NumberStrip23G1Illustration'
import NumberStrip23G1Explainer from './NumberStrip23G1Explainer'
import ShapeAdd23G1Illustration from './ShapeAdd23G1Illustration'
import ShapeAdd23G1Explainer from './ShapeAdd23G1Explainer'
import StarSquares23G1Illustration from './StarSquares23G1Illustration'
import StarSquares23G1Explainer from './StarSquares23G1Explainer'
import ShapePattern23G1Illustration from './ShapePattern23G1Illustration'
import ShapePattern23G1Explainer from './ShapePattern23G1Explainer'
import PaperFold23G1Illustration from './PaperFold23G1Illustration'
import PaperFold23G1Explainer from './PaperFold23G1Explainer'
import GridFill23G1Illustration from './GridFill23G1Illustration'
import GridFill23G1Explainer from './GridFill23G1Explainer'
import MatchSquares23G1Illustration from './MatchSquares23G1Illustration'
import MatchSquares23G1Explainer from './MatchSquares23G1Explainer'
import FreqGrid23G1Illustration from './FreqGrid23G1Illustration'
import FreqGrid23G1Explainer from './FreqGrid23G1Explainer'
import Bracelets23G1Illustration from './Bracelets23G1Illustration'
import Bracelets23G1Explainer from './Bracelets23G1Explainer'
import RouteTree23G1Illustration from './RouteTree23G1Illustration'
import RouteTree23G1Explainer from './RouteTree23G1Explainer'
import RoomMaze23G1Illustration from './RoomMaze23G1Illustration'
import RoomMaze23G1Explainer from './RoomMaze23G1Explainer'
import SegmentCount23G1Illustration from './SegmentCount23G1Illustration'
import SegmentCount23G1Explainer from './SegmentCount23G1Explainer'
import PatternRules23G1Illustration from './PatternRules23G1Illustration'
import PatternRules23G1Explainer from './PatternRules23G1Explainer'
import RobotMaze23G1Illustration from './RobotMaze23G1Illustration'
import RobotMaze23G1Explainer from './RobotMaze23G1Explainer'
import MatchNum23G1Option from './MatchNum23G1Option'
import Jigsaw23G1Illustration from './Jigsaw23G1Illustration'
import Jigsaw23G1Explainer from './Jigsaw23G1Explainer'
import Jigsaw23G1Option from './Jigsaw23G1Option'
import CardStats23G1Illustration from './CardStats23G1Illustration'
import CardStats23G1Explainer from './CardStats23G1Explainer'
import CardStats23G1Option from './CardStats23G1Option'
import {
  SmallestExpr23G1Explainer,
  AppleBaskets23G1Explainer,
  ChangeMoney23G1Explainer,
  BalloonTrade23G1Explainer,
  UnitsDigit23G1Explainer,
  SignFill23G1Explainer,
  ColorCycle23G1Explainer,
} from './tryCheckExplainers23G1'
// 2024 G1 Final
import Segments24G1Illustration from './Segments24G1Illustration'
import Segments24G1Explainer from './Segments24G1Explainer'
import DiceNet24G1Illustration from './DiceNet24G1Illustration'
import DiceNet24G1Explainer from './DiceNet24G1Explainer'
import NumberVenn24G1Illustration from './NumberVenn24G1Illustration'
import NumberVenn24G1Explainer from './NumberVenn24G1Explainer'
import ShapeAdd24G1Illustration from './ShapeAdd24G1Illustration'
import ShapeAdd24G1Explainer from './ShapeAdd24G1Explainer'
import ExprPattern24G1Illustration from './ExprPattern24G1Illustration'
import ExprPattern24G1Explainer from './ExprPattern24G1Explainer'
import DigitCards24G1Illustration from './DigitCards24G1Illustration'
import DigitCards24G1Explainer from './DigitCards24G1Explainer'
import SumCards24G1Illustration from './SumCards24G1Illustration'
import SumCards24G1Explainer from './SumCards24G1Explainer'
import RemoveOp24G1Illustration from './RemoveOp24G1Illustration'
import RemoveOp24G1Explainer from './RemoveOp24G1Explainer'
import BallTubes24G1Illustration from './BallTubes24G1Illustration'
import BallTubes24G1Explainer from './BallTubes24G1Explainer'
import LogicGrid24G1Illustration from './LogicGrid24G1Illustration'
import LogicGrid24G1Explainer from './LogicGrid24G1Explainer'
import BlockStack24G1Illustration from './BlockStack24G1Illustration'
import BlockStack24G1Explainer from './BlockStack24G1Explainer'
import SumGrid24G1Illustration from './SumGrid24G1Illustration'
import AnimalMaze24G1Illustration from './AnimalMaze24G1Illustration'
import AnimalMaze24G1Explainer from './AnimalMaze24G1Explainer'
import AnimalMaze24G1Option from './AnimalMaze24G1Option'
import ClockPic24G1Illustration from './ClockPic24G1Illustration'
import ClockPic24G1Explainer from './ClockPic24G1Explainer'
import ClockPic24G1Option from './ClockPic24G1Option'
import CookieSort24G1Illustration from './CookieSort24G1Illustration'
import CookieSort24G1Explainer from './CookieSort24G1Explainer'
import BallSort24G1Illustration from './BallSort24G1Illustration'
import BallSort24G1Explainer from './BallSort24G1Explainer'
import {
  EqualsFifteen24G1Explainer,
  BuildAdd24G1Explainer,
  CupsHandle24G1Explainer,
  CakeShortfall24G1Explainer,
  TwoClues24G1Explainer,
  DigitTally24G1Explainer,
  BusCarry24G1Explainer,
  CoinTotals24G1Explainer,
  ChocoLeft24G1Explainer,
} from './tryCheckExplainers24G1'
// 2025 G1 Final
import LineSquares25G1Illustration from './LineSquares25G1Illustration'
import LineSquares25G1Explainer from './LineSquares25G1Explainer'
import CubeRecolor25G1Illustration from './CubeRecolor25G1Illustration'
import CubeRecolor25G1Explainer from './CubeRecolor25G1Explainer'
import DigitTriple25G1Illustration from './DigitTriple25G1Illustration'
import DigitTriple25G1Explainer from './DigitTriple25G1Explainer'
import TheaterSeats25G1Illustration from './TheaterSeats25G1Illustration'
import TheaterSeats25G1Explainer from './TheaterSeats25G1Explainer'
import Stones25G1Illustration from './Stones25G1Illustration'
import Stones25G1Explainer from './Stones25G1Explainer'
import AppleBoxes25G1Illustration from './AppleBoxes25G1Illustration'
import AppleBoxes25G1Explainer from './AppleBoxes25G1Explainer'
import BoatTranslate25G1Illustration from './BoatTranslate25G1Illustration'
import BoatTranslate25G1Explainer from './BoatTranslate25G1Explainer'
import NumberPattern25G1Illustration from './NumberPattern25G1Illustration'
import NumberPattern25G1Explainer from './NumberPattern25G1Explainer'
import FlippedRuler25G1Illustration from './FlippedRuler25G1Illustration'
import FlippedRuler25G1Explainer from './FlippedRuler25G1Explainer'
import ChildrenChairs25G1Illustration from './ChildrenChairs25G1Illustration'
import ChildrenChairs25G1Explainer from './ChildrenChairs25G1Explainer'
import BalanceScales25G1Illustration from './BalanceScales25G1Illustration'
import BalanceScales25G1Explainer from './BalanceScales25G1Explainer'
import SpecialTrees25G1Illustration from './SpecialTrees25G1Illustration'
import SpecialTrees25G1Explainer from './SpecialTrees25G1Explainer'
import ClothingPrices25G1Illustration from './ClothingPrices25G1Illustration'
import ClothingPrices25G1Explainer from './ClothingPrices25G1Explainer'
import HomeMap25G1Illustration from './HomeMap25G1Illustration'
import HomeMap25G1Explainer from './HomeMap25G1Explainer'
import NumberPyramid25G1Illustration from './NumberPyramid25G1Illustration'
import NumberPyramid25G1Explainer from './NumberPyramid25G1Explainer'
import CircleSums25G1Illustration from './CircleSums25G1Illustration'
import CircleSums25G1Explainer from './CircleSums25G1Explainer'
import HundredsChart25G1Illustration from './HundredsChart25G1Illustration'
import HundredsChart25G1Explainer from './HundredsChart25G1Explainer'
import HundredsChart25G1Option from './HundredsChart25G1Option'
import ShapeSeq25G1Illustration from './ShapeSeq25G1Illustration'
import ShapeSeq25G1Explainer from './ShapeSeq25G1Explainer'
import ShapeSeq25G1Option from './ShapeSeq25G1Option'
import CountFigures25G1Illustration from './CountFigures25G1Illustration'
import CountFigures25G1Explainer from './CountFigures25G1Explainer'
import CountFigures25G1Option from './CountFigures25G1Option'
import {
  OddCount25G1Explainer,
  MiddleExpr25G1Explainer,
  FlowerCost25G1Explainer,
  DigitSumEight25G1Explainer,
  BusStanding25G1Explainer,
  AnsweredGap25G1Explainer,
} from './tryCheckExplainers25G1'
import Angles23G3Illustration from './Angles23G3Illustration'
import Angles23G3Explainer from './Angles23G3Explainer'
import OverlapRects23G3Illustration from './OverlapRects23G3Illustration'
import OverlapRects23G3Explainer from './OverlapRects23G3Explainer'
import SnailPath23G3Illustration from './SnailPath23G3Illustration'
import SnailPath23G3Explainer from './SnailPath23G3Explainer'
import ParkingFee23G3Illustration from './ParkingFee23G3Illustration'
import ParkingFee23G3Explainer from './ParkingFee23G3Explainer'
import MetroGraph23G3Illustration from './MetroGraph23G3Illustration'
import MetroGraph23G3Explainer from './MetroGraph23G3Explainer'
import ClockPieces23G3Illustration from './ClockPieces23G3Illustration'
import ClockPieces23G3Explainer from './ClockPieces23G3Explainer'
import TriGridQuad23G3Illustration from './TriGridQuad23G3Illustration'
import TriGridQuad23G3Explainer from './TriGridQuad23G3Explainer'
import Spiral23G3Illustration from './Spiral23G3Illustration'
import Spiral23G3Explainer from './Spiral23G3Explainer'
import SpiralOption23G3 from './SpiralOption23G3'
import FoldTriangle23G3Illustration from './FoldTriangle23G3Illustration'
import FoldTriangle23G3Explainer from './FoldTriangle23G3Explainer'
import FiveSquares23G3Illustration from './FiveSquares23G3Illustration'
import FiveSquares23G3Explainer from './FiveSquares23G3Explainer'
import Pinwheel23G3Illustration from './Pinwheel23G3Illustration'
import Pinwheel23G3Explainer from './Pinwheel23G3Explainer'
import Match23G3Explainer from './Match23G3Explainer'
import NumberGrid23G3Illustration from './NumberGrid23G3Illustration'
import NumberGrid23G3Explainer from './NumberGrid23G3Explainer'
import RobotMaze23G3Illustration from './RobotMaze23G3Illustration'
import RobotMaze23G3Explainer from './RobotMaze23G3Explainer'
import {
  SubtractMany23G3Explainer,
  MilkTotal23G3Explainer,
  PagesLeft23G3Explainer,
  DigitDiff23G3Explainer,
  SwapDivide23G3Explainer,
  ProductCancel23G3Explainer,
  ConsecDiv23G3Explainer,
  ChallengeScore23G3Explainer,
  GreedyDelete23G3Explainer,
} from './tryCheckExplainers23G3'
import Cards23G2Illustration from './Cards23G2Illustration'
import Cards23G2Explainer from './Cards23G2Explainer'
import PeggyMap23G2Illustration from './PeggyMap23G2Illustration'
import PeggyMap23G2Explainer from './PeggyMap23G2Explainer'
import Lines23G2Illustration from './Lines23G2Illustration'
import Lines23G2Explainer from './Lines23G2Explainer'
import StarGrid23G2Illustration from './StarGrid23G2Illustration'
import StarGrid23G2Explainer from './StarGrid23G2Explainer'
import Matchsticks23G2Illustration from './Matchsticks23G2Illustration'
import Matchsticks23G2Explainer from './Matchsticks23G2Explainer'
import CardStats23G2Illustration from './CardStats23G2Illustration'
import CardStats23G2Explainer from './CardStats23G2Explainer'
import Pattern23G2Illustration, { Pattern23G2Option } from './Pattern23G2Illustration'
import Pattern23G2Explainer from './Pattern23G2Explainer'
import RobotMaze23G2Illustration from './RobotMaze23G2Illustration'
import RobotMaze23G2Explainer from './RobotMaze23G2Explainer'
import {
  RoundSubtract23G2Explainer,
  MultipleNine23G2Explainer,
  ApplesBaskets23G2Explainer,
  PokemonWin23G2Explainer,
  DiceSum23G2Explainer,
  HamburgerDeal23G2Explainer,
  MaxExpr23G2Explainer,
  InterleaveSeq23G2Explainer,
  ExhibitOverlap23G2Explainer,
  DigitCount23G2Explainer,
  ComputeProducts23G2Explainer,
  CryptoABCD23G2Explainer,
  BlockSeq23G2Explainer,
  ChallengeScore23G2Explainer,
  UnusedDigit23G2Explainer,
} from './tryCheckExplainers23G2'
import Parallelogram24G2Illustration from './Parallelogram24G2Illustration'
import Parallelogram24G2Explainer from './Parallelogram24G2Explainer'
import AntPath24G2Illustration from './AntPath24G2Illustration'
import AntPath24G2Explainer from './AntPath24G2Explainer'
import GrayGrid24G2Illustration from './GrayGrid24G2Illustration'
import GrayGrid24G2Explainer from './GrayGrid24G2Explainer'
import Field24G2Illustration from './Field24G2Illustration'
import Field24G2Explainer from './Field24G2Explainer'
import Solid24G2Illustration from './Solid24G2Illustration'
import Solid24G2Explainer from './Solid24G2Explainer'
import Seating24G2Illustration from './Seating24G2Illustration'
import Seating24G2Explainer from './Seating24G2Explainer'
import Tangram24G2Illustration, { Tangram24G2Option } from './Tangram24G2Illustration'
import Tangram24G2Explainer from './Tangram24G2Explainer'
import TrainArrows24G2Illustration, { TrainArrows24G2Option } from './TrainArrows24G2Illustration'
import TrainArrows24G2Explainer from './TrainArrows24G2Explainer'
import RollingHex24G2Illustration from './RollingHex24G2Illustration'
import RollingHex24G2Explainer from './RollingHex24G2Explainer'
import ShapeEq24G2Illustration from './ShapeEq24G2Illustration'
import ShapeEq24G2Explainer from './ShapeEq24G2Explainer'
import TriSticks24G2Illustration from './TriSticks24G2Illustration'
import TriSticks24G2Explainer from './TriSticks24G2Explainer'
import Parking24G2Illustration from './Parking24G2Illustration'
import Parking24G2Explainer from './Parking24G2Explainer'
import Grid24G2Illustration from './Grid24G2Illustration'
import Grid24G2Explainer from './Grid24G2Explainer'
import BoardPath24G2Illustration from './BoardPath24G2Illustration'
import BoardPath24G2Explainer from './BoardPath24G2Explainer'
import SymbolGrid24G2Illustration from './SymbolGrid24G2Illustration'
import SymbolGrid24G2Explainer from './SymbolGrid24G2Explainer'
import {
  MatchProduct24G2Explainer,
  TreesPlan24G2Explainer,
  TrainGap24G2Explainer,
  TwoItems24G2Explainer,
  RankSqueeze24G2Explainer,
  ThreeWeights24G2Explainer,
  GreedyEven24G2Explainer,
  MaxOddSum24G2Explainer,
  RockPaper24G2Explainer,
} from './tryCheckExplainers24G2'
import ShipBridge24G3Illustration from './ShipBridge24G3Illustration'
import ShipBridge24G3Explainer from './ShipBridge24G3Explainer'
import Classroom24G3Illustration from './Classroom24G3Illustration'
import Classroom24G3Explainer from './Classroom24G3Explainer'
import RaceTrack24G3Illustration from './RaceTrack24G3Illustration'
import RaceTrack24G3Explainer from './RaceTrack24G3Explainer'
import CompositeRect24G3Illustration from './CompositeRect24G3Illustration'
import CompositeRect24G3Explainer from './CompositeRect24G3Explainer'
import Trapezoid24G3Illustration from './Trapezoid24G3Illustration'
import Trapezoid24G3Explainer from './Trapezoid24G3Explainer'
import ViewTable24G3Illustration from './ViewTable24G3Illustration'
import ViewTable24G3Explainer from './ViewTable24G3Explainer'
import SubTriangle24G3Illustration from './SubTriangle24G3Illustration'
import SubTriangle24G3Explainer from './SubTriangle24G3Explainer'
import DiceNet24G3Illustration from './DiceNet24G3Illustration'
import DiceNet24G3Explainer from './DiceNet24G3Explainer'
import PentRoll24G3Illustration from './PentRoll24G3Illustration'
import PentRoll24G3Explainer from './PentRoll24G3Explainer'
import ButtonPanel24G3Illustration from './ButtonPanel24G3Illustration'
import ButtonPanel24G3Explainer from './ButtonPanel24G3Explainer'
import CardLayout24G3Illustration from './CardLayout24G3Illustration'
import CardLayout24G3Explainer from './CardLayout24G3Explainer'
import CutCount24G3Illustration from './CutCount24G3Illustration'
import CutCount24G3Explainer from './CutCount24G3Explainer'
import RabbitGrid24G3Illustration from './RabbitGrid24G3Illustration'
import RabbitGrid24G3Explainer from './RabbitGrid24G3Explainer'
import NumGrid24G3Illustration from './NumGrid24G3Illustration'
import NumGrid24G3Explainer from './NumGrid24G3Explainer'
import {
  DivZero24G3Explainer,
  BusFill24G3Explainer,
  CigaretteTime24G3Explainer,
  MealCombos24G3Explainer,
  ColumnCrypto24G3Explainer,
  MaxQuotient24G3Explainer,
  Matchsticks24G3Explainer,
  CardEquations24G3Explainer,
  TreeAges24G3Explainer,
  Palindrome24G3Explainer,
} from './tryCheckExplainers24G3'
import StarAdd25G2Illustration from './StarAdd25G2Illustration'
import StarAdd25G2Explainer from './StarAdd25G2Explainer'
import RopeRuler25G2Illustration from './RopeRuler25G2Illustration'
import RopeRuler25G2Explainer from './RopeRuler25G2Explainer'
import Gomoku25G2Illustration from './Gomoku25G2Illustration'
import Gomoku25G2Explainer from './Gomoku25G2Explainer'
import FaceSeq25G2Illustration, { FaceSeq25G2Option } from './FaceSeq25G2Illustration'
import FaceSeq25G2Explainer from './FaceSeq25G2Explainer'
import Ordering25G2Illustration from './Ordering25G2Illustration'
import Ordering25G2Explainer from './Ordering25G2Explainer'
import Cube2025G2Illustration from './Cube2025G2Illustration'
import Cube2025G2Explainer from './Cube2025G2Explainer'
import ProductGrid25G2Illustration from './ProductGrid25G2Illustration'
import ProductGrid25G2Explainer from './ProductGrid25G2Explainer'
import Roundabout25G2Illustration from './Roundabout25G2Illustration'
import Roundabout25G2Explainer from './Roundabout25G2Explainer'
import Jerseys25G2Illustration from './Jerseys25G2Illustration'
import Jerseys25G2Explainer from './Jerseys25G2Explainer'
import MoneyGrid25G2Illustration from './MoneyGrid25G2Illustration'
import MoneyGrid25G2Explainer from './MoneyGrid25G2Explainer'
import {
  SortMiddle25G2Explainer,
  Direction25G2Explainer,
  ConsecEven25G2Explainer,
  SquareCandy25G2Explainer,
  ShipDirection25G2Explainer,
  LuckyNumber25G2Explainer,
  TornPages25G2Explainer,
  DateBoxes25G2Explainer,
  GreedyRemove25G2Explainer,
  SubtractEight25G2Explainer,
  ShapeSums25G2Explainer,
  AppendDigits25G2Explainer,
  ModClues25G2Explainer,
  BalanceNumbers25G2Explainer,
} from './tryCheckExplainers25G2'
import RectSquare25G3Illustration from './RectSquare25G3Illustration'
import RectSquare25G3Explainer from './RectSquare25G3Explainer'
import StationMap25G3Illustration from './StationMap25G3Illustration'
import StationMap25G3Explainer from './StationMap25G3Explainer'
import Folding25G3Illustration, { Folding25G3Option } from './Folding25G3Illustration'
import Folding25G3Explainer from './Folding25G3Explainer'
import Assemble25G3Illustration from './Assemble25G3Illustration'
import Assemble25G3Explainer from './Assemble25G3Explainer'
import Coin25G3Illustration, { Coin25G3Option } from './Coin25G3Illustration'
import Coin25G3Explainer from './Coin25G3Explainer'
import MultGrid25G3Illustration from './MultGrid25G3Illustration'
import MultGrid25G3Explainer from './MultGrid25G3Explainer'
import Symmetry25G3Illustration from './Symmetry25G3Illustration'
import Symmetry25G3Explainer from './Symmetry25G3Explainer'
import ParaDivide25G3Illustration from './ParaDivide25G3Illustration'
import ParaDivide25G3Explainer from './ParaDivide25G3Explainer'
import Elephant25G3Illustration from './Elephant25G3Illustration'
import Elephant25G3Explainer from './Elephant25G3Explainer'
// 2019 G1 Semifinal (WMI-19P1A) — prelim
import CubeStack19P1Illustration from './CubeStack19P1Illustration'
import CubeStack19P1Explainer from './CubeStack19P1Explainer'
import TriangleFill19P1Illustration from './TriangleFill19P1Illustration'
import TriangleFill19P1Explainer from './TriangleFill19P1Explainer'
import BalanceSub19P1Illustration from './BalanceSub19P1Illustration'
import BalanceSub19P1Explainer from './BalanceSub19P1Explainer'
import SymbolPos19P1Illustration from './SymbolPos19P1Illustration'
import SymbolPos19P1Explainer from './SymbolPos19P1Explainer'
import ArrowGrid19P1Illustration from './ArrowGrid19P1Illustration'
import ArrowGrid19P1Explainer from './ArrowGrid19P1Explainer'
import AppleAdd19P1Illustration from './AppleAdd19P1Illustration'
import AppleAdd19P1Explainer from './AppleAdd19P1Explainer'
import NumberBoard19P1Illustration from './NumberBoard19P1Illustration'
import NumberBoard19P1Explainer from './NumberBoard19P1Explainer'
import CylinderCount19P1Illustration from './CylinderCount19P1Illustration'
import CylinderCount19P1Explainer from './CylinderCount19P1Explainer'
import TrapTriangles19P1Illustration from './TrapTriangles19P1Illustration'
import TrapTriangles19P1Explainer from './TrapTriangles19P1Explainer'
import TilePath19P1Illustration from './TilePath19P1Illustration'
import TilePath19P1Explainer from './TilePath19P1Explainer'
import ShapeJoin19P1Illustration from './ShapeJoin19P1Illustration'
import ShapeJoin19P1Explainer from './ShapeJoin19P1Explainer'
import BeltPulley19P1Illustration from './BeltPulley19P1Illustration'
import BeltPulley19P1Explainer from './BeltPulley19P1Explainer'
import DigitRule19P1Illustration from './DigitRule19P1Illustration'
import DigitRule19P1Explainer from './DigitRule19P1Explainer'
import TilePieces19P1Illustration from './TilePieces19P1Illustration'
import TilePieces19P1Explainer from './TilePieces19P1Explainer'
import SymbolGrid19P1Illustration from './SymbolGrid19P1Illustration'
import SymbolGrid19P1Explainer from './SymbolGrid19P1Explainer'
import SquareTriangles19P1Illustration from './SquareTriangles19P1Illustration'
import SquareTriangles19P1Explainer from './SquareTriangles19P1Explainer'
import FlowerPiece19P1Illustration from './FlowerPiece19P1Illustration'
import FlowerPiece19P1Explainer from './FlowerPiece19P1Explainer'
import LetterOrder19P1Illustration from './LetterOrder19P1Illustration'
import LetterOrder19P1Explainer from './LetterOrder19P1Explainer'
import P19G2Q3Illustration from './P19G2Q3Illustration'
import P19G2Q3Explainer from './P19G2Q3Explainer'
import P19G2Q5Illustration from './P19G2Q5Illustration'
import P19G2Q5Explainer from './P19G2Q5Explainer'
import P19G2Q6Illustration from './P19G2Q6Illustration'
import P19G2Q6Explainer from './P19G2Q6Explainer'
import P19G2Q7Illustration from './P19G2Q7Illustration'
import P19G2Q7Explainer from './P19G2Q7Explainer'
import P19G2Q11Illustration from './P19G2Q11Illustration'
import P19G2Q11Explainer from './P19G2Q11Explainer'
import P19G2Q12Illustration from './P19G2Q12Illustration'
import P19G2Q12Explainer from './P19G2Q12Explainer'
import P19G2Q21Illustration from './P19G2Q21Illustration'
import P19G2Q21Explainer from './P19G2Q21Explainer'
import P19G2Q23Illustration from './P19G2Q23Illustration'
import P19G2Q23Explainer from './P19G2Q23Explainer'
import P19G2Q25Illustration from './P19G2Q25Illustration'
import P19G2Q25Explainer from './P19G2Q25Explainer'
import P19G3Q5Illustration from './P19G3Q5Illustration'
import P19G3Q5Explainer from './P19G3Q5Explainer'
import P19G3Q6Illustration from './P19G3Q6Illustration'
import P19G3Q6Explainer from './P19G3Q6Explainer'
import P19G3Q11Illustration from './P19G3Q11Illustration'
import P19G3Q11Explainer from './P19G3Q11Explainer'
import P19G3Q13Illustration from './P19G3Q13Illustration'
import P19G3Q13Explainer from './P19G3Q13Explainer'
import P19G3Q17Illustration from './P19G3Q17Illustration'
import P19G3Q17Explainer from './P19G3Q17Explainer'
import P19G3Q20Illustration from './P19G3Q20Illustration'
import P19G3Q20Explainer from './P19G3Q20Explainer'
import P19G3Q25Illustration from './P19G3Q25Illustration'
import P19G3Q25Explainer from './P19G3Q25Explainer'
import P20G1Q6Illustration from './P20G1Q6Illustration'
import P20G1Q6Explainer from './P20G1Q6Explainer'
import P20G1Q8Illustration from './P20G1Q8Illustration'
import P20G1Q8Explainer from './P20G1Q8Explainer'
import P20G1Q9Illustration from './P20G1Q9Illustration'
import P20G1Q9Explainer from './P20G1Q9Explainer'
import P20G1Q19Illustration from './P20G1Q19Illustration'
import P20G1Q19Explainer from './P20G1Q19Explainer'
import P20G1Q22Illustration from './P20G1Q22Illustration'
import P20G1Q22Explainer from './P20G1Q22Explainer'
import P20G1Q24Illustration from './P20G1Q24Illustration'
import P20G1Q24Explainer from './P20G1Q24Explainer'
import P20G1Q25Illustration from './P20G1Q25Illustration'
import P20G1Q25Explainer from './P20G1Q25Explainer'
import P20G2Q6Illustration from './P20G2Q6Illustration'
import P20G2Q6Explainer from './P20G2Q6Explainer'
import P20G2Q7Illustration from './P20G2Q7Illustration'
import P20G2Q7Explainer from './P20G2Q7Explainer'
import P20G2Q9Illustration from './P20G2Q9Illustration'
import P20G2Q9Explainer from './P20G2Q9Explainer'
import P20G2Q18Illustration from './P20G2Q18Illustration'
import P20G2Q18Explainer from './P20G2Q18Explainer'
import P20G2Q23Illustration from './P20G2Q23Illustration'
import P20G2Q23Explainer from './P20G2Q23Explainer'
import P20G2Q24Illustration from './P20G2Q24Illustration'
import P20G2Q24Explainer from './P20G2Q24Explainer'
import P20G2Q25Illustration from './P20G2Q25Illustration'
import P20G2Q25Explainer from './P20G2Q25Explainer'
import P20G3Q4Illustration from './P20G3Q4Illustration'
import P20G3Q4Explainer from './P20G3Q4Explainer'
import P20G3Q5Illustration from './P20G3Q5Illustration'
import P20G3Q5Explainer from './P20G3Q5Explainer'
import P20G3Q6Illustration from './P20G3Q6Illustration'
import P20G3Q6Explainer from './P20G3Q6Explainer'
import P20G3Q11Illustration from './P20G3Q11Illustration'
import P20G3Q11Explainer from './P20G3Q11Explainer'
import P20G3Q14Illustration from './P20G3Q14Illustration'
import P20G3Q14Explainer from './P20G3Q14Explainer'
import P20G3Q17Illustration from './P20G3Q17Illustration'
import P20G3Q17Explainer from './P20G3Q17Explainer'
import P20G3Q20Illustration from './P20G3Q20Illustration'
import P20G3Q20Explainer from './P20G3Q20Explainer'
import P20G3Q23Illustration from './P20G3Q23Illustration'
import P20G3Q23Explainer from './P20G3Q23Explainer'
import P21G1Q3Illustration from './P21G1Q3Illustration'
import P21G1Q3Explainer from './P21G1Q3Explainer'
import P21G1Q10Illustration from './P21G1Q10Illustration'
import P21G1Q10Explainer from './P21G1Q10Explainer'
import P21G1Q12Illustration from './P21G1Q12Illustration'
import P21G1Q12Explainer from './P21G1Q12Explainer'
import P21G1Q13Illustration from './P21G1Q13Illustration'
import P21G1Q13Explainer from './P21G1Q13Explainer'
import P21G1Q16Illustration from './P21G1Q16Illustration'
import P21G1Q16Explainer from './P21G1Q16Explainer'
import P21G1Q17Illustration from './P21G1Q17Illustration'
import P21G1Q17Explainer from './P21G1Q17Explainer'
import P21G1Q19Illustration from './P21G1Q19Illustration'
import P21G1Q19Explainer from './P21G1Q19Explainer'
import P21G1Q21Illustration from './P21G1Q21Illustration'
import P21G1Q21Explainer from './P21G1Q21Explainer'
import P21G1Q22Illustration from './P21G1Q22Illustration'
import P21G1Q22Explainer from './P21G1Q22Explainer'
import P21G1Q23Illustration from './P21G1Q23Illustration'
import P21G1Q23Explainer from './P21G1Q23Explainer'
import P21G1Q24Illustration from './P21G1Q24Illustration'
import P21G1Q24Explainer from './P21G1Q24Explainer'
import P21G1Q25Illustration from './P21G1Q25Illustration'
import P21G1Q25Explainer from './P21G1Q25Explainer'
import P21G2Q10Illustration from './P21G2Q10Illustration'
import P21G2Q10Explainer from './P21G2Q10Explainer'
import P21G2Q14Illustration from './P21G2Q14Illustration'
import P21G2Q14Explainer from './P21G2Q14Explainer'
import P21G2Q16Illustration from './P21G2Q16Illustration'
import P21G2Q16Explainer from './P21G2Q16Explainer'
import P21G2Q17Illustration from './P21G2Q17Illustration'
import P21G2Q17Explainer from './P21G2Q17Explainer'
import P21G2Q19Illustration from './P21G2Q19Illustration'
import P21G2Q19Explainer from './P21G2Q19Explainer'
import P21G2Q20Illustration from './P21G2Q20Illustration'
import P21G2Q20Explainer from './P21G2Q20Explainer'
import P21G2Q21Illustration from './P21G2Q21Illustration'
import P21G2Q21Explainer from './P21G2Q21Explainer'
import P21G2Q22Illustration from './P21G2Q22Illustration'
import P21G2Q22Explainer from './P21G2Q22Explainer'
import P21G2Q23Illustration from './P21G2Q23Illustration'
import P21G2Q23Explainer from './P21G2Q23Explainer'
import P21G2Q25Illustration from './P21G2Q25Illustration'
import P21G2Q25Explainer from './P21G2Q25Explainer'
import P21G3Q9Illustration from './P21G3Q9Illustration'
import P21G3Q9Explainer from './P21G3Q9Explainer'
import P21G3Q10Illustration from './P21G3Q10Illustration'
import P21G3Q10Explainer from './P21G3Q10Explainer'
import P21G3Q11Illustration from './P21G3Q11Illustration'
import P21G3Q11Explainer from './P21G3Q11Explainer'
import P21G3Q14Illustration from './P21G3Q14Illustration'
import P21G3Q14Explainer from './P21G3Q14Explainer'
import P21G3Q18Illustration from './P21G3Q18Illustration'
import P21G3Q18Explainer from './P21G3Q18Explainer'
import P21G3Q20Illustration from './P21G3Q20Illustration'
import P21G3Q20Explainer from './P21G3Q20Explainer'
import P21G3Q22Illustration from './P21G3Q22Illustration'
import P21G3Q22Explainer from './P21G3Q22Explainer'
import P21G3Q23Illustration from './P21G3Q23Illustration'
import P21G3Q23Explainer from './P21G3Q23Explainer'
import P21G3Q25Illustration from './P21G3Q25Illustration'
import P21G3Q25Explainer from './P21G3Q25Explainer'
import P22G1Q1Illustration from './P22G1Q1Illustration'
import P22G1Q1Explainer from './P22G1Q1Explainer'
import P22G1Q4Illustration from './P22G1Q4Illustration'
import P22G1Q4Explainer from './P22G1Q4Explainer'
import P22G1Q7Illustration from './P22G1Q7Illustration'
import P22G1Q7Explainer from './P22G1Q7Explainer'
import P22G1Q8Illustration from './P22G1Q8Illustration'
import P22G1Q8Explainer from './P22G1Q8Explainer'
import P22G1Q11Illustration from './P22G1Q11Illustration'
import P22G1Q11Explainer from './P22G1Q11Explainer'
import P22G1Q14Illustration from './P22G1Q14Illustration'
import P22G1Q14Explainer from './P22G1Q14Explainer'
import P22G1Q15Illustration from './P22G1Q15Illustration'
import P22G1Q15Explainer from './P22G1Q15Explainer'
import P22G1Q17Illustration from './P22G1Q17Illustration'
import P22G1Q17Explainer from './P22G1Q17Explainer'
import P22G1Q19Illustration from './P22G1Q19Illustration'
import P22G1Q19Explainer from './P22G1Q19Explainer'
import P22G1Q20Illustration from './P22G1Q20Illustration'
import P22G1Q20Explainer from './P22G1Q20Explainer'
import P22G1Q21Illustration from './P22G1Q21Illustration'
import P22G1Q21Explainer from './P22G1Q21Explainer'
import P22G1Q22Illustration from './P22G1Q22Illustration'
import P22G1Q22Explainer from './P22G1Q22Explainer'
import P22G1Q23Illustration from './P22G1Q23Illustration'
import P22G1Q23Explainer from './P22G1Q23Explainer'
import P22G1Q25Illustration from './P22G1Q25Illustration'
import P22G1Q25Explainer from './P22G1Q25Explainer'
import P22G2Q7Illustration from './P22G2Q7Illustration'
import P22G2Q7Explainer from './P22G2Q7Explainer'
import P22G2Q11Illustration from './P22G2Q11Illustration'
import P22G2Q11Explainer from './P22G2Q11Explainer'
import P22G2Q17Illustration from './P22G2Q17Illustration'
import P22G2Q17Explainer from './P22G2Q17Explainer'
import P22G2Q19Illustration from './P22G2Q19Illustration'
import P22G2Q19Explainer from './P22G2Q19Explainer'
import P22G2Q20Illustration from './P22G2Q20Illustration'
import P22G2Q20Explainer from './P22G2Q20Explainer'
import P22G2Q21Illustration from './P22G2Q21Illustration'
import P22G2Q21Explainer from './P22G2Q21Explainer'
import P22G2Q22Illustration from './P22G2Q22Illustration'
import P22G2Q22Explainer from './P22G2Q22Explainer'
import P22G2Q23Illustration from './P22G2Q23Illustration'
import P22G2Q23Explainer from './P22G2Q23Explainer'
import P22G2Q25Illustration from './P22G2Q25Illustration'
import P22G2Q25Explainer from './P22G2Q25Explainer'
import P22G3Q3Illustration from './P22G3Q3Illustration'
import P22G3Q3Explainer from './P22G3Q3Explainer'
import P22G3Q5Illustration from './P22G3Q5Illustration'
import P22G3Q5Explainer from './P22G3Q5Explainer'
import P22G3Q7Illustration from './P22G3Q7Illustration'
import P22G3Q7Explainer from './P22G3Q7Explainer'
import P22G3Q9Illustration from './P22G3Q9Illustration'
import P22G3Q9Explainer from './P22G3Q9Explainer'
import P22G3Q10Illustration from './P22G3Q10Illustration'
import P22G3Q10Explainer from './P22G3Q10Explainer'
import P22G3Q17Illustration from './P22G3Q17Illustration'
import P22G3Q17Explainer from './P22G3Q17Explainer'
import P22G3Q18Illustration from './P22G3Q18Illustration'
import P22G3Q18Explainer from './P22G3Q18Explainer'
import P22G3Q21Illustration from './P22G3Q21Illustration'
import P22G3Q21Explainer from './P22G3Q21Explainer'
import P22G3Q22Illustration from './P22G3Q22Illustration'
import P22G3Q22Explainer from './P22G3Q22Explainer'
import P22G3Q24Illustration from './P22G3Q24Illustration'
import P22G3Q24Explainer from './P22G3Q24Explainer'
import P23G1Q10Illustration from './P23G1Q10Illustration'
import P23G1Q10Explainer from './P23G1Q10Explainer'
import P23G1Q15Illustration from './P23G1Q15Illustration'
import P23G1Q15Explainer from './P23G1Q15Explainer'
import P23G1Q16Illustration from './P23G1Q16Illustration'
import P23G1Q16Explainer from './P23G1Q16Explainer'
import P23G1Q17Illustration from './P23G1Q17Illustration'
import P23G1Q17Explainer from './P23G1Q17Explainer'
import P23G1Q18Illustration from './P23G1Q18Illustration'
import P23G1Q18Explainer from './P23G1Q18Explainer'
import P23G1Q20Illustration from './P23G1Q20Illustration'
import P23G1Q20Explainer from './P23G1Q20Explainer'
import P23G1Q22Illustration from './P23G1Q22Illustration'
import P23G1Q22Explainer from './P23G1Q22Explainer'
import P23G1Q24Illustration from './P23G1Q24Illustration'
import P23G1Q24Explainer from './P23G1Q24Explainer'
import P23G1Q25Illustration from './P23G1Q25Illustration'
import P23G1Q25Explainer from './P23G1Q25Explainer'
import P23G2Q2Illustration from './P23G2Q2Illustration'
import P23G2Q2Explainer from './P23G2Q2Explainer'
import P23G2Q4Illustration from './P23G2Q4Illustration'
import P23G2Q4Explainer from './P23G2Q4Explainer'
import P23G2Q5Illustration from './P23G2Q5Illustration'
import P23G2Q5Explainer from './P23G2Q5Explainer'
import P23G2Q7Illustration from './P23G2Q7Illustration'
import P23G2Q7Explainer from './P23G2Q7Explainer'
import P23G2Q12Illustration from './P23G2Q12Illustration'
import P23G2Q12Explainer from './P23G2Q12Explainer'
import P23G2Q17Illustration from './P23G2Q17Illustration'
import P23G2Q17Explainer from './P23G2Q17Explainer'
import P23G2Q18Illustration from './P23G2Q18Illustration'
import P23G2Q18Explainer from './P23G2Q18Explainer'
import P23G2Q24Illustration from './P23G2Q24Illustration'
import P23G2Q24Explainer from './P23G2Q24Explainer'
import P23G2Q25Illustration from './P23G2Q25Illustration'
import P23G2Q25Explainer from './P23G2Q25Explainer'
import P23G3Q4Illustration from './P23G3Q4Illustration'
import P23G3Q4Explainer from './P23G3Q4Explainer'
import P23G3Q5Illustration from './P23G3Q5Illustration'
import P23G3Q5Explainer from './P23G3Q5Explainer'
import P23G3Q8Illustration from './P23G3Q8Illustration'
import P23G3Q8Explainer from './P23G3Q8Explainer'
import P23G3Q9Illustration from './P23G3Q9Illustration'
import P23G3Q9Explainer from './P23G3Q9Explainer'
import P23G3Q14Illustration from './P23G3Q14Illustration'
import P23G3Q14Explainer from './P23G3Q14Explainer'
import P23G3Q16Illustration from './P23G3Q16Illustration'
import P23G3Q16Explainer from './P23G3Q16Explainer'
import P23G3Q18Illustration from './P23G3Q18Illustration'
import P23G3Q18Explainer from './P23G3Q18Explainer'
import P23G3Q23Illustration from './P23G3Q23Illustration'
import P23G3Q23Explainer from './P23G3Q23Explainer'
import P23G3Q24Illustration from './P23G3Q24Illustration'
import P23G3Q24Explainer from './P23G3Q24Explainer'
import P23G3Q25Illustration from './P23G3Q25Illustration'
import P23G3Q25Explainer from './P23G3Q25Explainer'
import P24G1Q4Illustration from './P24G1Q4Illustration'
import P24G1Q4Explainer from './P24G1Q4Explainer'
import P24G1Q6Illustration from './P24G1Q6Illustration'
import P24G1Q6Explainer from './P24G1Q6Explainer'
import P24G1Q11Illustration from './P24G1Q11Illustration'
import P24G1Q11Explainer from './P24G1Q11Explainer'
import P24G1Q12Illustration from './P24G1Q12Illustration'
import P24G1Q12Explainer from './P24G1Q12Explainer'
import P24G1Q13Illustration from './P24G1Q13Illustration'
import P24G1Q13Explainer from './P24G1Q13Explainer'
import P24G1Q14Illustration from './P24G1Q14Illustration'
import P24G1Q14Explainer from './P24G1Q14Explainer'
import P24G1Q15Illustration from './P24G1Q15Illustration'
import P24G1Q15Explainer from './P24G1Q15Explainer'
import P24G1Q17Illustration from './P24G1Q17Illustration'
import P24G1Q17Explainer from './P24G1Q17Explainer'
import P24G1Q18Illustration from './P24G1Q18Illustration'
import P24G1Q18Explainer from './P24G1Q18Explainer'
import P24G1Q19Illustration from './P24G1Q19Illustration'
import P24G1Q19Explainer from './P24G1Q19Explainer'
import P24G1Q21Illustration from './P24G1Q21Illustration'
import P24G1Q21Explainer from './P24G1Q21Explainer'
import P24G1Q22Illustration from './P24G1Q22Illustration'
import P24G1Q22Explainer from './P24G1Q22Explainer'
import P24G1Q23Illustration from './P24G1Q23Illustration'
import P24G1Q23Explainer from './P24G1Q23Explainer'
import P24G1Q24Illustration from './P24G1Q24Illustration'
import P24G1Q24Explainer from './P24G1Q24Explainer'
import P24G1Q25Illustration from './P24G1Q25Illustration'
import P24G1Q25Explainer from './P24G1Q25Explainer'
import P24G2Q4Illustration from './P24G2Q4Illustration'
import P24G2Q4Explainer from './P24G2Q4Explainer'
import P24G2Q9Illustration from './P24G2Q9Illustration'
import P24G2Q9Explainer from './P24G2Q9Explainer'
import P24G2Q14Illustration from './P24G2Q14Illustration'
import P24G2Q14Explainer from './P24G2Q14Explainer'
import P24G2Q15Illustration from './P24G2Q15Illustration'
import P24G2Q15Explainer from './P24G2Q15Explainer'
import P24G2Q17Illustration from './P24G2Q17Illustration'
import P24G2Q17Explainer from './P24G2Q17Explainer'
import P24G2Q18Illustration from './P24G2Q18Illustration'
import P24G2Q18Explainer from './P24G2Q18Explainer'
import P24G2Q19Illustration from './P24G2Q19Illustration'
import P24G2Q19Explainer from './P24G2Q19Explainer'
import P24G2Q20Illustration from './P24G2Q20Illustration'
import P24G2Q20Explainer from './P24G2Q20Explainer'
import P24G2Q22Illustration from './P24G2Q22Illustration'
import P24G2Q22Explainer from './P24G2Q22Explainer'
import P24G2Q23Illustration from './P24G2Q23Illustration'
import P24G2Q23Explainer from './P24G2Q23Explainer'
import P24G2Q25Illustration from './P24G2Q25Illustration'
import P24G2Q25Explainer from './P24G2Q25Explainer'
import P24G3Q1Illustration from './P24G3Q1Illustration'
import P24G3Q1Explainer from './P24G3Q1Explainer'
import P24G3Q3Illustration from './P24G3Q3Illustration'
import P24G3Q3Explainer from './P24G3Q3Explainer'
import P24G3Q8Illustration from './P24G3Q8Illustration'
import P24G3Q8Explainer from './P24G3Q8Explainer'
import P24G3Q12Illustration from './P24G3Q12Illustration'
import P24G3Q12Explainer from './P24G3Q12Explainer'
import P24G3Q17Illustration from './P24G3Q17Illustration'
import P24G3Q17Explainer from './P24G3Q17Explainer'
import P24G3Q18Illustration from './P24G3Q18Illustration'
import P24G3Q18Explainer from './P24G3Q18Explainer'
import P24G3Q19Illustration from './P24G3Q19Illustration'
import P24G3Q19Explainer from './P24G3Q19Explainer'
import P24G3Q23Illustration from './P24G3Q23Illustration'
import P24G3Q23Explainer from './P24G3Q23Explainer'
import P25G1Q2Illustration from './P25G1Q2Illustration'
import P25G1Q2Explainer from './P25G1Q2Explainer'
import P25G1Q3Illustration from './P25G1Q3Illustration'
import P25G1Q3Explainer from './P25G1Q3Explainer'
import P25G1Q4Illustration from './P25G1Q4Illustration'
import P25G1Q4Explainer from './P25G1Q4Explainer'
import P25G1Q6Illustration from './P25G1Q6Illustration'
import P25G1Q6Explainer from './P25G1Q6Explainer'
import P25G1Q11Illustration from './P25G1Q11Illustration'
import P25G1Q11Explainer from './P25G1Q11Explainer'
import P25G1Q13Illustration from './P25G1Q13Illustration'
import P25G1Q13Explainer from './P25G1Q13Explainer'
import P25G1Q15Illustration from './P25G1Q15Illustration'
import P25G1Q15Explainer from './P25G1Q15Explainer'
import P25G1Q16Illustration from './P25G1Q16Illustration'
import P25G1Q16Explainer from './P25G1Q16Explainer'
import P25G1Q18Illustration from './P25G1Q18Illustration'
import P25G1Q18Explainer from './P25G1Q18Explainer'
import P25G1Q19Illustration from './P25G1Q19Illustration'
import P25G1Q19Explainer from './P25G1Q19Explainer'
import P25G1Q20Illustration from './P25G1Q20Illustration'
import P25G1Q20Explainer from './P25G1Q20Explainer'
import P25G1Q22Illustration from './P25G1Q22Illustration'
import P25G1Q22Explainer from './P25G1Q22Explainer'
import P25G1Q24Illustration from './P25G1Q24Illustration'
import P25G1Q24Explainer from './P25G1Q24Explainer'
import P25G1Q25Illustration from './P25G1Q25Illustration'
import P25G1Q25Explainer from './P25G1Q25Explainer'
import P25G2Q2Illustration from './P25G2Q2Illustration'
import P25G2Q2Explainer from './P25G2Q2Explainer'
import P25G2Q3Illustration from './P25G2Q3Illustration'
import P25G2Q3Explainer from './P25G2Q3Explainer'
import P25G2Q15Illustration from './P25G2Q15Illustration'
import P25G2Q15Explainer from './P25G2Q15Explainer'
import P25G2Q17Illustration from './P25G2Q17Illustration'
import P25G2Q17Explainer from './P25G2Q17Explainer'
import P25G2Q19Illustration from './P25G2Q19Illustration'
import P25G2Q19Explainer from './P25G2Q19Explainer'
import P25G2Q21Illustration from './P25G2Q21Illustration'
import P25G2Q21Explainer from './P25G2Q21Explainer'
import P25G2Q22Illustration from './P25G2Q22Illustration'
import P25G2Q22Explainer from './P25G2Q22Explainer'
import P25G2Q23Illustration from './P25G2Q23Illustration'
import P25G2Q23Explainer from './P25G2Q23Explainer'
import P25G3Q4Illustration from './P25G3Q4Illustration'
import P25G3Q4Explainer from './P25G3Q4Explainer'
import P25G3Q9Illustration from './P25G3Q9Illustration'
import P25G3Q9Explainer from './P25G3Q9Explainer'
import P25G3Q14Illustration from './P25G3Q14Illustration'
import P25G3Q14Explainer from './P25G3Q14Explainer'
import P25G3Q15Illustration from './P25G3Q15Illustration'
import P25G3Q15Explainer from './P25G3Q15Explainer'
import P25G3Q18Illustration from './P25G3Q18Illustration'
import P25G3Q18Explainer from './P25G3Q18Explainer'
import P25G3Q19Illustration from './P25G3Q19Illustration'
import P25G3Q19Explainer from './P25G3Q19Explainer'
import P25G3Q22Illustration from './P25G3Q22Illustration'
import P25G3Q22Explainer from './P25G3Q22Explainer'

interface QuestionVisual {
  Illustration?: ComponentType
  Explainer?: ComponentType<ExplainerProps>
}

const VISUALS: Record<string, QuestionVisual> = {
  // 2019 G1 Semifinal (WMI-19P1A) — prelim
  'WMI-19P1A-Q3': { Illustration: SymbolPos19P1Illustration, Explainer: SymbolPos19P1Explainer },
  'WMI-19P1A-Q4': { Illustration: CubeStack19P1Illustration, Explainer: CubeStack19P1Explainer },
  'WMI-19P1A-Q5': { Illustration: ArrowGrid19P1Illustration, Explainer: ArrowGrid19P1Explainer },
  'WMI-19P1A-Q6': { Illustration: TriangleFill19P1Illustration, Explainer: TriangleFill19P1Explainer },
  'WMI-19P1A-Q8': { Illustration: AppleAdd19P1Illustration, Explainer: AppleAdd19P1Explainer },
  'WMI-19P1A-Q9': { Illustration: NumberBoard19P1Illustration, Explainer: NumberBoard19P1Explainer },
  'WMI-19P1A-Q10': { Illustration: CylinderCount19P1Illustration, Explainer: CylinderCount19P1Explainer },
  'WMI-19P1A-Q11': { Illustration: TrapTriangles19P1Illustration, Explainer: TrapTriangles19P1Explainer },
  'WMI-19P1A-Q12': { Illustration: TilePath19P1Illustration, Explainer: TilePath19P1Explainer },
  'WMI-19P1A-Q13': { Illustration: ShapeJoin19P1Illustration, Explainer: ShapeJoin19P1Explainer },
  'WMI-19P1A-Q14': { Illustration: BeltPulley19P1Illustration, Explainer: BeltPulley19P1Explainer },
  'WMI-19P1A-Q18': { Illustration: DigitRule19P1Illustration, Explainer: DigitRule19P1Explainer },
  'WMI-19P1A-Q19': { Illustration: TilePieces19P1Illustration, Explainer: TilePieces19P1Explainer },
  'WMI-19P1A-Q20': { Illustration: SymbolGrid19P1Illustration, Explainer: SymbolGrid19P1Explainer },
  'WMI-19P1A-Q21': { Illustration: SquareTriangles19P1Illustration, Explainer: SquareTriangles19P1Explainer },
  'WMI-19P1A-Q23': { Illustration: BalanceSub19P1Illustration, Explainer: BalanceSub19P1Explainer },
  'WMI-19P1A-Q24': { Illustration: FlowerPiece19P1Illustration, Explainer: FlowerPiece19P1Explainer },
  'WMI-19P1A-Q25': { Illustration: LetterOrder19P1Illustration, Explainer: LetterOrder19P1Explainer },
  // 19 G2 Semifinal (WMI-19P2A)
  'WMI-19P2A-Q3': { Illustration: P19G2Q3Illustration, Explainer: P19G2Q3Explainer },
  'WMI-19P2A-Q5': { Illustration: P19G2Q5Illustration, Explainer: P19G2Q5Explainer },
  'WMI-19P2A-Q6': { Illustration: P19G2Q6Illustration, Explainer: P19G2Q6Explainer },
  'WMI-19P2A-Q7': { Illustration: P19G2Q7Illustration, Explainer: P19G2Q7Explainer },
  'WMI-19P2A-Q11': { Illustration: P19G2Q11Illustration, Explainer: P19G2Q11Explainer },
  'WMI-19P2A-Q12': { Illustration: P19G2Q12Illustration, Explainer: P19G2Q12Explainer },
  'WMI-19P2A-Q21': { Illustration: P19G2Q21Illustration, Explainer: P19G2Q21Explainer },
  'WMI-19P2A-Q23': { Illustration: P19G2Q23Illustration, Explainer: P19G2Q23Explainer },
  'WMI-19P2A-Q25': { Illustration: P19G2Q25Illustration, Explainer: P19G2Q25Explainer },
  // 19 G3 Semifinal (WMI-19P3A)
  'WMI-19P3A-Q5': { Illustration: P19G3Q5Illustration, Explainer: P19G3Q5Explainer },
  'WMI-19P3A-Q6': { Illustration: P19G3Q6Illustration, Explainer: P19G3Q6Explainer },
  'WMI-19P3A-Q11': { Illustration: P19G3Q11Illustration, Explainer: P19G3Q11Explainer },
  'WMI-19P3A-Q13': { Illustration: P19G3Q13Illustration, Explainer: P19G3Q13Explainer },
  'WMI-19P3A-Q17': { Illustration: P19G3Q17Illustration, Explainer: P19G3Q17Explainer },
  'WMI-19P3A-Q20': { Illustration: P19G3Q20Illustration, Explainer: P19G3Q20Explainer },
  'WMI-19P3A-Q25': { Illustration: P19G3Q25Illustration, Explainer: P19G3Q25Explainer },
  // 20 G1 Semifinal (WMI-20P1A)
  'WMI-20P1A-Q6': { Illustration: P20G1Q6Illustration, Explainer: P20G1Q6Explainer },
  'WMI-20P1A-Q8': { Illustration: P20G1Q8Illustration, Explainer: P20G1Q8Explainer },
  'WMI-20P1A-Q9': { Illustration: P20G1Q9Illustration, Explainer: P20G1Q9Explainer },
  'WMI-20P1A-Q19': { Illustration: P20G1Q19Illustration, Explainer: P20G1Q19Explainer },
  'WMI-20P1A-Q22': { Illustration: P20G1Q22Illustration, Explainer: P20G1Q22Explainer },
  'WMI-20P1A-Q24': { Illustration: P20G1Q24Illustration, Explainer: P20G1Q24Explainer },
  'WMI-20P1A-Q25': { Illustration: P20G1Q25Illustration, Explainer: P20G1Q25Explainer },
  // 20 G2 Semifinal (WMI-20P2A)
  'WMI-20P2A-Q6': { Illustration: P20G2Q6Illustration, Explainer: P20G2Q6Explainer },
  'WMI-20P2A-Q7': { Illustration: P20G2Q7Illustration, Explainer: P20G2Q7Explainer },
  'WMI-20P2A-Q9': { Illustration: P20G2Q9Illustration, Explainer: P20G2Q9Explainer },
  'WMI-20P2A-Q18': { Illustration: P20G2Q18Illustration, Explainer: P20G2Q18Explainer },
  'WMI-20P2A-Q23': { Illustration: P20G2Q23Illustration, Explainer: P20G2Q23Explainer },
  'WMI-20P2A-Q24': { Illustration: P20G2Q24Illustration, Explainer: P20G2Q24Explainer },
  'WMI-20P2A-Q25': { Illustration: P20G2Q25Illustration, Explainer: P20G2Q25Explainer },
  // 20 G3 Semifinal (WMI-20P3A)
  'WMI-20P3A-Q4': { Illustration: P20G3Q4Illustration, Explainer: P20G3Q4Explainer },
  'WMI-20P3A-Q5': { Illustration: P20G3Q5Illustration, Explainer: P20G3Q5Explainer },
  'WMI-20P3A-Q6': { Illustration: P20G3Q6Illustration, Explainer: P20G3Q6Explainer },
  'WMI-20P3A-Q11': { Illustration: P20G3Q11Illustration, Explainer: P20G3Q11Explainer },
  'WMI-20P3A-Q14': { Illustration: P20G3Q14Illustration, Explainer: P20G3Q14Explainer },
  'WMI-20P3A-Q17': { Illustration: P20G3Q17Illustration, Explainer: P20G3Q17Explainer },
  'WMI-20P3A-Q20': { Illustration: P20G3Q20Illustration, Explainer: P20G3Q20Explainer },
  'WMI-20P3A-Q23': { Illustration: P20G3Q23Illustration, Explainer: P20G3Q23Explainer },
  // 21 G1 Semifinal (WMI-21P1A)
  'WMI-21P1A-Q3': { Illustration: P21G1Q3Illustration, Explainer: P21G1Q3Explainer },
  'WMI-21P1A-Q10': { Illustration: P21G1Q10Illustration, Explainer: P21G1Q10Explainer },
  'WMI-21P1A-Q12': { Illustration: P21G1Q12Illustration, Explainer: P21G1Q12Explainer },
  'WMI-21P1A-Q13': { Illustration: P21G1Q13Illustration, Explainer: P21G1Q13Explainer },
  'WMI-21P1A-Q16': { Illustration: P21G1Q16Illustration, Explainer: P21G1Q16Explainer },
  'WMI-21P1A-Q17': { Illustration: P21G1Q17Illustration, Explainer: P21G1Q17Explainer },
  'WMI-21P1A-Q19': { Illustration: P21G1Q19Illustration, Explainer: P21G1Q19Explainer },
  'WMI-21P1A-Q21': { Illustration: P21G1Q21Illustration, Explainer: P21G1Q21Explainer },
  'WMI-21P1A-Q22': { Illustration: P21G1Q22Illustration, Explainer: P21G1Q22Explainer },
  'WMI-21P1A-Q23': { Illustration: P21G1Q23Illustration, Explainer: P21G1Q23Explainer },
  'WMI-21P1A-Q24': { Illustration: P21G1Q24Illustration, Explainer: P21G1Q24Explainer },
  'WMI-21P1A-Q25': { Illustration: P21G1Q25Illustration, Explainer: P21G1Q25Explainer },
  // 21 G2 Semifinal (WMI-21P2A)
  'WMI-21P2A-Q10': { Illustration: P21G2Q10Illustration, Explainer: P21G2Q10Explainer },
  'WMI-21P2A-Q14': { Illustration: P21G2Q14Illustration, Explainer: P21G2Q14Explainer },
  'WMI-21P2A-Q16': { Illustration: P21G2Q16Illustration, Explainer: P21G2Q16Explainer },
  'WMI-21P2A-Q17': { Illustration: P21G2Q17Illustration, Explainer: P21G2Q17Explainer },
  'WMI-21P2A-Q19': { Illustration: P21G2Q19Illustration, Explainer: P21G2Q19Explainer },
  'WMI-21P2A-Q20': { Illustration: P21G2Q20Illustration, Explainer: P21G2Q20Explainer },
  'WMI-21P2A-Q21': { Illustration: P21G2Q21Illustration, Explainer: P21G2Q21Explainer },
  'WMI-21P2A-Q22': { Illustration: P21G2Q22Illustration, Explainer: P21G2Q22Explainer },
  'WMI-21P2A-Q23': { Illustration: P21G2Q23Illustration, Explainer: P21G2Q23Explainer },
  'WMI-21P2A-Q25': { Illustration: P21G2Q25Illustration, Explainer: P21G2Q25Explainer },
  // 21 G3 Semifinal (WMI-21P3A)
  'WMI-21P3A-Q9': { Illustration: P21G3Q9Illustration, Explainer: P21G3Q9Explainer },
  'WMI-21P3A-Q10': { Illustration: P21G3Q10Illustration, Explainer: P21G3Q10Explainer },
  'WMI-21P3A-Q11': { Illustration: P21G3Q11Illustration, Explainer: P21G3Q11Explainer },
  'WMI-21P3A-Q14': { Illustration: P21G3Q14Illustration, Explainer: P21G3Q14Explainer },
  'WMI-21P3A-Q18': { Illustration: P21G3Q18Illustration, Explainer: P21G3Q18Explainer },
  'WMI-21P3A-Q20': { Illustration: P21G3Q20Illustration, Explainer: P21G3Q20Explainer },
  'WMI-21P3A-Q22': { Illustration: P21G3Q22Illustration, Explainer: P21G3Q22Explainer },
  'WMI-21P3A-Q23': { Illustration: P21G3Q23Illustration, Explainer: P21G3Q23Explainer },
  'WMI-21P3A-Q25': { Illustration: P21G3Q25Illustration, Explainer: P21G3Q25Explainer },
  // 22 G1 Semifinal (WMI-22P1A)
  'WMI-22P1A-Q1': { Illustration: P22G1Q1Illustration, Explainer: P22G1Q1Explainer },
  'WMI-22P1A-Q4': { Illustration: P22G1Q4Illustration, Explainer: P22G1Q4Explainer },
  'WMI-22P1A-Q7': { Illustration: P22G1Q7Illustration, Explainer: P22G1Q7Explainer },
  'WMI-22P1A-Q8': { Illustration: P22G1Q8Illustration, Explainer: P22G1Q8Explainer },
  'WMI-22P1A-Q11': { Illustration: P22G1Q11Illustration, Explainer: P22G1Q11Explainer },
  'WMI-22P1A-Q14': { Illustration: P22G1Q14Illustration, Explainer: P22G1Q14Explainer },
  'WMI-22P1A-Q15': { Illustration: P22G1Q15Illustration, Explainer: P22G1Q15Explainer },
  'WMI-22P1A-Q17': { Illustration: P22G1Q17Illustration, Explainer: P22G1Q17Explainer },
  'WMI-22P1A-Q19': { Illustration: P22G1Q19Illustration, Explainer: P22G1Q19Explainer },
  'WMI-22P1A-Q20': { Illustration: P22G1Q20Illustration, Explainer: P22G1Q20Explainer },
  'WMI-22P1A-Q21': { Illustration: P22G1Q21Illustration, Explainer: P22G1Q21Explainer },
  'WMI-22P1A-Q22': { Illustration: P22G1Q22Illustration, Explainer: P22G1Q22Explainer },
  'WMI-22P1A-Q23': { Illustration: P22G1Q23Illustration, Explainer: P22G1Q23Explainer },
  'WMI-22P1A-Q25': { Illustration: P22G1Q25Illustration, Explainer: P22G1Q25Explainer },
  // 22 G2 Semifinal (WMI-22P2A)
  'WMI-22P2A-Q7': { Illustration: P22G2Q7Illustration, Explainer: P22G2Q7Explainer },
  'WMI-22P2A-Q11': { Illustration: P22G2Q11Illustration, Explainer: P22G2Q11Explainer },
  'WMI-22P2A-Q17': { Illustration: P22G2Q17Illustration, Explainer: P22G2Q17Explainer },
  'WMI-22P2A-Q19': { Illustration: P22G2Q19Illustration, Explainer: P22G2Q19Explainer },
  'WMI-22P2A-Q20': { Illustration: P22G2Q20Illustration, Explainer: P22G2Q20Explainer },
  'WMI-22P2A-Q21': { Illustration: P22G2Q21Illustration, Explainer: P22G2Q21Explainer },
  'WMI-22P2A-Q22': { Illustration: P22G2Q22Illustration, Explainer: P22G2Q22Explainer },
  'WMI-22P2A-Q23': { Illustration: P22G2Q23Illustration, Explainer: P22G2Q23Explainer },
  'WMI-22P2A-Q25': { Illustration: P22G2Q25Illustration, Explainer: P22G2Q25Explainer },
  // 22 G3 Semifinal (WMI-22P3A)
  'WMI-22P3A-Q3': { Illustration: P22G3Q3Illustration, Explainer: P22G3Q3Explainer },
  'WMI-22P3A-Q5': { Illustration: P22G3Q5Illustration, Explainer: P22G3Q5Explainer },
  'WMI-22P3A-Q7': { Illustration: P22G3Q7Illustration, Explainer: P22G3Q7Explainer },
  'WMI-22P3A-Q9': { Illustration: P22G3Q9Illustration, Explainer: P22G3Q9Explainer },
  'WMI-22P3A-Q10': { Illustration: P22G3Q10Illustration, Explainer: P22G3Q10Explainer },
  'WMI-22P3A-Q17': { Illustration: P22G3Q17Illustration, Explainer: P22G3Q17Explainer },
  'WMI-22P3A-Q18': { Illustration: P22G3Q18Illustration, Explainer: P22G3Q18Explainer },
  'WMI-22P3A-Q21': { Illustration: P22G3Q21Illustration, Explainer: P22G3Q21Explainer },
  'WMI-22P3A-Q22': { Illustration: P22G3Q22Illustration, Explainer: P22G3Q22Explainer },
  'WMI-22P3A-Q24': { Illustration: P22G3Q24Illustration, Explainer: P22G3Q24Explainer },
  // 23 G1 Semifinal (WMI-23P1A)
  'WMI-23P1A-Q10': { Illustration: P23G1Q10Illustration, Explainer: P23G1Q10Explainer },
  'WMI-23P1A-Q15': { Illustration: P23G1Q15Illustration, Explainer: P23G1Q15Explainer },
  'WMI-23P1A-Q16': { Illustration: P23G1Q16Illustration, Explainer: P23G1Q16Explainer },
  'WMI-23P1A-Q17': { Illustration: P23G1Q17Illustration, Explainer: P23G1Q17Explainer },
  'WMI-23P1A-Q18': { Illustration: P23G1Q18Illustration, Explainer: P23G1Q18Explainer },
  'WMI-23P1A-Q20': { Illustration: P23G1Q20Illustration, Explainer: P23G1Q20Explainer },
  'WMI-23P1A-Q22': { Illustration: P23G1Q22Illustration, Explainer: P23G1Q22Explainer },
  'WMI-23P1A-Q24': { Illustration: P23G1Q24Illustration, Explainer: P23G1Q24Explainer },
  'WMI-23P1A-Q25': { Illustration: P23G1Q25Illustration, Explainer: P23G1Q25Explainer },
  // 23 G2 Semifinal (WMI-23P2A)
  'WMI-23P2A-Q2': { Illustration: P23G2Q2Illustration, Explainer: P23G2Q2Explainer },
  'WMI-23P2A-Q4': { Illustration: P23G2Q4Illustration, Explainer: P23G2Q4Explainer },
  'WMI-23P2A-Q5': { Illustration: P23G2Q5Illustration, Explainer: P23G2Q5Explainer },
  'WMI-23P2A-Q7': { Illustration: P23G2Q7Illustration, Explainer: P23G2Q7Explainer },
  'WMI-23P2A-Q12': { Illustration: P23G2Q12Illustration, Explainer: P23G2Q12Explainer },
  'WMI-23P2A-Q17': { Illustration: P23G2Q17Illustration, Explainer: P23G2Q17Explainer },
  'WMI-23P2A-Q18': { Illustration: P23G2Q18Illustration, Explainer: P23G2Q18Explainer },
  'WMI-23P2A-Q24': { Illustration: P23G2Q24Illustration, Explainer: P23G2Q24Explainer },
  'WMI-23P2A-Q25': { Illustration: P23G2Q25Illustration, Explainer: P23G2Q25Explainer },
  // 23 G3 Semifinal (WMI-23P3A)
  'WMI-23P3A-Q4': { Illustration: P23G3Q4Illustration, Explainer: P23G3Q4Explainer },
  'WMI-23P3A-Q5': { Illustration: P23G3Q5Illustration, Explainer: P23G3Q5Explainer },
  'WMI-23P3A-Q8': { Illustration: P23G3Q8Illustration, Explainer: P23G3Q8Explainer },
  'WMI-23P3A-Q9': { Illustration: P23G3Q9Illustration, Explainer: P23G3Q9Explainer },
  'WMI-23P3A-Q14': { Illustration: P23G3Q14Illustration, Explainer: P23G3Q14Explainer },
  'WMI-23P3A-Q16': { Illustration: P23G3Q16Illustration, Explainer: P23G3Q16Explainer },
  'WMI-23P3A-Q18': { Illustration: P23G3Q18Illustration, Explainer: P23G3Q18Explainer },
  'WMI-23P3A-Q23': { Illustration: P23G3Q23Illustration, Explainer: P23G3Q23Explainer },
  'WMI-23P3A-Q24': { Illustration: P23G3Q24Illustration, Explainer: P23G3Q24Explainer },
  'WMI-23P3A-Q25': { Illustration: P23G3Q25Illustration, Explainer: P23G3Q25Explainer },
  // 24 G1 Semifinal (WMI-24P1A)
  'WMI-24P1A-Q4': { Illustration: P24G1Q4Illustration, Explainer: P24G1Q4Explainer },
  'WMI-24P1A-Q6': { Illustration: P24G1Q6Illustration, Explainer: P24G1Q6Explainer },
  'WMI-24P1A-Q11': { Illustration: P24G1Q11Illustration, Explainer: P24G1Q11Explainer },
  'WMI-24P1A-Q12': { Illustration: P24G1Q12Illustration, Explainer: P24G1Q12Explainer },
  'WMI-24P1A-Q13': { Illustration: P24G1Q13Illustration, Explainer: P24G1Q13Explainer },
  'WMI-24P1A-Q14': { Illustration: P24G1Q14Illustration, Explainer: P24G1Q14Explainer },
  'WMI-24P1A-Q15': { Illustration: P24G1Q15Illustration, Explainer: P24G1Q15Explainer },
  'WMI-24P1A-Q17': { Illustration: P24G1Q17Illustration, Explainer: P24G1Q17Explainer },
  'WMI-24P1A-Q18': { Illustration: P24G1Q18Illustration, Explainer: P24G1Q18Explainer },
  'WMI-24P1A-Q19': { Illustration: P24G1Q19Illustration, Explainer: P24G1Q19Explainer },
  'WMI-24P1A-Q21': { Illustration: P24G1Q21Illustration, Explainer: P24G1Q21Explainer },
  'WMI-24P1A-Q22': { Illustration: P24G1Q22Illustration, Explainer: P24G1Q22Explainer },
  'WMI-24P1A-Q23': { Illustration: P24G1Q23Illustration, Explainer: P24G1Q23Explainer },
  'WMI-24P1A-Q24': { Illustration: P24G1Q24Illustration, Explainer: P24G1Q24Explainer },
  'WMI-24P1A-Q25': { Illustration: P24G1Q25Illustration, Explainer: P24G1Q25Explainer },
  // 24 G2 Semifinal (WMI-24P2A)
  'WMI-24P2A-Q4': { Illustration: P24G2Q4Illustration, Explainer: P24G2Q4Explainer },
  'WMI-24P2A-Q9': { Illustration: P24G2Q9Illustration, Explainer: P24G2Q9Explainer },
  'WMI-24P2A-Q14': { Illustration: P24G2Q14Illustration, Explainer: P24G2Q14Explainer },
  'WMI-24P2A-Q15': { Illustration: P24G2Q15Illustration, Explainer: P24G2Q15Explainer },
  'WMI-24P2A-Q17': { Illustration: P24G2Q17Illustration, Explainer: P24G2Q17Explainer },
  'WMI-24P2A-Q18': { Illustration: P24G2Q18Illustration, Explainer: P24G2Q18Explainer },
  'WMI-24P2A-Q19': { Illustration: P24G2Q19Illustration, Explainer: P24G2Q19Explainer },
  'WMI-24P2A-Q20': { Illustration: P24G2Q20Illustration, Explainer: P24G2Q20Explainer },
  'WMI-24P2A-Q22': { Illustration: P24G2Q22Illustration, Explainer: P24G2Q22Explainer },
  'WMI-24P2A-Q23': { Illustration: P24G2Q23Illustration, Explainer: P24G2Q23Explainer },
  'WMI-24P2A-Q25': { Illustration: P24G2Q25Illustration, Explainer: P24G2Q25Explainer },
  // 24 G3 Semifinal (WMI-24P3A)
  'WMI-24P3A-Q1': { Illustration: P24G3Q1Illustration, Explainer: P24G3Q1Explainer },
  'WMI-24P3A-Q3': { Illustration: P24G3Q3Illustration, Explainer: P24G3Q3Explainer },
  'WMI-24P3A-Q8': { Illustration: P24G3Q8Illustration, Explainer: P24G3Q8Explainer },
  'WMI-24P3A-Q12': { Illustration: P24G3Q12Illustration, Explainer: P24G3Q12Explainer },
  'WMI-24P3A-Q17': { Illustration: P24G3Q17Illustration, Explainer: P24G3Q17Explainer },
  'WMI-24P3A-Q18': { Illustration: P24G3Q18Illustration, Explainer: P24G3Q18Explainer },
  'WMI-24P3A-Q19': { Illustration: P24G3Q19Illustration, Explainer: P24G3Q19Explainer },
  'WMI-24P3A-Q23': { Illustration: P24G3Q23Illustration, Explainer: P24G3Q23Explainer },
  // 25 G1 Semifinal (WMI-25P1A)
  'WMI-25P1A-Q2': { Illustration: P25G1Q2Illustration, Explainer: P25G1Q2Explainer },
  'WMI-25P1A-Q3': { Illustration: P25G1Q3Illustration, Explainer: P25G1Q3Explainer },
  'WMI-25P1A-Q4': { Illustration: P25G1Q4Illustration, Explainer: P25G1Q4Explainer },
  'WMI-25P1A-Q6': { Illustration: P25G1Q6Illustration, Explainer: P25G1Q6Explainer },
  'WMI-25P1A-Q11': { Illustration: P25G1Q11Illustration, Explainer: P25G1Q11Explainer },
  'WMI-25P1A-Q13': { Illustration: P25G1Q13Illustration, Explainer: P25G1Q13Explainer },
  'WMI-25P1A-Q15': { Illustration: P25G1Q15Illustration, Explainer: P25G1Q15Explainer },
  'WMI-25P1A-Q16': { Illustration: P25G1Q16Illustration, Explainer: P25G1Q16Explainer },
  'WMI-25P1A-Q18': { Illustration: P25G1Q18Illustration, Explainer: P25G1Q18Explainer },
  'WMI-25P1A-Q19': { Illustration: P25G1Q19Illustration, Explainer: P25G1Q19Explainer },
  'WMI-25P1A-Q20': { Illustration: P25G1Q20Illustration, Explainer: P25G1Q20Explainer },
  'WMI-25P1A-Q22': { Illustration: P25G1Q22Illustration, Explainer: P25G1Q22Explainer },
  'WMI-25P1A-Q24': { Illustration: P25G1Q24Illustration, Explainer: P25G1Q24Explainer },
  'WMI-25P1A-Q25': { Illustration: P25G1Q25Illustration, Explainer: P25G1Q25Explainer },
  // 25 G2 Semifinal (WMI-25P2A)
  'WMI-25P2A-Q2': { Illustration: P25G2Q2Illustration, Explainer: P25G2Q2Explainer },
  'WMI-25P2A-Q3': { Illustration: P25G2Q3Illustration, Explainer: P25G2Q3Explainer },
  'WMI-25P2A-Q15': { Illustration: P25G2Q15Illustration, Explainer: P25G2Q15Explainer },
  'WMI-25P2A-Q17': { Illustration: P25G2Q17Illustration, Explainer: P25G2Q17Explainer },
  'WMI-25P2A-Q19': { Illustration: P25G2Q19Illustration, Explainer: P25G2Q19Explainer },
  'WMI-25P2A-Q21': { Illustration: P25G2Q21Illustration, Explainer: P25G2Q21Explainer },
  'WMI-25P2A-Q22': { Illustration: P25G2Q22Illustration, Explainer: P25G2Q22Explainer },
  'WMI-25P2A-Q23': { Illustration: P25G2Q23Illustration, Explainer: P25G2Q23Explainer },
  // 25 G3 Semifinal (WMI-25P3A)
  'WMI-25P3A-Q4': { Illustration: P25G3Q4Illustration, Explainer: P25G3Q4Explainer },
  'WMI-25P3A-Q9': { Illustration: P25G3Q9Illustration, Explainer: P25G3Q9Explainer },
  'WMI-25P3A-Q14': { Illustration: P25G3Q14Illustration, Explainer: P25G3Q14Explainer },
  'WMI-25P3A-Q15': { Illustration: P25G3Q15Illustration, Explainer: P25G3Q15Explainer },
  'WMI-25P3A-Q18': { Illustration: P25G3Q18Illustration, Explainer: P25G3Q18Explainer },
  'WMI-25P3A-Q19': { Illustration: P25G3Q19Illustration, Explainer: P25G3Q19Explainer },
  'WMI-25P3A-Q22': { Illustration: P25G3Q22Illustration, Explainer: P25G3Q22Explainer },
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
  'WMI-20F2A-Q10': { Illustration: RosesG2Illustration, Explainer: RosesG2Explainer },
  'WMI-20F2A-Q11': { Illustration: MinuteSectionsG2Illustration, Explainer: MinuteTicks20G2Explainer },
  'WMI-20F2A-Q12': { Illustration: HeartSpadeSeqG2Illustration, Explainer: HeartSpadeSeqG2Explainer },
  'WMI-20F2A-Q13': { Illustration: DigitCluesG2Illustration, Explainer: DigitClues20G2Explainer },
  'WMI-20F2A-Q14': { Illustration: PatternRowsG2Illustration, Explainer: PatternRowsG2Explainer },
  'WMI-20F2A-Q15': { Illustration: NumberLineHopsG2Illustration, Explainer: NumberLineHopsG2Explainer },
  'WMI-20F2A-Q16': { Illustration: FivesCard20G2Illustration, Explainer: OrderOps20G2Explainer },
  'WMI-20F2A-Q17': { Illustration: DigitCards20G2Illustration, Explainer: EvenExtremes20G2Explainer },
  'WMI-20F2A-Q18': { Illustration: GridSumsG2Illustration, Explainer: GridSumsG2Explainer },
  'WMI-20F2A-Q19': { Illustration: RepdigitAddG2Illustration, Explainer: RepdigitAddG2Explainer },
  'WMI-20F2A-Q20': { Illustration: WeatherDaysG2Illustration, Explainer: WeatherDaysG2Explainer },
  'WMI-20F2A-Q21': { Illustration: CubeNetsG2Illustration, Explainer: CubeNetsG2Explainer },
  'WMI-20F2A-Q22': { Illustration: BalanceScalesG2Illustration, Explainer: BalanceScalesG2Explainer },
  'WMI-20F2A-Q23': { Illustration: SudokuExprG2Illustration, Explainer: SudokuExprG2Explainer },
  'WMI-20F2A-Q24': { Illustration: NineCards20G2Illustration, Explainer: CardCombos20G2Explainer },
  'WMI-20F2A-Q25': { Illustration: DigitGridG2Illustration, Explainer: DigitGridG2Explainer },
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
  'WMI-22F2A-Q2': { Explainer: Compute22G2Explainer },
  'WMI-22F2A-Q3': { Illustration: PaperStack22G2Illustration, Explainer: PaperStack22G2Explainer },
  'WMI-22F2A-Q4': { Explainer: ShareCandy22G2Explainer },
  'WMI-22F2A-Q5': { Illustration: Balls22G2Illustration, Explainer: Balls22G2Explainer },
  'WMI-22F2A-Q6': { Explainer: Birthday22G2Explainer },
  'WMI-22F2A-Q7': { Explainer: DoubleTree22G2Explainer },
  'WMI-22F2A-Q8': { Illustration: ThickLines22G2Illustration, Explainer: ThickLines22G2Explainer },
  'WMI-22F2A-Q9': { Explainer: BalanceEq22G2Explainer },
  'WMI-22F2A-Q10': { Illustration: ChildrenOrder22G2Illustration, Explainer: ChildrenOrder22G2Explainer },
  'WMI-22F2A-Q11': { Illustration: Targets22G2Illustration, Explainer: Targets22G2Explainer },
  'WMI-22F2A-Q12': { Illustration: EggPath22G2Illustration, Explainer: EggPath22G2Explainer },
  'WMI-22F2A-Q13': { Explainer: CardsClosest22G2Explainer },
  'WMI-22F2A-Q14': { Explainer: DinoEggs22G2Explainer },
  'WMI-22F2A-Q15': { Illustration: Cups22G2Illustration, Explainer: Cups22G2Explainer },
  'WMI-22F2A-Q16': { Illustration: Flowchart22G2Illustration, Explainer: Flowchart22G2Explainer },
  'WMI-22F2A-Q17': { Illustration: Balance22G2Illustration, Explainer: Balance22G2Explainer },
  'WMI-22F2A-Q18': { Illustration: SeatGrid22G2Illustration, Explainer: SeatGrid22G2Explainer },
  'WMI-22F2A-Q19': { Illustration: ShapeAddition22G2Illustration, Explainer: ShapeAddition22G2Explainer },
  'WMI-22F2A-Q20': { Illustration: PasswordDial22G2Illustration, Explainer: PasswordDial22G2Explainer },
  'WMI-22F2A-Q21': { Illustration: CardHands22G2Illustration, Explainer: CardHands22G2Explainer },
  'WMI-22F2A-Q22': { Explainer: BallShare22G2Explainer },
  'WMI-22F2A-Q23': { Illustration: Soldiers22G2Illustration, Explainer: Soldiers22G2Explainer },
  'WMI-22F2A-Q24': { Illustration: MirrorBlocks22G2Illustration, Explainer: MirrorBlocks22G2Explainer },
  'WMI-22F2A-Q25': { Illustration: TCover22G2Illustration, Explainer: TCover22G2Explainer },
  // 2022 G3 (WMI-22F3A) — Paper A batch
  'WMI-22F3A-Q1': { Explainer: Compute22G3Explainer },
  'WMI-22F3A-Q6': { Explainer: CakeBudget22G3Explainer },
  'WMI-22F3A-Q7': { Explainer: BlouseSkirt22G3Explainer },
  'WMI-22F3A-Q9': { Explainer: EvenCount22G3Explainer },
  'WMI-22F3A-Q10': { Explainer: MeetingTime22G3Explainer },
  'WMI-22F3A-Q12': { Explainer: Visitors22G3Explainer },
  'WMI-22F3A-Q14': { Explainer: DiffSeq22G3Explainer },
  'WMI-22F3A-Q15': { Explainer: NinesPattern22G3Explainer },
  'WMI-22F3A-Q16': { Explainer: NextYear22G3Explainer },
  'WMI-22F3A-Q22': { Explainer: OpenDoors22G3Explainer },
  'WMI-22F3A-Q2': { Illustration: PieThirds22G3Illustration, Explainer: PieThirds22G3Explainer },
  'WMI-22F3A-Q3': { Illustration: NestedTri22G3Illustration, Explainer: NestedTri22G3Explainer },
  'WMI-22F3A-Q4': { Illustration: StreetMap22G3Illustration, Explainer: StreetMap22G3Explainer },
  'WMI-22F3A-Q5': { Illustration: PaintedArea22G3Illustration, Explainer: PaintedArea22G3Explainer },
  'WMI-22F3A-Q8': { Illustration: HalfShadeGrid22G3Illustration, Explainer: HalfShadeGrid22G3Explainer },
  'WMI-22F3A-Q11': { Illustration: CubeNet22G3Illustration, Explainer: CubeNet22G3Explainer },
  'WMI-22F3A-Q13': { Illustration: ChampionMedian22G3Illustration, Explainer: ChampionMedian22G3Explainer },
  // 2022 G3 (WMI-22F3A) — Paper B batch (Q18 deferred: ambiguous clue)
  'WMI-22F3A-Q17': { Illustration: ProductTriangle22G3Illustration, Explainer: ProductTriangle22G3Explainer },
  'WMI-22F3A-Q19': { Illustration: VerticalMult22G3Illustration, Explainer: VerticalMult22G3Explainer },
  'WMI-22F3A-Q20': { Illustration: TilePieces22G3Illustration, Explainer: TilePieces22G3Explainer },
  'WMI-22F3A-Q21': { Illustration: RectFrame22G3Illustration, Explainer: RectFrame22G3Explainer },
  'WMI-22F3A-Q23': { Illustration: SoldierRoad22G3Illustration, Explainer: SoldierRoad22G3Explainer },
  'WMI-22F3A-Q24': { Illustration: MirrorSolid22G3Illustration, Explainer: MirrorSolid22G3Explainer },
  'WMI-22F3A-Q25': { Illustration: NumberGrid22G3Illustration, Explainer: NumberGrid22G3Explainer },

  // 2022 G1 Final
  'WMI-22F1A-Q1': { Illustration: Money22G1Illustration, Explainer: Money22G1Explainer },
  'WMI-22F1A-Q2': { Illustration: Letters22G1Illustration, Explainer: Letters22G1Explainer },
  'WMI-22F1A-Q3': { Explainer: AnimalLegs22G1Explainer },
  'WMI-22F1A-Q4': { Illustration: NumberVenn22G1Illustration, Explainer: NumberVenn22G1Explainer },
  'WMI-22F1A-Q5': { Explainer: Fruit22G1Explainer },
  'WMI-22F1A-Q6': { Explainer: LuckyNumber22G1Explainer },
  'WMI-22F1A-Q7': { Explainer: Solid22G1Explainer },
  'WMI-22F1A-Q8': { Illustration: BlockPack22G1Illustration, Explainer: BlockPack22G1Explainer },
  'WMI-22F1A-Q9': { Illustration: Balance22G1Illustration, Explainer: Balance22G1Explainer },
  'WMI-22F1A-Q10': { Explainer: CircleRect22G1Explainer },
  'WMI-22F1A-Q11': { Explainer: Balls22G1Explainer },
  'WMI-22F1A-Q12': { Illustration: TwoLines22G1Illustration, Explainer: TwoLines22G1Explainer },
  'WMI-22F1A-Q13': { Illustration: Locks22G1Illustration, Explainer: Locks22G1Explainer },
  'WMI-22F1A-Q14': { Illustration: HeightOrder22G1Illustration, Explainer: HeightOrder22G1Explainer },
  'WMI-22F1A-Q15': { Illustration: NumberSnake22G1Illustration, Explainer: NumberSnake22G1Explainer },
  'WMI-22F1A-Q16': { Illustration: BracketGrid22G1Illustration, Explainer: BracketGrid22G1Explainer },
  'WMI-22F1A-Q17': { Illustration: Vases22G1Illustration, Explainer: Vases22G1Explainer },
  'WMI-22F1A-Q18': { Illustration: HexTree22G1Illustration, Explainer: HexTree22G1Explainer },
  'WMI-22F1A-Q19': { Illustration: TriCount22G1Illustration, Explainer: TriCount22G1Explainer },
  'WMI-22F1A-Q20': { Explainer: CustomOp22G1Explainer },
  'WMI-22F1A-Q21': { Illustration: Dial22G1Illustration, Explainer: Dial22G1Explainer },
  'WMI-22F1A-Q22': { Illustration: KnightTour22G1Illustration, Explainer: KnightTour22G1Explainer },
  'WMI-22F1A-Q23': { Illustration: SoldierRoad22G1Illustration, Explainer: SoldierRoad22G1Explainer },
  'WMI-22F1A-Q24': { Illustration: MirrorBlocks22G1Illustration, Explainer: MirrorBlocks22G1Explainer },
  'WMI-22F1A-Q25': { Illustration: EdgeMatch22G1Illustration, Explainer: EdgeMatch22G1Explainer },

  // 2023 G1 Final
  'WMI-23F1A-Q2': { Explainer: SmallestExpr23G1Explainer },
  'WMI-23F1A-Q4': { Explainer: AppleBaskets23G1Explainer },
  'WMI-23F1A-Q5': { Explainer: ChangeMoney23G1Explainer },
  'WMI-23F1A-Q7': { Explainer: BalloonTrade23G1Explainer },
  'WMI-23F1A-Q8': { Explainer: UnitsDigit23G1Explainer },
  'WMI-23F1A-Q9': { Explainer: SignFill23G1Explainer },
  'WMI-23F1A-Q15': { Explainer: ColorCycle23G1Explainer },
  'WMI-23F1A-Q1': { Illustration: GoBoard23G1Illustration, Explainer: GoBoard23G1Explainer },
  'WMI-23F1A-Q3': { Illustration: NumberStrip23G1Illustration, Explainer: NumberStrip23G1Explainer },
  'WMI-23F1A-Q16': { Illustration: ShapeAdd23G1Illustration, Explainer: ShapeAdd23G1Explainer },
  'WMI-23F1A-Q19': { Illustration: StarSquares23G1Illustration, Explainer: StarSquares23G1Explainer },
  'WMI-23F1A-Q11': { Illustration: ShapePattern23G1Illustration, Explainer: ShapePattern23G1Explainer },
  'WMI-23F1A-Q18': { Illustration: PaperFold23G1Illustration, Explainer: PaperFold23G1Explainer },
  'WMI-23F1A-Q21': { Illustration: GridFill23G1Illustration, Explainer: GridFill23G1Explainer },
  'WMI-23F1A-Q23': { Illustration: MatchSquares23G1Illustration, Explainer: MatchSquares23G1Explainer },
  'WMI-23F1A-Q6': { Illustration: FreqGrid23G1Illustration, Explainer: FreqGrid23G1Explainer },
  'WMI-23F1A-Q12': { Illustration: Bracelets23G1Illustration, Explainer: Bracelets23G1Explainer },
  'WMI-23F1A-Q20': { Illustration: RouteTree23G1Illustration, Explainer: RouteTree23G1Explainer },
  'WMI-23F1A-Q22': { Illustration: RoomMaze23G1Illustration, Explainer: RoomMaze23G1Explainer },
  'WMI-23F1A-Q17': { Illustration: SegmentCount23G1Illustration, Explainer: SegmentCount23G1Explainer },
  'WMI-23F1A-Q24': { Illustration: PatternRules23G1Illustration, Explainer: PatternRules23G1Explainer },
  'WMI-23F1A-Q25': { Illustration: RobotMaze23G1Illustration, Explainer: RobotMaze23G1Explainer },
  'WMI-23F1A-Q10': { Illustration: Jigsaw23G1Illustration, Explainer: Jigsaw23G1Explainer },
  'WMI-23F1A-Q13': { Illustration: CardStats23G1Illustration, Explainer: CardStats23G1Explainer },
  'WMI-23F2A-Q1': { Explainer: RoundSubtract23G2Explainer },
  'WMI-23F2A-Q3': { Explainer: MultipleNine23G2Explainer },
  'WMI-23F2A-Q6': { Explainer: ApplesBaskets23G2Explainer },
  'WMI-23F2A-Q7': { Explainer: PokemonWin23G2Explainer },
  'WMI-23F2A-Q8': { Explainer: DiceSum23G2Explainer },
  'WMI-23F2A-Q9': { Explainer: HamburgerDeal23G2Explainer },
  'WMI-23F2A-Q10': { Explainer: MaxExpr23G2Explainer },
  'WMI-23F2A-Q11': { Explainer: InterleaveSeq23G2Explainer },
  'WMI-23F2A-Q13': { Explainer: ExhibitOverlap23G2Explainer },
  'WMI-23F2A-Q14': { Explainer: DigitCount23G2Explainer },
  'WMI-23F2A-Q16': { Explainer: ComputeProducts23G2Explainer },
  'WMI-23F2A-Q18': { Explainer: CryptoABCD23G2Explainer },
  'WMI-23F2A-Q20': { Explainer: BlockSeq23G2Explainer },
  'WMI-23F2A-Q22': { Explainer: ChallengeScore23G2Explainer },
  'WMI-23F2A-Q23': { Explainer: UnusedDigit23G2Explainer },
  'WMI-23F2A-Q2': { Illustration: Cards23G2Illustration, Explainer: Cards23G2Explainer },
  'WMI-23F2A-Q4': { Illustration: PeggyMap23G2Illustration, Explainer: PeggyMap23G2Explainer },
  'WMI-23F2A-Q5': { Illustration: Lines23G2Illustration, Explainer: Lines23G2Explainer },
  'WMI-23F2A-Q12': { Illustration: CardStats23G2Illustration, Explainer: CardStats23G2Explainer },
  'WMI-23F2A-Q17': { Illustration: StarGrid23G2Illustration, Explainer: StarGrid23G2Explainer },
  'WMI-23F2A-Q21': { Illustration: Matchsticks23G2Illustration, Explainer: Matchsticks23G2Explainer },
  'WMI-23F2A-Q24': { Illustration: Pattern23G2Illustration, Explainer: Pattern23G2Explainer },
  'WMI-23F2A-Q25': { Illustration: RobotMaze23G2Illustration, Explainer: RobotMaze23G2Explainer },
  'WMI-24F2A-Q1': { Explainer: MatchProduct24G2Explainer },
  'WMI-24F2A-Q5': { Explainer: TreesPlan24G2Explainer },
  'WMI-24F2A-Q6': { Explainer: TrainGap24G2Explainer },
  'WMI-24F2A-Q7': { Explainer: TwoItems24G2Explainer },
  'WMI-24F2A-Q10': { Explainer: RankSqueeze24G2Explainer },
  'WMI-24F2A-Q11': { Explainer: ThreeWeights24G2Explainer },
  'WMI-24F2A-Q17': { Explainer: GreedyEven24G2Explainer },
  'WMI-24F2A-Q20': { Explainer: MaxOddSum24G2Explainer },
  'WMI-24F2A-Q22': { Explainer: RockPaper24G2Explainer },
  'WMI-24F2A-Q2': { Illustration: Parallelogram24G2Illustration, Explainer: Parallelogram24G2Explainer },
  'WMI-24F2A-Q3': { Illustration: AntPath24G2Illustration, Explainer: AntPath24G2Explainer },
  'WMI-24F2A-Q4': { Illustration: GrayGrid24G2Illustration, Explainer: GrayGrid24G2Explainer },
  'WMI-24F2A-Q8': { Illustration: Field24G2Illustration, Explainer: Field24G2Explainer },
  'WMI-24F2A-Q9': { Illustration: Solid24G2Illustration, Explainer: Solid24G2Explainer },
  'WMI-24F2A-Q12': { Illustration: Seating24G2Illustration, Explainer: Seating24G2Explainer },
  'WMI-24F2A-Q13': { Illustration: Tangram24G2Illustration, Explainer: Tangram24G2Explainer },
  'WMI-24F2A-Q14': { Illustration: TrainArrows24G2Illustration, Explainer: TrainArrows24G2Explainer },
  'WMI-24F2A-Q15': { Illustration: RollingHex24G2Illustration, Explainer: RollingHex24G2Explainer },
  'WMI-24F2A-Q16': { Illustration: ShapeEq24G2Illustration, Explainer: ShapeEq24G2Explainer },
  'WMI-24F2A-Q19': { Illustration: TriSticks24G2Illustration, Explainer: TriSticks24G2Explainer },
  'WMI-24F2A-Q21': { Illustration: Parking24G2Illustration, Explainer: Parking24G2Explainer },
  'WMI-24F2A-Q23': { Illustration: Grid24G2Illustration, Explainer: Grid24G2Explainer },
  'WMI-24F2A-Q24': { Illustration: BoardPath24G2Illustration, Explainer: BoardPath24G2Explainer },
  'WMI-24F2A-Q25': { Illustration: SymbolGrid24G2Illustration, Explainer: SymbolGrid24G2Explainer },
  'WMI-24F3A-Q1': { Explainer: DivZero24G3Explainer },
  'WMI-24F3A-Q5': { Explainer: BusFill24G3Explainer },
  'WMI-24F3A-Q7': { Explainer: CigaretteTime24G3Explainer },
  'WMI-24F3A-Q11': { Explainer: MealCombos24G3Explainer },
  'WMI-24F3A-Q13': { Explainer: ColumnCrypto24G3Explainer },
  'WMI-24F3A-Q16': { Explainer: MaxQuotient24G3Explainer },
  'WMI-24F3A-Q17': { Explainer: Matchsticks24G3Explainer },
  'WMI-24F3A-Q18': { Explainer: CardEquations24G3Explainer },
  'WMI-24F3A-Q19': { Explainer: TreeAges24G3Explainer },
  'WMI-24F3A-Q21': { Explainer: Palindrome24G3Explainer },
  'WMI-24F3A-Q2': { Illustration: ShipBridge24G3Illustration, Explainer: ShipBridge24G3Explainer },
  'WMI-24F3A-Q3': { Illustration: Classroom24G3Illustration, Explainer: Classroom24G3Explainer },
  'WMI-24F3A-Q4': { Illustration: RaceTrack24G3Illustration, Explainer: RaceTrack24G3Explainer },
  'WMI-24F3A-Q6': { Illustration: CompositeRect24G3Illustration, Explainer: CompositeRect24G3Explainer },
  'WMI-24F3A-Q9': { Illustration: Trapezoid24G3Illustration, Explainer: Trapezoid24G3Explainer },
  'WMI-24F3A-Q10': { Illustration: ViewTable24G3Illustration, Explainer: ViewTable24G3Explainer },
  'WMI-24F3A-Q12': { Illustration: SubTriangle24G3Illustration, Explainer: SubTriangle24G3Explainer },
  'WMI-24F3A-Q14': { Illustration: DiceNet24G3Illustration, Explainer: DiceNet24G3Explainer },
  'WMI-24F3A-Q15': { Illustration: PentRoll24G3Illustration, Explainer: PentRoll24G3Explainer },
  'WMI-24F3A-Q20': { Illustration: ButtonPanel24G3Illustration, Explainer: ButtonPanel24G3Explainer },
  'WMI-24F3A-Q22': { Illustration: CardLayout24G3Illustration, Explainer: CardLayout24G3Explainer },
  'WMI-24F3A-Q23': { Illustration: CutCount24G3Illustration, Explainer: CutCount24G3Explainer },
  'WMI-24F3A-Q24': { Illustration: RabbitGrid24G3Illustration, Explainer: RabbitGrid24G3Explainer },
  'WMI-24F3A-Q25': { Illustration: NumGrid24G3Illustration, Explainer: NumGrid24G3Explainer },
  'WMI-25F2A-Q1': { Explainer: SortMiddle25G2Explainer },
  'WMI-25F2A-Q3': { Explainer: Direction25G2Explainer },
  'WMI-25F2A-Q4': { Explainer: ConsecEven25G2Explainer },
  'WMI-25F2A-Q6': { Explainer: SquareCandy25G2Explainer },
  'WMI-25F2A-Q7': { Explainer: ShipDirection25G2Explainer },
  'WMI-25F2A-Q9': { Explainer: LuckyNumber25G2Explainer },
  'WMI-25F2A-Q10': { Explainer: TornPages25G2Explainer },
  'WMI-25F2A-Q12': { Explainer: DateBoxes25G2Explainer },
  'WMI-25F2A-Q14': { Explainer: GreedyRemove25G2Explainer },
  'WMI-25F2A-Q16': { Explainer: SubtractEight25G2Explainer },
  'WMI-25F2A-Q18': { Explainer: ShapeSums25G2Explainer },
  'WMI-25F2A-Q21': { Explainer: AppendDigits25G2Explainer },
  'WMI-25F2A-Q22': { Explainer: ModClues25G2Explainer },
  'WMI-25F2A-Q25': { Explainer: BalanceNumbers25G2Explainer },
  'WMI-25F2A-Q2': { Illustration: StarAdd25G2Illustration, Explainer: StarAdd25G2Explainer },
  'WMI-25F2A-Q5': { Illustration: RopeRuler25G2Illustration, Explainer: RopeRuler25G2Explainer },
  'WMI-25F2A-Q8': { Illustration: Gomoku25G2Illustration, Explainer: Gomoku25G2Explainer },
  'WMI-25F2A-Q11': { Illustration: FaceSeq25G2Illustration, Explainer: FaceSeq25G2Explainer },
  'WMI-25F2A-Q15': { Illustration: Ordering25G2Illustration, Explainer: Ordering25G2Explainer },
  'WMI-25F2A-Q17': { Illustration: Cube2025G2Illustration, Explainer: Cube2025G2Explainer },
  'WMI-25F2A-Q19': { Illustration: ProductGrid25G2Illustration, Explainer: ProductGrid25G2Explainer },
  'WMI-25F2A-Q20': { Illustration: Roundabout25G2Illustration, Explainer: Roundabout25G2Explainer },
  'WMI-25F2A-Q23': { Illustration: Jerseys25G2Illustration, Explainer: Jerseys25G2Explainer },
  'WMI-25F2A-Q24': { Illustration: MoneyGrid25G2Illustration, Explainer: MoneyGrid25G2Explainer },
  'WMI-25F3A-Q4': { Illustration: RectSquare25G3Illustration, Explainer: RectSquare25G3Explainer },
  'WMI-25F3A-Q8': { Illustration: StationMap25G3Illustration, Explainer: StationMap25G3Explainer },
  'WMI-25F3A-Q10': { Illustration: Folding25G3Illustration, Explainer: Folding25G3Explainer },
  'WMI-25F3A-Q11': { Illustration: Assemble25G3Illustration, Explainer: Assemble25G3Explainer },
  'WMI-25F3A-Q13': { Illustration: Coin25G3Illustration, Explainer: Coin25G3Explainer },
  'WMI-25F3A-Q14': { Illustration: MultGrid25G3Illustration, Explainer: MultGrid25G3Explainer },
  'WMI-25F3A-Q17': { Illustration: Symmetry25G3Illustration, Explainer: Symmetry25G3Explainer },
  'WMI-25F3A-Q19': { Illustration: ParaDivide25G3Illustration, Explainer: ParaDivide25G3Explainer },
  'WMI-25F3A-Q25': { Illustration: Elephant25G3Illustration, Explainer: Elephant25G3Explainer },

  // 2024 G1 Final
  'WMI-24F1A-Q1': { Explainer: EqualsFifteen24G1Explainer },
  'WMI-24F1A-Q2': { Explainer: BuildAdd24G1Explainer },
  'WMI-24F1A-Q4': { Explainer: CupsHandle24G1Explainer },
  'WMI-24F1A-Q6': { Explainer: CakeShortfall24G1Explainer },
  'WMI-24F1A-Q7': { Explainer: TwoClues24G1Explainer },
  'WMI-24F1A-Q8': { Explainer: DigitTally24G1Explainer },
  'WMI-24F1A-Q9': { Explainer: BusCarry24G1Explainer },
  'WMI-24F1A-Q12': { Explainer: CoinTotals24G1Explainer },
  'WMI-24F1A-Q19': { Explainer: ChocoLeft24G1Explainer },
  'WMI-24F1A-Q3': { Illustration: Segments24G1Illustration, Explainer: Segments24G1Explainer },
  'WMI-24F1A-Q5': { Illustration: DiceNet24G1Illustration, Explainer: DiceNet24G1Explainer },
  'WMI-24F1A-Q10': { Illustration: NumberVenn24G1Illustration, Explainer: NumberVenn24G1Explainer },
  'WMI-24F1A-Q15': { Illustration: ShapeAdd24G1Illustration, Explainer: ShapeAdd24G1Explainer },
  'WMI-24F1A-Q16': { Illustration: ExprPattern24G1Illustration, Explainer: ExprPattern24G1Explainer },
  'WMI-24F1A-Q17': { Illustration: DigitCards24G1Illustration, Explainer: DigitCards24G1Explainer },
  'WMI-24F1A-Q18': { Illustration: SumCards24G1Illustration, Explainer: SumCards24G1Explainer },
  'WMI-24F1A-Q23': { Illustration: RemoveOp24G1Illustration, Explainer: RemoveOp24G1Explainer },
  'WMI-24F1A-Q20': { Illustration: BallTubes24G1Illustration, Explainer: BallTubes24G1Explainer },
  'WMI-24F1A-Q21': { Illustration: LogicGrid24G1Illustration, Explainer: LogicGrid24G1Explainer },
  'WMI-24F1A-Q22': { Illustration: BlockStack24G1Illustration, Explainer: BlockStack24G1Explainer },
  'WMI-24F1A-Q25': { Illustration: SumGrid24G1Illustration },
  'WMI-24F1A-Q11': { Illustration: AnimalMaze24G1Illustration, Explainer: AnimalMaze24G1Explainer },
  'WMI-24F1A-Q13': { Illustration: ClockPic24G1Illustration, Explainer: ClockPic24G1Explainer },
  'WMI-24F1A-Q14': { Illustration: CookieSort24G1Illustration, Explainer: CookieSort24G1Explainer },
  'WMI-24F1A-Q24': { Illustration: BallSort24G1Illustration, Explainer: BallSort24G1Explainer },

  // 2025 G1 Final
  'WMI-25F1A-Q3': { Explainer: OddCount25G1Explainer },
  'WMI-25F1A-Q4': { Explainer: MiddleExpr25G1Explainer },
  'WMI-25F1A-Q9': { Explainer: FlowerCost25G1Explainer },
  'WMI-25F1A-Q11': { Explainer: DigitSumEight25G1Explainer },
  'WMI-25F1A-Q18': { Explainer: BusStanding25G1Explainer },
  'WMI-25F1A-Q19': { Explainer: AnsweredGap25G1Explainer },
  'WMI-25F1A-Q15': { Illustration: LineSquares25G1Illustration, Explainer: LineSquares25G1Explainer },
  'WMI-25F1A-Q16': { Illustration: CubeRecolor25G1Illustration, Explainer: CubeRecolor25G1Explainer },
  'WMI-25F1A-Q17': { Illustration: DigitTriple25G1Illustration, Explainer: DigitTriple25G1Explainer },
  'WMI-25F1A-Q20': { Illustration: TheaterSeats25G1Illustration, Explainer: TheaterSeats25G1Explainer },
  'WMI-25F1A-Q1': { Illustration: Stones25G1Illustration, Explainer: Stones25G1Explainer },
  'WMI-25F1A-Q6': { Illustration: AppleBoxes25G1Illustration, Explainer: AppleBoxes25G1Explainer },
  'WMI-25F1A-Q7': { Illustration: BoatTranslate25G1Illustration, Explainer: BoatTranslate25G1Explainer },
  'WMI-25F1A-Q12': { Illustration: NumberPattern25G1Illustration, Explainer: NumberPattern25G1Explainer },
  'WMI-25F1A-Q5': { Illustration: FlippedRuler25G1Illustration, Explainer: FlippedRuler25G1Explainer },
  'WMI-25F1A-Q10': { Illustration: ChildrenChairs25G1Illustration, Explainer: ChildrenChairs25G1Explainer },
  'WMI-25F1A-Q22': { Illustration: BalanceScales25G1Illustration, Explainer: BalanceScales25G1Explainer },
  'WMI-25F1A-Q24': { Illustration: SpecialTrees25G1Illustration, Explainer: SpecialTrees25G1Explainer },
  'WMI-25F1A-Q2': { Illustration: ClothingPrices25G1Illustration, Explainer: ClothingPrices25G1Explainer },
  'WMI-25F1A-Q23': { Illustration: HomeMap25G1Illustration, Explainer: HomeMap25G1Explainer },
  'WMI-25F1A-Q25': { Illustration: NumberPyramid25G1Illustration, Explainer: NumberPyramid25G1Explainer },
  'WMI-25F1A-Q21': { Illustration: CircleSums25G1Illustration, Explainer: CircleSums25G1Explainer },
  'WMI-25F1A-Q8': { Illustration: HundredsChart25G1Illustration, Explainer: HundredsChart25G1Explainer },
  'WMI-25F1A-Q13': { Illustration: ShapeSeq25G1Illustration, Explainer: ShapeSeq25G1Explainer },
  'WMI-25F1A-Q14': { Illustration: CountFigures25G1Illustration, Explainer: CountFigures25G1Explainer },

  // 2023 G3 Final
  'WMI-23F3A-Q1': { Explainer: SubtractMany23G3Explainer },
  'WMI-23F3A-Q3': { Explainer: MilkTotal23G3Explainer },
  'WMI-23F3A-Q6': { Explainer: PagesLeft23G3Explainer },
  'WMI-23F3A-Q9': { Explainer: DigitDiff23G3Explainer },
  'WMI-23F3A-Q10': { Explainer: SwapDivide23G3Explainer },
  'WMI-23F3A-Q16': { Explainer: ProductCancel23G3Explainer },
  'WMI-23F3A-Q20': { Explainer: ConsecDiv23G3Explainer },
  'WMI-23F3A-Q21': { Explainer: ChallengeScore23G3Explainer },
  'WMI-23F3A-Q24': { Explainer: GreedyDelete23G3Explainer },
  'WMI-23F3A-Q2': { Illustration: Angles23G3Illustration, Explainer: Angles23G3Explainer },
  'WMI-23F3A-Q4': { Illustration: OverlapRects23G3Illustration, Explainer: OverlapRects23G3Explainer },
  'WMI-23F3A-Q5': { Illustration: SnailPath23G3Illustration, Explainer: SnailPath23G3Explainer },
  'WMI-23F3A-Q7': { Illustration: ParkingFee23G3Illustration, Explainer: ParkingFee23G3Explainer },
  'WMI-23F3A-Q8': { Illustration: MetroGraph23G3Illustration, Explainer: MetroGraph23G3Explainer },
  'WMI-23F3A-Q11': { Illustration: ClockPieces23G3Illustration, Explainer: ClockPieces23G3Explainer },
  'WMI-23F3A-Q13': { Illustration: TriGridQuad23G3Illustration, Explainer: TriGridQuad23G3Explainer },
  'WMI-23F3A-Q15': { Illustration: Spiral23G3Illustration, Explainer: Spiral23G3Explainer },
  'WMI-23F3A-Q17': { Illustration: FoldTriangle23G3Illustration, Explainer: FoldTriangle23G3Explainer },
  'WMI-23F3A-Q18': { Illustration: FiveSquares23G3Illustration, Explainer: FiveSquares23G3Explainer },
  'WMI-23F3A-Q19': { Illustration: Pinwheel23G3Illustration, Explainer: Pinwheel23G3Explainer },
  'WMI-23F3A-Q22': { Illustration: MatchSquares23G1Illustration, Explainer: Match23G3Explainer },
  'WMI-23F3A-Q23': { Illustration: NumberGrid23G3Illustration, Explainer: NumberGrid23G3Explainer },
  'WMI-23F3A-Q25': { Illustration: RobotMaze23G3Illustration, Explainer: RobotMaze23G3Explainer },
}

// Optional per-question renderer for the A/B/C/D choice content. When present,
// it replaces the plain choice text (e.g. shape-count options drawn as bar
// charts). The renderer binds to the choice's own text so it can't drift.
type ChoiceRenderer = ComponentType<{ choice: WmiChoice }>

const CHOICE_RENDERERS: Record<string, ChoiceRenderer> = {
  // 2023 G2: Q24 options are the five candidate shape patterns.
  'WMI-23F2A-Q24': Pattern23G2Option,
  // 2024 G2: Q13 tangram-letter options, Q14 arrow-pair options.
  'WMI-24F2A-Q13': Tangram24G2Option,
  'WMI-24F2A-Q14': TrainArrows24G2Option,
  // 2025 G2: Q11 face-stack pattern options.
  'WMI-25F2A-Q11': FaceSeq25G2Option,
  // 2025 G3: Q10 folded-shape options, Q13 spun-coin options.
  'WMI-25F3A-Q10': Folding25G3Option,
  'WMI-25F3A-Q13': Coin25G3Option,
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
  // 2022 G1: Q5 fruit-group pictures, Q7 cube solids, Q10 circle/rect figures, Q11 ball sets.
  'WMI-22F1A-Q5': Fruit22G1Option,
  'WMI-22F1A-Q7': Solid22G1Option,
  'WMI-22F1A-Q10': CircleRect22G1Option,
  'WMI-22F1A-Q11': Balls22G1Option,

  // 2023 G1: Q14 matchstick-number options, Q10 jigsaw pieces, Q13 candidate cards.
  'WMI-23F1A-Q14': MatchNum23G1Option,
  'WMI-23F1A-Q10': Jigsaw23G1Option,
  'WMI-23F1A-Q13': CardStats23G1Option,

  // 2024 G1: Q11 animal options, Q13 clock-picture options.
  'WMI-24F1A-Q11': AnimalMaze24G1Option,
  'WMI-24F1A-Q13': ClockPic24G1Option,

  // 2025 G1: Q8 hundreds-chart fragments, Q13 shape options, Q14 figure-pair options.
  'WMI-25F1A-Q8': HundredsChart25G1Option,
  'WMI-25F1A-Q13': ShapeSeq25G1Option,
  'WMI-25F1A-Q14': CountFigures25G1Option,

  // 2023 G3: Q15 spiral missing-pair options
  'WMI-23F3A-Q15': SpiralOption23G3,
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
