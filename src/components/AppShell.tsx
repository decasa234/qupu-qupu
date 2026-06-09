// src/components/AppShell.tsx
//
// Member-route chrome. Replaces <Layout> for /dashboard /shop /badges
// /report /me. Mobile-first phone-shell layout: sticky top stats, scrollable
// body, sticky bottom nav. On lg+ the narrow column is framed as a "device"
// and the surrounding gutters are filled with brand decoration so it reads as
// an intentional phone mockup, not a mobile page stranded on a wide monitor.
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import { getCachedPublic } from '../lib/api'
import { inferWmiGrade } from '../lib/childGrade'
import type { AgeGroupOption } from '../types'
import TopStatStrip from './app-shell/TopStatStrip'
import BottomTabBar from './app-shell/BottomTabBar'
import OnboardingTour from './onboarding/OnboardingTour'

export default function AppShell() {
  const children = useAuthStore((state) => state.children)
  const activeChildId = useAuthStore((state) => state.activeChildId)
  const role = useAuthStore((state) => state.user?.role)
  const syncChildGrade = useWmiStore((state) => state.syncChildGrade)
  const childrenCount = children.length

  // Age groups are needed to reverse the onboarding wizard's grade→ageGroup
  // mapping (a child profile only stores ageGroupId). Cached for 60s by
  // getCachedPublic, so this is cheap across remounts.
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[] | null>(null)
  useEffect(() => {
    let cancelled = false
    getCachedPublic<{ data?: { ageGroups?: AgeGroupOption[] } }>('/public/meta')
      .then((meta) => {
        if (!cancelled) setAgeGroups(meta.data?.ageGroups ?? [])
      })
      .catch(() => {
        /* inference falls back to grade 1; persisted picks still win */
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Single sync point for the per-child WMI grade: covers login, child
  // switching (ChildSwitcher → authStore.setActiveChild) and cold-load
  // rehydration, because AppShell wraps every member route. A persisted
  // manual pick (gradeByChild) always wins over the inferred grade.
  useEffect(() => {
    if (!activeChildId) return
    const child = children.find((c) => c.id === activeChildId) ?? null
    syncChildGrade(activeChildId, inferWmiGrade(child, ageGroups))
  }, [activeChildId, children, ageGroups, syncChildGrade])

  // Gate: a member with no child profile yet must complete /onboard/child
  // before reaching any member surface (can't skip the first step). Admins
  // are exempt — they manage the app rather than onboard a child.
  if (childrenCount === 0 && role !== 'admin') {
    return <Navigate to="/onboard/child" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-qupu-cream">
      <TopStatStrip />
      <main className="relative flex w-full flex-1 flex-col px-4 py-4">
        <DesktopBackdrop />
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col sm:max-w-lg lg:my-6 lg:max-w-[460px] lg:rounded-[2.75rem] lg:bg-[#FFF8F0] lg:p-4 lg:shadow-[8px_10px_0_0_#FFD3B1] lg:ring-1 lg:ring-[#FFE3CC]">
          <Outlet />
        </div>
      </main>
      <BottomTabBar />
      <OnboardingTour />
    </div>
  )
}

// Decorative-only layer for the empty desktop gutters. Self-clips with its own
// overflow-hidden (it is a sibling *behind* the content column, never an
// ancestor) so sticky page headers inside the column keep working. lg-only and
// pointer-events-none — zero impact on mobile and on interaction.
function DesktopBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block"
    >
      {/* soft colour blobs */}
      <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-qupu-brand-yellow/25 blur-3xl" />
      <div className="absolute -right-8 top-1/3 h-72 w-72 rounded-full bg-qupu-brand-orange/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-qupu-brand-blue/10 blur-3xl" />

      {/* star constellation — kept inside the gutters (well clear of the centred frame) */}
      <i className="fa-solid fa-star absolute left-[7%] top-[14%] text-3xl text-qupu-brand-yellow/80" />
      <i className="fa-solid fa-star absolute left-[15%] top-[42%] text-base text-qupu-brand-orange/50" />
      <i className="fa-solid fa-star absolute left-[5%] bottom-[20%] text-2xl text-qupu-brand-yellow/70" />
      <i className="fa-solid fa-star absolute right-[8%] top-[12%] text-2xl text-qupu-brand-yellow/80" />
      <i className="fa-solid fa-star absolute right-[16%] top-[38%] text-lg text-qupu-brand-orange/45" />
      <i className="fa-solid fa-star absolute right-[6%] top-[58%] text-xl text-qupu-brand-yellow/70" />

      {/* mascot peeking from the right gutter */}
      <img
        src="/hero-mascot.png"
        alt=""
        draggable={false}
        className="absolute bottom-[10%] right-[4%] h-40 w-auto -rotate-6 select-none drop-shadow-[0_12px_28px_rgba(120,60,0,0.22)] xl:h-52"
      />
    </div>
  )
}
