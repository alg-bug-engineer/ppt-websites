<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import Footer from './components/Footer.vue';
import MembershipModal from './components/MembershipModal.vue';

const route = useRoute();

const isStandalonePage = computed(() => {
  return ['login', 'admin', 'admin-login', 'profile', 'payment-success'].includes(route.name as string);
});
</script>

<template>
  <div class="app-container">
    <!-- Show Header/Sidebar/Footer only if NOT on a standalone page -->
    <template v-if="!isStandalonePage">
      <Header />
      
      <div class="main-layout">
        <Sidebar />
        
        <main class="content">
          <router-view :key="route.fullPath"></router-view>
        </main>
      </div>

      <Footer />
    </template>
    
    <!-- Show only the view for standalone pages (Login, Admin, etc.) -->
    <template v-else>
      <router-view></router-view>
    </template>

    <MembershipModal />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-layout {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.content {
  flex: 1;
  padding: 24px 40px;
  background-color: var(--bg-color);
}
</style>
