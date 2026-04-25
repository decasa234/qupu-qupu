// src/components/Slider.tsx
import { useId } from 'react'
import { cn } from '../lib/utils'

interface SliderProps {
  value: number
  min?: number
  max: number
  step?: number
  onChange: (value: number) => void
  className?: string
  ariaLabel?: string
}

export default function Slider({
  value,
  min = 0,
  max,
  step = 1,
  onChange,
  className,
  ariaLabel,
}: SliderProps) {
  const id = useId()
  const range = max - min === 0 ? 1 : max - min
  const percent = ((value - min) / range) * 100

  return (
    <div className={cn('relative w-full select-none px-3 pb-2 pt-10', className)}>
      <div
        className="pointer-events-none absolute -translate-x-1/2 transition-[left] duration-150 ease-out"
        style={{ left: `calc(${percent}% + ${12 - percent * 0.24}px)`, top: 0 }}
      >
        <div className="relative">
          <div className="rounded-xl bg-qupu-brand-blue px-3 py-1 font-display text-sm font-extrabold text-white shadow-[0_2px_0_0_#263B55]">
            {value}
          </div>
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px"
            aria-hidden="true"
          >
            <div className="h-2 w-2 rotate-45 bg-qupu-brand-blue" />
          </div>
        </div>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={ariaLabel}
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-full bg-qupu-peach',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-qupu-brand-orange/30',
          '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-qupu-peach',
          '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-qupu-peach',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:-translate-y-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-qupu-brand-orange [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-subscribe [&::-webkit-slider-thumb]:transition-transform',
          '[&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-qupu-brand-orange [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-subscribe',
        )}
        style={{
          background: `linear-gradient(to right, #EF711A 0%, #EF711A ${percent}%, #FFD3B1 ${percent}%, #FFD3B1 100%)`,
        }}
      />

      <div className="mt-2 flex justify-between text-xs font-semibold text-qupu-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
