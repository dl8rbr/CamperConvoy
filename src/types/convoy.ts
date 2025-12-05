// Typen für das Konvoi-Feature

export interface ConvoyWaypoint {
  id: string
  name: string
  lat: number
  lng: number
  order: number
}

export interface ConvoyParticipant {
  id: string
  name: string
  avatar?: string
  joinedAt: Date
  isOrganizer: boolean
}

export interface Convoy {
  id: string
  title: string
  description: string
  startDate: Date
  endDate?: Date
  startLocation: {
    name: string
    lat: number
    lng: number
  }
  destination: {
    name: string
    lat: number
    lng: number
  }
  waypoints: ConvoyWaypoint[]
  participants: ConvoyParticipant[]
  maxParticipants?: number
  organizerId: string
  organizerName: string
  createdAt: Date
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  tags?: string[]
  image?: string
}

export interface CreateConvoyData {
  title: string
  description: string
  startDate: string
  endDate?: string
  startLocation: {
    name: string
    lat: number
    lng: number
  }
  destination: {
    name: string
    lat: number
    lng: number
  }
  waypoints?: Omit<ConvoyWaypoint, 'id'>[]
  maxParticipants?: number
  tags?: string[]
}


