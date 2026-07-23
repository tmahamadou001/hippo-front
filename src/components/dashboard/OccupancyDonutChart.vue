<template>
  <div class="bg-white rounded-xl p-6 border border-gray-200">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Répartition par confort</h3>
      <p class="text-sm text-gray-600 mt-1">Réservations ce mois-ci</p>
    </div>
    <div class="flex items-center justify-center">
      <apexchart
        type="donut"
        height="280"
        :options="chartOptions as any"
        :series="series"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const series = ref([456, 289, 178])

const chartOptions = ref({
  chart: {
    type: 'donut' as const,
    fontFamily: 'Poppins, sans-serif'
  },
  colors: ['#FF6B4A', '#0A2540', '#3474a6'],
  labels: ['Standard', 'VIP', 'Premium'],
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '14px',
      fontWeight: 600
    },
    dropShadow: {
      enabled: false
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151'
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 700,
            color: '#111827',
            formatter: (val: string) => {
              return val
            }
          },
          total: {
            show: true,
            label: 'Total',
            fontSize: '14px',
            fontWeight: 600,
            color: '#6B7280',
            formatter: () => {
              return '923'
            }
          }
        }
      }
    }
  },
  legend: {
    position: 'bottom' as const,
    horizontalAlign: 'center' as const,
    fontSize: '13px',
    fontWeight: 500,
    labels: {
      colors: '#374151'
    },
    markers: {
      width: 12,
      height: 12,
      radius: 12
    },
    itemMargin: {
      horizontal: 12,
      vertical: 8
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
  states: {
    hover: {
      filter: {
        type: 'darken' as const,
        value: 0.15
      }
    },
    active: {
      filter: {
        type: 'darken' as const,
        value: 0.2
      }
    }
  }
})
</script>
