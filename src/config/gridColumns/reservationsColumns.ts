// ============================================================================
// AG Grid Column Definitions: Reservations
// ============================================================================

import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import type { ActionMenuItem } from '@/components/common/ActionMenu.vue';

// Formateurs de valeurs
const dateFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '-';
  return new Date(params.value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const priceFormatter = (params: ValueFormatterParams) => {
  if (!params.value) return '-';
  return `${params.value.toLocaleString('fr-FR')} FCFA`;
};

const statusFormatter = (params: ValueFormatterParams) => {
  const statusMap: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    cancelled: 'Annulée',
    expired: 'Expirée'
  };
  return statusMap[params.value] || params.value;
};

const paymentStatusFormatter = (params: ValueFormatterParams) => {
  const statusMap: Record<string, string> = {
    pending: 'En attente',
    paid: 'Payée',
    failed: 'Échouée',
    refunded: 'Remboursée'
  };
  return statusMap[params.value] || params.value;
};

const paymentMethodFormatter = (params: ValueFormatterParams) => {
  const methodMap: Record<string, string> = {
    'Mobile Money': 'Mobile Money',
    'Cash': 'Espèces',
    'Card': 'Carte bancaire'
  };
  return methodMap[params.value] || params.value;
};

// Cell Renderers personnalisés
const statusCellRenderer = (params: any) => {
  const status = params.value;
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800'
  };
  
  const colorClass = colors[status] || 'bg-gray-100 text-gray-800';
  const text = statusFormatter(params);
  
  return `<span class="px-2 py-1 text-xs font-medium rounded-full ${colorClass}">${text}</span>`;
};

const paymentStatusCellRenderer = (params: any) => {
  const status = params.value;
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800'
  };
  
  const colorClass = colors[status] || 'bg-gray-100 text-gray-800';
  const text = paymentStatusFormatter(params);
  
  return `<span class="px-2 py-1 text-xs font-medium rounded-full ${colorClass}">${text}</span>`;
};

// Définition des colonnes
export const reservationsColumnDefs: ColDef[] = [
  {
    headerName: 'Passager',
    field: 'passenger_name',
    width: 200,
    pinned: 'left',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    filter: 'agTextColumnFilter',
    suppressSizeToFit: true
  },
  {
    headerName: 'Téléphone',
    field: 'passenger_phone',
    width: 160,
    filter: 'agTextColumnFilter',
    suppressSizeToFit: true
  },
  {
    headerName: 'Statut',
    field: 'status',
    width: 140,
    cellRenderer: statusCellRenderer,
    filter: 'agTextColumnFilter',
    suppressSizeToFit: true
  },
  {
    headerName: 'Paiement',
    field: 'payment_status',
    width: 140,
    cellRenderer: paymentStatusCellRenderer,
    filter: 'agTextColumnFilter',
    suppressSizeToFit: true
  },
  {
    headerName: 'Email',
    field: 'passenger_email',
    width: 240,
    filter: 'agTextColumnFilter',
    suppressSizeToFit: true
  },
  {
    headerName: 'Prix',
    field: 'price',
    width: 140,
    valueFormatter: priceFormatter,
    filter: 'agNumberColumnFilter',
    type: 'numericColumn',
    cellStyle: { fontWeight: '600', color: '#059669' },
    suppressSizeToFit: true
  },
  {
    headerName: 'Méthode',
    field: 'payment_method',
    width: 160,
    valueFormatter: paymentMethodFormatter,
    filter: 'agTextColumnFilter',
    suppressSizeToFit: true
  },
  {
    headerName: 'Départ',
    field: 'departure.line.origin.name',
    width: 140,
    valueGetter: (params) => {
      return params.data?.departure?.line?.origin?.name || '-';
    },
    suppressSizeToFit: true
  },
  {
    headerName: 'Destination',
    field: 'departure.line.destination.name',
    width: 140,
    valueGetter: (params) => {
      return params.data?.departure?.line?.destination?.name || '-';
    },
    suppressSizeToFit: true
  },
  {
    headerName: 'Date départ',
    field: 'departure.departure_date',
    width: 180,
    valueFormatter: dateFormatter,
    filter: 'agDateColumnFilter',
    valueGetter: (params) => {
      return params.data?.departure?.departure_date || null;
    },
    suppressSizeToFit: true
  },
  {
    headerName: 'Date réservation',
    field: 'reserved_at',
    width: 180,
    valueFormatter: dateFormatter,
    filter: 'agDateColumnFilter',
    suppressSizeToFit: true
  },
  {
    headerName: 'Date paiement',
    field: 'paid_at',
    width: 180,
    valueFormatter: dateFormatter,
    filter: 'agDateColumnFilter',
    suppressSizeToFit: true
  },
  {
    headerName: 'Expire le',
    field: 'expires_at',
    width: 180,
    valueFormatter: dateFormatter,
    filter: 'agDateColumnFilter',
    suppressSizeToFit: true,
    cellStyle: (params) => {
      if (!params.value) return null;
      const expiresAt = new Date(params.value);
      const now = new Date();
      if (expiresAt < now && params.data?.status === 'pending') {
        return { color: '#dc2626', fontWeight: '600' };
      }
      return null;
    }
  }
];

// Variable statique pour garder une référence au menu ouvert
let currentOpenMenu: ActionsCellRenderer | null = null;

// Cell Renderer pour les actions (HTML natif)
class ActionsCellRenderer {
  private eGui!: HTMLDivElement;
  private actions: ActionMenuItem[] = [];
  private data: any;
  private isMenuOpen = false;
  private menuElement: HTMLDivElement | null = null;

  init(params: any) {
    console.log('ActionsCellRenderer init - params:', params);
    
    this.actions = params.colDef?.cellRendererParams?.actions || params.actions || [];
    this.data = params.data;

    console.log('ActionsCellRenderer init - actions:', this.actions);
    console.log('ActionsCellRenderer init - data:', this.data);

    // Créer le conteneur principal
    this.eGui = document.createElement('div');
    this.eGui.className = 'relative flex items-center justify-center h-full';
    this.eGui.style.overflow = 'visible';
    this.eGui.style.position = 'relative';
    
    // Créer le bouton 3 points
    const button = document.createElement('button');
    button.className = 'p-2 hover:bg-gray-100 rounded-lg transition-colors';
    button.style.cursor = 'pointer';
    button.type = 'button';
    button.innerHTML = `
      <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    `;
    
    // Event listener pour ouvrir/fermer le menu
    const clickHandler = (e: Event) => {
      console.log('Button clicked! Event:', e);
      e.stopPropagation();
      e.preventDefault();
      this.toggleMenu();
    };
    
    button.addEventListener('click', clickHandler, true);
    button.addEventListener('mousedown', (e) => {
      console.log('Button mousedown');
      e.stopPropagation();
    }, true);

    this.eGui.appendChild(button);
  }

  toggleMenu() {
    console.log('toggleMenu called, isMenuOpen:', this.isMenuOpen);
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    console.log('openMenu called, actions:', this.actions);
    
    // Fermer le menu précédent s'il existe
    if (currentOpenMenu && currentOpenMenu !== this) {
      currentOpenMenu.closeMenu();
    }
    
    this.isMenuOpen = true;
    currentOpenMenu = this;

    // Obtenir la position du bouton
    const buttonRect = this.eGui.getBoundingClientRect();
    console.log('Button position:', buttonRect);

    // Créer le menu
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1';
    this.menuElement.style.zIndex = '9999';
    
    // Calculer la hauteur estimée du menu (nombre d'actions * hauteur approximative)
    const estimatedMenuHeight = this.actions.length * 44; // ~44px par action
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    // Décider si on ouvre vers le haut ou vers le bas
    const openUpward = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
    
    if (openUpward) {
      // Ouvrir vers le haut
      this.menuElement.style.bottom = `${window.innerHeight - buttonRect.top + 8}px`;
      console.log('Opening upward');
    } else {
      // Ouvrir vers le bas
      this.menuElement.style.top = `${buttonRect.bottom + 8}px`;
      console.log('Opening downward');
    }
    
    this.menuElement.style.right = `${window.innerWidth - buttonRect.right}px`;
    
    console.log('Menu created at position:', {
      top: this.menuElement.style.top,
      bottom: this.menuElement.style.bottom,
      right: this.menuElement.style.right,
      openUpward
    });
    
    // Ajouter les actions
    this.actions.forEach((action, index) => {
      console.log(`Creating action button ${index}:`, action.label);
      
      const actionButton = document.createElement('button');
      actionButton.className = `w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${action.className || 'text-gray-700'}`;
      actionButton.type = 'button';
      
      // Ajouter l'icône si présente
      if (action.iconPath) {
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('class', 'w-4 h-4');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('viewBox', '0 0 24 24');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('d', action.iconPath);
        
        icon.appendChild(path);
        actionButton.appendChild(icon);
      }
      
      // Ajouter le label
      const label = document.createElement('span');
      label.textContent = action.label;
      actionButton.appendChild(label);
      
      // Event listener pour l'action
      actionButton.addEventListener('click', (e) => {
        console.log('Action clicked:', action.label);
        e.stopPropagation();
        action.onClick(this.data);
        this.closeMenu();
      });
      
      this.menuElement!.appendChild(actionButton);
    });

    // Ajouter le menu au body au lieu de la cellule
    document.body.appendChild(this.menuElement);
    console.log('Menu appended to body');

    // Fermer le menu si on clique en dehors
    setTimeout(() => {
      document.addEventListener('click', this.handleClickOutside);
    }, 0);
  }

  closeMenu() {
    if (this.menuElement) {
      this.menuElement.remove();
      this.menuElement = null;
    }
    this.isMenuOpen = false;
    if (currentOpenMenu === this) {
      currentOpenMenu = null;
    }
    document.removeEventListener('click', this.handleClickOutside);
  }

  handleClickOutside = (e: MouseEvent) => {
    if (this.eGui && !this.eGui.contains(e.target as Node)) {
      this.closeMenu();
    }
  };

  getGui() {
    return this.eGui;
  }

  refresh() {
    return false;
  }

  destroy() {
    this.closeMenu();
  }
}

// Fonction pour créer la colonne d'actions
// À appeler depuis la vue avec les actions spécifiques
export const createActionsColumn = (actions: ActionMenuItem[]): ColDef => ({
  headerName: 'Actions',
  field: 'actions',
  width: 100,
  pinned: 'right',
  cellRenderer: ActionsCellRenderer,
  cellRendererParams: {
    actions
  },
  sortable: false,
  filter: false,
  resizable: false,
  suppressSizeToFit: true
});

// Configuration par défaut pour les colonnes
export const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  minWidth: 100,
  wrapText: false,
  autoHeight: false,
  filterParams: {
    buttons: ['reset', 'apply'],
    closeOnApply: true
  }
};
