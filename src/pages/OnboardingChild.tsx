// src/pages/OnboardingChild.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import ChildForm from '../components/ChildForm'
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

  return (
    <AuthCard
      mascotSrc="/hero-mascot.png"
      eyebrow="Profil Anak"
      title="Tambah profil anak pertama"
      subtitle="Setiap anak punya progres dan koleksi badge sendiri. Kamu bisa tambah lebih banyak profil kapan saja."
    >
      <ChildForm submitLabel="Simpan dan mulai" onCreated={handleCreated} />
    </AuthCard>
  )
}
