import { useEffect, useRef } from 'react'
import type { ExplainerProps } from './registry'

interface CountObjectsParams {
  n: number
  kind: string
}

const KIND_COLOR: Record<string, string> = {
  apel: '#F97316',
  bola: '#2563EB',
  bintang: '#ffdd55',
  kucing: '#7C3AED',
}

export default function CountObjectsExplainer({ params }: ExplainerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const p = params as CountObjectsParams
    const n = Math.max(1, Math.min(9, p.n))
    const color = KIND_COLOR[p.kind] ?? '#F97316'
    const start = performance.now()
    const interval = 500
    const cols = 5
    const cell = 56
    const radius = 18
    let raf = 0

    const draw = (now: number) => {
      const revealed = Math.min(n, Math.floor((now - start) / interval) + 1)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < revealed; i++) {
        const cx = (i % cols) * cell + cell / 2 + 8
        const cy = Math.floor(i / cols) * cell + cell / 2 + 8
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }
      ctx.fillStyle = '#30598A'
      ctx.font = 'bold 28px Nunito, sans-serif'
      ctx.fillText(String(revealed), 8, canvas.height - 12)
      if (revealed < n) raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [params])

  return <canvas ref={canvasRef} width={320} height={180} className="mx-auto block" />
}
