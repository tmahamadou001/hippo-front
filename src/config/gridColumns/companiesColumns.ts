/**
 * Configuration des colonnes AG Grid pour les Compagnies
 */
import type { ColDef, ValueFormatterParams } from 'ag-grid-community'
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue'

/**
 * Rendu personnalisé pour la compagnie (nom + slug)
 */
const companyCellRenderer = (params: any) => {
  const company = params.data
  if (!company) return '-'
  
  const name = company.name || ''
  const slug = company.slug || ''
  const isSystem = slug === 'geyavo_company'
  
  return `
    <div class="flex items-center gap-2">
      <span class="font-medium text-gray-900">${name}</span>
      <span class="text-xs text-gray-500">(@${slug})</span>
      ${isSystem ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Système</span>' : ''}
    </div>
  `
}

/**
 * Rendu personnalisé pour les statistiques
 */
const statsCellRenderer = (field: string, icon: string) => {
  return (params: any) => {
    const value = params.data?.stats?.[field] || 0
    return `
      <div class="flex items-center gap-1.5">
        <span>${icon}</span>
        <span class="text-gray-700">${value}</span>
      </div>
    `
  }
}

/**
 * Définition des colonnes pour les compagnies
 */
export const companiesColumnDefs: ColDef[] = [
  {
    headerName: 'Compagnie',
    field: 'name',
    cellRenderer: companyCellRenderer,
    minWidth: 280,
    flex: 1,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueGetter: (params) => {
      const company = params.data
      return `${company?.name || ''} ${company?.slug || ''}`
    }
  },
  {
    headerName: 'Email',
    field: 'contact_email',
    minWidth: 200,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueFormatter: (params: ValueFormatterParams) => params.value || '-'
  },
  {
    headerName: 'Téléphone',
    field: 'contact_phone',
    minWidth: 150,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueFormatter: (params: ValueFormatterParams) => params.value || '-'
  },
  {
    headerName: 'Adresse',
    field: 'address',
    minWidth: 200,
    filter: 'agTextColumnFilter',
    sortable: true,
    valueFormatter: (params: ValueFormatterParams) => params.value || '-'
  },
  {
    headerName: 'Utilisateurs',
    field: 'stats.users',
    cellRenderer: statsCellRenderer('users', '👥'),
    minWidth: 130,
    filter: 'agNumberColumnFilter',
    sortable: true,
    type: 'numericColumn',
    headerClass: 'ag-right-aligned-header',
    valueGetter: (params) => params.data?.stats?.users || 0
  },
  {
    headerName: 'Véhicules',
    field: 'stats.vehicles',
    cellRenderer: statsCellRenderer('vehicles', '🚗'),
    minWidth: 130,
    filter: 'agNumberColumnFilter',
    sortable: true,
    type: 'numericColumn',
    headerClass: 'ag-right-aligned-header',
    valueGetter: (params) => params.data?.stats?.vehicles || 0
  },
  {
    headerName: 'Lignes',
    field: 'stats.lines',
    cellRenderer: statsCellRenderer('lines', '🛣️'),
    minWidth: 110,
    filter: 'agNumberColumnFilter',
    sortable: true,
    type: 'numericColumn',
    headerClass: 'ag-right-aligned-header',
    valueGetter: (params) => params.data?.stats?.lines || 0
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
