import { useState } from 'react'
import type { WmiGlossaryTerm } from '../../types/wmi'

export default function WmiGlossaryPopover({ term }: { term: WmiGlossaryTerm }) {
  const [lang, setLang] = useState<'en' | 'id'>('en')
  const isId = lang === 'id'

  return (
    <span className="absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-qupu-peach bg-white p-3 text-left text-sm shadow-clay">
      <span className="flex items-center justify-between gap-3">
        <strong className="text-qupu-brand-blue">{isId ? term.term_id : term.term_en}</strong>
        <button
          type="button"
          onClick={() => setLang(isId ? 'en' : 'id')}
          className="rounded-full bg-qupu-cream px-2 py-1 text-xs font-bold text-qupu-brand-blue"
        >
          {isId ? 'EN' : 'ID'}
        </button>
      </span>
      <span className="mt-2 block text-gray-700">
        {isId ? term.definition_id : term.definition_en}
      </span>
      {(term.example_en || term.example_id) && (
        <em className="mt-2 block text-gray-500">
          {isId ? term.example_id : term.example_en}
        </em>
      )}
    </span>
  )
}
