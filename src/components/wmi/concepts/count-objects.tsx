import DotArray from '../figures/DotArray'

interface CountObjectsParams {
  n: number
  kind: string
}

export default function CountObjectsIllustration({ params }: { params: unknown }) {
  const p = params as CountObjectsParams
  return <DotArray totalDots={p.n} />
}
