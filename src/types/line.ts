// ============================================================================
// LINE TYPES
// ============================================================================

export interface Line {
  id: string
  company_id: string
  origin: string
  destination: string
  estimated_duration?: string
  base_price?: number
  distance_km?: number
  stops?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateLineDto {
  origin: string
  destination: string
  estimated_duration?: string
  base_price?: number
  distance_km?: number
  stops?: string[]
  is_active?: boolean
}

export interface UpdateLineDto {
  origin?: string
  destination?: string
  estimated_duration?: string
  base_price?: number
  distance_km?: number
  stops?: string[]
  is_active?: boolean
}

export interface LineFilters {
  origin?: string
  destination?: string
  is_active?: boolean
}
