'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/lib/store'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Navbar() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const user = useStore((state) => state.user)
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const logout = useStore((state) => state.logout)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Scroll Detection für Navbar-Schatten
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navLinkClass = (path: string) => `
    relative py-2 px-1 font-medium transition-colors duration-200
    ${isActive(path) 
      ? 'text-teal-600 dark:text-teal-400' 
      : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
    }
    after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 
    after:bg-teal-500 after:transform after:origin-left
    after:transition-transform after:duration-300
    ${isActive(path) ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}
  `

  return (
    <nav className={`
      sticky top-0 z-50 transition-all duration-300
      ${scrolled 
        ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-lg' 
        : 'bg-white dark:bg-slate-900'
      }
    `}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🚐</span>
            <span className="text-xl font-bold gradient-text">CamperConvoy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={navLinkClass('/')}>
              {t('nav.home')}
            </Link>
            <Link href="/convoys" className={navLinkClass('/convoys')}>
              {t('nav.convoys')}
            </Link>
            <Link href="/map" className={navLinkClass('/map')}>
              {t('nav.map')}
            </Link>
            {isAuthenticated && (
              <Link href="/favorites" className={navLinkClass('/favorites')}>
                {t('nav.favorites')}
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/convoys/new" 
                  className="btn-primary text-sm py-2"
                >
                  ➕ Neuer Konvoi
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                  <span className="w-7 h-7 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center text-sm">
                    {user.avatar || user.name.charAt(0)}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>
                <button 
                  onClick={logout}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-2"
                  title={t('nav.logout')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-slate-600 dark:bg-slate-300 rounded transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-full h-0.5 bg-slate-600 dark:bg-slate-300 rounded transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-full h-0.5 bg-slate-600 dark:bg-slate-300 rounded transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="py-4 space-y-2 border-t border-slate-200 dark:border-slate-700">
            <Link 
              href="/" 
              className={`block px-4 py-3 rounded-xl transition-colors ${
                isActive('/') 
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🏠 {t('nav.home')}
            </Link>
            <Link 
              href="/convoys" 
              className={`block px-4 py-3 rounded-xl transition-colors ${
                isActive('/convoys') 
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🚐 {t('nav.convoys')}
            </Link>
            <Link 
              href="/map" 
              className={`block px-4 py-3 rounded-xl transition-colors ${
                isActive('/map') 
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🗺️ {t('nav.map')}
            </Link>
            {isAuthenticated && (
              <Link 
                href="/favorites" 
                className={`block px-4 py-3 rounded-xl transition-colors ${
                  isActive('/favorites') 
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                ❤️ {t('nav.favorites')}
              </Link>
            )}
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>
            </div>
            
            <div className="pt-2 px-4 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                      {user.avatar || user.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link 
                    href="/convoys/new"
                    className="btn-primary w-full text-center block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ➕ Neuen Konvoi erstellen
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="btn-secondary w-full"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="btn-primary w-full text-center block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link 
                    href="/register" 
                    className="btn-outline w-full text-center block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}


