// ============================================================================
// DEPARTURE TYPES
// ============================================================================

export interface Departure {
  id: string
  line_id: string
  vehicle_id?: string
  
  // Horaires
  depart_at: string           // ISO timestamp
  departure_time: string      // "08:00:00"
  arrival_time?: string       // "11:00:00"
  
  // Gare et confort
  departure_station?: string  // "Gare d'Adjamé"
  comfort_type: 'standard' | 'vip' | 'vvip' | 'premium'
  comfort_services: string[]  // ["climatisation", "wifi", "collation"]
  
  // Contacts
  contact_info: ContactInfo
  
  // Tarification et capacité
  price: number
  capacity?: number
  seats_available?: number
  
  // Statut
  status: 'open' | 'closed' | 'cancelled'
  meta: Record<string, any>
  
  created_at: string
  updated_at: string
  
  // Relations (populated by backend)
  line?: {
    id: string
    origin: string
    destination: string
    is_active: boolean
  }
  vehicle?: {
    id: string
    name: string
    plate: string
    type: string
    seats: number
  }
}

export interface ContactInfo {
  phone?: string
  whatsapp?: string
  email?: string
}

export interface CreateDepartureDto {
  line_id: string
  vehicle_id?: string
  
  depart_at: string
  departure_time: string
  arrival_time?: string
  
  departure_station?: string
  comfort_type?: 'standard' | 'vip' | 'vvip' | 'premium'
  comfort_services?: string[]
  
  contact_info?: ContactInfo
  
  price: number
  capacity?: number
  
  status?: 'open' | 'closed' | 'cancelled'
  meta?: Record<string, any>
}

export interface UpdateDepartureDto {
  line_id?: string
  vehicle_id?: string
  
  depart_at?: string
  departure_time?: string
  arrival_time?: string
  
  departure_station?: string
  comfort_type?: 'standard' | 'vip' | 'vvip' | 'premium'
  comfort_services?: string[]
  
  contact_info?: ContactInfo
  
  price?: number
  capacity?: number
  seats_available?: number
  
  status?: 'open' | 'closed' | 'cancelled'
  meta?: Record<string, any>
}

export interface DepartureFilters {
  line_id?: string
  vehicle_id?: string
  status?: 'open' | 'closed' | 'cancelled'
  comfort_type?: string
  departure_station?: string
  date_from?: string  // ISO date
  date_to?: string    // ISO date
}

// Options pour les selects
export const COMFORT_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'vip', label: 'VIP' },
  { value: 'vvip', label: 'VVIP' },
  { value: 'premium', label: 'Premium' }
] as const

export const DEPARTURE_STATUSES = [
  { value: 'open', label: 'Ouvert', color: 'green' },
  { value: 'closed', label: 'Fermé', color: 'gray' },
  { value: 'cancelled', label: 'Annulé', color: 'red' }
] as const

export const COMFORT_SERVICES_OPTIONS = [
  'Climatisation',
  'WiFi',
  'Collation',
  'Boissons',
  'Télévision',
  'Prises USB',
  'Toilettes',
  'Sièges inclinables'
]
