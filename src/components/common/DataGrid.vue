<template>
  <div class="data-grid-wrapper">
    <!-- Toolbar (optionnel) -->
    <div v-if="showToolbar" class="data-grid-toolbar">
      <div class="flex items-center justify-between mb-4">
        <!-- Titre et compteur -->
        <div>
          <h3 v-if="title" class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <p v-if="rowData" class="text-sm text-gray-500 mt-1">
            {{ rowData.length }} {{ rowData.length > 1 ? 'éléments' : 'élément' }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Recherche globale -->
          <div v-if="showQuickFilter" class="relative">
            <input
              v-model="quickFilterText"
              type="text"
              placeholder="Rechercher..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <!-- Export CSV -->
          <button
            v-if="showExport"
            @click="exportToCsv"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg class="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter CSV
          </button>

          <!-- Slot pour actions personnalisées -->
          <slot name="toolbar-actions"></slot>
        </div>
      </div>
    </div>

    <!-- AG Grid -->
    <div :class="gridClass">
      <AgGridVue
        ref="agGrid"
        :style="{ width: '100%', height: gridHeight }"
        :class="theme"
        theme="legacy"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        :pagination="pagination"
        :paginationPageSize="paginationPageSize"
        :paginationPageSizeSelector="paginationPageSizeSelector"
        :rowSelection="rowSelection"
        :suppressRowClickSelection="suppressRowClickSelection"
        :quickFilterText="quickFilterText"
        :animateRows="true"
        :enableCellTextSelection="true"
        :ensureDomOrder="true"
        @grid-ready="onGridReady"
        @selection-changed="onSelectionChanged"
        @row-clicked="onRowClicked"
        @cell-clicked="onCellClicked"
      />
    </div>

    <!-- Footer personnalisé (optionnel) -->
    <div v-if="$slots.footer" class="data-grid-footer mt-4">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import type { 
  ColDef, 
  GridApi, 
  GridReadyEvent,
  SelectionChangedEvent,
  RowClickedEvent,
  CellClickedEvent
} from 'ag-grid-community';

// Props
interface Props {
  // Données
  columnDefs: ColDef[];
  rowData: any[] | null;
  
  // Configuration de base
  title?: string;
  gridHeight?: string;
  gridClass?: string;
  theme?: 'ag-theme-quartz' | 'ag-theme-alpine' | 'ag-theme-balham' | 'ag-theme-material';
  
  // Toolbar
  showToolbar?: boolean;
  showQuickFilter?: boolean;
  showExport?: boolean;
  
  // Pagination
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeSelector?: number[];
  
  // Sélection
  rowSelection?: 'single' | 'multiple';
  suppressRowClickSelection?: boolean;
  
  // Colonnes par défaut
  defaultColDef?: ColDef;
}

const props = withDefaults(defineProps<Props>(), {
  gridHeight: 'calc(100vh - 182px)',
  gridClass: '',
  theme: 'ag-theme-quartz',
  showToolbar: true,
  showQuickFilter: true,
  showExport: true,
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeSelector: () => [10, 20, 50, 100],
  rowSelection: 'multiple',
  suppressRowClickSelection: true,
  defaultColDef: () => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  })
});

// Emits
const emit = defineEmits<{
  gridReady: [api: GridApi];
  selectionChanged: [selectedRows: any[]];
  rowClicked: [row: any];
  cellClicked: [params: CellClickedEvent];
}>();

// State
const agGrid = ref<any>(null);
const gridApi = ref<GridApi | null>(null);
const quickFilterText = ref('');

// Méthodes
const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api;
  emit('gridReady', params.api);
};

const onSelectionChanged = (event: SelectionChangedEvent) => {
  const selectedRows = event.api.getSelectedRows();
  emit('selectionChanged', selectedRows);
};

const onRowClicked = (event: RowClickedEvent) => {
  emit('rowClicked', event.data);
};

const onCellClicked = (params: CellClickedEvent) => {
  emit('cellClicked', params);
};

const exportToCsv = () => {
  if (gridApi.value) {
    gridApi.value.exportDataAsCsv({
      fileName: `export_${new Date().toISOString().split('T')[0]}.csv`,
    });
  }
};

// Méthodes exposées pour utilisation externe
const getSelectedRows = () => {
  return gridApi.value?.getSelectedRows() || [];
};

const refreshData = () => {
  gridApi.value?.refreshCells();
};

const sizeColumnsToFit = () => {
  gridApi.value?.sizeColumnsToFit();
};

const autoSizeAllColumns = () => {
  if (gridApi.value) {
    const allColumnIds = gridApi.value.getColumns()?.map(col => col.getId()) || [];
    gridApi.value.autoSizeColumns(allColumnIds);
  }
};

// Exposer les méthodes
defineExpose({
  getSelectedRows,
  refreshData,
  sizeColumnsToFit,
  autoSizeAllColumns,
  gridApi
});

// Watch pour auto-resize quand les données changent
watch(() => props.rowData, () => {
  if (gridApi.value && props.rowData && props.rowData.length > 0) {
    // Attendre que le DOM soit mis à jour
    setTimeout(() => {
      sizeColumnsToFit();
    }, 100);
  }
});
</script>

<style scoped>
.data-grid-wrapper {
  @apply bg-white;
}

.data-grid-toolbar {
  @apply p-6 bg-white;
}

.data-grid-footer {
  @apply p-4 bg-gray-50 border-t border-gray-200;
}

/* Amélioration du champ de recherche */
.data-grid-toolbar input[type="text"] {
  @apply transition-all duration-200;
}

.data-grid-toolbar input[type="text"]:focus {
  @apply ring-2 ring-primary-500 border-primary-500;
}

/* Boutons de la toolbar */
.data-grid-toolbar button {
  @apply transition-all duration-200 shadow-sm;
}

.data-grid-toolbar button:hover {
  @apply shadow-md transform -translate-y-0.5;
}

.data-grid-toolbar button:active {
  @apply transform translate-y-0;
}
</style>
