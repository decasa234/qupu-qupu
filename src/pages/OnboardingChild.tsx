// src/pages/OnboardingChild.tsx
import { useNavigate } from 'react-router-dom'
import ChildOnboardingWizard from '../components/onboarding/ChildOnboardingWizard'
import { trackEvent } from '../lib/analytics'
import { useAuthStore } from '../store/authStore'
import { useWmiStore } from '../store/wmiStore'
import type { Child } from '../types'
import type { WmiGrade } from '../types/wmi'

export default function OnboardingChild() {
  const navigate = useNavigate()
  const { addChild, setActiveChild } = useAuthStore()
  const pinGradeForChild = useWmiStore((state) => state.pinGradeForChild)

  const handleCreated = (child: Child, wmiGrade: WmiGrade) => {
    addChild(child)
    setActiveChild(child.id)
    // Pin the wizard's grade choice for this child so the garden opens at the
    // real grade (age groups alone can't distinguish Kelas 1/2/3).
    pinGradeForChild(child.id, wmiGrade)
    trackEvent('onboarding_child_created')
    // The garden is the app's landing — a one-time coach-mark there points at
    // the first session, so the first question is the tutorial.
    navigate('/latihan/wmi', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-qupu-brand-orange px-4 py-12">
      {/* Minimal orange-on-orange depth + a few faint stars. Focus, not clutter. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-[#C46123]/40" />
        <i className="fa-solid fa-star absolute left-[12%] top-[16%] text-2xl text-white/40" />
        <i className="fa-solid fa-star absolute right-[14%] top-[22%] text-base text-white/30" />
        <i className="fa-solid fa-star absolute bottom-[18%] right-[20%] text-xl text-white/35" />
      </div>

      <div className="relative z-10 w-full">
        <ChildOnboardingWizard onCreated={handleCreated} />
      </div>
    </div>
  )
}
