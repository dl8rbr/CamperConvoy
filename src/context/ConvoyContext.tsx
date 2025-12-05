'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Convoy, CreateConvoyData, ConvoyParticipant } from '@/types/convoy'
import { useAuth } from './AuthContext'

// Demo-Konvois
const DEMO_CONVOYS: Convoy[] = [
  {
    id: '1',
    title: 'Alpenüberquerung 2024',
    description: 'Gemeinsame Fahrt über die Alpen von München nach Verona. Wir nehmen die landschaftlich schönste Route über den Brenner mit Zwischenstopps an malerischen Seen.',
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-20'),
    startLocation: { name: 'München', lat: 48.1351, lng: 11.5820 },
    destination: { name: 'Verona, Italien', lat: 45.4384, lng: 10.9916 },
    waypoints: [
      { id: 'w1', name: 'Innsbruck', lat: 47.2692, lng: 11.4041, order: 1 },
      { id: 'w2', name: 'Brennerpass', lat: 47.0425, lng: 11.5069, order: 2 },
      { id: 'w3', name: 'Bozen', lat: 46.4983, lng: 11.3548, order: 3 },
    ],
    participants: [
      { id: '1', name: 'Max Mustermann', avatar: '🚐', joinedAt: new Date('2024-01-15'), isOrganizer: true },
      { id: '2', name: 'Anna Schmidt', avatar: '🚗', joinedAt: new Date('2024-02-01'), isOrganizer: false },
      { id: '3', name: 'Peter Weber', avatar: '🏕️', joinedAt: new Date('2024-02-10'), isOrganizer: false },
    ],
    maxParticipants: 10,
    organizerId: '1',
    organizerName: 'Max Mustermann',
    createdAt: new Date('2024-01-15'),
    status: 'planned',
    tags: ['Alpen', 'Italien', 'Sommer'],
  },
  {
    id: '2',
    title: 'Ostsee-Rundfahrt',
    description: 'Entspannte Tour entlang der deutschen Ostseeküste. Wir besuchen die schönsten Strände und historischen Hansestädte.',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-08-07'),
    startLocation: { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
    destination: { name: 'Usedom', lat: 53.9333, lng: 14.0833 },
    waypoints: [
      { id: 'w1', name: 'Lübeck', lat: 53.8655, lng: 10.6866, order: 1 },
      { id: 'w2', name: 'Rostock', lat: 54.0924, lng: 12.0991, order: 2 },
      { id: 'w3', name: 'Stralsund', lat: 54.3093, lng: 13.0818, order: 3 },
    ],
    participants: [
      { id: '4', name: 'Lisa Müller', avatar: '🚐', joinedAt: new Date('2024-03-01'), isOrganizer: true },
      { id: '5', name: 'Tom Bauer', avatar: '🚗', joinedAt: new Date('2024-03-15'), isOrganizer: false },
    ],
    maxParticipants: 8,
    organizerId: '4',
    organizerName: 'Lisa Müller',
    createdAt: new Date('2024-03-01'),
    status: 'planned',
    tags: ['Ostsee', 'Strand', 'Hansestädte'],
  },
  {
    id: '3',
    title: 'Schwarzwald-Entdeckung',
    description: 'Erkunde mit uns den mystischen Schwarzwald. Wir besuchen traditionelle Dörfer, Wasserfälle und genießen die lokale Küche.',
    startDate: new Date('2024-06-10'),
    endDate: new Date('2024-06-14'),
    startLocation: { name: 'Freiburg', lat: 47.9990, lng: 7.8421 },
    destination: { name: 'Baden-Baden', lat: 48.7606, lng: 8.2397 },
    waypoints: [
      { id: 'w1', name: 'Titisee', lat: 47.9039, lng: 8.1548, order: 1 },
      { id: 'w2', name: 'Triberg (Wasserfälle)', lat: 48.1303, lng: 8.2328, order: 2 },
    ],
    participants: [
      { id: '6', name: 'Sabine Koch', avatar: '🏕️', joinedAt: new Date('2024-02-20'), isOrganizer: true },
    ],
    maxParticipants: 6,
    organizerId: '6',
    organizerName: 'Sabine Koch',
    createdAt: new Date('2024-02-20'),
    status: 'planned',
    tags: ['Schwarzwald', 'Natur', 'Wandern'],
  },
]

interface ConvoyContextType {
  convoys: Convoy[]
  isLoading: boolean
  getConvoy: (id: string) => Convoy | undefined
  createConvoy: (data: CreateConvoyData) => Promise<Convoy>
  joinConvoy: (convoyId: string) => Promise<boolean>
  leaveConvoy: (convoyId: string) => Promise<boolean>
  isParticipant: (convoyId: string) => boolean
  getUserConvoys: () => Convoy[]
}

const ConvoyContext = createContext<ConvoyContextType | null>(null)

export function useConvoy() {
  const context = useContext(ConvoyContext)
  if (!context) {
    throw new Error('useConvoy must be used within a ConvoyProvider')
  }
  return context
}

interface ConvoyProviderProps {
  children: ReactNode
}

export function ConvoyProvider({ children }: ConvoyProviderProps) {
  const [convoys, setConvoys] = useState<Convoy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  // Konvois laden (simuliert)
  useEffect(() => {
    const loadConvoys = async () => {
      // Simulierte Verzögerung
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Aus localStorage laden oder Demo-Daten verwenden
      const stored = localStorage.getItem('camper-convoy-convoys')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Dates wiederherstellen
          const restored = parsed.map((c: Convoy) => ({
            ...c,
            startDate: new Date(c.startDate),
            endDate: c.endDate ? new Date(c.endDate) : undefined,
            createdAt: new Date(c.createdAt),
            participants: c.participants.map((p: ConvoyParticipant) => ({
              ...p,
              joinedAt: new Date(p.joinedAt),
            })),
          }))
          setConvoys(restored)
        } catch {
          setConvoys(DEMO_CONVOYS)
        }
      } else {
        setConvoys(DEMO_CONVOYS)
      }
      setIsLoading(false)
    }
    loadConvoys()
  }, [])

  // Konvois speichern
  useEffect(() => {
    if (!isLoading && convoys.length > 0) {
      localStorage.setItem('camper-convoy-convoys', JSON.stringify(convoys))
    }
  }, [convoys, isLoading])

  const getConvoy = useCallback((id: string) => {
    return convoys.find((c) => c.id === id)
  }, [convoys])

  const createConvoy = useCallback(async (data: CreateConvoyData): Promise<Convoy> => {
    if (!user) throw new Error('Must be logged in to create convoy')

    await new Promise((resolve) => setTimeout(resolve, 300))

    const newConvoy: Convoy = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      startLocation: data.startLocation,
      destination: data.destination,
      waypoints: data.waypoints?.map((w, i) => ({ ...w, id: `w${i}` })) || [],
      participants: [
        {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          joinedAt: new Date(),
          isOrganizer: true,
        },
      ],
      maxParticipants: data.maxParticipants,
      organizerId: user.id,
      organizerName: user.name,
      createdAt: new Date(),
      status: 'planned',
      tags: data.tags,
    }

    setConvoys((prev) => [...prev, newConvoy])
    return newConvoy
  }, [user])

  const joinConvoy = useCallback(async (convoyId: string): Promise<boolean> => {
    if (!user || !isAuthenticated) return false

    await new Promise((resolve) => setTimeout(resolve, 300))

    setConvoys((prev) =>
      prev.map((convoy) => {
        if (convoy.id !== convoyId) return convoy
        
        // Prüfen ob bereits Teilnehmer
        if (convoy.participants.some((p) => p.id === user.id)) return convoy
        
        // Prüfen ob max erreicht
        if (convoy.maxParticipants && convoy.participants.length >= convoy.maxParticipants) {
          return convoy
        }

        return {
          ...convoy,
          participants: [
            ...convoy.participants,
            {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              joinedAt: new Date(),
              isOrganizer: false,
            },
          ],
        }
      })
    )

    return true
  }, [user, isAuthenticated])

  const leaveConvoy = useCallback(async (convoyId: string): Promise<boolean> => {
    if (!user) return false

    await new Promise((resolve) => setTimeout(resolve, 300))

    setConvoys((prev) =>
      prev.map((convoy) => {
        if (convoy.id !== convoyId) return convoy
        
        // Organisator kann nicht verlassen
        if (convoy.organizerId === user.id) return convoy

        return {
          ...convoy,
          participants: convoy.participants.filter((p) => p.id !== user.id),
        }
      })
    )

    return true
  }, [user])

  const isParticipant = useCallback((convoyId: string): boolean => {
    if (!user) return false
    const convoy = convoys.find((c) => c.id === convoyId)
    return convoy?.participants.some((p) => p.id === user.id) || false
  }, [convoys, user])

  const getUserConvoys = useCallback((): Convoy[] => {
    if (!user) return []
    return convoys.filter((c) => c.participants.some((p) => p.id === user.id))
  }, [convoys, user])

  const value: ConvoyContextType = {
    convoys,
    isLoading,
    getConvoy,
    createConvoy,
    joinConvoy,
    leaveConvoy,
    isParticipant,
    getUserConvoys,
  }

  return <ConvoyContext.Provider value={value}>{children}</ConvoyContext.Provider>
}


