/**
 * Configuration des colonnes AG Grid pour les Départs
 */
import type { ColDef, ValueFormatterParams } from 'ag-grid-community'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'

/**
 * Formateurs de valeurs
 */
const dateFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '-'
  const date = new Date(params.value)
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

const timeFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '-'
  return params.value.slice(0, 5) // HH:MM
}

const priceFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '-'
  return `${params.value.toLocaleString('fr-FR')} XOF`
}

const statusFormatter = (params: ValueFormatterParams) => {
  const statusMap: Record<string, string> = {
    open: 'Ouvert',
    closed: 'Fermé',
    cancelled: 'Annulé'
  }
  return statusMap[params.value] || params.value
}

/**
 * Rendu personnalisé pour le statut avec badge coloré
 */
const statusCellRenderer = (params: any) => {
  const status = params.value
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ouvert' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Fermé' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' }
  }
  
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
  
  return `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}">
      ${config.label}
    </span>
  `
}

/**
 * Rendu personnalisé pour le type de confort
 */
const comfortTypeCellRenderer = (params: any) => {
  const type = params.value
  return `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      ${type || 'Standard'}
    </span>
  `
}

/**
 * Rendu personnalisé pour la ligne (origine → destination)
 */
const lineCellRenderer = (params: any) => {
  const line = params.data.line
  if (!line) return '-'
  
  return `
    <div class="flex items-center gap-2">
      <span class="font-medium">${line.origin}</span>
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="font-medium">${line.destination}</span>
    </div>
  `
}

/**
 * Rendu personnalisé pour la source (auto vs manuel)
 */
const sourceCellRenderer = (params: any) => {
  const hasSchedule = params.data?.schedule_id
  
  if (hasSchedule) {
    return `
      <div class="flex items-center gap-1.5">
        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="text-xs font-medium text-blue-700">Auto</span>
      </div>
    `
  } else {
    return `
      <div class="flex items-center gap-1.5">
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span class="text-xs font-medium text-gray-700">Manuel</span>
      </div>
    `
  }
}

/**
 * Définition des colonnes pour les départs
 */
export const departuresColumnDefs: ColDef[] = [
  {
    headerName: 'Ligne',
    field: 'line',
    cellRenderer: lineCellRenderer,
    minWidth: 250,
    flex: 1,
    filter: 'agTextColumnFilter',
    sortable: true
  },
  {
    headerName: 'Source',
    field: 'schedule_id',
    cellRenderer: sourceCellRenderer,
    minWidth: 100,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueFormatter: (params) => params.value ? 'Auto' : 'Manuel'
  },
  {
    headerName: 'Date',
    field: 'depart_at',
    valueFormatter: dateFormatter,
    minWidth: 120,
    filter: 'agDateColumnFilter',
    sortable: true
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
    headerName: 'Véhicule',
    field: 'vehicle.name',
    minWidth: 150,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueGetter: (params) => params.data?.vehicle?.name || params.data?.vehicle?.plate || '-'
  },
  {
    headerName: 'Gare',
    field: 'departure_station',
    minWidth: 150,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueFormatter: (params) => params.value || '-'
  },
  {
    headerName: 'Prix',
    field: 'price',
    valueFormatter: priceFormatter,
    minWidth: 120,
    filter: 'agNumberColumnFilter',
    sortable: true,
    type: 'numericColumn',
    headerClass: 'ag-right-aligned-header'
  },
  {
    headerName: 'Places dispo.',
    field: 'seats_available',
    minWidth: 130,
    filter: 'agNumberColumnFilter',
    sortable: true,
    type: 'numericColumn',
    headerClass: 'ag-right-aligned-header',
    cellStyle: (params) => {
      const available = params.value || 0
      const total = params.data.capacity || params.data.vehicle?.seats || 0
      const percentage = total > 0 ? (available / total) * 100 : 0
      
      if (percentage < 20) {
        return { color: '#dc2626', fontWeight: '700' } // Rouge
      } else if (percentage < 50) {
        return { color: '#f59e0b', fontWeight: '400' } // Orange
      }
      return { color: '#059669', fontWeight: '400' } // Vert
    }
  },
  {
    headerName: 'Confort',
    field: 'comfort_type',
    cellRenderer: comfortTypeCellRenderer,
    minWidth: 120,
    filter: 'agTextColumnFilter',
    sortable: true
  },
  {
    headerName: 'Statut',
    field: 'status',
    cellRenderer: statusCellRenderer,
    minWidth: 120,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueFormatter: statusFormatter
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
 * Rendu personnalisé pour la compagnie avec chip
 */
const companyCellRenderer = (params: any) => {
  const companyName = params.data?.line?.company?.name
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
  field: 'line.company.name',
  cellRenderer: companyCellRenderer,
  minWidth: 180,
  filter: 'agTextColumnFilter',
  sortable: true,
  valueGetter: (params) => params.data?.line?.company?.name || '-'
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
