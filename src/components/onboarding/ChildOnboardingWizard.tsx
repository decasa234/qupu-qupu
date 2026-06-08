// src/components/onboarding/ChildOnboardingWizard.tsx
//
// Beautified, gated multi-step child-profile setup used on /onboard/child.
// Steps: name -> grade -> avatar (icon + color) -> daily goal. Each step gates
// the next (the primary button is disabled until the step is complete), and a
// live avatar preview builds as the parent goes. Creates the real child via
// POST /me/children and hands the result back through onCreated.
import { useEffect, useState } from 'react'
import api from '../../lib/api'
import {
  AVATAR_COLORS,
  AVATAR_OPTIONS,
  avatarIconClass,
  DEFAULT_AVATAR_COLOR,
  DEFAULT_AVATAR_SLUG,
} from '../../lib/avatars'
import type { AgeGroupOption, Child } from '../../types'
import ProgressDots from './ProgressDots'

interface ChildOnboardingWizardProps {
  onCreated: (child: Child) => void
}

type StepKey = 'name' | 'grade' | 'avatar' | 'goal'

const STEPS: { key: StepKey; eyebrow: string; title: string; subtitle: string }[] = [
  { key: 'name', eyebrow: 'Langkah 1 dari 4', title: 'Siapa nama anak?', subtitle: 'Nama ini muncul di dashboard dan koleksi badge anak.' },
  { key: 'grade', eyebrow: 'Langkah 2 dari 4', title: 'Anak kelas berapa?', subtitle: 'Kami sesuaikan soal dan video dengan kelasnya.' },
  { key: 'avatar', eyebrow: 'Langkah 3 dari 4', title: 'Pilih avatar', subtitle: 'Pilih hewan dan warna favorit anak.' },
  { key: 'goal', eyebrow: 'Langkah 4 dari 4', title: 'Target harian', subtitle: 'Berapa kuis per hari? Bisa diubah kapan saja.' },
]

const GOAL_OPTIONS = [1, 2, 3, 5, 7, 10]

export default function ChildOnboardingWizard({ onCreated }: ChildOnboardingWizardProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [name, setName] = useState('')
  const [ageGroupId, setAgeGroupId] = useState('')
  const [avatarColor, setAvatarColor] = useState(DEFAULT_AVATAR_COLOR)
  const [avatarIcon, setAvatarIcon] = useState(DEFAULT_AVATAR_SLUG)
  const [dailyGoal, setDailyGoal] = useState(3)
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void api
      .get('/public/meta')
      .then((response) => setAgeGroups(response.data.data.ageGroups ?? []))
      .catch(() => {
        /* grade step still renders; just no options to choose yet */
      })
  }, [])

  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1
  const canAdvance =
    step.key === 'name' ? name.trim().length > 0 : step.key === 'grade' ? Boolean(ageGroupId) : true

  function handleNext() {
    if (!canAdvance) return
    if (!isLast) {
      setStepIndex((i) => i + 1)
      return
    }
    void submit()
  }

  async function submit() {
    setSaving(true)
    setError('')
    try {
      const response = await api.post('/me/children', {
        name: name.trim(),
        ageGroupId: ageGroupId || null,
        avatarColor,
        avatarIcon,
        dailyGoalQuizzes: dailyGoal,
      })
      onCreated(response.data.data.child as Child)
    } catch (submitError: unknown) {
      const message =
        typeof submitError === 'object' &&
        submitError !== null &&
        'response' in submitError &&
        typeof (submitError as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (submitError as { response: { data: { error: string } } }).response.data.error
          : 'Gagal menyimpan profil anak.'
      setError(message)
      setSaving(false)
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <img
        src="/hero-mascot.png"
        alt=""
        draggable={false}
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-12 z-10 h-28 w-auto select-none drop-shadow-[0_10px_24px_rgba(120,60,0,0.25)] sm:-right-6 sm:-top-14 sm:h-32"
      />
      <i className="fa-solid fa-star pointer-events-none absolute -left-4 top-8 text-2xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute right-12 -top-3 text-base text-qupu-brand-yellow/80" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute -left-2 bottom-16 text-sm text-qupu-brand-yellow/70" aria-hidden="true" />

      <div className="relative rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-7 shadow-[6px_8px_0_0_#FFD3B1] sm:p-9">
        <ProgressDots total={STEPS.length} current={stepIndex} />

        <div className="mt-5 flex items-center gap-4">
          <AvatarPreview color={avatarColor} icon={avatarIcon} />
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
              {step.eyebrow}
            </div>
            <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight text-qupu-brand-blue">
              {step.title}
            </h1>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">{step.subtitle}</p>

        <div className="mt-6">
          {step.key === 'name' && (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">Nama anak</span>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleNext()}
                placeholder="Contoh: Aira"
                maxLength={80}
                className="mt-2 w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-5 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
              />
            </label>
          )}

          {step.key === 'grade' && (
            <div className="grid grid-cols-1 gap-2">
              {ageGroups.length === 0 && (
                <p className="text-sm font-semibold text-qupu-muted">Memuat pilihan kelas…</p>
              )}
              {ageGroups.map((group) => {
                const active = ageGroupId === group.id
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setAgeGroupId(group.id)}
                    aria-pressed={active}
                    className={`flex items-center justify-between rounded-[1.25rem] border-2 px-5 py-3 text-left font-display text-base font-extrabold transition-colors ${
                      active
                        ? 'border-qupu-brand-blue bg-qupu-brand-blue text-white shadow-subscribe'
                        : 'border-qupu-peach bg-qupu-shell text-qupu-brand-blue hover:border-qupu-brand-blue'
                    }`}
                  >
                    {group.name}
                    {active && <i className="fa-solid fa-circle-check" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          )}

          {step.key === 'avatar' && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">Warna</span>
                <div className="mt-2 flex flex-wrap gap-3">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Warna ${color}`}
                      onClick={() => setAvatarColor(color)}
                      className={`h-10 w-10 cursor-pointer rounded-full border-[3px] transition-transform hover:scale-110 ${
                        avatarColor === color ? 'border-qupu-brand-blue' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">Hewan</span>
                <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-7">
                  {AVATAR_OPTIONS.map((option) => {
                    const active = avatarIcon === option.slug
                    return (
                      <button
                        key={option.slug}
                        type="button"
                        aria-label={option.label}
                        aria-pressed={active}
                        onClick={() => setAvatarIcon(option.slug)}
                        className={`flex aspect-square items-center justify-center rounded-[1.25rem] border-2 text-lg transition-colors ${
                          active
                            ? 'border-qupu-brand-blue bg-qupu-sky/50 text-qupu-brand-blue'
                            : 'border-qupu-peach bg-qupu-shell text-qupu-muted hover:border-qupu-brand-blue'
                        }`}
                      >
                        <i className={option.icon} aria-hidden="true" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step.key === 'goal' && (
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={dailyGoal === value}
                  onClick={() => setDailyGoal(value)}
                  className={`min-w-[3.25rem] rounded-full px-4 py-2.5 font-display text-sm font-extrabold transition-colors ${
                    dailyGoal === value
                      ? 'bg-qupu-brand-blue text-white shadow-subscribe'
                      : 'bg-qupu-shell text-qupu-brand-blue/70 hover:text-qupu-brand-blue'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="mt-7 flex items-center justify-between gap-3">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i - 1)}
              disabled={saving}
              className="font-display text-sm font-bold text-qupu-muted hover:text-qupu-brand-orange disabled:opacity-50"
            >
              <i className="fa-solid fa-arrow-left mr-1.5" aria-hidden="true" />
              Kembali
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance || saving}
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-qupu-brand-orange px-7 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLast ? (saving ? 'Menyimpan…' : 'Buat profil & mulai') : 'Lanjut'}
            {!saving && <i className={`fa-solid ${isLast ? 'fa-rocket' : 'fa-arrow-right'}`} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function AvatarPreview({ color, icon }: { color: string; icon: string }) {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-[0_4px_0_0_rgba(0,0,0,0.12)]"
      style={{ backgroundColor: color }}
    >
      <i className={`${avatarIconClass(icon)} text-2xl text-white`} aria-hidden="true" />
    </div>
  )
}
