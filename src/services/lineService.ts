// ============================================================================
// LINE SERVICE
// ============================================================================

import api from './api'
import type { Line, CreateLineDto, UpdateLineDto, LineFilters } from '@/types/line'

export default {
  /**
   * Search lines with pagination (for autocomplete)
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
      data: Line[]
      total: number
      hasMore: boolean
    }>(`/lines/search?${params.toString()}`)

    return response.data
  },

  /**
   * Get all lines
   */
  async getAll(filters?: LineFilters) {
    const params = new URLSearchParams()
    
    if (filters?.origin) {
      params.append('origin', filters.origin)
    }
    if (filters?.destination) {
      params.append('destination', filters.destination)
    }
    if (filters?.is_active !== undefined) {
      params.append('is_active', String(filters.is_active))
    }

    const queryString = params.toString()
    const url = queryString ? `/lines?${queryString}` : '/lines'
    
    const response = await api.get<{ success: boolean; data: Line[] }>(url)
    return response.data
  },

  /**
   * Get active lines only
   */
  async getActive() {
    const response = await api.get<{ success: boolean; data: Line[] }>('/lines/active')
    return response.data
  },

  /**
   * Get line by ID
   */
  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: Line }>(`/lines/${id}`)
    return response.data
  },

  /**
   * Create a new line
   */
  async create(data: CreateLineDto) {
    const response = await api.post<{ success: boolean; data: Line; message: string }>('/lines', data)
    return response.data
  },

  /**
   * Update a line
   */
  async update(id: string, data: UpdateLineDto) {
    const response = await api.put<{ success: boolean; data: Line; message: string }>(`/lines/${id}`, data)
    return response.data
  },

  /**
   * Delete a line
   */
  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(`/lines/${id}`)
    return response.data
  },

  /**
   * Toggle line active status
   */
  async toggleActive(id: string) {
    const response = await api.patch<{ success: boolean; data: Line; message: string }>(`/lines/${id}/toggle`)
    return response.data
  }
}
