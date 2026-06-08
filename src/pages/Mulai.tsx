// src/pages/Mulai.tsx
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { saveDemoSelections } from '../lib/demoStorage'
import {
  bandForAgeGroup,
  FALLBACK_GRADES,
  getDemoQuestions,
} from '../lib/demoQuestions'
import { useAuthStore } from '../store/authStore'
import type { AgeGroupOption, PublicMeta, SubjectOption } from '../types'
import ProgressDots from '../components/onboarding/ProgressDots'
import WhoStep from '../components/onboarding/WhoStep'
import SampleQuiz from '../components/onboarding/SampleQuiz'
import WinMoment from '../components/onboarding/WinMoment'
import MiniTour from '../components/onboarding/MiniTour'
import PlanReveal from '../components/onboarding/PlanReveal'

type Step = 'who' | 'quiz' | 'win' | 'tour' | 'plan'
const STEP_ORDER: Step[] = ['who', 'quiz', 'win', 'tour', 'plan']

export default function Mulai() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [step, setStep] = useState<Step>('who')
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[]>(FALLBACK_GRADES)
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [quizCount, setQuizCount] = useState(0)
  const [childName, setChildName] = useState('')
  const [grade, setGrade] = useState<AgeGroupOption | null>(null)

  useEffect(() => {
    trackEvent('demo_started')
  }, [])

  useEffect(() => {
    let cancelled = false
    api
      .get('/public/meta')
      .then((response) => {
        if (cancelled) return
        const meta = response.data.data as PublicMeta
        if (meta.ageGroups?.length) setAgeGroups(meta.ageGroups)
        setSubjects(meta.subjects ?? [])
        setQuizCount(meta.stats?.featuredVideos ?? 0)
      })
      .catch(() => {
        // keep FALLBACK_GRADES; demo must run without the backend.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const questions = useMemo(
    () => getDemoQuestions(bandForAgeGroup(grade)),
    [grade],
  )

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  function handleWhoSubmit(name: string, group: AgeGroupOption) {
    setChildName(name)
    setGrade(group)
    trackEvent('demo_grade_selected', { gradeName: group.name })
    setStep('quiz')
  }

  function handleSignup() {
    const realId = grade && !grade.id.startsWith('fallback-') ? grade.id : null
    saveDemoSelections({ childName, ageGroupId: realId })
    trackEvent('demo_signup_click')
    navigate('/register')
  }

  function handleSkip() {
    trackEvent('demo_skipped')
    navigate('/')
  }

  const currentIndex = STEP_ORDER.indexOf(step)

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[420px] flex-col gap-6 px-4 py-8">
      <ProgressDots total={STEP_ORDER.length} current={currentIndex} />

      {step === 'who' && <WhoStep ageGroups={ageGroups} onSubmit={handleWhoSubmit} />}
      {step === 'quiz' && (
        <SampleQuiz questions={questions} onComplete={() => setStep('win')} />
      )}
      {step === 'win' && <WinMoment onContinue={() => setStep('tour')} />}
      {step === 'tour' && <MiniTour onContinue={() => setStep('plan')} />}
      {step === 'plan' && (
        <PlanReveal
          childName={childName}
          gradeName={grade?.name ?? 'Kelas anak'}
          subjects={subjects}
          quizCount={quizCount}
          onSignup={handleSignup}
          onSkip={handleSkip}
        />
      )}
    </div>
  )
}
