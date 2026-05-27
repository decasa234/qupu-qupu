export default function WmiFigure({ src }: { src: string | null }) {
  if (!src) return null
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white">
      <img src={src} alt="" className="mx-auto max-h-72 w-full object-contain" />
    </div>
  )
}
