'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useConvoy } from '@/context/ConvoyContext'
import { CreateConvoyData } from '@/types/convoy'

// Vordefinierte Orte für Demo
const PRESET_LOCATIONS = [
  { name: 'München', lat: 48.1351, lng: 11.5820 },
  { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
  { name: 'Köln', lat: 50.9375, lng: 6.9603 },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  { name: 'Stuttgart', lat: 48.7758, lng: 9.1829 },
  { name: 'Freiburg', lat: 47.9990, lng: 7.8421 },
  { name: 'Dresden', lat: 51.0504, lng: 13.7373 },
  { name: 'Wien', lat: 48.2082, lng: 16.3738 },
  { name: 'Zürich', lat: 47.3769, lng: 8.5417 },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Prag', lat: 50.0755, lng: 14.4378 },
  { name: 'Verona', lat: 45.4384, lng: 10.9916 },
  { name: 'Barcelona', lat: 41.3874, lng: 2.1686 },
]

export default function NewConvoyPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { createConvoy } = useConvoy()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startLocation, setStartLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [tags, setTags] = useState('')

  // Weiterleitung wenn nicht eingeloggt
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const getLocationData = (name: string) => {
    const location = PRESET_LOCATIONS.find(
      (l) => l.name.toLowerCase() === name.toLowerCase()
    )
    return location || { name, lat: 50.0, lng: 10.0 } // Fallback Koordinaten
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validierung
    if (!title.trim()) {
      setError(t('convoy.form.errors.titleRequired'))
      return
    }
    if (!startDate) {
      setError(t('convoy.form.errors.startDateRequired'))
      return
    }
    if (!startLocation.trim()) {
      setError(t('convoy.form.errors.startLocationRequired'))
      return
    }
    if (!destination.trim()) {
      setError(t('convoy.form.errors.destinationRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      const convoyData: CreateConvoyData = {
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate: endDate || undefined,
        startLocation: getLocationData(startLocation),
        destination: getLocationData(destination),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      }

      const newConvoy = await createConvoy(convoyData)
      router.push(`/convoys/${newConvoy.id}`)
    } catch (err) {
      setError(t('convoy.form.errors.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-2xl mx-auto">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            {t('convoy.form.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('convoy.form.subtitle')}
          </p>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Titel */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              {t('convoy.form.convoyTitle')} *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('convoy.form.titlePlaceholder')}
              className="input-field"
              maxLength={100}
              required
            />
          </div>

          {/* Beschreibung */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              {t('convoy.form.description')}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('convoy.form.descriptionPlaceholder')}
              className="input-field min-h-[120px] resize-y"
              maxLength={1000}
            />
            <p className="text-xs text-slate-500 mt-1">
              {description.length}/1000 {t('convoy.form.characters')}
            </p>
          </div>

          {/* Datum */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                {t('convoy.form.startDate')} *
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                {t('convoy.form.endDate')}
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="input-field"
              />
            </div>
          </div>

          {/* Route */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startLocation" className="block text-sm font-medium mb-2">
                {t('convoy.form.startLocation')} *
              </label>
              <input
                id="startLocation"
                type="text"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder={t('convoy.form.startLocationPlaceholder')}
                className="input-field"
                list="locations-start"
                required
              />
              <datalist id="locations-start">
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium mb-2">
                {t('convoy.form.destination')} *
              </label>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t('convoy.form.destinationPlaceholder')}
                className="input-field"
                list="locations-dest"
                required
              />
              <datalist id="locations-dest">
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Max Teilnehmer */}
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium mb-2">
              {t('convoy.form.maxParticipants')}
            </label>
            <input
              id="maxParticipants"
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder={t('convoy.form.maxParticipantsPlaceholder')}
              className="input-field"
              min={2}
              max={50}
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              {t('convoy.form.tags')}
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t('convoy.form.tagsPlaceholder')}
              className="input-field"
            />
            <p className="text-xs text-slate-500 mt-1">
              {t('convoy.form.tagsHint')}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-outline flex-1"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.loading') : t('convoy.form.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


