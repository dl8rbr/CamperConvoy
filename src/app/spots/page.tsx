'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'

// Demo-Stellplätze
const demoSpots = [
  {
    id: 1,
    name: 'Stellplatz am Bodensee',
    location: 'Konstanz, Baden-Württemberg',
    description: 'Wunderschöner Stellplatz mit direktem Seeblick und modernen Sanitäranlagen.',
    image: '🏕️',
    rating: 4.5,
    reviews: 128,
    price: 15,
    amenities: ['Strom', 'Wasser', 'WLAN', 'Toiletten'],
  },
  {
    id: 2,
    name: 'Camping Alpenblick',
    location: 'Garmisch-Partenkirchen, Bayern',
    description: 'Ruhiger Platz mit atemberaubendem Bergpanorama.',
    image: '⛺',
    rating: 4.8,
    reviews: 256,
    price: 20,
    amenities: ['Strom', 'Wasser', 'Duschen', 'Restaurant'],
  },
  {
    id: 3,
    name: 'Wohnmobilhafen Hamburg',
    location: 'Hamburg',
    description: 'Stadtnaher Stellplatz mit guter Anbindung an öffentliche Verkehrsmittel.',
    image: '🚐',
    rating: 4.2,
    reviews: 89,
    price: 25,
    amenities: ['Strom', 'Wasser', 'WLAN', 'Entsorgung'],
  },
  {
    id: 4,
    name: 'Naturcamp Schwarzwald',
    location: 'Freiburg, Baden-Württemberg',
    description: 'Idyllischer Platz mitten in der Natur, perfekt für Wanderer.',
    image: '🌲',
    rating: 4.6,
    reviews: 167,
    price: 12,
    amenities: ['Wasser', 'Toiletten', 'Feuerstelle'],
  },
  {
    id: 5,
    name: 'Ostseecamping Fehmarn',
    location: 'Fehmarn, Schleswig-Holstein',
    description: 'Direkter Strandzugang und familienfreundliche Atmosphäre.',
    image: '🏖️',
    rating: 4.4,
    reviews: 312,
    price: 18,
    amenities: ['Strom', 'Wasser', 'WLAN', 'Spielplatz', 'Strand'],
  },
  {
    id: 6,
    name: 'Weinberg-Stellplatz Mosel',
    location: 'Bernkastel-Kues, Rheinland-Pfalz',
    description: 'Einzigartiger Stellplatz zwischen Weinbergen mit Weinprobe.',
    image: '🍷',
    rating: 4.7,
    reviews: 94,
    price: 0,
    amenities: ['Wasser', 'Toiletten', 'Weinprobe'],
  },
]

export default function SpotsPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useState<number[]>([])

  const filteredSpots = demoSpots.filter(
    (spot) =>
      spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
        {t('nav.spots')}
      </h1>

      {/* Suchleiste */}
      <div className="mb-8">
        <input
          type="text"
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field max-w-md"
        />
      </div>

      {/* Stellplatz-Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpots.map((spot) => (
          <div key={spot.id} className="card hover:shadow-xl transition-shadow">
            {/* Bild-Platzhalter */}
            <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-6xl">{spot.image}</span>
            </div>

            {/* Inhalt */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {spot.name}
                </h3>
                {isAuthenticated && (
                  <button
                    onClick={() => toggleFavorite(spot.id)}
                    className="text-2xl hover:scale-110 transition-transform"
                    aria-label={
                      favorites.includes(spot.id)
                        ? t('spot.removeFromFavorites')
                        : t('spot.addToFavorites')
                    }
                  >
                    {favorites.includes(spot.id) ? '❤️' : '🤍'}
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                📍 {spot.location}
              </p>

              <p className="text-slate-600 dark:text-slate-300 text-sm">
                {spot.description}
              </p>

              {/* Bewertung */}
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{spot.rating}</span>
                <span className="text-slate-400">
                  ({spot.reviews} {t('spot.reviews')})
                </span>
              </div>

              {/* Ausstattung */}
              <div className="flex flex-wrap gap-1">
                {spot.amenities.slice(0, 3).map((amenity) => (
                  <span
                    key={amenity}
                    className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded"
                  >
                    {amenity}
                  </span>
                ))}
                {spot.amenities.length > 3 && (
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    +{spot.amenities.length - 3}
                  </span>
                )}
              </div>

              {/* Preis und Aktionen */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-lg font-bold text-primary-600">
                  {spot.price === 0 ? t('spot.free') : `€${spot.price}/Nacht`}
                </div>
                <button className="btn-primary text-sm">
                  {t('map.details')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSpots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Keine Stellplätze gefunden.
          </p>
        </div>
      )}
    </div>
  )
}


