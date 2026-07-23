<template>
  <div class="bg-white rounded-xl p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Calendrier des départs</h3>
        <p class="text-sm text-gray-600 mt-1">{{ currentMonthName }} {{ currentYear }}</p>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="previousMonth"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft class="w-5 h-5 text-gray-600" />
        </button>
        <button
          @click="nextMonth"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight class="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-2">
      <!-- Days of week -->
      <div
        v-for="day in daysOfWeek"
        :key="day"
        class="text-center text-xs font-semibold text-gray-600 py-2"
      >
        {{ day }}
      </div>

      <!-- Calendar days -->
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="[
          'aspect-square rounded-lg p-2 text-center transition-all cursor-pointer relative',
          day.isCurrentMonth
            ? 'hover:bg-gray-50'
            : 'text-gray-300',
          day.isToday
            ? 'ring-2 ring-corail-500'
            : '',
          day.departuresCount > 0 && day.isCurrentMonth
            ? 'bg-gradient-to-br from-corail-50 to-primary-50'
            : 'bg-white'
        ]"
        @click="selectDay(day)"
      >
        <div class="text-sm font-medium" :class="day.isToday ? 'text-corail-600' : 'text-gray-900'">
          {{ day.day }}
        </div>
        <div v-if="day.departuresCount > 0 && day.isCurrentMonth" class="mt-1">
          <div
            :class="[
              'text-xs font-semibold px-1.5 py-0.5 rounded-full inline-block',
              getOccupancyClass(day.occupancyRate)
            ]"
          >
            {{ day.departuresCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-center space-x-6 text-xs">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span class="text-gray-600">Faible (&lt; 50%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
          <span class="text-gray-600">Moyen (50-80%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span class="text-gray-600">Élevé (&gt; 80%)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface CalendarDay {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  departuresCount: number
  occupancyRate: number
  date: Date
}

const currentDate = ref(new Date())

const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('fr-FR', { month: 'long' })
})

const currentYear = computed(() => {
  return currentDate.value.getFullYear()
})

// Données simulées - à remplacer par de vraies données API
const getDeparturesForDay = (date: Date): { count: number; occupancyRate: number } => {
  // Simulation: plus de départs en milieu de semaine
  const dayOfWeek = date.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { count: Math.floor(Math.random() * 5) + 2, occupancyRate: Math.random() * 100 }
  }
  return { count: Math.floor(Math.random() * 8) + 5, occupancyRate: Math.random() * 100 }
}

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Ajuster pour commencer le lundi (1) au lieu de dimanche (0)
  let startDay = firstDay.getDay() - 1
  if (startDay === -1) startDay = 6
  
  const days: CalendarDay[] = []
  
  // Jours du mois précédent
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(year, month - 1, day)
    days.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      departuresCount: 0,
      occupancyRate: 0,
      date
    })
  }
  
  // Jours du mois actuel
  const today = new Date()
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    const isToday = date.toDateString() === today.toDateString()
    const { count, occupancyRate } = getDeparturesForDay(date)
    
    days.push({
      day,
      isCurrentMonth: true,
      isToday,
      departuresCount: count,
      occupancyRate,
      date
    })
  }
  
  // Jours du mois suivant pour compléter la grille
  const remainingDays = 42 - days.length // 6 semaines * 7 jours
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      departuresCount: 0,
      occupancyRate: 0,
      date
    })
  }
  
  return days
})

const getOccupancyClass = (rate: number) => {
  if (rate < 50) return 'bg-green-500 text-white'
  if (rate < 80) return 'bg-orange-500 text-white'
  return 'bg-red-500 text-white'
}

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const selectDay = (day: CalendarDay) => {
  if (day.isCurrentMonth && day.departuresCount > 0) {
    console.log('Selected day:', day.date, 'Departures:', day.departuresCount)
    // TODO: Ouvrir un modal avec les détails des départs du jour
  }
}
</script>
