// ============================================================================
// RESERVATION TYPES
// ============================================================================

export interface Reservation {
  id: string
  departure_id: string
  seat_number?: string
  passenger_name: string
  passenger_email?: string
  passenger_phone: string
  price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired'
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_method?: string
  expires_at?: string
  created_at: string
  updated_at: string
  
  // Relations
  departure?: {
    id: string
    depart_at: string
    departure_time: string
    line?: {
      origin: string
      destination: string
    }
  }
}

export interface CreateReservationDto {
  departure_id: string
  seat_number?: string
  passenger_name: string
  passenger_email?: string
  passenger_phone: string
  price: number
  payment_method?: string
}

export interface UpdateReservationDto {
  seat_number?: string
  passenger_name?: string
  passenger_email?: string
  passenger_phone?: string
  price?: number
  status?: 'pending' | 'confirmed' | 'cancelled'
  payment_status?: 'pending' | 'paid' | 'refunded'
  payment_method?: string
}

export interface ReservationFilters {
  departure_id?: string
  status?: 'pending' | 'confirmed' | 'cancelled'
  payment_status?: 'pending' | 'paid' | 'refunded'
  search?: string
}

export const RESERVATION_STATUSES = [
  { value: 'pending', label: 'En attente', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmée', color: 'green' },
  { value: 'cancelled', label: 'Annulée', color: 'red' },
  { value: 'expired', label: 'Expirée', color: 'gray' }
] as const

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'En attente', color: 'yellow' },
  { value: 'paid', label: 'Payé', color: 'green' },
  { value: 'refunded', label: 'Remboursé', color: 'gray' }
] as const

export const PAYMENT_METHODS = [
  'Espèces',
  'Mobile Money',
  'Orange Money',
  'MTN Money',
  'Wave',
  'Carte bancaire'
]
