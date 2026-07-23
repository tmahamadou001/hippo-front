<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p class="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
      </div>
      <div class="flex items-center space-x-2">
        <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Calendar class="w-4 h-4 inline mr-2" />
          Aujourd'hui
        </button>
        <button class="px-4 py-2 text-sm font-medium text-white bg-corail-500 rounded-lg hover:bg-corail-600 transition-colors">
          <Download class="w-4 h-4 inline mr-2" />
          Exporter
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :change="stat.change"
        :trend="stat.trend"
        :icon="stat.icon"
        :bg-color="stat.bgColor"
        :icon-color="stat.iconColor"
      />
    </div>

    <!-- Quick Actions -->
    <div class="bg-gradient-to-br from-corail-50 to-primary-50 rounded-xl p-6 border border-corail-100">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          v-for="action in quickActions"
          :key="action.title"
          :title="action.title"
          :description="action.description"
          :icon="action.icon"
          :bg-color="action.bgColor"
          :icon-color="action.iconColor"
          @click="handleQuickAction(action.action)"
        />
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Upcoming Departures -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Prochains départs</h3>
              <p class="text-sm text-gray-600 mt-1">Départs prévus aujourd'hui</p>
            </div>
            <button class="text-sm font-medium text-corail-600 hover:text-corail-700">
              Voir tout
              <ChevronRight class="w-4 h-4 inline ml-1" />
            </button>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <UpcomingDepartureCard
              v-for="departure in upcomingDepartures"
              :key="departure.id"
              :origin="departure.origin"
              :destination="departure.destination"
              :line-name="departure.lineName"
              :departure-time="departure.departureTime"
              :seats-booked="departure.seatsBooked"
              :total-seats="departure.totalSeats"
              :vehicle-name="departure.vehicleName"
              :price="departure.price"
              :status="departure.status"
            />
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <BookingsChart />
        </div>

        <!-- Calendar -->
        <DeparturesCalendar />
      </div>

      <!-- Right Column (1/3) -->
      <div class="space-y-6">
        <!-- Today's Summary -->
        <div class="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <h3 class="text-lg font-semibold mb-4">Aujourd'hui</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Ticket class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm opacity-90">Réservations</p>
                  <p class="text-2xl font-bold">{{ todayStats.reservations }}</p>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <DollarSign class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm opacity-90">Revenus</p>
                  <p class="text-2xl font-bold">{{ formatCurrency(todayStats.revenue) }}</p>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm opacity-90">Départs</p>
                  <p class="text-2xl font-bold">{{ todayStats.departures }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Routes -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-base font-semibold text-gray-900">Lignes populaires</h3>
          </div>
          <div class="p-4 space-y-3">
            <div
              v-for="(route, index) in topRoutes"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-corail-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-bold text-corail-600">{{ index + 1 }}</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ route.name }}</p>
                  <p class="text-xs text-gray-500">{{ route.bookings }} réservations</p>
                </div>
              </div>
              <TrendingUp class="w-4 h-4 text-green-500" />
            </div>
          </div>
        </div>

        <!-- Occupancy Donut Chart -->
        <OccupancyDonutChart />
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Activité récente</h3>
          <p class="text-sm text-gray-600 mt-1">Dernières actions sur la plateforme</p>
        </div>
        <button class="text-sm font-medium text-corail-600 hover:text-corail-700">
          Tout voir
        </button>
      </div>
      <div class="p-4 space-y-2">
        <RecentActivityItem
          v-for="activity in recentActivities"
          :key="activity.id"
          :title="activity.title"
          :description="activity.description"
          :time="activity.time"
          :icon="activity.icon"
          :bg-color="activity.bgColor"
          :icon-color="activity.iconColor"
          :badge="activity.badge"
          :badge-class="activity.badgeClass"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Ticket,
  DollarSign,
  Truck,
  TrendingUp,
  Calendar,
  Download,
  ChevronRight,
  Plus,
  FileText,
  Users,
  Settings
} from 'lucide-vue-next'
import StatCard from '@/components/dashboard/StatCard.vue'
import QuickActionCard from '@/components/dashboard/QuickActionCard.vue'
import RecentActivityItem from '@/components/dashboard/RecentActivityItem.vue'
import UpcomingDepartureCard from '@/components/dashboard/UpcomingDepartureCard.vue'
import RevenueChart from '@/components/dashboard/RevenueChart.vue'
import BookingsChart from '@/components/dashboard/BookingsChart.vue'
import OccupancyDonutChart from '@/components/dashboard/OccupancyDonutChart.vue'
import DeparturesCalendar from '@/components/dashboard/DeparturesCalendar.vue'

const router = useRouter()

// Stats data
const stats = ref([
  {
    label: 'Réservations',
    value: '1,234',
    change: '+12.5%',
    trend: 'up' as const,
    bgColor: 'bg-corail-100',
    iconColor: 'text-corail-600',
    icon: Ticket
  },
  {
    label: 'Revenus',
    value: '2.4M FCFA',
    change: '+18.2%',
    trend: 'up' as const,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: DollarSign
  },
  {
    label: 'Véhicules actifs',
    value: '24',
    change: '+2',
    trend: 'up' as const,
    bgColor: 'bg-primary-100',
    iconColor: 'text-primary-600',
    icon: Truck
  },
  {
    label: 'Taux d\'occupation',
    value: '87%',
    change: '-3.1%',
    trend: 'down' as const,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    icon: TrendingUp
  }
])

// Quick Actions
const quickActions = ref([
  {
    title: 'Nouveau départ',
    description: 'Créer un nouveau départ',
    icon: Plus,
    bgColor: 'bg-corail-50',
    iconColor: 'text-corail-600',
    action: 'create-departure'
  },
  {
    title: 'Réservation',
    description: 'Enregistrer une réservation',
    icon: Ticket,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    action: 'create-reservation'
  },
  {
    title: 'Rapport',
    description: 'Générer un rapport',
    icon: FileText,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    action: 'generate-report'
  },
  {
    title: 'Paramètres',
    description: 'Configurer le système',
    icon: Settings,
    bgColor: 'bg-gray-50',
    iconColor: 'text-gray-600',
    action: 'settings'
  }
])

// Upcoming Departures
const upcomingDepartures = ref([
  {
    id: 1,
    origin: 'Abidjan',
    destination: 'Yamoussoukro',
    lineName: 'Ligne Express',
    departureTime: '08:00',
    seatsBooked: 42,
    totalSeats: 50,
    vehicleName: 'Bus VIP 01',
    price: 5000,
    status: 'open' as const
  },
  {
    id: 2,
    origin: 'Abidjan',
    destination: 'Bouaké',
    lineName: 'Ligne Confort',
    departureTime: '10:30',
    seatsBooked: 35,
    totalSeats: 45,
    vehicleName: 'Bus Standard 03',
    price: 4500,
    status: 'open' as const
  },
  {
    id: 3,
    origin: 'Abidjan',
    destination: 'San-Pédro',
    lineName: 'Ligne Côtière',
    departureTime: '14:00',
    seatsBooked: 50,
    totalSeats: 50,
    vehicleName: 'Bus VIP 02',
    price: 6000,
    status: 'closed' as const
  },
  {
    id: 4,
    origin: 'Yamoussoukro',
    destination: 'Korhogo',
    lineName: 'Ligne Nord',
    departureTime: '16:00',
    seatsBooked: 28,
    totalSeats: 40,
    vehicleName: 'Bus Standard 05',
    price: 5500,
    status: 'open' as const
  }
])

// Today's Stats
const todayStats = ref({
  reservations: 47,
  revenue: 235000,
  departures: 12
})

// Top Routes
const topRoutes = ref([
  { name: 'Abidjan → Yamoussoukro', bookings: 156 },
  { name: 'Abidjan → Bouaké', bookings: 142 },
  { name: 'Abidjan → San-Pédro', bookings: 128 },
  { name: 'Yamoussoukro → Korhogo', bookings: 98 }
])

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    title: 'Nouvelle réservation',
    description: 'Jean Kouassi a réservé 2 places pour Abidjan → Yamoussoukro',
    time: 'Il y a 5 minutes',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: Ticket,
    badge: 'Nouveau',
    badgeClass: 'bg-blue-100 text-blue-700'
  },
  {
    id: 2,
    title: 'Départ complété',
    description: 'Le départ #1234 vers Bouaké a été marqué comme complété',
    time: 'Il y a 1 heure',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: Calendar,
    badge: 'Complété',
    badgeClass: 'bg-green-100 text-green-700'
  },
  {
    id: 3,
    title: 'Nouveau véhicule',
    description: 'Bus VIP 06 ajouté à la flotte (AB-5678-CI)',
    time: 'Il y a 3 heures',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    icon: Truck,
    badge: undefined,
    badgeClass: undefined
  },
  {
    id: 4,
    title: 'Paiement reçu',
    description: 'Paiement de 45,000 FCFA confirmé pour la réservation #5678',
    time: 'Il y a 4 heures',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: DollarSign,
    badge: undefined,
    badgeClass: undefined
  },
  {
    id: 5,
    title: 'Nouvel utilisateur',
    description: 'Marie Traoré a rejoint l\'équipe en tant qu\'opérateur',
    time: 'Il y a 6 heures',
    bgColor: 'bg-corail-100',
    iconColor: 'text-corail-600',
    icon: Users,
    badge: undefined,
    badgeClass: undefined
  }
])

// Functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

const handleQuickAction = (action: string) => {
  const routes: Record<string, string> = {
    'create-departure': '/departures',
    'create-reservation': '/reservations',
    'generate-report': '/statistics',
    'settings': '/settings'
  }
  
  if (routes[action]) {
    router.push(routes[action])
  }
}
</script>
