import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import CategoryView from '../views/CategoryView.vue';
import SearchView from '../views/SearchView.vue';
import ContactView from '../views/ContactView.vue';
import AdminView from '../views/AdminView.vue';
import AdminLoginView from '../views/AdminLoginView.vue';
import PaymentSuccessView from '../views/PaymentSuccessView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/category/:id', name: 'category', component: CategoryView },
  { path: '/search', name: 'search', component: SearchView },
  { path: '/contact', name: 'contact', component: ContactView },
  { path: '/payment-success', name: 'payment-success', component: PaymentSuccessView },
  { path: '/profile', name: 'profile', component: () => import('../views/PersonalCenterView.vue') },
  { 
    path: '/admin', 
    name: 'admin', 
    component: AdminView,
    beforeEnter: (_to: any, _from: any, next: any) => {
      if (localStorage.getItem('isAdminAuthenticated') === 'true') {
        next();
      } else {
        next('/admin/login');
      }
    }
  },
  { path: '/admin/login', name: 'admin-login', component: AdminLoginView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
