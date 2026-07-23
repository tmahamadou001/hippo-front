<template>
  <div class="bg-white rounded-xl p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Réservations</h3>
        <p class="text-sm text-gray-600 mt-1">Par jour cette semaine</p>
      </div>
      <div class="flex items-center space-x-2 text-sm">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
          <span class="text-gray-600">Confirmées</span>
        </div>
        <div class="flex items-center ml-4">
          <div class="w-3 h-3 rounded-full bg-corail-500 mr-2"></div>
          <span class="text-gray-600">En attente</span>
        </div>
      </div>
    </div>
    <apexchart
      type="bar"
      height="280"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const series = ref([
  {
    name: 'Confirmées',
    data: [44, 55, 41, 67, 52, 48, 61]
  },
  {
    name: 'En attente',
    data: [13, 23, 20, 18, 13, 27, 15]
  }
])

const chartOptions = ref({
  chart: {
    type: 'bar' as const,
    height: 280,
    toolbar: {
      show: false
    },
    fontFamily: 'Poppins, sans-serif'
  },
  colors: ['#0A2540', '#FF6B4A'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 6,
      borderRadiusApplication: 'end' as const
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    labels: {
      style: {
        colors: '#6B7280',
        fontSize: '12px'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: '#6B7280',
        fontSize: '12px'
      }
    }
  },
  fill: {
    opacity: 1
  },
  grid: {
    borderColor: '#F3F4F6',
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: false
      }
    }
  },
  tooltip: {
    theme: 'light',
    y: {
      formatter: (value: number) => {
        return value + ' réservations'
      }
    }
  },
  legend: {
    show: false
  }
})
</script>
