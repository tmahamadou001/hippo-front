/**
 * Configuration des colonnes AG Grid pour les Horaires
 */
import type { ColDef, ValueFormatterParams } from 'ag-grid-community'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'

/**
 * Formateur pour la ligne (origin → destination)
 */
const lineFormatter = (params: ValueFormatterParams) => {
  const line = params.data?.line
  if (!line) return '-'
  return `${line.origin} → ${line.destination}`
}

/**
 * Formateur pour le type de récurrence
 */
const recurrenceFormatter = (params: ValueFormatterParams) => {
  const typeMap: Record<string, string> = {
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    custom: 'Personnalisé'
  }
  return typeMap[params.value] || params.value
}

/**
 * Formateur pour les jours de la semaine
 */
const daysFormatter = (params: ValueFormatterParams) => {
  const recurrenceType = params.data?.recurrence_type
  if (recurrenceType === 'daily') return 'Tous les jours'
  
  const days = params.value
  if (!days || !Array.isArray(days) || days.length === 0) return '-'
  
  const dayNames: Record<number, string> = {
    1: 'Lun',
    2: 'Mar',
    3: 'Mer',
    4: 'Jeu',
    5: 'Ven',
    6: 'Sam',
    7: 'Dim'
  }
  
  // Si tous les jours de la semaine
  if (days.length === 7) return 'Tous les jours'
  
  // Si Lun-Ven
  if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) return 'Lun-Ven'
  
  // Si Sam-Dim
  if (days.length === 2 && days.includes(6) && days.includes(7)) return 'Sam-Dim'
  
  // Sinon, afficher les jours
  return days.sort().map(d => dayNames[d]).join(', ')
}

/**
 * Formateur pour l'heure
 */
const timeFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '-'
  // Format HH:MM
  return params.value.substring(0, 5)
}

/**
 * Formateur pour le prix
 */
const priceFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '-'
  return `${params.value.toLocaleString('fr-FR')} FCFA`
}

/**
 * Formateur pour le type de confort
 */
const comfortFormatter = (params: ValueFormatterParams) => {
  const comfortMap: Record<string, string> = {
    standard: 'Standard',
    vip: 'VIP',
    vvip: 'VVIP',
    premium: 'Premium'
  }
  return comfortMap[params.value] || params.value
}

/**
 * Cell renderer pour le statut
 */
const statusCellRenderer = (params: any) => {
  const isActive = params.value
  const colorClass = isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  const text = isActive ? 'Actif' : 'Inactif'
  
  return `<span class="px-2 py-1 text-xs font-medium rounded-full ${colorClass}">${text}</span>`
}

/**
 * Définition des colonnes pour les horaires
 */
export const schedulesColumnDefs: ColDef[] = [
  {
    headerName: 'Ligne',
    field: 'line',
    valueFormatter: lineFormatter,
    minWidth: 220,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueGetter: (params) => {
      const line = params.data?.line
      return line ? `${line.origin} ${line.destination}` : ''
    }
  },
  {
    headerName: 'Gare',
    field: 'departure_station',
    minWidth: 160,
    filter: 'agTextColumnFilter',
    sortable: true
  },
  {
    headerName: 'Récurrence',
    field: 'recurrence_type',
    valueFormatter: recurrenceFormatter,
    minWidth: 130,
    filter: 'agTextColumnFilter',
    sortable: true
  },
  {
    headerName: 'Jours',
    field: 'days_of_week',
    valueFormatter: daysFormatter,
    minWidth: 140,
    filter: false,
    sortable: false
  },
  {
    headerName: 'Heure',
    field: 'departure_time',
    valueFormatter: timeFormatter,
    minWidth: 100,
    filter: 'agTextColumnFilter',
    sortable: true
  },
  {
    headerName: 'Confort',
    field: 'default_comfort_type',
    valueFormatter: comfortFormatter,
    minWidth: 110,
    filter: 'agTextColumnFilter',
    sortable: true
  },
  {
    headerName: 'Prix',
    field: 'default_price',
    valueFormatter: priceFormatter,
    minWidth: 130,
    filter: 'agNumberColumnFilter',
    type: 'numericColumn',
    sortable: true
  },
  {
    headerName: 'Statut',
    field: 'is_active',
    cellRenderer: statusCellRenderer,
    minWidth: 110,
    filter: 'agTextColumnFilter',
    sortable: true
  }
]

/**
 * Configuration par défaut des colonnes
 */
export const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  floatingFilter: false
}

/**
 * Variable statique pour garder une référence au menu ouvert
 */
let currentOpenMenu: ActionsCellRenderer | null = null

/**
 * Cell Renderer pour les actions (menu à 3 points)
 */
class ActionsCellRenderer {
  private eGui!: HTMLDivElement
  private actions: ActionMenuItem[] = []
  private data: any
  private isMenuOpen = false
  private menuElement: HTMLDivElement | null = null

  init(params: any) {
    this.actions = params.colDef?.cellRendererParams?.actions || params.actions || []
    this.data = params.data

    // Créer le conteneur principal
    this.eGui = document.createElement('div')
    this.eGui.className = 'relative flex items-center justify-center h-full'
    this.eGui.style.overflow = 'visible'
    this.eGui.style.position = 'relative'
    
    // Créer le bouton 3 points
    const button = document.createElement('button')
    button.className = 'p-2 hover:bg-gray-100 rounded-lg transition-colors'
    button.style.cursor = 'pointer'
    button.type = 'button'
    button.innerHTML = `
      <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    `
    
    // Event listener pour ouvrir/fermer le menu
    button.addEventListener('click', (e: Event) => {
      e.stopPropagation()
      e.preventDefault()
      this.toggleMenu()
    }, true)

    this.eGui.appendChild(button)
  }

  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu()
    } else {
      this.openMenu()
    }
  }

  openMenu() {
    // Fermer le menu précédent s'il existe
    if (currentOpenMenu && currentOpenMenu !== this) {
      currentOpenMenu.closeMenu()
    }
    
    this.isMenuOpen = true
    currentOpenMenu = this

    // Obtenir la position du bouton
    const buttonRect = this.eGui.getBoundingClientRect()

    // Créer le menu
    this.menuElement = document.createElement('div')
    this.menuElement.className = 'fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1'
    this.menuElement.style.zIndex = '9999'
    
    // Calculer la hauteur estimée du menu
    const estimatedMenuHeight = this.actions.length * 44
    const spaceBelow = window.innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    
    // Décider si on ouvre vers le haut ou vers le bas
    const openUpward = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow
    
    if (openUpward) {
      this.menuElement.style.bottom = `${window.innerHeight - buttonRect.top + 8}px`
    } else {
      this.menuElement.style.top = `${buttonRect.bottom + 8}px`
    }
    
    this.menuElement.style.right = `${window.innerWidth - buttonRect.right}px`
    
    // Ajouter les actions
    this.actions.forEach((action) => {
      const actionButton = document.createElement('button')
      actionButton.className = `w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${action.className || 'text-gray-700'}`
      actionButton.type = 'button'
      
      // Ajouter l'icône si présente
      if (action.iconPath) {
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        icon.setAttribute('class', 'w-4 h-4')
        icon.setAttribute('fill', 'none')
        icon.setAttribute('stroke', 'currentColor')
        icon.setAttribute('viewBox', '0 0 24 24')
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('stroke-linecap', 'round')
        path.setAttribute('stroke-linejoin', 'round')
        path.setAttribute('stroke-width', '2')
        path.setAttribute('d', action.iconPath)
        
        icon.appendChild(path)
        actionButton.appendChild(icon)
      }
      
      // Ajouter le label
      const label = document.createElement('span')
      label.textContent = action.label
      actionButton.appendChild(label)
      
      // Event listener pour l'action
      actionButton.addEventListener('click', (e) => {
        e.stopPropagation()
        action.onClick(this.data)
        this.closeMenu()
      })
      
      this.menuElement!.appendChild(actionButton)
    })

    // Ajouter le menu au body
    document.body.appendChild(this.menuElement)

    // Fermer le menu si on clique en dehors
    setTimeout(() => {
      document.addEventListener('click', this.handleClickOutside)
    }, 0)
  }

  closeMenu() {
    if (this.menuElement) {
      this.menuElement.remove()
      this.menuElement = null
    }
    this.isMenuOpen = false
    if (currentOpenMenu === this) {
      currentOpenMenu = null
    }
    document.removeEventListener('click', this.handleClickOutside)
  }

  handleClickOutside = (e: MouseEvent) => {
    if (this.eGui && !this.eGui.contains(e.target as Node)) {
      this.closeMenu()
    }
  }

  getGui() {
    return this.eGui
  }

  refresh() {
    return false
  }

  destroy() {
    this.closeMenu()
  }
}

/**
 * Créer la colonne d'actions avec menu à 3 points
 */
export const createActionsColumn = (actions: ActionMenuItem[]): ColDef => ({
  headerName: '',
  field: 'actions',
  cellRenderer: ActionsCellRenderer,
  cellRendererParams: {
    actions
  },
  minWidth: 80,
  maxWidth: 80,
  sortable: false,
  filter: false,
  resizable: false,
  pinned: 'right',
  lockPosition: 'right',
  suppressMovable: true
})

/**
 * Créer la colonne Compagnie (visible uniquement pour Geyavo)
 */
export const createCompanyColumn = (): ColDef => ({
  headerName: 'Compagnie',
  field: 'company.name',
  minWidth: 160,
  filter: 'agTextColumnFilter',
  sortable: true,
  valueGetter: (params) => params.data?.company?.name || '-'
})
