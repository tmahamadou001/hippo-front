// ============================================================================
// DEPARTURE SERVICE
// ============================================================================

import api from './api'
import type { Departure, CreateDepartureDto, UpdateDepartureDto, DepartureFilters } from '@/types/departure'

export default {
  /**
   * Search departures with pagination (for autocomplete)
   */
  async search(search: string, offset: number, limit: number) {
    const params = new URLSearchParams()
    
    if (search) {
      params.append('search', search)
    }
    params.append('offset', offset.toString())
    params.append('limit', limit.toString())
    
    const response = await api.get<{ 
      success: boolean
      data: Departure[]
      total: number
      hasMore: boolean
    }>(`/departures/search?${params.toString()}`)
    
    return response.data
  },

  /**
   * Get all departures
   */
  async getAll(filters?: DepartureFilters) {
    const params = new URLSearchParams()
    
    if (filters?.line_id) {
      params.append('line_id', filters.line_id)
    }
    if (filters?.vehicle_id) {
      params.append('vehicle_id', filters.vehicle_id)
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.comfort_type) {
      params.append('comfort_type', filters.comfort_type)
    }
    if (filters?.departure_station) {
      params.append('departure_station', filters.departure_station)
    }
    if (filters?.date_from) {
      params.append('date_from', filters.date_from)
    }
    if (filters?.date_to) {
      params.append('date_to', filters.date_to)
    }

    const queryString = params.toString()
    const url = queryString ? `/departures?${queryString}` : '/departures'
    
    const response = await api.get<{ success: boolean; data: Departure[] }>(url)
    return response.data
  },

  /**
   * Get departure by ID
   */
  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: Departure }>(`/departures/${id}`)
    return response.data
  },

  /**
   * Create a new departure
   */
  async create(data: CreateDepartureDto) {
    const response = await api.post<{ success: boolean; data: Departure; message: string }>('/departures', data)
    return response.data
  },

  /**
   * Update a departure
   */
  async update(id: string, data: UpdateDepartureDto) {
    const response = await api.put<{ success: boolean; data: Departure; message: string }>(`/departures/${id}`, data)
    return response.data
  },

  /**
   * Delete a departure
   */
  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(`/departures/${id}`)
    return response.data
  },

  /**
   * Cancel a departure
   */
  async cancel(id: string) {
    const response = await api.patch<{ success: boolean; data: Departure; message: string }>(`/departures/${id}/cancel`)
    return response.data
  }
}
