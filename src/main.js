import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { useAuthStore } from '@/stores/auth.js'

import './assets/main.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
const authStore = useAuthStore(pinia)
// because we do not save user in local storage
if (authStore.token) {
    await authStore.fetchUser()
}

app.use(router)

app.mount('#app')
