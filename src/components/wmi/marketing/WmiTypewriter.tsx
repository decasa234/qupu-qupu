import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/** Char-by-char typewriter. Instant + cursor-free when reduced-motion is on. */
export default function WmiTypewriter({
  text,
  speed = 55,
  startDelay = 0,
  className,
  cursorClassName,
}: {
  text: string
  speed?: number
  startDelay?: number
  className?: string
  cursorClassName?: string
}) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? text.length : 0)

  useEffect(() => {
    if (reduce) {
      setN(text.length)
      return
    }
    setN(0)
    let i = 0
    let interval: ReturnType<typeof setInterval>
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setN(i)
        if (i >= text.length) clearInterval(interval)
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
  }, [text, speed, startDelay, reduce])

  const done = n >= text.length
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {!done && (
        <span
          aria-hidden="true"
          className={cursorClassName ?? 'ml-1 inline-block w-[3px] animate-pulse rounded bg-current align-middle'}
          style={{ height: '0.9em' }}
        />
      )}
    </span>
  )
}
