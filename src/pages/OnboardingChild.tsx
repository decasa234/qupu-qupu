// src/pages/OnboardingChild.tsx
import { useNavigate } from 'react-router-dom'
import ChildOnboardingWizard from '../components/onboarding/ChildOnboardingWizard'
import { trackEvent } from '../lib/analytics'
import { useAuthStore } from '../store/authStore'
import { useTourStore } from '../store/tourStore'
import type { Child } from '../types'

export default function OnboardingChild() {
  const navigate = useNavigate()
  const { children, addChild, setActiveChild } = useAuthStore()
  const startTour = useTourStore((state) => state.startTour)

  const handleCreated = (child: Child) => {
    const isFirstChild = children.length === 0
    addChild(child)
    setActiveChild(child.id)
    trackEvent('onboarding_child_created')

    if (isFirstChild) {
      // First profile => kick off the spotlight tour on the real pages.
      startTour()
      navigate('/latihan/wmi/drill', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return <ChildOnboardingWizard onCreated={handleCreated} />
}
