import type { WmiGrade } from '../../types/wmi'

const GRADES: WmiGrade[] = [0, 1, 2, 3]

export default function WmiGradeChips({
  selected,
  onSelect,
}: {
  selected: WmiGrade
  onSelect: (grade: WmiGrade) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {GRADES.map((grade) => (
        <button
          key={grade}
          type="button"
          onClick={() => onSelect(grade)}
          className={`rounded-full px-4 py-1.5 text-sm font-bold ${
            selected === grade ? 'bg-qupu-brand-blue text-white' : 'bg-qupu-cream text-qupu-brand-blue'
          }`}
        >
          Grade {grade}
        </button>
      ))}
    </div>
  )
}
