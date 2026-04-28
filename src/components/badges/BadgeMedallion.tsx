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

export default function BadgeMedallion(props: Props) {
  if (props.state === 'locked') {
    return (
      <div className="flex flex-col items-center text-center opacity-40 grayscale">
        <BadgeCurve
          color="#CBD5E1"
          ribbonColor="#94A3B8"
          className="block h-auto w-full"
          label={props.label}
        />
        <div className="mt-1 w-full truncate text-[9px] font-bold text-slate-400">
          {props.label}
        </div>
      </div>
    )
  }
  return (
    <Link
      to={props.href}
      className="group relative flex flex-col items-center text-center transition-transform hover:-translate-y-1"
    >
      <div className="relative w-full">
        <BadgeCurve
          color={props.colorHex}
          className="block h-auto w-full"
          label={props.label}
        />
        {props.badgeCount > 1 && (
          <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-qupu-brand-orange px-1 font-display text-[9px] font-extrabold text-white shadow-sm">
            {props.badgeCount}×
          </span>
        )}
      </div>
      <div className="mt-1 w-full truncate text-[9px] font-bold text-qupu-brand-blue">
        {props.label}
      </div>
    </Link>
  )
}
