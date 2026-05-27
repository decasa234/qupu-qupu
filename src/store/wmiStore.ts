import { create } from 'zustand'
import { fetchGlossary } from '../lib/wmiApi'
import type { WmiGlossaryTerm, WmiGrade } from '../types/wmi'

interface WmiState {
  selectedGrade: WmiGrade
  glossary: Record<string, WmiGlossaryTerm>
  glossaryLoaded: boolean
  setSelectedGrade: (grade: WmiGrade) => void
  loadGlossary: () => Promise<void>
}

export const useWmiStore = create<WmiState>((set, get) => ({
  selectedGrade: 1,
  glossary: {},
  glossaryLoaded: false,
  setSelectedGrade: (grade) => set({ selectedGrade: grade }),
  loadGlossary: async () => {
    if (get().glossaryLoaded) return
    const terms = await fetchGlossary()
    set({
      glossaryLoaded: true,
      glossary: Object.fromEntries(terms.map((term) => [term.slug, term])),
    })
  },
}))
