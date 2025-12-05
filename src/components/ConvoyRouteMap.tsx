'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Convoy, ConvoyParticipant } from '@/lib/store'

// ============================================
// Custom Marker Icons
// ============================================

const createIcon = (emoji: string, bgColor: string, size: number = 30) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    background-color: ${bgColor}; 
    color: white; 
    width: ${size}px; 
    height: ${size}px; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: ${size * 0.5}px; 
    border: 3px solid white; 
    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
  ">${emoji}</div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
  popupAnchor: [0, -size / 2],
})

const startIcon = createIcon('🚐', '#22c55e', 36)
const destinationIcon = createIcon('🎯', '#ef4444', 36)
const waypointIcon = createIcon('📍', '#3b82f6', 28)

// Teilnehmer-Icons mit verschiedenen Farben
const participantColors = ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#84cc16']
const createParticipantIcon = (avatar: string, index: number) => {
  const color = participantColors[index % participantColors.length]
  return L.divIcon({
    className: 'participant-marker',
    html: `<div style="
      background-color: ${color}; 
      color: white; 
      width: 32px; 
      height: 32px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 16px; 
      border: 3px solid white; 
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
      animation: pulse 2s infinite;
    ">${avatar}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// ============================================
// Helper-Komponente für Map-Bounds
// ============================================

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 })
    }
  }, [map, positions])

  return null
}

// ============================================
// Simulierte Teilnehmer-Positionen
// ============================================

function getSimulatedParticipantPosition(
  participant: ConvoyParticipant,
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  index: number
): [number, number] {
  // Simuliere Position entlang der Route (basierend auf Index)
  const progress = (index * 0.15) % 0.8 // 0 bis 80% der Strecke
  const lat = startLat + (destLat - startLat) * progress + (Math.random() - 0.5) * 0.1
  const lng = startLng + (destLng - startLng) * progress + (Math.random() - 0.5) * 0.1
  return [lat, lng]
}

// ============================================
// Legende Komponente
// ============================================

function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 text-sm">
      <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Legende</h4>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px]">🚐</span>
          <span className="text-slate-600 dark:text-slate-300">Start</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px]">📍</span>
          <span className="text-slate-600 dark:text-slate-300">Zwischenstopp</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px]">🎯</span>
          <span className="text-slate-600 dark:text-slate-300">Ziel</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
          <span className="text-slate-600 dark:text-slate-300">Teilnehmer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }}></span>
          <span className="text-slate-600 dark:text-slate-300">Route</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Hauptkomponente: ConvoyRouteMap
// ============================================

interface ConvoyRouteMapProps {
  convoy: Convoy
  height?: string
  showParticipants?: boolean
  showLegend?: boolean
}

export default function ConvoyRouteMap({ 
  convoy, 
  height = '50vh',
  showParticipants = true,
  showLegend = true,
}: ConvoyRouteMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Loading State
  if (!mounted) {
    return (
      <div 
        className="bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center animate-pulse"
        style={{ height, minHeight: '300px' }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-slate-500 dark:text-slate-400">Karte wird geladen...</p>
        </div>
      </div>
    )
  }

  // Alle Positionen für die Route sammeln
  const routePositions: [number, number][] = [
    [convoy.startLocation.lat, convoy.startLocation.lng],
    ...convoy.waypoints
      .sort((a, b) => a.order - b.order)
      .map((wp) => [wp.lat, wp.lng] as [number, number]),
    [convoy.destination.lat, convoy.destination.lng],
  ]

  // Berechne Zentrum
  const centerLat = routePositions.reduce((sum, pos) => sum + pos[0], 0) / routePositions.length
  const centerLng = routePositions.reduce((sum, pos) => sum + pos[1], 0) / routePositions.length

  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-lg w-full" 
      style={{ height, minHeight: '300px' }}
    >
      {/* CSS für Marker-Animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .participant-marker div {
          animation: pulse 2s ease-in-out infinite;
        }
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
          z-index: 1;
        }
      `}</style>

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        {/* OpenStreetMap TileLayer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-Zoom auf Route */}
        <FitBounds positions={routePositions} />

        {/* Route als Polyline */}
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: '#22c55e',
            weight: 5,
            opacity: 0.9,
            dashArray: '12, 8',
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {/* Durchgehende Linie darunter für bessere Sichtbarkeit */}
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: '#16a34a',
            weight: 8,
            opacity: 0.3,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {/* Start-Marker */}
        <Marker
          position={[convoy.startLocation.lat, convoy.startLocation.lng]}
          icon={startIcon}
        >
          <Popup>
            <div className="p-2 min-w-[150px]">
              <h4 className="font-bold text-green-600 text-lg mb-1">🚐 Startpunkt</h4>
              <p className="text-slate-700 font-medium">{convoy.startLocation.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                Hier beginnt die Reise!
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Waypoint-Marker */}
        {convoy.waypoints
          .sort((a, b) => a.order - b.order)
          .map((waypoint, index) => (
            <Marker
              key={waypoint.id}
              position={[waypoint.lat, waypoint.lng]}
              icon={waypointIcon}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <h4 className="font-bold text-blue-600 text-lg mb-1">
                    📍 Stopp {index + 1}
                  </h4>
                  <p className="text-slate-700 font-medium">{waypoint.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Zwischenstopp auf der Route
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Ziel-Marker */}
        <Marker
          position={[convoy.destination.lat, convoy.destination.lng]}
          icon={destinationIcon}
        >
          <Popup>
            <div className="p-2 min-w-[150px]">
              <h4 className="font-bold text-red-600 text-lg mb-1">🎯 Ziel</h4>
              <p className="text-slate-700 font-medium">{convoy.destination.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                Das Reiseziel!
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Teilnehmer-Marker (simulierte Positionen) */}
        {showParticipants && convoy.participants.map((participant, index) => {
          const position = getSimulatedParticipantPosition(
            participant,
            convoy.startLocation.lat,
            convoy.startLocation.lng,
            convoy.destination.lat,
            convoy.destination.lng,
            index
          )
          
          return (
            <Marker
              key={participant.id}
              position={position}
              icon={createParticipantIcon(participant.avatar || '👤', index)}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{participant.avatar || '👤'}</span>
                    <div>
                      <h4 className="font-bold text-slate-800">{participant.name}</h4>
                      {participant.isOrganizer && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded">
                          Organisator
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    📍 Simulierte Position
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Legende */}
      {showLegend && <MapLegend />}

      {/* Teilnehmer-Counter Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-slate-800 rounded-lg shadow-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {convoy.participants.length} Teilnehmer
          </span>
        </div>
      </div>
    </div>
  )
}


