import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import BrandLogo from './BrandLogo'
import api from '../lib/api'
import { useAdminIdleLogout } from '../hooks/useIdleLogout'
import { useAuthStore } from '../store/authStore'
import type { Child } from '../types'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

export default function Layout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setChildren = useAuthStore((state) => state.setChildren)

  useAdminIdleLogout()

  useEffect(() => {
    if (!isAuthenticated) return

    void api
      .get('/me/children')
      .then((response) => {
        const children: Child[] = response.data.data.children ?? []
        setChildren(children)
      })
      .catch((error) => {
        console.error('Failed to load children:', error)
      })
  }, [isAuthenticated, setChildren])

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-qupu-cream text-qupu-ink">
      <ScrollToTop />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-4rem] h-72 w-72 rounded-full bg-qupu-orange/20 blur-3xl" />
        <div className="absolute right-[-4rem] top-28 h-72 w-72 rounded-full bg-qupu-brand-blue/20 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-64 w-64 rounded-full bg-qupu-peach/80 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-36 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}

function SiteFooter() {
  return (
    <footer data-app-footer className="relative mt-8 overflow-hidden bg-qupu-brand-blue text-white">
      {/* cloud top */}
      <svg
        className="absolute inset-x-0 top-0 h-12 w-full text-qupu-cream"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,0 Q150,50 300,20 T600,30 T900,20 T1200,25 L1200,0 Z" fill="currentColor" />
      </svg>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-10 pt-20 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12 lg:px-8">
        <div className="space-y-4">
          <BrandLogo />
          <p className="text-sm font-medium leading-relaxed text-white/80">
            Channel edukatif untuk anak-anak usia 5-12 tahun. Belajar seru, berpengetahuan, dan
            bermain bersama QUPU setiap hari!
          </p>
        </div>

        <FooterCol title="Navigasi">
          <FooterLink href="/">Beranda</FooterLink>
          <FooterLink href="/#tentang">Tentang</FooterLink>
          <FooterLink href="/#kategori">Kategori</FooterLink>
          <FooterLink href="/videos">Video</FooterLink>
          <FooterLink href="/#faq">FAQ</FooterLink>
          <FooterLink href="/#kontak">Kontak</FooterLink>
        </FooterCol>

        <FooterCol title="Ikuti Kami">
          <FooterSocial
            href="https://www.youtube.com/@qupuid"
            iconClass="fa-brands fa-youtube"
            label="YouTube"
          />
          <FooterSocial href="#" iconClass="fa-brands fa-instagram" label="Instagram" />
          <FooterSocial href="#" iconClass="fa-brands fa-tiktok" label="TikTok" />
          <FooterSocial href="#" iconClass="fa-brands fa-facebook" label="Facebook" />
        </FooterCol>

        <FooterCol title="Website">
          <FooterSocial
            href="https://www.qupu.id"
            iconClass="fa-solid fa-globe"
            label="www.qupu.id"
          />
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs font-medium text-white/70 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <span>© {new Date().getFullYear()} QUPU. Semua hak cipta dilindungi.</span>
          <span className="text-white/50">Dibuat dengan kasih untuk anak Indonesia.</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4 font-display text-base font-extrabold uppercase tracking-[0.18em] text-qupu-brand-yellow">
        {title}
      </div>
      <ul className="space-y-3 text-sm font-semibold text-white/85">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="cursor-pointer transition-colors hover:text-qupu-brand-orange"
      >
        {children}
      </a>
    </li>
  )
}

function FooterSocial({
  href,
  iconClass,
  label,
}: {
  href: string
  iconClass: string
  label: string
}) {
  const isExternal = href.startsWith('http')
  return (
    <li>
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel="noreferrer"
        className="group inline-flex cursor-pointer items-center gap-3 transition-colors hover:text-qupu-brand-orange"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-qupu-brand-orange transition-colors group-hover:border-qupu-brand-orange group-hover:bg-qupu-brand-orange group-hover:text-white">
          <i className={`${iconClass} text-sm`} aria-hidden="true" />
        </span>
        {label}
      </a>
    </li>
  )
}
