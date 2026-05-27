// src/hooks/useLoadingState.ts
//
// Global in-flight counter for the LoadingOverlay. Every axios request +
// route change increments; completion decrements. When the counter hits
// zero we wait 500ms before hiding — gives slow renders time to commit
// and absorbs flicker between rapid back-to-back requests.
//
// Safety: if the overlay stays visible continuously for more than 8
// seconds, force-reset the counter and hide. Belt-and-braces guard
// against a stuck counter (e.g. StrictMode leak, hung request).
import { create } from 'zustand'

interface LoadingState {
  inflightCount: number
  visible: boolean
  start: () => void
  stop: () => void
  // Internal: force-reset (used by safety timer)
  _forceReset: () => void
}

const HIDE_DELAY_MS = 500
const MAX_VISIBLE_MS = 8000
let hideTimer: number | null = null
let safetyTimer: number | null = null

function clearHideTimer() {
  if (hideTimer !== null) {
    window.clearTimeout(hideTimer)
    hideTimer = null
  }
}

function clearSafetyTimer() {
  if (safetyTimer !== null) {
    window.clearTimeout(safetyTimer)
    safetyTimer = null
  }
}

export const useLoadingState = create<LoadingState>((set, get) => ({
  inflightCount: 0,
  visible: false,
  start: () => {
    clearHideTimer()
    const wasVisible = get().visible
    set((s) => ({ inflightCount: s.inflightCount + 1, visible: true }))
    // (Re)arm the safety timer only if we just became visible.
    if (!wasVisible) {
      clearSafetyTimer()
      safetyTimer = window.setTimeout(() => {
        // Hung work — force reset so the UI isn't blocked.
        console.warn('[loading] overlay stuck > 8s, force-resetting')
        get()._forceReset()
      }, MAX_VISIBLE_MS)
    }
  },
  stop: () => {
    set((s) => ({ inflightCount: Math.max(0, s.inflightCount - 1) }))
    if (get().inflightCount === 0) {
      clearHideTimer()
      hideTimer = window.setTimeout(() => {
        set({ visible: false })
        hideTimer = null
        clearSafetyTimer()
      }, HIDE_DELAY_MS)
    }
  },
  _forceReset: () => {
    clearHideTimer()
    clearSafetyTimer()
    set({ inflightCount: 0, visible: false })
  },
}))
