import { useState } from 'react'
import { useWmiStore } from '../../store/wmiStore'
import WmiGlossaryPopover from './WmiGlossaryPopover'

interface Props {
  slug: string
  children: string
  onLookup?: (slug: string) => void
}

export default function WmiGlossaryTerm({ slug, children, onLookup }: Props) {
  const [open, setOpen] = useState(false)
  const term = useWmiStore((state) => state.glossary[slug])

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value)
          onLookup?.(slug)
        }}
        className="font-bold text-qupu-brand-blue underline decoration-qupu-brand-yellow decoration-2 underline-offset-4"
      >
        {children}
      </button>
      {open && term && <WmiGlossaryPopover term={term} />}
    </span>
  )
}
