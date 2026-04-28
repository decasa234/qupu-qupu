import { cn } from '../lib/utils'

interface BrandLogoProps {
  className?: string
}

export default function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      src="/logo-qupu.png"
      alt="QUPU"
      draggable={false}
      className={cn(
        'block h-16 select-none object-contain object-center py-3 sm:h-24 sm:py-4 sm:pb-6',
        className,
      )}
    />
  )
}
