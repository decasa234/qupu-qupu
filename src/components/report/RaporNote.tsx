import type { ProgressSummary, SubjectStat } from '../../types'
import { subjectAutoNote } from '../../lib/predikat'

interface Props {
  stats: SubjectStat[]
  summary: ProgressSummary
  childName: string
}

export default function RaporNote({ stats, summary, childName }: Props) {
  const text = subjectAutoNote(stats, summary, childName)
  return (
    <div className="mt-3 rounded-lg border-[1.5px] border-dashed border-qupu-brand-orange bg-white px-3 py-2 text-[11px] leading-relaxed text-qupu-brand-blue">
      {text}
    </div>
  )
}
