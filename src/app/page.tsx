'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/lib/store'

// Dynamischer Import der Karte
const ConvoyOverviewMap = dynamic(() => import('@/components/ConvoyOverviewMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-slate-200 dark:bg-slate-700 rounded-2xl animate-shimmer" />
  ),
})

// Feature Card Komponente
function FeatureCard({ 
  icon, 
  title, 
  description, 
  delay 
}: { 
  icon: string
  title: string
  description: string
  delay: number 
}) {
  return (
    <div 
      className="card-hover text-center group animate-fade-in-up opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  )
}

// Konvoi Preview Card
function ConvoyPreviewCard({ convoy, index }: { convoy: any; index: number }) {
  const { t } = useTranslation()
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
    })
  }

  const spotsLeft = convoy.maxParticipants 
    ? convoy.maxParticipants - convoy.participants.length 
    : null

  return (
    <Link href={`/convoys/${convoy.id}`}>
      <div 
        className="card-hover h-full animate-fade-in-up opacity-0"
        style={{ animationDelay: `${200 + index * 100}ms`, animationFillMode: 'forwards' }}
      >
        {/* Header mit Gradient */}
        <div className="h-32 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl mb-4 relative overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl group-hover:scale-125 transition-transform duration-500">🚐</span>
          </div>
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`badge ${
              convoy.status === 'planned' ? 'badge-warning' : 'badge-success'
            }`}>
              {t(`convoy.status.${convoy.status}`)}
            </span>
          </div>
          {/* Teilnehmer */}
          <div className="absolute bottom-3 left-3 flex -space-x-2">
            {convoy.participants.slice(0, 3).map((p: any, i: number) => (
              <div 
                key={p.id}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow-md border-2 border-white"
              >
                {p.avatar || p.name.charAt(0)}
              </div>
            ))}
            {convoy.participants.length > 3 && (
              <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
                +{convoy.participants.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 line-clamp-1">
          {convoy.title}
        </h3>
        
        <div className="flex items-center text-sm text-slate-500 mb-2">
          <span>📅 {formatDate(convoy.startDate)}</span>
          <span className="mx-2">•</span>
          <span>👥 {convoy.participants.length} Teilnehmer</span>
        </div>

        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
          <span className="truncate">
            📍 {convoy.startLocation.name} → {convoy.destination.name}
          </span>
        </div>

        {spotsLeft !== null && spotsLeft > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              ✨ Noch {spotsLeft} {spotsLeft === 1 ? 'Platz' : 'Plätze'} frei!
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

// Stats Counter mit Animation
function AnimatedCounter({ value, label, icon }: { value: number; label: string; icon: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 30
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-4xl font-bold gradient-text">{count}+</div>
      <div className="text-slate-600 dark:text-slate-400 text-sm">{label}</div>
    </div>
  )
}

export default function Home() {
  const { t } = useTranslation()
  const user = useStore((state) => state.user)
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const convoys = useStore((state) => state.convoys)

  // Nur geplante/aktive Konvois
  const activeConvoys = convoys.filter((c) => c.status === 'planned' || c.status === 'active')
  const totalParticipants = convoys.reduce((sum, c) => sum + c.participants.length, 0)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 hero-gradient dark:hero-gradient-dark overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Welcome Badge */}
            {isAuthenticated && user && (
              <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-4 py-2 rounded-full mb-6 animate-fade-in-down">
                <span>👋</span>
                <span className="font-medium">{t('home.welcome', { name: user.name })}</span>
              </div>
            )}

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in-up">
              <span className="text-slate-800 dark:text-white">Gemeinsam </span>
              <span className="gradient-text">unterwegs</span>
              <span className="text-slate-800 dark:text-white">,</span>
              <br />
              <span className="text-slate-800 dark:text-white">Abenteuer </span>
              <span className="gradient-text">teilen</span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
              Plane Konvoi-Fahrten mit anderen Campern, entdecke neue Routen 
              und erlebe unvergessliche Reisen in der Gemeinschaft.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up animate-delay-200">
              <Link href="/convoys" className="btn-primary text-lg px-8 py-3">
                🗺️ Konvois entdecken
              </Link>
              {isAuthenticated ? (
                <Link href="/convoys/new" className="btn-outline text-lg px-8 py-3">
                  ➕ Konvoi erstellen
                </Link>
              ) : (
                <Link href="/login" className="btn-outline text-lg px-8 py-3">
                  🔑 Anmelden
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up animate-delay-300">
              <AnimatedCounter value={activeConvoys.length} label="Aktive Konvois" icon="🚐" />
              <AnimatedCounter value={totalParticipants} label="Camper dabei" icon="👥" />
              <AnimatedCounter value={convoys.reduce((sum, c) => sum + c.waypoints.length, 0) + convoys.length * 2} label="Wegpunkte" icon="📍" />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">🚐</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-10 animate-float animate-delay-500">⛺</div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4 animate-fade-in-up">
              🗺️ Aktuelle Konvoi-Routen
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
              Entdecke geplante und laufende Gruppenfahrten in ganz Europa. 
              Klicke auf einen Marker für Details.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto animate-scale-in animate-delay-200">
            <ConvoyOverviewMap height="500px" showRoutes={true} />
          </div>
        </div>
      </section>

      {/* Featured Convoys */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                🔥 Beliebte Konvois
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Die nächsten geplanten Gruppenfahrten
              </p>
            </div>
            <Link 
              href="/convoys" 
              className="btn-ghost hidden md:flex items-center gap-2 group"
            >
              Alle anzeigen 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeConvoys.slice(0, 3).map((convoy, index) => (
              <ConvoyPreviewCard key={convoy.id} convoy={convoy} index={index} />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/convoys" className="btn-primary">
              Alle Konvois anzeigen →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Warum CamperConvoy?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Die perfekte Plattform für gemeinsame Camping-Abenteuer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <FeatureCard 
              icon="🚐" 
              title="Konvoi-Planung"
              description="Plane Routen, setze Zwischenstopps und lade andere Camper ein."
              delay={0}
            />
            <FeatureCard 
              icon="💬" 
              title="Gruppenchat"
              description="Kommuniziere in Echtzeit mit deiner Reisegruppe."
              delay={100}
            />
            <FeatureCard 
              icon="🗺️" 
              title="Live-Tracking"
              description="Behalte den Überblick über die Position aller Teilnehmer."
              delay={200}
            />
            <FeatureCard 
              icon="👥" 
              title="Community"
              description="Finde Gleichgesinnte und teile deine Erfahrungen."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card bg-gradient-to-br from-teal-500 to-emerald-600 text-white p-10 md:p-16 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 text-[200px] opacity-10 transform translate-x-1/4 -translate-y-1/4">
                🚐
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
                Bereit für dein nächstes Abenteuer?
              </h2>
              <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto relative z-10">
                Werde Teil der CamperConvoy-Community und entdecke 
                das Campen in der Gemeinschaft neu.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 relative z-10">
                {isAuthenticated ? (
                  <Link 
                    href="/convoys/new" 
                    className="bg-white text-teal-600 hover:bg-teal-50 font-bold py-3 px-8 rounded-xl transition-all hover:-translate-y-1 shadow-lg"
                  >
                    🚀 Konvoi erstellen
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/register" 
                      className="bg-white text-teal-600 hover:bg-teal-50 font-bold py-3 px-8 rounded-xl transition-all hover:-translate-y-1 shadow-lg"
                    >
                      🚀 Kostenlos registrieren
                    </Link>
                    <Link 
                      href="/convoys" 
                      className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-xl transition-all"
                    >
                      Konvois erkunden
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


