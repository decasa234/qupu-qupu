// src/pages/OnboardingChild.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChildOnboardingWizard from '../components/onboarding/ChildOnboardingWizard'
import { trackEvent } from '../lib/analytics'
import { useAuthStore } from '../store/authStore'
import type { Child } from '../types'

export default function OnboardingChild() {
  const navigate = useNavigate()
  const { children, activeChildId, addChild, setActiveChild } = useAuthStore()

  useEffect(() => {
    if (children.length > 0 && activeChildId) {
      navigate('/dashboard', { replace: true })
    }
  }, [children, activeChildId, navigate])

  const handleCreated = (child: Child) => {
    addChild(child)
    setActiveChild(child.id)
    trackEvent('onboarding_child_created')
    navigate('/dashboard', { replace: true })
  }

  return <ChildOnboardingWizard onCreated={handleCreated} />
}
