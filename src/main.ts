import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/css/main.css'

// Directive v-permission
import { permissionDirective } from './directives/permission'

// Toast notifications
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// AG Grid - Module Registry (v34+)
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

// AG Grid styles - Utilisation du thème legacy (v32)
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import './assets/css/ag-grid-custom.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(permissionDirective)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

app.mount('#app')
