import { Link } from 'react-router-dom'
import BadgeCurve from '../BadgeCurve'

interface EarnedProps {
  state: 'earned'
  label: string
  colorHex: string
  href: string
  badgeCount: number
}

interface LockedProps {
  state: 'locked'
  label: string
}

type Props = EarnedProps | LockedProps

const BADGE_SIZE = 56

export default function BadgeMedallion(props: Props) {
  if (props.state === 'locked') {
    return (
      <div className="text-center">
        <div className="mx-auto opacity-40 grayscale" style={{ width: BADGE_SIZE }}>
          <BadgeCurve color="#CBD5E1" ribbonColor="#94A3B8" size={BADGE_SIZE} label={props.label} />
        </div>
        <div className="mt-1 truncate text-[10px] font-bold text-slate-400">{props.label}</div>
      </div>
    )
  }
  return (
    <Link
      to={props.href}
      className="group relative text-center transition-transform hover:-translate-y-1"
    >
      <div className="relative mx-auto" style={{ width: BADGE_SIZE }}>
        <BadgeCurve color={props.colorHex} size={BADGE_SIZE} label={props.label} />
        {props.badgeCount > 1 && (
          <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-qupu-brand-orange px-1.5 font-display text-[11px] font-extrabold text-white shadow-sm">
            {props.badgeCount}×
          </span>
        )}
      </div>
      <div className="mt-1 truncate text-[10px] font-bold text-qupu-brand-blue">{props.label}</div>
    </Link>
  )
}
