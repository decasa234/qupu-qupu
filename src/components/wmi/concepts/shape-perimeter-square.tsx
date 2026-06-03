import Square from '../figures/Square'

interface ShapePerimeterSquareParams {
  side: number
}

export default function ShapePerimeterSquareIllustration({ params }: { params: unknown }) {
  const p = params as ShapePerimeterSquareParams
  return <Square side={p.side} />
}
