'use client'

import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'

const ConvoyOverviewMap = dynamic(() => import('@/components/ConvoyOverviewMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-8rem)] bg-slate-200 dark:bg-slate-700 animate-shimmer flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce-subtle">🗺️</div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Karte wird geladen...</p>
      </div>
    </div>
  ),
})

export default function MapPage() {
  const { t } = useTranslation()

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ConvoyOverviewMap height="100%" showRoutes={true} />
    </div>
  )
}


