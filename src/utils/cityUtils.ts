// ============================================================================
// CITY UTILITIES
// ============================================================================

/**
 * Normalise un nom de ville pour la base de données
 */
export function normalizeCityName(city: string): string {
  if (!city) return ''
  
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

/**
 * Formate un nom de ville pour l'affichage
 */
export function formatCityName(normalizedCity: string): string {
  if (!normalizedCity) return ''
  
  return normalizedCity
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Vérifie si deux noms de villes sont équivalents
 */
export function areCitiesEqual(city1: string, city2: string): boolean {
  return normalizeCityName(city1) === normalizeCityName(city2)
}
