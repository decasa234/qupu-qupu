// src/components/onboarding/OnboardingGuided.tsx
//
// Post-signup guided onboarding. Reuses the pre-signup demo steps
// (WhoStep -> SampleQuiz -> WinMoment -> MiniTour) but, because the user is
// already authenticated, ends by creating their REAL first child profile via
// the existing ChildForm (seeded with the name + grade collected in WhoStep).
// Used by OnboardingChild for new signups that did NOT come through the
// pre-signup /mulai demo.
import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { trackEvent } from '../../lib/analytics'
import { bandForAgeGroup, FALLBACK_GRADES, getDemoQuestions } from '../../lib/demoQuestions'
import type { AgeGroupOption, Child, PublicMeta } from '../../types'
import AuthCard from '../AuthCard'
import ChildForm from '../ChildForm'
import ProgressDots from './ProgressDots'
import WhoStep from './WhoStep'
import SampleQuiz from './SampleQuiz'
import WinMoment from './WinMoment'
import MiniTour from './MiniTour'

type Step = 'who' | 'quiz' | 'win' | 'tour' | 'form'
const STEP_ORDER: Step[] = ['who', 'quiz', 'win', 'tour', 'form']

interface OnboardingGuidedProps {
  onCreated: (child: Child) => void
}

export default function OnboardingGuided({ onCreated }: OnboardingGuidedProps) {
  const [step, setStep] = useState<Step>('who')
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[]>(FALLBACK_GRADES)
  const [childName, setChildName] = useState('')
  const [grade, setGrade] = useState<AgeGroupOption | null>(null)

  useEffect(() => {
    trackEvent('demo_started', { variant: 'post_signup' })
  }, [])

  useEffect(() => {
    let cancelled = false
    api
      .get('/public/meta')
      .then((response) => {
        if (cancelled) return
        const meta = response.data.data as PublicMeta
        if (meta.ageGroups?.length) setAgeGroups(meta.ageGroups)
      })
      .catch(() => {
        // keep FALLBACK_GRADES; onboarding must still run.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const questions = useMemo(() => getDemoQuestions(bandForAgeGroup(grade)), [grade])
  const currentIndex = STEP_ORDER.indexOf(step)

  function handleWhoSubmit(name: string, group: AgeGroupOption) {
    setChildName(name)
    setGrade(group)
    trackEvent('demo_grade_selected', { gradeName: group.name, variant: 'post_signup' })
    setStep('quiz')
  }

  // Only a real (non-sentinel) age group id can seed the child profile select.
  const initialAgeGroupId =
    grade && !grade.id.startsWith('fallback-') ? grade.id : ''

  if (step === 'form') {
    return (
      <AuthCard
        mascotSrc="/hero-mascot.png"
        eyebrow="Profil Anak"
        title={childName ? `Buat profil ${childName}` : 'Buat profil anak pertama'}
        subtitle="Konfirmasi data anak, lalu mulai belajar. Kamu bisa ubah kapan saja."
      >
        <ChildForm
          submitLabel="Mulai belajar"
          onCreated={onCreated}
          initialName={childName}
          initialAgeGroupId={initialAgeGroupId}
        />
      </AuthCard>
    )
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[420px] flex-col gap-6 px-4 py-8">
      <ProgressDots total={STEP_ORDER.length} current={currentIndex} />

      {step === 'who' && <WhoStep ageGroups={ageGroups} onSubmit={handleWhoSubmit} />}
      {step === 'quiz' && (
        <SampleQuiz questions={questions} onComplete={() => setStep('win')} />
      )}
      {step === 'win' && <WinMoment onContinue={() => setStep('tour')} />}
      {step === 'tour' && <MiniTour onContinue={() => setStep('form')} />}
    </div>
  )
}
