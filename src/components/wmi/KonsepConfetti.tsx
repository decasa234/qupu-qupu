// src/components/wmi/KonsepConfetti.tsx
//
// One-shot celebration burst for a correct konsep answer. Mounted fresh on each
// correct submission (parent keys it), so every correct answer gets a new rain.
// Reuses the global `fall` keyframe (index.css). pointer-events-none — never
// blocks the "Next question" tap underneath.
import { useEffect, useMemo, useState } from 'react'

const COLORS = ['#FFDD55', '#F0853A', '#30598A', '#22C55E', '#FB923C']

export default function KonsepConfetti({ pieces = 40 }: { pieces?: number }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2500)
    return () => clearTimeout(t)
  }, [])

  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.4,
        duration: 1.8 + Math.random() * 1.4,
        size: 6 + Math.random() * 7,
        round: i % 3 === 0,
      })),
    [pieces],
  )

  if (!show) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      aria-hidden="true"
    >
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size * 1.4}px`,
            backgroundColor: b.color,
            borderRadius: b.round ? '9999px' : '2px',
            animation: `fall ${b.duration}s linear ${b.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
