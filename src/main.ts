import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { store } from './store'

// Initialize products from backend
store.fetchTemplates();

const app = createApp(App)
app.use(router)
app.mount('#app')
