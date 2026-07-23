/**
 * ============================================================================
 * Seat Template Service
 * ============================================================================
 * Service pour gérer les templates de configuration de sièges
 */

import api from './api'
import type { SeatLayout, SeatMapMetadata } from '@/types/seat'

export interface SeatMapTemplate {
  id: string
  company_id: string | null
  name: string
  description: string
  total_seats: number
  layout: SeatLayout
  metadata: SeatMapMetadata
  preview_url?: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreateSeatMapTemplateDto {
  company_id?: string | null
  name: string
  description?: string
  total_seats: number
  layout: SeatLayout
  metadata?: SeatMapMetadata
  preview_url?: string
}

export interface UpdateSeatMapTemplateDto {
  name?: string
  description?: string
  total_seats?: number
  layout?: SeatLayout
  metadata?: SeatMapMetadata
  preview_url?: string
  is_active?: boolean
}

const seatTemplateService = {
  /**
   * Récupérer tous les templates
   */
  async getAll() {
    const response = await api.get('/seat-map-templates')
    return response.data
  },

  /**
   * Récupérer un template par ID
   */
  async getById(id: string) {
    const response = await api.get(`/seat-map-templates/${id}`)
    return response.data
  },

  /**
   * Créer un nouveau template
   */
  async create(data: CreateSeatMapTemplateDto) {
    const response = await api.post('/seat-map-templates', data)
    return response.data
  },

  /**
   * Mettre à jour un template
   */
  async update(id: string, data: UpdateSeatMapTemplateDto) {
    const response = await api.put(`/seat-map-templates/${id}`, data)
    return response.data
  },

  /**
   * Supprimer un template
   */
  async delete(id: string) {
    const response = await api.delete(`/seat-map-templates/${id}`)
    return response.data
  }
}

export default seatTemplateService
