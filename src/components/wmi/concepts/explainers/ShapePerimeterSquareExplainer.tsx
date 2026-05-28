import { useEffect, useRef } from 'react'
import type { ExplainerProps } from './registry'

interface ShapePerimeterSquareParams {
  side: number
}

export default function ShapePerimeterSquareExplainer({ params }: ExplainerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const p = params as ShapePerimeterSquareParams
    const side = Math.max(1, p.side)
    const start = performance.now()
    const interval = 800
    const x = 60
    const y = 30
    const len = 120
    let raf = 0

    const corners: Array<[number, number]> = [
      [x, y],
      [x + len, y],
      [x + len, y + len],
      [x, y + len],
    ]
    const edges: Array<[[number, number], [number, number]]> = [
      [corners[0], corners[1]],
      [corners[1], corners[2]],
      [corners[2], corners[3]],
      [corners[3], corners[0]],
    ]

    const draw = (now: number) => {
      const highlighted = Math.min(4, Math.floor((now - start) / interval) + 1)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = '#CBD5E1'
      ctx.lineWidth = 4
      ctx.strokeRect(x, y, len, len)

      ctx.strokeStyle = '#F97316'
      ctx.lineWidth = 6
      for (let i = 0; i < highlighted; i++) {
        const [[ax, ay], [bx, by]] = edges[i]
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }

      ctx.fillStyle = '#30598A'
      ctx.font = 'bold 22px Nunito, sans-serif'
      ctx.fillText(`${side} x ${highlighted} = ${side * highlighted}`, x, y + len + 36)

      if (highlighted < 4) raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [params])

  return <canvas ref={canvasRef} width={300} height={220} className="mx-auto block" />
}
