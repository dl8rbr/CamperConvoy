/**
 * Zustand Store - Zentrales State Management für CamperConvoy
 * 
 * Vorteile von Zustand gegenüber Redux:
 * - Keine Actions/Reducer nötig - direktes Mutieren des States
 * - Minimaler Boilerplate - einfache Store-Definition
 * - TypeScript-freundlich - volle Typisierung out-of-the-box
 * - Kein Provider nötig - direkter Zugriff via Hook
 * - Selektoren eingebaut - nur bei Änderungen re-rendern
 * - Middleware-Support für Persistence, DevTools etc.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================
// Types
// ============================================

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  loggedIn: boolean
}

export interface ConvoyParticipant {
  id: string
  name: string
  avatar?: string
  joinedAt: Date
  isOrganizer: boolean
}

export interface ConvoyWaypoint {
  id: string
  name: string
  lat: number
  lng: number
  order: number
}

export interface Convoy {
  id: string
  title: string
  description: string
  startDate: Date
  endDate?: Date
  startLocation: { name: string; lat: number; lng: number }
  destination: { name: string; lat: number; lng: number }
  waypoints: ConvoyWaypoint[]
  participants: ConvoyParticipant[]
  maxParticipants?: number
  organizerId: string
  organizerName: string
  createdAt: Date
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  tags?: string[]
}

export interface ChatMessage {
  id: string
  convoyId: string
  userId: string
  userName: string
  userAvatar?: string
  text: string
  timestamp: Date
}

// ============================================
// Store Interface
// ============================================

interface AppState {
  // User State
  user: User | null
  isAuthenticated: boolean
  
  // Convoy State
  convoys: Convoy[]
  
  // Chat State
  messages: Record<string, ChatMessage[]> // convoyId -> messages
  
  // User Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<boolean>
  
  // Convoy Actions
  getConvoy: (id: string) => Convoy | undefined
  createConvoy: (data: Partial<Convoy>) => Convoy
  joinConvoy: (convoyId: string) => boolean
  leaveConvoy: (convoyId: string) => boolean
  isParticipant: (convoyId: string) => boolean
  getUserConvoys: () => Convoy[]
  
  // Chat Actions
  sendMessage: (convoyId: string, text: string) => void
  getMessages: (convoyId: string) => ChatMessage[]
}

// ============================================
// Demo Data
// ============================================

const DEMO_CONVOYS: Convoy[] = [
  {
    id: '1',
    title: 'Alpenüberquerung 2024',
    description: 'Gemeinsame Fahrt über die Alpen von München nach Verona. Wir nehmen die landschaftlich schönste Route über den Brenner.',
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-20'),
    startLocation: { name: 'München', lat: 48.1351, lng: 11.5820 },
    destination: { name: 'Verona', lat: 45.4384, lng: 10.9916 },
    waypoints: [
      { id: 'w1', name: 'Innsbruck', lat: 47.2692, lng: 11.4041, order: 1 },
      { id: 'w2', name: 'Brennerpass', lat: 47.0425, lng: 11.5069, order: 2 },
      { id: 'w3', name: 'Bozen', lat: 46.4983, lng: 11.3548, order: 3 },
    ],
    participants: [
      { id: '1', name: 'Max Mustermann', avatar: '🚐', joinedAt: new Date('2024-01-15'), isOrganizer: true },
      { id: '2', name: 'Anna Schmidt', avatar: '🚗', joinedAt: new Date('2024-02-01'), isOrganizer: false },
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
    description: 'Entspannte Tour entlang der deutschen Ostseeküste.',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-08-07'),
    startLocation: { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
    destination: { name: 'Usedom', lat: 53.9333, lng: 14.0833 },
    waypoints: [
      { id: 'w1', name: 'Lübeck', lat: 53.8655, lng: 10.6866, order: 1 },
      { id: 'w2', name: 'Rostock', lat: 54.0924, lng: 12.0991, order: 2 },
    ],
    participants: [
      { id: '3', name: 'Lisa Müller', avatar: '🏕️', joinedAt: new Date('2024-03-01'), isOrganizer: true },
    ],
    maxParticipants: 8,
    organizerId: '3',
    organizerName: 'Lisa Müller',
    createdAt: new Date('2024-03-01'),
    status: 'planned',
    tags: ['Ostsee', 'Strand'],
  },
]

const DEMO_MESSAGES: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: 'm1',
      convoyId: '1',
      userId: '1',
      userName: 'Max Mustermann',
      userAvatar: '🚐',
      text: 'Hallo zusammen! Freue mich auf die Tour! 🏔️',
      timestamp: new Date('2024-03-01T10:00:00'),
    },
    {
      id: 'm2',
      convoyId: '1',
      userId: '2',
      userName: 'Anna Schmidt',
      userAvatar: '🚗',
      text: 'Hi Max! Ich bin auch dabei. Welche Route nehmen wir genau?',
      timestamp: new Date('2024-03-01T10:05:00'),
    },
    {
      id: 'm3',
      convoyId: '1',
      userId: '1',
      userName: 'Max Mustermann',
      userAvatar: '🚐',
      text: 'Wir fahren über den Brenner - die Aussicht ist dort fantastisch!',
      timestamp: new Date('2024-03-01T10:10:00'),
    },
  ],
  '2': [
    {
      id: 'm4',
      convoyId: '2',
      userId: '3',
      userName: 'Lisa Müller',
      userAvatar: '🏕️',
      text: 'Wer ist alles dabei für die Ostsee-Tour? 🌊',
      timestamp: new Date('2024-03-15T14:00:00'),
    },
  ],
}

// ============================================
// Store Creation
// ============================================

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      convoys: DEMO_CONVOYS,
      messages: DEMO_MESSAGES,

      // ============================================
      // User Actions
      // ============================================
      
      login: async (email: string, password: string): Promise<boolean> => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        // Demo: Akzeptiere jeden User mit Passwort "demo" oder "password"
        if (password === 'demo' || password === 'password') {
          const user: User = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email: email.toLowerCase(),
            avatar: '🚐',
            loggedIn: true,
          }
          set({ user, isAuthenticated: true })
          return true
        }
        return false
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      register: async (email: string, password: string, name: string): Promise<boolean> => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        const user: User = {
          id: Date.now().toString(),
          name,
          email: email.toLowerCase(),
          avatar: '🚐',
          loggedIn: true,
        }
        set({ user, isAuthenticated: true })
        return true
      },

      // ============================================
      // Convoy Actions
      // ============================================

      getConvoy: (id: string): Convoy | undefined => {
        return get().convoys.find((c) => c.id === id)
      },

      createConvoy: (data: Partial<Convoy>): Convoy => {
        const { user } = get()
        if (!user) throw new Error('Must be logged in')

        const newConvoy: Convoy = {
          id: Date.now().toString(),
          title: data.title || 'Neuer Konvoi',
          description: data.description || '',
          startDate: data.startDate || new Date(),
          endDate: data.endDate,
          startLocation: data.startLocation || { name: 'Start', lat: 50, lng: 10 },
          destination: data.destination || { name: 'Ziel', lat: 51, lng: 11 },
          waypoints: data.waypoints || [],
          participants: [{
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            joinedAt: new Date(),
            isOrganizer: true,
          }],
          maxParticipants: data.maxParticipants,
          organizerId: user.id,
          organizerName: user.name,
          createdAt: new Date(),
          status: 'planned',
          tags: data.tags,
        }

        set((state) => ({ convoys: [...state.convoys, newConvoy] }))
        return newConvoy
      },

      joinConvoy: (convoyId: string): boolean => {
        const { user, convoys } = get()
        if (!user) return false

        const convoy = convoys.find((c) => c.id === convoyId)
        if (!convoy) return false
        if (convoy.participants.some((p) => p.id === user.id)) return false
        if (convoy.maxParticipants && convoy.participants.length >= convoy.maxParticipants) return false

        set((state) => ({
          convoys: state.convoys.map((c) =>
            c.id === convoyId
              ? {
                  ...c,
                  participants: [
                    ...c.participants,
                    {
                      id: user.id,
                      name: user.name,
                      avatar: user.avatar,
                      joinedAt: new Date(),
                      isOrganizer: false,
                    },
                  ],
                }
              : c
          ),
        }))
        return true
      },

      leaveConvoy: (convoyId: string): boolean => {
        const { user, convoys } = get()
        if (!user) return false

        const convoy = convoys.find((c) => c.id === convoyId)
        if (!convoy) return false
        if (convoy.organizerId === user.id) return false // Organisator kann nicht verlassen

        set((state) => ({
          convoys: state.convoys.map((c) =>
            c.id === convoyId
              ? { ...c, participants: c.participants.filter((p) => p.id !== user.id) }
              : c
          ),
        }))
        return true
      },

      isParticipant: (convoyId: string): boolean => {
        const { user, convoys } = get()
        if (!user) return false
        const convoy = convoys.find((c) => c.id === convoyId)
        return convoy?.participants.some((p) => p.id === user.id) || false
      },

      getUserConvoys: (): Convoy[] => {
        const { user, convoys } = get()
        if (!user) return []
        return convoys.filter((c) => c.participants.some((p) => p.id === user.id))
      },

      // ============================================
      // Chat Actions
      // ============================================

      sendMessage: (convoyId: string, text: string) => {
        const { user } = get()
        if (!user || !text.trim()) return

        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          convoyId,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          text: text.trim(),
          timestamp: new Date(),
        }

        set((state) => ({
          messages: {
            ...state.messages,
            [convoyId]: [...(state.messages[convoyId] || []), newMessage],
          },
        }))
      },

      getMessages: (convoyId: string): ChatMessage[] => {
        return get().messages[convoyId] || []
      },
    }),
    {
      name: 'camper-convoy-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        convoys: state.convoys,
        messages: state.messages,
      }),
    }
  )
)

// ============================================
// Selectors (für optimierte Re-Renders)
// ============================================

export const selectUser = (state: AppState) => state.user
export const selectIsAuthenticated = (state: AppState) => state.isAuthenticated
export const selectConvoys = (state: AppState) => state.convoys
export const selectMessages = (convoyId: string) => (state: AppState) => state.messages[convoyId] || []


