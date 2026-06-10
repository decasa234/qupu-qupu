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
// renders (illustration) or is revealed (explainer).
const VISUALS: Record<string, QuestionVisualLoaders> = {
  'WMI-19F1A-Q1': {
    illustration: () => import('./StarRowsIllustration'),
    explainer: () => import('./StarCountExplainer'),
  },
  'WMI-19F1A-Q4': {
    illustration: () => import('./SecondLongestIllustration'),
    explainer: () => import('./SecondLongestExplainer'),
  },
  'WMI-19F1A-Q6': {
    illustration: () => import('./ClockReadIllustration'),
    explainer: () => import('./ClockReadExplainer'),
  },
  'WMI-19F1A-Q8': {
    explainer: () => import('./WhiteCircleSquareExplainer'),
  },
  'WMI-19F1A-Q10': {
    illustration: () => import('./NumberPatternIllustration'),
    explainer: () => import('./NumberPatternExplainer'),
  },
  'WMI-19F1A-Q11': {
    illustration: () => import('./BalanceScaleIllustration'),
    explainer: () => import('./BalanceScaleExplainer'),
  },
  'WMI-19F1A-Q15': {
    illustration: () => import('./ShapeCountChartIllustration'),
    explainer: () => import('./ShapeCountChartExplainer'),
  },
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
  'WMI-19F1A-Q20': {
    explainer: () => import('./DigitArrangeExplainer'),
  },
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
  'WMI-19F2A-Q2': {
    illustration: () => import('./CardsSmallestNumberIllustration'),
    explainer: () => import('./CardsSmallestNumberExplainer'),
  },
  'WMI-19F2A-Q4': {
    illustration: () => import('./ShapeCountG2Illustration'),
    explainer: () => import('./ShapeCountG2Explainer'),
  },
  'WMI-19F2A-Q5': {
    illustration: () => import('./PatternNinthG2Illustration'),
    explainer: () => import('./PatternNinthG2Explainer'),
  },
  'WMI-19F2A-Q8': {
    illustration: () => import('./ClockReadG2Illustration'),
    explainer: () => import('./ClockReadG2Explainer'),
  },
  'WMI-19F2A-Q10': {
    illustration: () => import('./EqualPartsG2Illustration'),
    explainer: () => import('./EqualPartsG2Explainer'),
  },
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
  'WMI-19F2A-Q17': {
    illustration: () => import('./CountSquaresG2Illustration'),
    explainer: () => import('./CountSquaresG2Explainer'),
  },
  'WMI-19F2A-Q20': {
    illustration: () => import('./BalanceTwoScalesG2Illustration'),
    explainer: () => import('./BalanceTwoScalesG2Explainer'),
  },
  'WMI-19F2A-Q22': {
    illustration: () => import('./LockCodeG2Illustration'),
    explainer: () => import('./LockCodeG2Explainer'),
  },
  'WMI-19F2A-Q23': {
    illustration: () => import('./SumTo2019G2Illustration'),
    explainer: () => import('./SumTo2019G2Explainer'),
  },
  'WMI-19F2A-Q24': {
    illustration: () => import('./KenKenG2Illustration'),
    explainer: () => import('./KenKenG2Explainer'),
  },
  'WMI-19F2A-Q25': {
    illustration: () => import('./ArrowGridG2Illustration'),
    explainer: () => import('./ArrowGridG2Explainer'),
  },
}

// Optional per-question renderer for the A/B/C/D choice content. When present,
// it replaces the plain choice text (e.g. shape-count options drawn as bar
// charts). The renderer binds to the choice's own text so it can't drift.
type ChoiceRenderer = ComponentType<{ choice: WmiChoice }>

const CHOICE_RENDERERS: Record<string, Loader<ChoiceRenderer>> = {
  'WMI-19F1A-Q15': () => import('./ShapeCountOption'),
  'WMI-19F1A-Q8': () => import('./WhiteCircleSquareOption'),
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
