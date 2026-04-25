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
        'block py-4 pb-6 h-20 select-none object-contain object-center sm:h-24 ',
        className,
      )}
    />
  )
}
