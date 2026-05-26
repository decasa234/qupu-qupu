// src/hooks/useLoadingState.ts
//
// Global in-flight counter for the LoadingOverlay. Every axios request +
// route change increments; completion decrements. When the counter hits
// zero we wait 500ms before hiding — gives slow renders time to commit
// and absorbs flicker between rapid back-to-back requests.
import { create } from 'zustand'

interface LoadingState {
  inflightCount: number
  visible: boolean
  start: () => void
  stop: () => void
}

const HIDE_DELAY_MS = 500
let hideTimer: number | null = null

export const useLoadingState = create<LoadingState>((set, get) => ({
  inflightCount: 0,
  visible: false,
  start: () => {
    if (hideTimer !== null) {
      window.clearTimeout(hideTimer)
      hideTimer = null
    }
    set((s) => ({ inflightCount: s.inflightCount + 1, visible: true }))
  },
  stop: () => {
    set((s) => ({ inflightCount: Math.max(0, s.inflightCount - 1) }))
    if (get().inflightCount === 0) {
      if (hideTimer !== null) window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => {
        set({ visible: false })
        hideTimer = null
      }, HIDE_DELAY_MS)
    }
  },
}))
