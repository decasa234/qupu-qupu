import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export interface BeatControl {
  /** Controlled current beat (shown when not playing). */
  step?: number
  /** When true, auto-advance from `step` toward the last beat. */
  playing?: boolean
  onStepCount?: (count: number) => void
  onStepChange?: (index: number) => void
  /** Called once a play-through reaches the last beat. */
  onPlayEnd?: () => void
  /** Uniform auto-advance interval in ms (used when `holds` is not given). */
  stepMs?: number
  /** Optional per-beat hold durations in ms; element i = time spent on beat i before advancing. */
  holds?: number[]
}

/**
 * Drives an explainer's current beat. When `playing` is true it auto-advances
 * from `step` to the last beat (honoring reduced-motion by jumping to the end);
 * otherwise it shows the controlled `step`. Reports the total beat count and the
 * current beat so the parent can render a play/pause + dot carousel.
 */
export function useBeatControl(finalIndex: number, opts: BeatControl = {}): number {
  const { step = 0, playing = false, onStepCount, onStepChange, onPlayEnd, stepMs = 1700, holds } = opts
  const reduce = useReducedMotion()
  const [autoIndex, setAutoIndex] = useState(step)

  const index = playing ? Math.min(autoIndex, finalIndex) : Math.max(0, Math.min(finalIndex, step))

  // Callbacks in refs so they are not effect deps (avoids re-runs / play restarts
  // when the parent passes fresh inline functions).
  const countRef = useRef(onStepCount)
  countRef.current = onStepCount
  const changeRef = useRef(onStepChange)
  changeRef.current = onStepChange
  const endRef = useRef(onPlayEnd)
  endRef.current = onPlayEnd
  // Read hold durations through a ref so a freshly-built `holds` array on each
  // render does NOT restart the play effect (which would reset autoplay to the
  // first beat on every advance). Callers pass `story.steps.map(...)` inline.
  const holdsRef = useRef(holds)
  holdsRef.current = holds

  useEffect(() => {
    countRef.current?.(finalIndex + 1)
  }, [finalIndex])

  useEffect(() => {
    changeRef.current?.(index)
  }, [index])

  // Run a play-through whenever `playing` flips true; it begins at the current `step`.
  useEffect(() => {
    if (!playing) return
    let i = Math.max(0, Math.min(finalIndex, step))
    setAutoIndex(i)
    if (reduce || i >= finalIndex) {
      setAutoIndex(finalIndex)
      endRef.current?.()
      return
    }
    let timer = 0
    const tick = () => {
      const wait = holdsRef.current?.[i] ?? stepMs
      timer = window.setTimeout(() => {
        i += 1
        setAutoIndex(i)
        if (i >= finalIndex) {
          endRef.current?.()
          return
        }
        tick()
      }, wait)
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [playing, step, finalIndex, reduce, stepMs])

  return index
}
