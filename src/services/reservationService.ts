// ============================================================================
// RESERVATION SERVICE
// ============================================================================

import api from './api'
import type { Reservation, CreateReservationDto, UpdateReservationDto, ReservationFilters } from '@/types/reservation'

export default {
  /**
   * Get all reservations
   */
  async getAll(filters?: ReservationFilters) {
    const params = new URLSearchParams()
    
    if (filters?.departure_id) {
      params.append('departure_id', filters.departure_id)
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.payment_status) {
      params.append('payment_status', filters.payment_status)
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }

    const queryString = params.toString()
    const url = queryString ? `/reservations?${queryString}` : '/reservations'
    
    const response = await api.get<{ success: boolean; data: Reservation[] }>(url)
    return response.data
  },

  /**
   * Get reservation by ID
   */
  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: Reservation }>(`/reservations/${id}`)
    return response.data
  },

  /**
   * Create a new reservation
   */
  async create(data: CreateReservationDto) {
    const response = await api.post<{ success: boolean; data: Reservation; message: string }>('/reservations', data)
    return response.data
  },

  /**
   * Update a reservation
   */
  async update(id: string, data: UpdateReservationDto) {
    const response = await api.put<{ success: boolean; data: Reservation; message: string }>(`/reservations/${id}`, data)
    return response.data
  },

  /**
   * Cancel a reservation
   */
  async cancel(id: string) {
    const response = await api.patch<{ success: boolean; data: Reservation; message: string }>(`/reservations/${id}/cancel`)
    return response.data
  },

  /**
   * Delete a reservation
   */
  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(`/reservations/${id}`)
    return response.data
  },

  /**
   * Download ticket PDF
   */
  async downloadTicket(id: string) {
    const response = await api.get(`/reservations/${id}/ticket`, {
      responseType: 'blob' // Important pour télécharger un fichier binaire
    })
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `billet-geyavo-${id}.pdf`)
    document.body.appendChild(link)
    link.click()
    
    // Nettoyer
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}
