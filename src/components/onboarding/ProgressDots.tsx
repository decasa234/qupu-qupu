// src/components/onboarding/ProgressDots.tsx
interface ProgressDotsProps {
  total: number
  current: number // 0-based index of the active step
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all duration-200 ${
            i === current
              ? 'w-6 bg-qupu-brand-orange'
              : i < current
                ? 'w-2 bg-qupu-brand-orange/50'
                : 'w-2 bg-qupu-peach'
          }`}
        />
      ))}
    </div>
  )
}
