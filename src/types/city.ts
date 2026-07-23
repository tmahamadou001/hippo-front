// ============================================================================
// CITY TYPES
// ============================================================================

export interface City {
  id: string
  normalized_name: string  // "abidjan", "san-pedro"
  display_name: string     // "Abidjan", "San-Pédro"
  country: string          // "CI"
  region?: string          // "District d'Abidjan"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CitySearchFilters {
  search?: string
  country?: string
  region?: string
  is_active?: boolean
}
