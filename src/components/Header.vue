<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store';
import { Search, User, Crown, LogOut, Languages } from 'lucide-vue-next';

const router = useRouter();
const searchQuery = ref('');

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } });
  }
};

const handleLogout = () => {
  store.logout();
  router.push('/');
};

const handleUpgrade = () => {
  store.ui.showMembershipModal = true;
};

const toggleLang = () => {
  store.setLang(store.lang === 'zh' ? 'en' : 'zh');
};
</script>

<template>
  <header class="header">
    <div class="header-content">
      <div class="logo-section" @click="router.push('/')">
        <h1 class="logo">{{ store.t('siteTitle') }}</h1>
      </div>

      <nav class="nav-links">
        <router-link to="/" class="nav-item">{{ store.t('navHome') }}</router-link>
        <router-link to="/category/1" class="nav-item">{{ store.t('navTeaching') }}</router-link>
        <router-link to="/category/6" class="nav-item">{{ store.t('navPremium') }}</router-link>
        <router-link to="/contact" class="nav-item">{{ store.t('navSupport') }}</router-link>
      </nav>

      <div class="search-section">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="store.t('searchPlaceholder')" 
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <Search :size="18" />
          </button>
        </div>
      </div>

      <div class="user-section">
        <button class="lang-toggle" @click="toggleLang" :title="store.lang === 'zh' ? 'Switch to English' : '切换至中文'">
          <Languages :size="20" />
          <span>{{ store.lang === 'zh' ? 'EN' : '中文' }}</span>
        </button>

        <div v-if="store.user.isLoggedIn" class="user-info">
          <!-- Member Status Badge / Upgrade Button -->
          <div v-if="store.user.isMember" class="vip-badge">
            <Crown :size="14" /> <span>{{ store.t('lifetimeMember') }}</span>
          </div>
          <button v-else class="upgrade-btn-link" @click="handleUpgrade">
            <Crown :size="14" /> <span>{{ store.lang === 'zh' ? '升级会员' : 'Upgrade' }}</span>
          </button>

          <div class="user-name" @click="router.push('/profile')" style="cursor: pointer;">
            <span>{{ store.user.phone }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout" :title="store.t('logout')">
            <LogOut :size="18" />
          </button>
        </div>
        
        <button v-else class="login-btn" @click="router.push('/login')">
          <User :size="20" />
          <span>{{ store.t('loginRegister') }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header { background-color: #fff; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 100; padding: 0 40px; }
.header-content { max-width: 1400px; margin: 0 auto; height: 70px; display: flex; align-items: center; justify-content: space-between; }
.logo-section { cursor: pointer; }
.logo { font-size: 22px; font-weight: bold; color: var(--primary-color); white-space: nowrap; }
.nav-links { display: flex; gap: 30px; margin: 0 40px; }
.nav-item { font-size: 16px; color: #666; font-weight: 500; transition: color 0.3s; }
.nav-item:hover, .router-link-active { color: var(--primary-color); }
.search-section { flex: 1; max-width: 320px; }
.search-bar { display: flex; background-color: #f0f2f5; border-radius: 20px; padding: 4px 12px; align-items: center; }
.search-bar input { background: none; border: none; outline: none; padding: 8px; width: 100%; font-size: 14px; }
.search-btn { background: none; border: none; cursor: pointer; color: #999; display: flex; align-items: center; }

.user-section { display: flex; align-items: center; gap: 20px; margin-left: 20px; }
.lang-toggle { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 12px; cursor: pointer; color: #64748b; font-size: 13px; font-weight: 600; transition: 0.2s; }
.lang-toggle:hover { border-color: var(--primary-color); color: var(--primary-color); background-color: #f0fdfa; }

.user-info { display: flex; align-items: center; gap: 12px; }

.vip-badge { display: flex; align-items: center; gap: 4px; background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: bold; }
.upgrade-btn-link { display: flex; align-items: center; gap: 4px; background: #1e293b; color: #fbbf24; border: none; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.upgrade-btn-link:hover { background: #334155; transform: scale(1.05); }

.user-name { font-weight: 600; color: #333; font-size: 14px; }
.crown-icon { color: #fbbf24; }

.logout-btn { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; padding: 4px; border-radius: 4px; transition: 0.2s; }
.logout-btn:hover { background-color: #f1f5f9; color: #ef4444; }

.login-btn { display: flex; align-items: center; gap: 6px; background-color: var(--primary-color); color: #fff; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: bold; white-space: nowrap; }
</style>
