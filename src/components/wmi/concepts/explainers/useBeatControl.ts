import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export interface BeatControl {
  /** Controlled current beat. When provided, auto-play is disabled (the parent owns the beat). */
  step?: number
  /** Reports the total beat count once the storyboard is known. */
  onStepCount?: (count: number) => void
  /** Reports the current beat index as it changes (auto-play or controlled). */
  onStepChange?: (index: number) => void
  /** Uniform auto-advance interval in ms (used when `holds` is not given). */
  stepMs?: number
  /** Optional per-beat hold durations in ms; element i = time spent on beat i before advancing. */
  holds?: number[]
}

/**
 * Drives an explainer's current beat. Auto-plays when uncontrolled; when `step`
 * is provided the parent owns the beat (used by the WmiExplainer carousel). It
 * reports the total beat count and the current beat so the parent can render a
 * carousel + dot indicators. Honors reduced-motion by jumping to the last beat.
 */
export function useBeatControl(finalIndex: number, opts: BeatControl = {}): number {
  const { step, onStepCount, onStepChange, stepMs = 1700, holds } = opts
  const reduce = useReducedMotion()
  const [autoIndex, setAutoIndex] = useState(0)

  const controlled = step !== undefined
  const index = controlled ? Math.max(0, Math.min(finalIndex, step as number)) : Math.min(autoIndex, finalIndex)

  // Keep callbacks in refs so they are not effect dependencies (avoids re-runs
  // when the parent passes fresh inline functions).
  const countRef = useRef(onStepCount)
  countRef.current = onStepCount
  const changeRef = useRef(onStepChange)
  changeRef.current = onStepChange

  useEffect(() => {
    countRef.current?.(finalIndex + 1)
  }, [finalIndex])

  useEffect(() => {
    changeRef.current?.(index)
  }, [index])

  useEffect(() => {
    if (controlled) return
    if (reduce) {
      setAutoIndex(finalIndex)
      return
    }
    setAutoIndex(0)
    let i = 0
    let timer = 0
    const tick = () => {
      if (i >= finalIndex) return
      const wait = holds?.[i] ?? stepMs
      timer = window.setTimeout(() => {
        i += 1
        setAutoIndex(i)
        tick()
      }, wait)
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [controlled, reduce, finalIndex, stepMs, holds])

  return index
}
