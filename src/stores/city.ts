// ============================================================================
// CITY STORE - Cache des villes pour affichage rapide
// ============================================================================

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import cityService from '@/services/cityService'
import type { City } from '@/types/city'
import { formatCityName as fallbackFormat } from '@/utils/cityUtils'

export const useCityStore = defineStore('city', () => {
  // State
  const cities = ref<City[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  // Getters
  const cityMap = computed(() => {
    const map = new Map<string, string>()
    cities.value.forEach(city => {
      map.set(city.normalized_name, city.display_name)
    })
    return map
  })

  /**
   * Obtenir le nom d'affichage d'une ville
   * @param normalizedName - Nom normalisé (ex: "bouake")
   * @returns Nom d'affichage (ex: "Bouaké")
   */
  const getDisplayName = (normalizedName: string): string => {
    if (!normalizedName) return ''
    
    // Chercher dans le cache
    const displayName = cityMap.value.get(normalizedName)
    
    // Si trouvé, retourner le vrai nom
    if (displayName) {
      return displayName
    }
    
    // Sinon, utiliser le formatage par défaut
    return fallbackFormat(normalizedName)
  }

  /**
   * Charger toutes les villes actives
   */
  const loadCities = async () => {
    if (loaded.value) return // Déjà chargé
    
    loading.value = true
    try {
      const response = await cityService.getActive()
      cities.value = response.data
      loaded.value = true
    } catch (error) {
      console.error('Error loading cities:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Recharger les villes (force refresh)
   */
  const reloadCities = async () => {
    loaded.value = false
    await loadCities()
  }

  return {
    // State
    cities,
    loading,
    loaded,
    // Getters
    cityMap,
    getDisplayName,
    // Actions
    loadCities,
    reloadCities
  }
})
