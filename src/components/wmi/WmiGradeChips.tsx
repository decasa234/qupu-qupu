import type { WmiGrade } from '../../types/wmi'

const DEFAULT_GRADES: WmiGrade[] = [1, 2, 3]

export default function WmiGradeChips({
  selected,
  onSelect,
  grades = DEFAULT_GRADES,
  // Garden levels are "Tingkat" (they don't map 1:1 to school grades);
  // WmiPapers overrides with "Grade" — the real WMI paper-grade labels.
  labelPrefix = 'Tingkat',
}: {
  selected: WmiGrade
  onSelect: (grade: WmiGrade) => void
  grades?: WmiGrade[]
  labelPrefix?: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {grades.map((grade) => (
        <button
          key={grade}
          type="button"
          onClick={() => onSelect(grade)}
          className={`rounded-full px-4 py-1.5 text-sm font-bold ${
            selected === grade ? 'bg-qupu-brand-blue text-white' : 'bg-qupu-cream text-qupu-brand-blue'
          }`}
        >
          {labelPrefix} {grade}
        </button>
      ))}
    </div>
  )
}
