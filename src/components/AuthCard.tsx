// src/components/AuthCard.tsx
import type { ReactNode } from 'react'
import Reveal from './Reveal'
import { cn } from '../lib/utils'

interface AuthCardProps {
  mascotSrc: string
  eyebrow: string
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export default function AuthCard({
  mascotSrc,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Reveal>
      <div className={cn('relative mx-auto max-w-lg', className)}>
        <img
          src={mascotSrc}
          alt=""
          draggable={false}
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-12 z-10 h-28 w-auto select-none drop-shadow-[0_10px_24px_rgba(120,60,0,0.25)] sm:-right-6 sm:-top-14 sm:h-32"
        />

        <i
          className="fa-solid fa-star pointer-events-none absolute -left-4 top-6 text-2xl text-qupu-brand-yellow drop-shadow-sm"
          aria-hidden="true"
        />
        <i
          className="fa-solid fa-star pointer-events-none absolute right-10 -top-2 text-base text-qupu-brand-yellow/80"
          aria-hidden="true"
        />
        <i
          className="fa-solid fa-star pointer-events-none absolute -left-2 bottom-12 text-sm text-qupu-brand-yellow/70"
          aria-hidden="true"
        />
        <i
          className="fa-solid fa-star pointer-events-none absolute -right-3 bottom-6 text-lg text-qupu-brand-yellow"
          aria-hidden="true"
        />

        <div className="relative rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-8 shadow-[6px_8px_0_0_#FFD3B1] sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            {eyebrow}
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-sm font-semibold leading-relaxed text-qupu-muted sm:text-base">
              {subtitle}
            </p>
          )}

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-6 border-t border-qupu-peach pt-5 text-sm text-qupu-muted">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  )
}
