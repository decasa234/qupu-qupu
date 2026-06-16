// src/components/Skeleton.tsx
//
// Skeleton-first loading placeholder. One consistent fill + pulse + radius for
// every member/parent loading state. Size/shape via className (e.g. "h-32",
// "h-16 w-16 rounded-full").
interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[1.25rem] bg-qupu-peach/50${className ? ` ${className}` : ''}`}
    />
  )
}
