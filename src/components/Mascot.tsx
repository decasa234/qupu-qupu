import { cn } from '../lib/utils'

interface MascotProps {
  className?: string
  variant?: 'default' | 'thumbs-up' | 'holding-book' | 'reading' | 'compact'
  accent?: 'orange' | 'purple' | 'blue'
}

export default function Mascot({ className, variant = 'default', accent = 'orange' }: MascotProps) {
  const cheek = accent === 'orange' ? '#F97316' : accent === 'purple' ? '#A855F7' : '#2563EB'
  return (
    <svg
      viewBox="0 0 220 240"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-auto w-full select-none', className)}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="qupu-body" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </radialGradient>
        <linearGradient id="qupu-wing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {/* wings */}
      <ellipse cx="50" cy="110" rx="42" ry="56" fill="url(#qupu-wing)" opacity="0.9" />
      <ellipse cx="170" cy="110" rx="42" ry="56" fill="url(#qupu-wing)" opacity="0.9" />
      <ellipse cx="55" cy="95" rx="18" ry="22" fill="#DDD6FE" opacity="0.6" />
      <ellipse cx="165" cy="95" rx="18" ry="22" fill="#DDD6FE" opacity="0.6" />

      {/* antennae */}
      <path d="M95 48 Q85 22 78 18" stroke="#1E3A8A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="78" cy="17" r="6" fill="#F97316" />
      <path d="M125 48 Q135 22 142 18" stroke="#1E3A8A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="142" cy="17" r="6" fill="#F97316" />

      {/* body */}
      <ellipse cx="110" cy="130" rx="62" ry="72" fill="url(#qupu-body)" />
      <ellipse cx="110" cy="110" rx="52" ry="40" fill="#BFDBFE" opacity="0.45" />

      {/* glasses */}
      <circle cx="85" cy="115" r="22" fill="white" stroke="#0F172A" strokeWidth="4" />
      <circle cx="135" cy="115" r="22" fill="white" stroke="#0F172A" strokeWidth="4" />
      <line x1="107" y1="115" x2="113" y2="115" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="85" cy="115" r="9" fill="#0F172A" />
      <circle cx="135" cy="115" r="9" fill="#0F172A" />
      <circle cx="89" cy="111" r="3" fill="white" />
      <circle cx="139" cy="111" r="3" fill="white" />

      {/* smile */}
      <path
        d="M94 148 Q110 162 126 148"
        stroke="#0F172A"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* cheeks */}
      <circle cx="68" cy="142" r="7" fill={cheek} opacity="0.5" />
      <circle cx="152" cy="142" r="7" fill={cheek} opacity="0.5" />

      {variant === 'thumbs-up' && (
        <g>
          <ellipse cx="165" cy="165" rx="14" ry="18" fill="#3B82F6" transform="rotate(-18 165 165)" />
          <rect x="158" y="148" width="14" height="8" rx="4" fill="#F97316" transform="rotate(-18 165 152)" />
        </g>
      )}

      {variant === 'holding-book' && (
        <g>
          <rect x="70" y="168" width="80" height="40" rx="6" fill="#F97316" />
          <rect x="70" y="168" width="80" height="40" rx="6" fill="none" stroke="#1E3A8A" strokeWidth="3" />
          <line x1="110" y1="168" x2="110" y2="208" stroke="#1E3A8A" strokeWidth="3" />
          <rect x="76" y="174" width="26" height="4" rx="2" fill="white" />
          <rect x="118" y="174" width="26" height="4" rx="2" fill="white" />
          <rect x="76" y="184" width="20" height="4" rx="2" fill="white" opacity="0.7" />
          <rect x="118" y="184" width="20" height="4" rx="2" fill="white" opacity="0.7" />
        </g>
      )}
    </svg>
  )
}
