import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Rooms from '../views/Rooms.vue'
import MeterReadings from '../views/MeterReadings.vue'
import Bills from '../views/Bills.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: Rooms
  },
  {
    path: '/meter-readings',
    name: 'MeterReadings',
    component: MeterReadings
  },
  {
    path: '/bills',
    name: 'Bills',
    component: Bills
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router