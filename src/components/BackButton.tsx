// src/components/BackButton.tsx
//
// The one back/exit control for member + parent pages. Used in a header row:
//   <BackButton to="/main" /> <h1>Title</h1>
// variant 'back' = round arrow-left, navigate(-1) with a route fallback when
// there's no history (deep link / notification). variant 'close' = round X for
// exiting a flow/session; live sessions pass their own quit-confirm via onClick.
import { useLocation, useNavigate } from 'react-router-dom'

interface BackButtonProps {
  variant?: 'back' | 'close'
  to?: string
  onClick?: () => void
  label?: string
  className?: string
}

export default function BackButton({
  variant = 'back',
  to,
  onClick,
  label,
  className,
}: BackButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handle = () => {
    if (onClick) {
      onClick()
      return
    }
    if (variant === 'close') {
      navigate(to ?? '/belajar')
      return
    }
    if (location.key === 'default') navigate(to ?? '/belajar')
    else navigate(-1)
  }

  const icon = variant === 'close' ? 'fa-xmark' : 'fa-arrow-left'
  const aria = label ?? (variant === 'close' ? 'Keluar' : 'Kembali')

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={aria}
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5${
        className ? ` ${className}` : ''
      }`}
    >
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
    </button>
  )
}
