import { useMemo } from 'react'
import type { ExplainerProps } from './registry'
import type { BasicStep } from './logicSteps'
import { useBeatControl } from './useBeatControl'

export function useLogicBeat(story: { steps: BasicStep[]; finalIndex: number }, props: ExplainerProps) {
  const holds = useMemo(() => story.steps.map((s) => s.hold), [story])
  const index = useBeatControl(story.finalIndex, { ...props, holds })
  return { index, beat: story.steps[index] ?? story.steps[story.finalIndex] }
}
