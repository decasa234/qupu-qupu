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
        'flex w-full items-start gap-3 rounded-lg border-2 bg-white p-3 text-left transition-colors',
        selected ? 'border-qupu-brand-blue' : 'border-qupu-cream-dark',
        correct && 'border-green-500 bg-green-50',
        wrongPicked && 'border-red-500 bg-red-50',
        disabled && 'cursor-default',
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-qupu-cream font-bold text-qupu-brand-blue">
        {choice.label}
      </span>
      <span>{children}</span>
    </button>
  )
}
