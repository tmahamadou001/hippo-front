// ============================================================================
// CITY SERVICE
// ============================================================================

import api from './api'
import type { City, CitySearchFilters } from '@/types/city'

export default {
  /**
   * Get all cities
   */
  async getAll(filters?: CitySearchFilters) {
    const params = new URLSearchParams()
    
    if (filters?.search) {
      params.append('search', filters.search)
    }
    if (filters?.country) {
      params.append('country', filters.country)
    }
    if (filters?.region) {
      params.append('region', filters.region)
    }
    if (filters?.is_active !== undefined) {
      params.append('is_active', String(filters.is_active))
    }

    const queryString = params.toString()
    const url = queryString ? `/cities?${queryString}` : '/cities'
    
    const response = await api.get<{ success: boolean; data: City[] }>(url)
    return response.data
  },

  /**
   * Get active cities only
   */
  async getActive() {
    const response = await api.get<{ success: boolean; data: City[] }>('/cities/active')
    return response.data
  },

  /**
   * Search cities (autocomplete)
   */
  async search(query: string) {
    const response = await api.get<{ success: boolean; data: City[] }>(`/cities/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  /**
   * Get city by ID
   */
  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: City }>(`/cities/${id}`)
    return response.data
  },

  /**
   * Get city by normalized name
   */
  async getByNormalizedName(name: string) {
    const response = await api.get<{ success: boolean; data: City }>(`/cities/name/${name}`)
    return response.data
  }
}
