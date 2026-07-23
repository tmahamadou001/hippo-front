// ============================================================================
// COMPOSABLE: City Display
// ============================================================================

import { useCityStore } from '@/stores/city'

/**
 * Composable pour afficher les noms de villes avec les accents corrects
 * 
 * @example
 * const { getCityName } = useCityDisplay()
 * getCityName('bouake') // "Bouaké"
 */
export function useCityDisplay() {
  const cityStore = useCityStore()

  /**
   * Obtenir le nom d'affichage d'une ville
   * @param normalizedName - Nom normalisé (ex: "bouake")
   * @returns Nom d'affichage (ex: "Bouaké")
   */
  const getCityName = (normalizedName: string): string => {
    return cityStore.getDisplayName(normalizedName)
  }

  /**
   * Charger les villes si pas encore fait
   */
  const ensureCitiesLoaded = async () => {
    await cityStore.loadCities()
  }

  return {
    getCityName,
    ensureCitiesLoaded,
    cityStore
  }
}
