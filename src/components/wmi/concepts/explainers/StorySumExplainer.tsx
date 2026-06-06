import { useEffect, useMemo, useRef } from 'react'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'

interface StorySumParams {
  start: number
  distractor: number
  giveMorning: number
  giveLunch: number
  name: string
  fruit_en: string
  fruit_id: string
  distractor_en: string
  distractor_id: string
}

interface Beat {
  text: string
  basket: number
  table: number
  hold: number
  result?: boolean
}

function drawZone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  bg: string,
  border: string,
) {
  ctx.fillStyle = bg
  ctx.strokeStyle = border
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 18)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#30598A'
  ctx.font = '800 16px Nunito, sans-serif'
  ctx.fillText(label, x + 16, y + 26)
}

// Lay `count` items out in a grid that fits INSIDE the given zone (below its
// label), shrinking the cells/radius as needed so nothing spills over.
function drawItems(
  ctx: CanvasRenderingContext2D,
  count: number,
  zoneX: number,
  zoneY: number,
  zoneW: number,
  zoneH: number,
  color: string,
  label: string,
) {
  if (count <= 0) return
  const padX = 14
  const padTop = 34 // clear the zone label
  const padBottom = 12
  const areaX = zoneX + padX
  const areaY = zoneY + padTop
  const areaW = zoneW - padX * 2
  const areaH = zoneH - padTop - padBottom

  const cols = Math.min(count, Math.max(1, Math.round(Math.sqrt((count * areaW) / areaH))))
  const rows = Math.ceil(count / cols)
  const cell = Math.min(areaW / cols, areaH / rows, 34)
  const radius = Math.max(5, Math.min(12, cell * 0.4))
  const startX = areaX + (areaW - cols * cell) / 2 + cell / 2
  const startY = areaY + (areaH - rows * cell) / 2 + cell / 2

  ctx.textAlign = 'center'
  for (let i = 0; i < count; i++) {
    const cx = startX + (i % cols) * cell
    const cy = startY + Math.floor(i / cols) * cell
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
    if (radius >= 8) {
      ctx.fillStyle = '#fff'
      ctx.font = `800 ${Math.round(radius * 0.95)}px Nunito, sans-serif`
      ctx.fillText(label, cx, cy + radius * 0.35)
    }
  }
  ctx.textAlign = 'left'
}

function fruitLetter(value: string): string {
  return value.slice(0, 1).toUpperCase()
}

export default function StorySumExplainer(props: ExplainerProps) {
  const { params, correctAnswer } = props
  const p = params as StorySumParams
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const beats = useMemo<Beat[]>(() => {
    const afterMorning = p.start - p.giveMorning
    const answer = afterMorning - p.giveLunch
    return [
      { text: `${p.name} starts with ${p.start} in the basket.`, basket: 0, table: 0, hold: 900 },
      { text: `${p.name} starts with ${p.start} in the basket.`, basket: p.start, table: 0, hold: 900 },
      { text: `${p.distractor} extra items are on the table, not in the basket.`, basket: p.start, table: p.distractor, hold: 1400 },
      { text: `Morning: give ${p.giveMorning}.`, basket: afterMorning, table: p.distractor, hold: 1200 },
      { text: `Lunch: give ${p.giveLunch} more.`, basket: answer, table: p.distractor, hold: 1200 },
      { text: `${correctAnswer} left in the basket. The table items do not count.`, basket: answer, table: p.distractor, hold: 0, result: true },
    ]
  }, [correctAnswer, p])

  const holds = useMemo(() => beats.map((b) => b.hold), [beats])
  const frame = useBeatControl(beats.length - 1, { ...props, holds })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const beat = beats[frame] ?? beats[0]

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#fff2df'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawZone(ctx, 18, 24, 212, 150, 'Keranjang', '#FFF6EC', '#F97316')
    drawZone(ctx, 250, 24, 172, 150, 'Meja', '#F3F4F6', '#9CA3AF')
    drawItems(ctx, beat.basket, 18, 24, 212, 150, '#F97316', fruitLetter(p.fruit_id))
    drawItems(ctx, beat.table, 250, 24, 172, 150, '#EF4444', fruitLetter(p.distractor_id))

    ctx.fillStyle = beat.result ? '#D1FAE5' : '#E1EFFB'
    ctx.strokeStyle = beat.result ? '#10B981' : '#30598A'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(18, 188, 404, 58, 14)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#341857'
    ctx.font = '800 16px Nunito, sans-serif'
    wrapText(ctx, beat.text, 36, 214, 360, 21)

    ctx.fillStyle = '#30598A'
    ctx.beginPath()
    ctx.roundRect(334, 132, 72, 30, 15)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '800 14px Nunito, sans-serif'
    ctx.fillText(`left: ${beat.basket}`, 348, 152)
  }, [beats, frame, p])

  return <canvas ref={canvasRef} width={440} height={260} className="mx-auto block w-full max-w-[440px]" />
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y)
      line = word
      y += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, x, y)
}
