'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'

export default function FavoritesPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
        {t('nav.favorites')}
      </h1>

      <div className="card text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <h2 className="text-xl font-semibold mb-2">Noch keine Favoriten</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Speichere Stellplätze, die dir gefallen, um sie später schnell wiederzufinden.
        </p>
        <button
          onClick={() => router.push('/spots')}
          className="btn-primary"
        >
          Stellplätze entdecken
        </button>
      </div>
    </div>
  )
}


