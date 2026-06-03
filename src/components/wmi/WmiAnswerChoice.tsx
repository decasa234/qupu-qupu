import type { WmiChoice } from '../../types/wmi'
import { cn } from '../../lib/utils'

interface Props {
  choice: WmiChoice
  selected: boolean
  correct?: boolean
  wrongPicked?: boolean
  disabled?: boolean
  onPick: (label: string) => void
  children: React.ReactNode
}

export default function WmiAnswerChoice({
  choice,
  selected,
  correct,
  wrongPicked,
  disabled,
  onPick,
  children,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPick(choice.label)}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border-2 bg-white p-3.5 text-left shadow-sm transition-all',
        !disabled &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-qupu-brand-blue hover:shadow-md active:translate-y-0 active:shadow-sm',
        selected ? 'border-qupu-brand-blue bg-qupu-sky/40 ring-2 ring-qupu-brand-blue/30' : 'border-qupu-cream-dark',
        correct && 'border-green-500 bg-green-50',
        wrongPicked && 'border-red-500 bg-red-50',
        disabled && 'cursor-default shadow-none',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold transition-colors',
          selected ? 'bg-qupu-brand-blue text-white' : 'bg-qupu-cream text-qupu-brand-blue',
          correct && 'bg-green-500 text-white',
          wrongPicked && 'bg-red-500 text-white',
        )}
      >
        {choice.label}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  )
}
