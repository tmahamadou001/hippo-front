// ============================================================================
// VEHICLE TYPES
// ============================================================================

export interface Vehicle {
  id: string
  company_id: string
  name: string
  plate: string
  type: string
  seats: number
  seat_map?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateVehicleDto {
  name: string
  plate: string
  type: string
  seats: number
  seat_map?: Record<string, any>
}

export interface UpdateVehicleDto {
  name?: string
  plate?: string
  type?: string
  seats?: number
  seat_map?: Record<string, any>
}

export interface VehicleFilters {
  type?: string
  search?: string
}

export const VEHICLE_TYPES = [
  { value: 'bus', label: 'Bus' },
  { value: 'minibus', label: 'Minibus' },
  { value: 'van', label: 'Van' },
  { value: 'car', label: 'Voiture' }
] as const
