// src/store/tourStore.ts
//
// Drives the post-signup product tour that spotlights the real pages.
// Stage advances strictly: idle -> wmi -> video -> done. Persisted so the
// gating survives reloads mid-tour. Only ever started explicitly after a
// child profile is created, so existing users are never retroactively toured.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TourStage = 'idle' | 'wmi' | 'video' | 'done'

interface TourState {
  stage: TourStage
  videoSlug: string | null
  startTour: () => void
  goToVideo: (slug: string) => void
  finishTour: () => void
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      stage: 'idle',
      videoSlug: null,
      startTour: () => set({ stage: 'wmi' }),
      goToVideo: (slug) => set({ stage: 'video', videoSlug: slug }),
      finishTour: () => set({ stage: 'done', videoSlug: null }),
    }),
    { name: 'qupu-onboarding-tour' },
  ),
)
