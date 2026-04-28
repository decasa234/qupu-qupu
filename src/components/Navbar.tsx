import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Menu, Shield, Trophy, X } from 'lucide-react'
import BrandLogo from './BrandLogo'
import ChildSwitcher from './ChildSwitcher'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'

const SCROLL_SPY_IDS = ['beranda', 'kategori']

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/') {
      setActive(null)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    )

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [ids, pathname])

  return active
}

type NavItem = {
  label: string
  to: string
}

const NAV_ITEMS_PARENT: NavItem[] = [
  { label: 'Beranda', to: '/' },
  { label: 'Kategori', to: '/#kategori' },
  { label: 'Video', to: '/videos' },
]

const NAV_ITEMS_ADMIN: NavItem[] = [
  { label: 'Beranda', to: '/' },
  { label: 'Video', to: '/videos' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const navItems = isAdmin ? NAV_ITEMS_ADMIN : NAV_ITEMS_PARENT
  const activeSection = useScrollSpy(SCROLL_SPY_IDS)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header data-app-nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border-2 border-qupu-peach bg-qupu-cream/95 px-4 backdrop-blur-md sm:px-6">
        <Link to="/" aria-label="Beranda QUPU" className="shrink-0 cursor-pointer !p-0">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavItemLink key={item.to} item={item} activeSection={activeSection} />
          ))}
          {isAuthenticated && !isAdmin && (
            <NavItemLink
              item={{ label: 'Dashboard', to: '/dashboard' }}
              activeSection={activeSection}
            />
          )}
          {isAuthenticated && !isAdmin && (
            <NavItemLink
              item={{ label: 'Badge', to: '/badges' }}
              activeSection={activeSection}
            />
          )}
          {isAdmin && (
            <NavItemLink
              item={{ label: 'Admin', to: '/admin/dashboard' }}
              activeSection={activeSection}
            />
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated && !isAdmin && <ChildSwitcher />}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-full px-3 py-2 font-display text-base font-bold text-qupu-muted transition-colors hover:text-qupu-brand-orange"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="cursor-pointer rounded-full px-3 py-2 font-display text-base font-bold text-qupu-muted transition-colors hover:text-qupu-brand-orange"
            >
              Login
            </Link>
          )}
          <a
            href="https://www.youtube.com/@qupuid?sub_confirmation=1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-2.5 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white">
              <i className="fa-brands fa-youtube text-base text-red-600" aria-hidden="true" />
            </span>
            Subscribe YouTube
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex cursor-pointer rounded-full bg-white p-3 text-qupu-brand-blue shadow-soft lg:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-3 max-w-7xl rounded-[2rem] border-2 border-qupu-peach bg-white px-5 py-5 shadow-clay lg:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <MobileLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </MobileLink>
            ))}
            {isAuthenticated && !isAdmin && (
              <MobileLink icon={LayoutDashboard} to="/dashboard" onClick={() => setOpen(false)}>
                Dashboard
              </MobileLink>
            )}
            {isAuthenticated && !isAdmin && (
              <MobileLink icon={Trophy} to="/badges" onClick={() => setOpen(false)}>
                Badge
              </MobileLink>
            )}
            {isAdmin && (
              <MobileLink icon={Shield} to="/admin/dashboard" onClick={() => setOpen(false)}>
                Admin
              </MobileLink>
            )}
          </div>

          {isAuthenticated && !isAdmin && (
            <div className="mt-5 border-t border-qupu-peach pt-4">
              <ChildSwitcher />
            </div>
          )}

          <div className="mt-5 grid gap-3 border-t border-qupu-peach pt-5">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  handleLogout()
                }}
                className="w-full cursor-pointer rounded-2xl bg-qupu-brand-blue px-5 py-3 font-display text-sm font-extrabold text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="w-full cursor-pointer rounded-2xl border-2 border-qupu-brand-blue px-5 py-3 text-center font-display text-sm font-bold text-qupu-brand-blue"
              >
                Login
              </Link>
            )}
            <a
              href="https://www.youtube.com/@qupuid?sub_confirmation=1"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-3 font-display text-sm font-extrabold text-white shadow-subscribe"
            > 
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white">
                <i className="fa-brands fa-youtube text-sm text-red-600" aria-hidden="true" />
              </span>
              Subscribe YouTube
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

function NavItemLink({
  item,
  activeSection,
}: {
  item: NavItem
  activeSection: string | null
}) {
  const location = useLocation()
  const isHash = item.to.includes('#')
  const activeClass =
    'text-qupu-brand-orange underline decoration-qupu-brand-orange decoration-[3px] underline-offset-[10px]'
  const idleClass = 'text-qupu-muted hover:text-qupu-brand-orange'

  if (isHash) {
    const sectionId = item.to.split('#')[1]
    const isActive = location.pathname === '/' && activeSection === sectionId

    return (
      <a
        href={item.to}
        className={cn(
          'cursor-pointer rounded-full px-4 py-2 font-display text-base font-bold transition-colors',
          isActive ? activeClass : idleClass,
        )}
      >
        {item.label}
      </a>
    )
  }

  const onHomeWithoutHash =
    item.to === '/' && location.pathname === '/' && !location.hash
  const homeIsActive =
    item.to === '/' && (activeSection === 'beranda' || (onHomeWithoutHash && !activeSection))

  const isActive =
    item.to === '/'
      ? homeIsActive
      : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

  const handleClick =
    item.to === '/' && location.pathname === '/'
      ? (event: React.MouseEvent<HTMLAnchorElement>) => {
          event.preventDefault()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      : undefined

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={handleClick}
      className={cn(
        'cursor-pointer rounded-full px-4 py-2 font-display text-base font-bold transition-colors',
        isActive ? activeClass : idleClass,
      )}
    >
      {item.label}
    </NavLink>
  )
}

function MobileLink({
  to,
  children,
  onClick,
  icon: Icon,
}: {
  to: string
  children: string
  onClick: () => void
  icon?: typeof Shield
}) {
  const isHash = to.includes('#')
  const classes =
    'flex cursor-pointer items-center gap-3 rounded-2xl bg-qupu-cream px-4 py-3 font-display font-bold text-qupu-brand-blue'

  if (isHash) {
    return (
      <a href={to} onClick={onClick} className={classes}>
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </a>
    )
  }

  return (
    <Link to={to} onClick={onClick} className={classes}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  )
}
