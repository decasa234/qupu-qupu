// src/components/SkeletonCard.tsx
interface SkeletonCardProps {
  className?: string
  height?: string
}

export default function SkeletonCard({
  className = '',
  height = 'h-96',
}: SkeletonCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/40 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] ${className}`}
    >
      <div className={`${height} w-full animate-pulse rounded-[2rem] bg-qupu-cream`} />
    </div>
  )
}
