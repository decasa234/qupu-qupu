import { Link } from 'react-router-dom'

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
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-dashed border-slate-300 bg-slate-100 text-slate-400">
          <i className="fa-solid fa-lock" aria-hidden="true" />
        </div>
        <div className="mt-1 truncate text-[10px] font-bold text-slate-400">{props.label}</div>
      </div>
    )
  }
  return (
    <Link to={props.href} className="text-center transition-transform hover:-translate-y-1">
      <div
        className="mx-auto h-12 w-12 rounded-full border-[3px] border-white shadow-[0_4px_0_#FFD3B1]"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${props.colorHex}33, ${props.colorHex})`,
        }}
        aria-label={props.label}
      />
      <div className="mt-1 truncate text-[10px] font-bold text-qupu-brand-blue">
        {props.label}
        {props.badgeCount > 1 ? ` (${props.badgeCount}×)` : ''}
      </div>
    </Link>
  )
}
