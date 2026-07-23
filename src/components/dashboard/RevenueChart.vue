<template>
  <div class="bg-white rounded-xl p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Revenus</h3>
        <p class="text-sm text-gray-600 mt-1">Évolution sur 7 jours</p>
      </div>
      <div class="flex items-center space-x-2">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="[
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
            selectedPeriod === period.value
              ? 'text-white bg-corail-500'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          ]"
        >
          {{ period.label }}
        </button>
      </div>
    </div>
    <apexchart
      type="area"
      height="280"
      :options="chartOptions as any"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const selectedPeriod = ref('7d')

const periods = [
  { label: '7j', value: '7d' },
  { label: '30j', value: '30d' },
  { label: '90j', value: '90d' }
]

// Données simulées - à remplacer par de vraies données API
const series = computed(() => [{
  name: 'Revenus',
  data: selectedPeriod.value === '7d'
    ? [125000, 145000, 132000, 168000, 155000, 178000, 195000]
    : selectedPeriod.value === '30d'
    ? [125000, 145000, 132000, 168000, 155000, 178000, 195000, 185000, 205000, 198000, 215000, 225000, 218000, 235000, 245000, 238000, 255000, 265000, 258000, 275000, 285000, 278000, 295000, 305000, 298000, 315000, 325000, 318000, 335000, 345000]
    : [125000, 145000, 132000, 168000, 155000, 178000, 195000, 185000, 205000, 198000, 215000, 225000, 218000, 235000, 245000, 238000, 255000, 265000, 258000, 275000, 285000, 278000, 295000, 305000, 298000, 315000, 325000, 318000, 335000, 345000, 338000, 355000, 365000, 358000, 375000, 385000, 378000, 395000, 405000, 398000, 415000, 425000, 418000, 435000, 445000, 438000, 455000, 465000, 458000, 475000, 485000, 478000, 495000, 505000, 498000, 515000, 525000, 518000, 535000, 545000, 538000, 555000, 565000, 558000, 575000, 585000, 578000, 595000, 605000, 598000, 615000, 625000, 618000, 635000, 645000, 638000, 655000, 665000, 658000, 675000, 685000, 678000, 695000, 705000, 698000, 715000, 725000, 718000, 735000, 745000]
}])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 280,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    fontFamily: 'Poppins, sans-serif'
  },
  colors: ['#FF6B4A'],
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    categories: selectedPeriod.value === '7d'
      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      : selectedPeriod.value === '30d'
      ? Array.from({ length: 30 }, (_, i) => `${i + 1}`)
      : Array.from({ length: 90 }, (_, i) => `${i + 1}`),
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
      },
      formatter: (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
          notation: 'compact',
          compactDisplay: 'short'
        }).format(value) + ' FCFA'
      }
    }
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
        return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'
      }
    }
  }
}))
</script>
