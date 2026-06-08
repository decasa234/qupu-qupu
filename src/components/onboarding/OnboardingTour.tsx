// src/components/onboarding/OnboardingTour.tsx
//
// Global driver for the post-signup spotlight tour. Mounted once inside the
// member AppShell. It runs react-joyride over the REAL pages:
//   stage 'wmi'   -> spotlights on /latihan/wmi/drill
//   stage 'video' -> spotlights on /quiz/:slug
// It also gates navigation: while a stage is active the user is kept on that
// stage's page (can't jump ahead to the dashboard until the tour finishes).
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Joyride, { type CallBackProps, type Step, STATUS } from 'react-joyride'
import api from '../../lib/api'
import { useTourStore } from '../../store/tourStore'

const WMI_ROUTE = '/latihan/wmi/drill'

const WMI_STEPS: Step[] = [
  {
    target: '[data-tour="wmi-question"]',
    title: 'Soal WMI',
    content: 'Ini soal latihan matematika WMI. Kata bergaris bawah bisa ditap untuk lihat artinya.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="wmi-language"]',
    title: 'Ganti bahasa',
    content: 'Tap tombol bola dunia untuk membaca soal dalam Bahasa Inggris atau Indonesia.',
    placement: 'left',
  },
  {
    target: '[data-tour="wmi-choices"]',
    title: 'Jawab soal',
    content: 'Pilih jawabanmu di sini. Jawaban benar dapat XP & badge; kalau salah, ada petunjuk.',
    placement: 'top',
  },
]

const VIDEO_STEPS: Step[] = [
  {
    target: '[data-tour="video-embed"]',
    title: 'Tonton video',
    content: 'Tonton video pembelajaran sampai selesai bersama anak.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="video-badges"]',
    title: 'Badge per video',
    content: 'Tiap video punya badge. Makin tinggi skornya, makin banyak badge yang didapat.',
    placement: 'top',
  },
  {
    target: '[data-tour="video-score"]',
    title: 'Isi skor',
    content: 'Setelah nonton, isi berapa soal yang dijawab benar untuk mengumpulkan badge.',
    placement: 'top',
  },
]

const JOYRIDE_STYLES = {
  options: {
    primaryColor: '#f0853a',
    textColor: '#1E3A8A',
    arrowColor: '#ffffff',
    backgroundColor: '#ffffff',
    zIndex: 10000,
  },
} as const

const JOYRIDE_LOCALE_WMI = { back: 'Kembali', next: 'Lanjut', last: 'Ke Video', skip: 'Lewati' }
const JOYRIDE_LOCALE_VIDEO = { back: 'Kembali', next: 'Lanjut', last: 'Selesai', skip: 'Lewati' }

// Pages load their content async, so wait for the first target to exist before
// letting Joyride run. Gives up after ~8s so a broken page can't trap the user.
function useTargetReady(selector: string, active: boolean): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!active) {
      setReady(false)
      return
    }
    if (document.querySelector(selector)) {
      setReady(true)
      return
    }
    let tries = 0
    const id = window.setInterval(() => {
      tries += 1
      if (document.querySelector(selector)) {
        setReady(true)
        window.clearInterval(id)
      } else if (tries > 40) {
        window.clearInterval(id)
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [selector, active])
  return ready
}

async function fetchFirstVideoSlug(): Promise<string | null> {
  try {
    const featured = await api.get('/public/videos', { params: { featured: 'true' } })
    const featuredVideos = featured.data?.data?.videos ?? []
    if (featuredVideos[0]?.slug) return featuredVideos[0].slug as string
  } catch {
    /* fall through to the general list */
  }
  try {
    const res = await api.get('/public/videos', { params: { page: 1 } })
    const videos = res.data?.data?.videos ?? []
    return (videos[0]?.slug as string) ?? null
  } catch {
    return null
  }
}

export default function OnboardingTour() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const stage = useTourStore((state) => state.stage)
  const videoSlug = useTourStore((state) => state.videoSlug)
  const goToVideo = useTourStore((state) => state.goToVideo)
  const finishTour = useTourStore((state) => state.finishTour)

  const onWmiStage = stage === 'wmi'
  const onVideoStage = stage === 'video'
  const onWmiRoute = pathname === WMI_ROUTE
  const onVideoRoute = pathname.startsWith('/quiz/')

  const wmiReady = useTargetReady('[data-tour="wmi-question"]', onWmiStage && onWmiRoute)
  const videoReady = useTargetReady('[data-tour="video-embed"]', onVideoStage && onVideoRoute)

  // Gating: keep the user on the active stage's page until the tour advances.
  useEffect(() => {
    if (onWmiStage && !onWmiRoute) {
      navigate(WMI_ROUTE, { replace: true })
    } else if (onVideoStage && videoSlug && !onVideoRoute) {
      navigate(`/quiz/${videoSlug}`, { replace: true })
    }
  }, [onWmiStage, onVideoStage, onWmiRoute, onVideoRoute, videoSlug, navigate])

  const handleWmiCallback = useCallback(
    async (data: CallBackProps) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        const slug = await fetchFirstVideoSlug()
        if (slug) {
          goToVideo(slug)
          navigate(`/quiz/${slug}`)
        } else {
          finishTour()
          navigate('/dashboard')
        }
      }
    },
    [goToVideo, finishTour, navigate],
  )

  const handleVideoCallback = useCallback(
    (data: CallBackProps) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        finishTour()
        navigate('/dashboard')
      }
    },
    [finishTour, navigate],
  )

  if (onWmiStage && onWmiRoute) {
    return (
      <Joyride
        steps={WMI_STEPS}
        run={wmiReady}
        continuous
        showProgress
        disableOverlayClose
        hideCloseButton
        spotlightPadding={6}
        callback={handleWmiCallback}
        styles={JOYRIDE_STYLES}
        locale={JOYRIDE_LOCALE_WMI}
      />
    )
  }

  if (onVideoStage && onVideoRoute) {
    return (
      <Joyride
        steps={VIDEO_STEPS}
        run={videoReady}
        continuous
        showProgress
        disableOverlayClose
        hideCloseButton
        spotlightPadding={6}
        callback={handleVideoCallback}
        styles={JOYRIDE_STYLES}
        locale={JOYRIDE_LOCALE_VIDEO}
      />
    )
  }

  return null
}
