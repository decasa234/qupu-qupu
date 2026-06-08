import { useEffect, useRef } from 'react'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'

interface ShapePerimeterSquareParams {
  side: number
}

export default function ShapePerimeterSquareExplainer(props: ExplainerProps) {
  const p = (props.params ?? {}) as ShapePerimeterSquareParams
  const side = Math.max(1, Number.isFinite(p.side) ? p.side : 1)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // One beat per highlighted edge (1..4).
  const index = useBeatControl(3, { ...props, stepMs: 800 })
  const highlighted = index + 1

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const len = 120
    const x = (canvas.width - len) / 2
    const y = 30
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
    ctx.textAlign = 'center'
    ctx.fillText(`${side} × ${highlighted} = ${side * highlighted}`, x + len / 2, y + len + 36)
  }, [highlighted, side])

  return <canvas ref={canvasRef} width={300} height={220} className="mx-auto block" />
}
