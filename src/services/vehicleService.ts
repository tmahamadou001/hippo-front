// ============================================================================
// VEHICLE SERVICE
// ============================================================================

import api from './api'
import type { Vehicle, CreateVehicleDto, UpdateVehicleDto, VehicleFilters } from '@/types/vehicle'
import type { SeatMap } from '@/types/seat'

export default {
  /**
   * Get all vehicles
   */
  async getAll(filters?: VehicleFilters) {
    const params = new URLSearchParams()
    
    if (filters?.type) {
      params.append('type', filters.type)
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }

    const queryString = params.toString()
    const url = queryString ? `/vehicles?${queryString}` : '/vehicles'
    
    const response = await api.get<{ success: boolean; data: Vehicle[] }>(url)
    return response.data
  },

  /**
   * Get vehicle by ID
   */
  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`)
    return response.data
  },

  /**
   * Create a new vehicle
   */
  async create(data: CreateVehicleDto) {
    const response = await api.post<{ success: boolean; data: Vehicle; message: string }>('/vehicles', data)
    return response.data
  },

  /**
   * Update a vehicle
   */
  async update(id: string, data: UpdateVehicleDto) {
    const response = await api.put<{ success: boolean; data: Vehicle; message: string }>(`/vehicles/${id}`, data)
    return response.data
  },

  /**
   * Delete a vehicle
   */
  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(`/vehicles/${id}`)
    return response.data
  },

  // ============================================================================
  // SEAT MAP METHODS
  // ============================================================================

  /**
   * Get seat map for a vehicle
   */
  async getSeatMap(vehicleId: string) {
    const response = await api.get<{ success: boolean; data: SeatMap | null }>(`/vehicles/${vehicleId}/seat-map`)
    return response.data
  },

  /**
   * Update seat map for a vehicle
   */
  async updateSeatMap(vehicleId: string, seatMap: SeatMap) {
    const response = await api.put<{ success: boolean; data: SeatMap; message: string }>(`/vehicles/${vehicleId}/seat-map`, seatMap)
    return response.data
  },

  /**
   * Generate seat map from template
   */
  async generateSeatMapFromTemplate(vehicleId: string, templateId: string) {
    const response = await api.post<{ success: boolean; data: SeatMap; message: string }>(`/vehicles/${vehicleId}/seat-map/generate`, { templateId })
    return response.data
  }
}
