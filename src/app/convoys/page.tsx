'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useStore, Convoy } from '@/lib/store'

// Konvoi Card Komponente
function ConvoyCard({ convoy, index }: { convoy: Convoy; index: number }) {
  const { t } = useTranslation()
  const user = useStore((state) => state.user)
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const spotsLeft = convoy.maxParticipants 
    ? convoy.maxParticipants - convoy.participants.length 
    : null

  const isParticipant = convoy.participants.some((p) => p.id === user?.id)

  return (
    <Link href={`/convoys/${convoy.id}`}>
      <div 
        className="card-hover h-full animate-fade-in-up opacity-0"
        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
      >
        {/* Header mit Gradient */}
        <div className="h-36 bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600 rounded-xl mb-4 relative overflow-hidden group">
          {/* Dekorative Elemente */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-2 text-4xl">🏔️</div>
            <div className="absolute bottom-2 left-2 text-3xl">🌲</div>
          </div>
          
          {/* Zentrales Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl group-hover:scale-125 transition-transform duration-500 drop-shadow-lg">
              🚐
            </span>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`badge ${
              convoy.status === 'planned' ? 'badge-warning' :
              convoy.status === 'active' ? 'badge-success' :
              'badge-info'
            }`}>
              {t(`convoy.status.${convoy.status}`)}
            </span>
          </div>

          {/* Teilnehmer-Avatare */}
          <div className="absolute bottom-3 right-3 flex -space-x-2">
            {convoy.participants.slice(0, 4).map((p, i) => (
              <div 
                key={p.id}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow-lg border-2 border-white"
                style={{ zIndex: 4 - i }}
              >
                {p.avatar || p.name.charAt(0)}
              </div>
            ))}
            {convoy.participants.length > 4 && (
              <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
                +{convoy.participants.length - 4}
              </div>
            )}
          </div>

          {/* Participant Badge */}
          {isParticipant && (
            <div className="absolute top-3 right-3">
              <span className="badge badge-success">
                ✓ Dabei
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="font-bold text-xl text-slate-800 dark:text-white line-clamp-1 group-hover:text-teal-600 transition-colors">
            {convoy.title}
          </h3>
          
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
            {convoy.description}
          </p>

          {/* Route */}
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="text-teal-500">📍</span>
              {convoy.startLocation.name}
            </span>
            <span className="mx-2 text-slate-300">→</span>
            <span className="flex items-center gap-1">
              <span className="text-rose-500">🎯</span>
              {convoy.destination.name}
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              📅 {formatDate(convoy.startDate)}
            </span>
            <span className="flex items-center gap-1">
              👥 {convoy.participants.length}{convoy.maxParticipants ? `/${convoy.maxParticipants}` : ''}
            </span>
          </div>

          {/* Tags */}
          {convoy.tags && convoy.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {convoy.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              von <span className="font-medium text-slate-700 dark:text-slate-300">{convoy.organizerName}</span>
            </span>
            
            {spotsLeft !== null && spotsLeft > 0 ? (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {spotsLeft} {spotsLeft === 1 ? 'Platz' : 'Plätze'} frei
              </span>
            ) : spotsLeft === 0 ? (
              <span className="badge badge-danger">Ausgebucht</span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ConvoysPage() {
  const { t } = useTranslation()
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const convoys = useStore((state) => state.convoys)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'planned' | 'active'>('all')

  const filteredConvoys = convoys.filter((convoy) => {
    const matchesSearch = 
      convoy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convoy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convoy.startLocation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convoy.destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convoy.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filter === 'all' || convoy.status === filter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-3">
              <span className="gradient-text">Konvois</span> entdecken
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
              {t('convoy.subtitle')}
            </p>
          </div>
          
          {isAuthenticated ? (
            <Link 
              href="/convoys/new" 
              className="btn-primary inline-flex items-center gap-2 animate-fade-in-up animate-delay-100"
            >
              <span className="text-lg">➕</span>
              <span>{t('convoy.create')}</span>
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="btn-outline inline-flex items-center gap-2 animate-fade-in-up animate-delay-100"
            >
              <span>🔑</span>
              <span>{t('convoy.loginToCreate')}</span>
            </Link>
          )}
        </div>

        {/* Filter & Suche */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in-up animate-delay-200">
          {/* Suchfeld */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder={t('common.search') + '...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {(['all', 'planned', 'active'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  filter === f
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {f === 'all' && '🌍 '}
                {f === 'planned' && '📅 '}
                {f === 'active' && '🚀 '}
                {t(`convoy.filter.${f}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Konvoi-Grid */}
        {filteredConvoys.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConvoys.map((convoy, index) => (
              <ConvoyCard key={convoy.id} convoy={convoy} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="card max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {t('convoy.noResults')}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm ? t('convoy.noSearchResults') : t('convoy.noConvoys')}
              </p>
              {isAuthenticated && (
                <Link href="/convoys/new" className="btn-primary">
                  {t('convoy.createFirst')}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Stats Footer */}
        {filteredConvoys.length > 0 && (
          <div className="mt-12 text-center text-slate-500 animate-fade-in-up">
            <p>
              {filteredConvoys.length} {filteredConvoys.length === 1 ? 'Konvoi' : 'Konvois'} gefunden
              {searchTerm && ` für "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


