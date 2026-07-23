/**
 * ============================================================================
 * Reservation Locks Service
 * ============================================================================
 * Service pour gérer les blocages temporaires de places
 */

import { apiClient } from './api'

export interface CreateLockRequest {
  departure_id: string
  number_of_seats: number
  seat_numbers?: string[]
  session_id: string
}

export interface LockResponse {
  success: boolean
  data: {
    lock_id: string
    expires_at: string
    remaining_seconds: number
    number_of_seats: number
  }
}

export interface UpdateLockRequest {
  number_of_seats: number
}

export interface AvailableSeatsResponse {
  success: boolean
  data: {
    departure_id: string
    available_seats: number
  }
}

export const reservationLocksService = {
  /**
   * Créer un lock temporaire (10 minutes)
   */
  async createLock(data: CreateLockRequest): Promise<LockResponse> {
    const response = await apiClient.post<LockResponse>('/reservations/locks', data)
    return response.data
  },

  /**
   * Mettre à jour le nombre de places d'un lock
   */
  async updateLock(lockId: string, data: UpdateLockRequest): Promise<LockResponse> {
    const response = await apiClient.patch<LockResponse>(`/reservations/locks/${lockId}`, data)
    return response.data
  },

  /**
   * Prolonger un lock de 5 minutes
   */
  async extendLock(lockId: string): Promise<LockResponse> {
    const response = await apiClient.patch<LockResponse>(`/reservations/locks/${lockId}/extend`)
    return response.data
  },

  /**
   * Supprimer un lock (libérer les places)
   */
  async deleteLock(lockId: string): Promise<void> {
    await apiClient.delete(`/reservations/locks/${lockId}`)
  },

  /**
   * Obtenir le nombre de places disponibles pour un départ
   */
  async getAvailableSeats(departureId: string): Promise<AvailableSeatsResponse> {
    const response = await apiClient.get<AvailableSeatsResponse>(
      `/reservations/locks/departure/${departureId}/available`
    )
    return response.data
  }
}
