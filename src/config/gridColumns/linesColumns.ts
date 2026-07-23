/**
 * Configuration des colonnes AG Grid pour les Lignes
 */
import type { ColDef, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'
import { useCityStore } from '@/stores/city'

/**
 * Formateurs de valeurs
 */
const priceFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '-'
  return `${params.value.toLocaleString('fr-FR')} XOF`
}

const distanceFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '-'
  return `${params.value} km`
}

const durationFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '-'
  // Format PostgreSQL interval (ex: "03:30:00" -> "3h30")
  const match = params.value.match(/(\d+):(\d+):(\d+)/)
  if (match) {
    const hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    return `${hours}h${minutes > 0 ? minutes.toString().padStart(2, '0') : ''}`
  }
  return params.value
}

/**
 * Rendu personnalisé pour la ligne (origine → destination)
 */
const routeCellRenderer = (params: any) => {
  const cityStore = useCityStore()
  const origin = cityStore.getDisplayName(params.data.origin)
  const destination = cityStore.getDisplayName(params.data.destination)
  
  return `
    <div class="flex items-center gap-2">
      <span class="font-medium text-gray-900">${origin}</span>
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="font-medium text-gray-900">${destination}</span>
    </div>
  `
}

/**
 * Rendu personnalisé pour le statut avec badge coloré
 */
const statusCellRenderer = (params: any) => {
  const isActive = params.value
  
  if (isActive) {
    return `
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    `
  }
  
  return `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      Inactive
    </span>
  `
}

/**
 * Rendu personnalisé pour les arrêts
 */
const stopsCellRenderer = (params: any) => {
  const stops = params.value
  if (!stops || stops.length === 0) {
    return '<span class="text-gray-400">-</span>'
  }
  
  if (stops.length <= 2) {
    return `
      <div class="flex flex-wrap gap-1">
        ${stops.map((stop: string) => `
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
            ${stop}
          </span>
        `).join('')}
      </div>
    `
  }
  
  return `
    <div class="flex items-center gap-1">
      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
        ${stops[0]}
      </span>
      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
        +${stops.length - 1}
      </span>
    </div>
  `
}

/**
 * Définition des colonnes pour les lignes
 */
export const linesColumnDefs: ColDef[] = [
  {
    headerName: 'Ligne',
    field: 'origin',
    cellRenderer: routeCellRenderer,
    minWidth: 280,
    flex: 1,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueGetter: (params: ValueGetterParams) => {
      const cityStore = useCityStore()
      const origin = cityStore.getDisplayName(params.data?.origin)
      const destination = cityStore.getDisplayName(params.data?.destination)
      return `${origin} ${destination}`
    }
  },
  {
    headerName: 'Distance',
    field: 'distance_km',
    valueFormatter: distanceFormatter,
    minWidth: 120,
    filter: 'agNumberColumnFilter',
    sortable: true,
    type: 'numericColumn',
    headerClass: 'ag-right-aligned-header'
  },
  {
    headerName: 'Durée',
    field: 'estimated_duration',
    valueFormatter: durationFormatter,
    minWidth: 120,
    filter: 'agTextColumnFilter',
    sortable: true
  },
  {
    headerName: 'Prix de base',
    field: 'base_price',
    valueFormatter: priceFormatter,
    minWidth: 140,
    filter: 'agNumberColumnFilter',
    sortable: true,
    type: 'numericColumn',
    headerClass: 'ag-right-aligned-header'
  },
  {
    headerName: 'Arrêts',
    field: 'stops',
    cellRenderer: stopsCellRenderer,
    minWidth: 200,
    filter: false,
    sortable: false,
    valueGetter: (params: ValueGetterParams) => {
      const stops = params.data?.stops
      return stops ? stops.length : 0
    }
  },
  {
    headerName: 'Statut',
    field: 'is_active',
    cellRenderer: statusCellRenderer,
    minWidth: 120,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueFormatter: (params: ValueFormatterParams) => params.value ? 'Active' : 'Inactive'
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
    const visibleActions = this.actions.filter(action => 
      !action.condition || action.condition(this.data)
    )
    const estimatedMenuHeight = visibleActions.length * 44
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
      // Vérifier la condition si elle existe
      if (action.condition && !action.condition(this.data)) {
        return
      }

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
 * Rendu personnalisé pour la compagnie avec chip
 */
const companyCellRenderer = (params: any) => {
  const companyName = params.data?.company?.name
  if (!companyName) return '-'
  
  return `
    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
      ${companyName}
    </span>
  `
}

/**
 * Créer la colonne Compagnie (visible uniquement pour Geyavo)
 */
export const createCompanyColumn = (): ColDef => ({
  headerName: 'Compagnie',
  field: 'company.name',
  cellRenderer: companyCellRenderer,
  minWidth: 180,
  filter: 'agTextColumnFilter',
  sortable: true,
  valueGetter: (params) => params.data?.company?.name || '-'
})

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
