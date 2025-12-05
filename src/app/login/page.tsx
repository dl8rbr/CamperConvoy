'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/lib/store'

export default function LoginPage() {
  const { t } = useTranslation()
  const login = useStore((state) => state.login)
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const success = await login(email, password)

    if (success) {
      router.push('/')
    } else {
      setError(t('auth.loginError'))
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce-subtle">🚐</div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
            Willkommen zurück!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Melde dich an, um Konvois zu erstellen und beizutreten.
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="deine@email.de"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Anmelden...
                </span>
              ) : (
                t('auth.loginButton')
              )}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
            <p className="text-sm text-teal-700 dark:text-teal-300 font-medium mb-2">
              🎮 Demo-Zugang:
            </p>
            <p className="text-sm text-teal-600 dark:text-teal-400">
              E-Mail: <code className="bg-teal-100 dark:bg-teal-900 px-1.5 py-0.5 rounded">beliebig</code>
            </p>
            <p className="text-sm text-teal-600 dark:text-teal-400">
              Passwort: <code className="bg-teal-100 dark:bg-teal-900 px-1.5 py-0.5 rounded">demo</code> oder <code className="bg-teal-100 dark:bg-teal-900 px-1.5 py-0.5 rounded">password</code>
            </p>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              {t('auth.noAccount')}{' '}
              <Link href="/register" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                {t('auth.registerButton')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


