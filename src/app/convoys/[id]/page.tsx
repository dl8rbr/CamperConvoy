'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'
import { useStore, Convoy } from '@/lib/store'
import Chat from '@/components/Chat'

// Dynamischer Import der Karte
const ConvoyRouteMap = dynamic(() => import('@/components/ConvoyRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[50vh] min-h-[300px] bg-slate-200 dark:bg-slate-700 rounded-2xl animate-shimmer flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-bounce-subtle">🗺️</div>
        <p className="text-slate-500">Karte wird geladen...</p>
      </div>
    </div>
  ),
})

export default function ConvoyDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  
  // Zustand Store
  const user = useStore((state) => state.user)
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const getConvoy = useStore((state) => state.getConvoy)
  const joinConvoy = useStore((state) => state.joinConvoy)
  const leaveConvoy = useStore((state) => state.leaveConvoy)
  const storeIsParticipant = useStore((state) => state.isParticipant)

  const [convoy, setConvoy] = useState<Convoy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info')

  const convoyId = params.id as string

  // Konvoi laden und bei Store-Änderungen aktualisieren
  useEffect(() => {
    const loadConvoy = () => {
      const found = getConvoy(convoyId)
      setConvoy(found || null)
      setIsLoading(false)
    }
    loadConvoy()
  }, [convoyId, getConvoy])

  // Re-subscribe bei Store-Änderungen
  useEffect(() => {
    const unsubscribe = useStore.subscribe(() => {
      const updated = getConvoy(convoyId)
      setConvoy(updated || null)
    })
    return unsubscribe
  }, [convoyId, getConvoy])

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    setIsJoining(true)
    joinConvoy(convoyId)
    setIsJoining(false)
  }

  const handleLeave = async () => {
    setIsLeaving(true)
    leaveConvoy(convoyId)
    setIsLeaving(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-shimmer" />
          <div className="h-12 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-xl animate-shimmer" />
          <div className="h-[50vh] bg-slate-200 dark:bg-slate-700 rounded-2xl animate-shimmer" />
        </div>
      </div>
    )
  }

  // Not Found
  if (!convoy) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="text-8xl mb-6 animate-bounce-subtle">🔍</div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
            {t('convoy.notFound')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {t('convoy.notFoundDescription')}
          </p>
          <Link href="/convoys" className="btn-primary">
            {t('convoy.backToList')}
          </Link>
        </div>
      </div>
    )
  }

  const userIsParticipant = storeIsParticipant(convoyId)
  const userIsOrganizer = user?.id === convoy.organizerId
  const spotsLeft = convoy.maxParticipants
    ? convoy.maxParticipants - convoy.participants.length
    : null
  const isFull = spotsLeft !== null && spotsLeft <= 0

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link 
            href="/convoys" 
            className="inline-flex items-center gap-2 text-teal-100 hover:text-white transition-colors mb-6"
          >
            <span>←</span>
            <span>{t('convoy.backToList')}</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-3">
                <span className={`badge ${
                  convoy.status === 'planned' ? 'bg-amber-400 text-amber-900' :
                  convoy.status === 'active' ? 'bg-emerald-400 text-emerald-900' :
                  'bg-slate-400 text-slate-900'
                }`}>
                  {t(`convoy.status.${convoy.status}`)}
                </span>
                {userIsParticipant && (
                  <span className="badge bg-white/20 text-white">
                    ✓ Du bist dabei
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                {convoy.title}
              </h1>
              
              <p className="text-teal-100 flex items-center gap-2">
                <span>👤</span>
                {t('convoy.organizedBy')} <span className="font-semibold text-white">{convoy.organizerName}</span>
              </p>
            </div>

            {/* Action Button */}
            <div className="animate-fade-in-up animate-delay-100">
              {userIsParticipant ? (
                userIsOrganizer ? (
                  <button className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold cursor-default">
                    ✓ {t('convoy.youAreOrganizer')}
                  </button>
                ) : (
                  <button
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className="bg-white text-rose-600 hover:bg-rose-50 px-6 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-lg"
                  >
                    {isLeaving ? '...' : t('convoy.leave')}
                  </button>
                )
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={isJoining || isFull}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                    isFull 
                      ? 'bg-white/50 text-white cursor-not-allowed' 
                      : 'bg-white text-teal-600 hover:bg-teal-50 hover:-translate-y-0.5'
                  }`}
                >
                  {isJoining ? '...' : isFull ? t('convoy.full') : `🚐 ${t('convoy.join')}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6">
        {/* Karte */}
        <div className="mb-8 animate-scale-in">
          <ConvoyRouteMap convoy={convoy as any} height="50vh" showParticipants={true} showLegend={true} />
        </div>

        {/* Tab Navigation (Mobile) */}
        <div className="flex gap-2 mb-6 md:hidden">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'info' 
                ? 'bg-teal-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            ℹ️ Infos
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'chat' 
                ? 'bg-teal-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            💬 Chat
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className={`lg:col-span-2 space-y-6 ${activeTab !== 'info' ? 'hidden md:block' : ''}`}>
            {/* Route Details */}
            <div className="card animate-fade-in-up">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span>🗺️</span> {t('convoy.routeDetails')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <span className="text-2xl">🚐</span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{t('convoy.start')}</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{convoy.startLocation.name}</p>
                  </div>
                </div>
                
                {convoy.waypoints.length > 0 && (
                  <div className="ml-6 pl-6 border-l-2 border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                    {convoy.waypoints.sort((a, b) => a.order - b.order).map((wp, i) => (
                      <div key={wp.id} className="flex items-center gap-3 py-2">
                        <span className="text-lg">📍</span>
                        <span className="text-slate-600 dark:text-slate-400">{wp.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{t('convoy.destination')}</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{convoy.destination.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card animate-fade-in-up animate-delay-100">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span>📝</span> {t('convoy.description')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                {convoy.description || t('convoy.noDescription')}
              </p>
              
              {convoy.tags && convoy.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  {convoy.tags.map((tag) => (
                    <span key={tag} className="badge badge-info">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="card animate-fade-in-up animate-delay-200">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span>👥</span> 
                {t('convoy.participantsList')} 
                <span className="text-sm font-normal text-slate-500">
                  ({convoy.participants.length}{convoy.maxParticipants ? `/${convoy.maxParticipants}` : ''})
                </span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {convoy.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      participant.id === user?.id 
                        ? 'bg-teal-50 dark:bg-teal-900/20 ring-2 ring-teal-500' 
                        : 'bg-slate-50 dark:bg-slate-700/50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center text-xl text-white shadow-md">
                      {participant.avatar || participant.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white truncate">
                        {participant.name}
                        {participant.id === user?.id && (
                          <span className="ml-1 text-xs text-teal-600">(Du)</span>
                        )}
                      </p>
                      {participant.isOrganizer && (
                        <p className="text-xs text-teal-600 font-medium">👑 {t('convoy.organizer')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className={`space-y-6 ${activeTab !== 'info' && activeTab !== 'chat' ? 'hidden md:block' : ''}`}>
            {/* Dates Card */}
            <div className="card animate-fade-in-up">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span>📅</span> {t('convoy.dates')}
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('convoy.startDate')}</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{formatDate(convoy.startDate)}</p>
                </div>
                {convoy.endDate && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('convoy.endDate')}</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{formatDate(convoy.endDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="card animate-fade-in-up animate-delay-100">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span>📊</span> {t('convoy.stats')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-2xl font-bold gradient-text">{convoy.participants.length}</p>
                  <p className="text-xs text-slate-500">{t('convoy.participants')}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-2xl font-bold gradient-text">{convoy.waypoints.length}</p>
                  <p className="text-xs text-slate-500">{t('convoy.waypoints')}</p>
                </div>
                {spotsLeft !== null && (
                  <div className="col-span-2 text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className={`text-2xl font-bold ${spotsLeft <= 2 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {spotsLeft}
                    </p>
                    <p className="text-xs text-slate-500">{t('convoy.spotsLeft')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat (Desktop) */}
            <div className={`hidden lg:block animate-fade-in-up animate-delay-200`}>
              <Chat convoyId={convoyId} />
            </div>

            {/* Share Card */}
            <div className="card animate-fade-in-up animate-delay-300">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span>🔗</span> {t('convoy.share')}
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert(t('convoy.linkCopied'))
                }}
                className="btn-outline w-full"
              >
                📋 {t('convoy.copyLink')}
              </button>
            </div>
          </div>

          {/* Chat (Mobile) */}
          <div className={`lg:hidden ${activeTab !== 'chat' ? 'hidden' : ''}`}>
            <Chat convoyId={convoyId} />
          </div>
        </div>
      </div>
    </div>
  )
}


