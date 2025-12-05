'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useStore, Convoy } from '@/lib/store'

// Konvoi-Marker Icon
const createConvoyIcon = (status: string, participantCount: number) => {
  const colors = {
    planned: '#f59e0b',
    active: '#22c55e',
    completed: '#64748b',
    cancelled: '#ef4444',
  }
  const color = colors[status as keyof typeof colors] || colors.planned

  return L.divIcon({
    className: 'convoy-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: ${color};
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 3px solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        ">🚐</div>
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          background: white;
          color: ${color};
          font-size: 11px;
          font-weight: bold;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        ">${participantCount}</div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -25],
  })
}

// Komponente zum Anpassen der Kartenansicht
function FitAllConvoys({ convoys }: { convoys: Convoy[] }) {
  const map = useMap()

  useEffect(() => {
    if (convoys.length === 0) return

    const allPositions: [number, number][] = convoys.flatMap((c) => [
      [c.startLocation.lat, c.startLocation.lng] as [number, number],
      [c.destination.lat, c.destination.lng] as [number, number],
    ])

    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(allPositions)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 })
    }
  }, [map, convoys])

  return null
}

// Popup Inhalt für Konvoi
function ConvoyPopupContent({ convoy }: { convoy: Convoy }) {
  const { t } = useTranslation()
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const statusColors = {
    planned: 'bg-amber-100 text-amber-700',
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-rose-100 text-rose-700',
  }

  return (
    <div className="p-4 min-w-[280px]">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg text-slate-800 pr-2">{convoy.title}</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[convoy.status]}`}>
          {t(`convoy.status.${convoy.status}`)}
        </span>
      </div>
      
      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
        {convoy.description}
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-slate-600">
          <span className="mr-2">📅</span>
          <span>{formatDate(convoy.startDate)}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <span className="mr-2">📍</span>
          <span>{convoy.startLocation.name} → {convoy.destination.name}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <span className="mr-2">👥</span>
          <span>
            {convoy.participants.length}
            {convoy.maxParticipants ? ` / ${convoy.maxParticipants}` : ''} {t('convoy.participants')}
          </span>
        </div>
      </div>
      
      <Link 
        href={`/convoys/${convoy.id}`}
        className="block w-full text-center py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
      >
        {t('map.details')}
      </Link>
    </div>
  )
}

interface ConvoyOverviewMapProps {
  height?: string
  showRoutes?: boolean
}

export default function ConvoyOverviewMap({ 
  height = '500px',
  showRoutes = true,
}: ConvoyOverviewMapProps) {
  const [mounted, setMounted] = useState(false)
  const convoys = useStore((state) => state.convoys)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div 
        className="bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center animate-shimmer"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce-subtle">🗺️</div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Karte wird geladen...</p>
        </div>
      </div>
    )
  }

  // Nur geplante und aktive Konvois anzeigen
  const visibleConvoys = convoys.filter((c) => c.status === 'planned' || c.status === 'active')

  // Zentrum: Deutschland
  const defaultCenter: [number, number] = [50.5, 10.5]

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitAllConvoys convoys={visibleConvoys} />

        {visibleConvoys.map((convoy) => {
          const routePositions: [number, number][] = [
            [convoy.startLocation.lat, convoy.startLocation.lng],
            ...convoy.waypoints
              .sort((a, b) => a.order - b.order)
              .map((wp) => [wp.lat, wp.lng] as [number, number]),
            [convoy.destination.lat, convoy.destination.lng],
          ]

          return (
            <div key={convoy.id}>
              {/* Route-Linie */}
              {showRoutes && (
                <>
                  {/* Schatten */}
                  <Polyline
                    positions={routePositions}
                    pathOptions={{
                      color: convoy.status === 'active' ? '#22c55e' : '#f59e0b',
                      weight: 6,
                      opacity: 0.3,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                  {/* Hauptlinie */}
                  <Polyline
                    positions={routePositions}
                    pathOptions={{
                      color: convoy.status === 'active' ? '#22c55e' : '#f59e0b',
                      weight: 3,
                      opacity: 0.8,
                      dashArray: '8, 8',
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                </>
              )}

              {/* Start-Marker mit Popup */}
              <Marker
                position={[convoy.startLocation.lat, convoy.startLocation.lng]}
                icon={createConvoyIcon(convoy.status, convoy.participants.length)}
              >
                <Popup>
                  <ConvoyPopupContent convoy={convoy} />
                </Popup>
              </Marker>
            </div>
          )
        })}
      </MapContainer>

      {/* Overlay Konvoi-Counter */}
      <div className="absolute top-4 left-4 z-[1000] glass rounded-xl px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚐</span>
          <div>
            <p className="font-bold text-slate-800 dark:text-white">{visibleConvoys.length}</p>
            <p className="text-xs text-slate-500">Aktive Konvois</p>
          </div>
        </div>
      </div>

      {/* Legende */}
      <div className="absolute bottom-4 right-4 z-[1000] glass rounded-xl p-3 shadow-lg">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 dark:text-slate-300">Geplant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-300">Unterwegs</span>
          </div>
        </div>
      </div>
    </div>
  )
}


