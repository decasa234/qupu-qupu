// src/pages/OnboardingChild.tsx
import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import ChildForm from '../components/ChildForm'
import { trackEvent } from '../lib/analytics'
import { clearDemoSelections, readDemoSelections } from '../lib/demoStorage'
import { useAuthStore } from '../store/authStore'
import type { Child } from '../types'

export default function OnboardingChild() {
  const navigate = useNavigate()
  const { children, activeChildId, addChild, setActiveChild } = useAuthStore()

  // Read once on mount so the form's initial state is seeded before render.
  const demo = useMemo(() => readDemoSelections(), [])

  useEffect(() => {
    if (children.length > 0 && activeChildId) {
      navigate('/dashboard', { replace: true })
    }
  }, [children, activeChildId, navigate])

  const handleCreated = (child: Child) => {
    addChild(child)
    setActiveChild(child.id)
    clearDemoSelections()
    trackEvent('onboarding_child_created')
    navigate('/dashboard', { replace: true })
  }

  const subtitle = demo?.childName
    ? `Lanjutkan rencana ${demo.childName}. Setiap anak punya progres dan koleksi badge sendiri.`
    : 'Setiap anak punya progres dan koleksi badge sendiri. Kamu bisa tambah lebih banyak profil kapan saja.'

  return (
    <AuthCard
      mascotSrc="/hero-mascot.png"
      eyebrow="Profil Anak"
      title="Tambah profil anak pertama"
      subtitle={subtitle}
      footer={
        <Link to="/dashboard" className="font-semibold hover:text-qupu-brand-orange">
          Lewati untuk sekarang
        </Link>
      }
    >
      <ChildForm
        submitLabel="Simpan dan mulai"
        onCreated={handleCreated}
        initialName={demo?.childName ?? ''}
        initialAgeGroupId={demo?.ageGroupId ?? ''}
      />
    </AuthCard>
  )
}
