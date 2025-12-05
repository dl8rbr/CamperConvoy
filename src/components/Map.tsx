'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'

// Fix für Leaflet Marker Icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

// Beispiel-Stellplätze für Demo
const demoSpots = [
  {
    id: 1,
    name: 'Stellplatz am Bodensee',
    lat: 47.6585,
    lng: 9.1793,
    description: 'Wunderschöner Stellplatz mit Seeblick',
    rating: 4.5,
  },
  {
    id: 2,
    name: 'Camping Alpenblick',
    lat: 47.4212,
    lng: 10.9863,
    description: 'Ruhiger Platz mit Bergpanorama',
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Wohnmobilhafen Hamburg',
    lat: 53.5511,
    lng: 9.9937,
    description: 'Stadtnaher Stellplatz mit guter Infrastruktur',
    rating: 4.2,
  },
  {
    id: 4,
    name: 'Naturcamp Schwarzwald',
    lat: 48.0905,
    lng: 8.0648,
    description: 'Idyllischer Platz mitten in der Natur',
    rating: 4.6,
  },
]

// Komponente zum Zentrieren der Karte auf Benutzerstandort
function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const map = useMap()

  useEffect(() => {
    map.locate().on('locationfound', (e) => {
      setPosition(e.latlng)
      map.flyTo(e.latlng, 10)
    })
  }, [map])

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Dein Standort</Popup>
    </Marker>
  )
}

export default function MapComponent() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  // Nur Client-seitig rendern
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">{t('map.loading')}</div>
      </div>
    )
  }

  // Standard-Zentrum: Deutschland
  const defaultCenter: [number, number] = [51.1657, 10.4515]
  const defaultZoom = 6

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <LocationMarker />
      
      {demoSpots.map((spot) => (
        <Marker key={spot.id} position={[spot.lat, spot.lng]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{spot.name}</h3>
              <p className="text-sm text-slate-600">{spot.description}</p>
              <div className="flex items-center mt-2">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 text-sm font-medium">{spot.rating}</span>
              </div>
              <button className="mt-2 bg-primary-600 text-white text-sm px-3 py-1 rounded hover:bg-primary-700 transition-colors">
                {t('map.details')}
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}


