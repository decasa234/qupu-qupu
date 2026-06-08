// src/components/onboarding/ChildOnboardingWizard.tsx
//
// Beautified, gated multi-step child-profile setup used on /onboard/child.
// Steps: name -> grade -> avatar -> daily goal. Each step gates the next (the
// primary button is disabled until the step is complete), and a live avatar
// preview builds as the parent goes. Grade is asked as TK / SD (Kelas 1-6) and
// mapped to the nearest age group for storage. Creates the real child via
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
import Slider from '../Slider'

interface ChildOnboardingWizardProps {
  onCreated: (child: Child) => void
}

type StepKey = 'name' | 'grade' | 'avatar' | 'goal'

const STEPS: { key: StepKey; eyebrow: string; title: string; subtitle: string }[] = [
  { key: 'name', eyebrow: 'Langkah 1 dari 4', title: 'Siapa nama anak?', subtitle: 'Nama ini muncul di dashboard dan koleksi badge anak.' },
  { key: 'grade', eyebrow: 'Langkah 2 dari 4', title: 'Anak kelas berapa?', subtitle: 'Kami sesuaikan soal dan video dengan kelasnya.' },
  { key: 'avatar', eyebrow: 'Langkah 3 dari 4', title: 'Pilih avatar', subtitle: '' },
  { key: 'goal', eyebrow: 'Langkah 4 dari 4', title: 'Target harian', subtitle: 'Berapa kuis per hari? Bisa diubah kapan saja.' },
]

// TK + SD (Kelas 1-6). `age` is a representative age used to map onto the
// backend's age_groups (the child profile stores age_group_id, not a grade).
const GRADE_OPTIONS = [
  { key: 'tk', label: 'TK', age: 5 },
  { key: 'sd1', label: 'Kelas 1', age: 6 },
  { key: 'sd2', label: 'Kelas 2', age: 7 },
  { key: 'sd3', label: 'Kelas 3', age: 8 },
  { key: 'sd4', label: 'Kelas 4', age: 9 },
  { key: 'sd5', label: 'Kelas 5', age: 10 },
  { key: 'sd6', label: 'Kelas 6', age: 11 },
]

export default function ChildOnboardingWizard({ onCreated }: ChildOnboardingWizardProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [name, setName] = useState('')
  const [gradeTrack, setGradeTrack] = useState<'' | 'tk' | 'sd'>('')
  const [gradeKey, setGradeKey] = useState('')
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
        /* grade still selectable; we map to an age group only if available */
      })
  }, [])

  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1
  const canAdvance =
    step.key === 'name' ? name.trim().length > 0 : step.key === 'grade' ? gradeKey !== '' : true

  function handleNext() {
    if (!canAdvance) return
    if (!isLast) {
      setStepIndex((i) => i + 1)
      return
    }
    void submit()
  }

  // Map the chosen grade to the nearest age group (by representative age). The
  // child profile stores age_group_id, so a non-UUID grade can't be sent.
  function resolveAgeGroupId(): string | null {
    const grade = GRADE_OPTIONS.find((g) => g.key === gradeKey)
    if (!grade) return null
    const match = ageGroups.find((g) => grade.age >= g.minAge && grade.age <= g.maxAge)
    return match?.id ?? null
  }

  async function submit() {
    setSaving(true)
    setError('')
    try {
      const response = await api.post('/me/children', {
        name: name.trim(),
        ageGroupId: resolveAgeGroupId(),
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
      <div className="relative rounded-[2.5rem] bg-white p-7 shadow-[10px_12px_0_0_#C46123] sm:p-9">
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
        {step.subtitle && <p className="mt-3 text-sm font-semibold text-qupu-muted">{step.subtitle}</p>}

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
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <GradeButton
                  active={gradeTrack === 'tk'}
                  label="TK"
                  onClick={() => {
                    setGradeTrack('tk')
                    setGradeKey('tk')
                  }}
                />
                <GradeButton
                  active={gradeTrack === 'sd'}
                  label="SD"
                  hint="Kelas 1–6"
                  onClick={() => {
                    setGradeTrack('sd')
                    setGradeKey('')
                  }}
                />
              </div>

              {gradeTrack === 'sd' && (
                <div className="grid grid-cols-3 gap-2">
                  {GRADE_OPTIONS.filter((g) => g.key !== 'tk').map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      aria-pressed={gradeKey === g.key}
                      onClick={() => setGradeKey(g.key)}
                      className={`rounded-[1.25rem] border-2 px-2 py-2.5 font-display text-sm font-extrabold transition-colors ${
                        gradeKey === g.key
                          ? 'border-qupu-brand-blue bg-qupu-brand-blue text-white shadow-subscribe'
                          : 'border-qupu-peach bg-qupu-shell text-qupu-brand-blue hover:border-qupu-brand-blue'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step.key === 'avatar' && (
            <div className="space-y-5">
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
            </div>
          )}

          {step.key === 'goal' && (
            <div className="pt-1">
              <Slider
                value={dailyGoal}
                min={1}
                max={10}
                step={1}
                onChange={setDailyGoal}
                ariaLabel="Target kuis harian"
              />
              <div className="mt-1 flex justify-between px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-qupu-muted">
                <span>Santai</span>
                <span>Giat</span>
              </div>
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

function GradeButton({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean
  label: string
  hint?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-[1.25rem] border-2 px-4 py-4 font-display font-extrabold transition-colors ${
        active
          ? 'border-qupu-brand-blue bg-qupu-brand-blue text-white shadow-subscribe'
          : 'border-qupu-peach bg-qupu-shell text-qupu-brand-blue hover:border-qupu-brand-blue'
      }`}
    >
      <span className="text-lg">{label}</span>
      {hint && (
        <span className={`text-[11px] font-bold ${active ? 'text-white/80' : 'text-qupu-muted'}`}>{hint}</span>
      )}
    </button>
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
