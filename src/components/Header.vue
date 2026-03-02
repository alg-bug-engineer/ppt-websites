<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store';
import { Search, User, Crown, LogOut } from 'lucide-vue-next';

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
</script>

<template>
  <header class="header">
    <div class="header-content">
      <div class="logo-section" @click="router.push('/')">
        <h1 class="logo">芝士AI吃鱼-PPT</h1>
      </div>

      <nav class="nav-links">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/category/1" class="nav-item">教学竞赛</router-link>
        <router-link to="/category/6" class="nav-item">高端定制</router-link>
        <router-link to="/contact" class="nav-item">联系客服</router-link>
      </nav>

      <div class="search-section">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索PPT模板..." 
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <Search :size="18" />
          </button>
        </div>
      </div>

      <div class="user-section">
        <div v-if="store.user.isLoggedIn" class="user-info">
          <div class="user-name" :class="{ 'is-member': store.user.isMember }">
            <Crown v-if="store.user.isMember" :size="16" class="crown-icon" />
            <span>{{ store.user.phone }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout" title="退出登录">
            <LogOut :size="18" />
          </button>
        </div>
        
        <button v-else class="login-btn" @click="router.push('/login')">
          <User :size="20" />
          <span>登录 / 注册</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header { background-color: #fff; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 100; padding: 0 40px; }
.header-content { max-width: 1400px; margin: 0 auto; height: 70px; display: flex; align-items: center; justify-content: space-between; }
.logo-section { cursor: pointer; }
.logo { font-size: 24px; font-weight: bold; color: var(--primary-color); white-space: nowrap; }
.nav-links { display: flex; gap: 30px; margin: 0 40px; }
.nav-item { font-size: 16px; color: #666; font-weight: 500; transition: color 0.3s; }
.nav-item:hover, .router-link-active { color: var(--primary-color); }
.search-section { flex: 1; max-width: 320px; }
.search-bar { display: flex; background-color: #f0f2f5; border-radius: 20px; padding: 4px 12px; align-items: center; }
.search-bar input { background: none; border: none; outline: none; padding: 8px; width: 100%; font-size: 14px; }
.search-btn { background: none; border: none; cursor: pointer; color: #999; display: flex; align-items: center; }

.user-section { display: flex; align-items: center; gap: 24px; margin-left: 40px; }
.user-info { display: flex; align-items: center; gap: 16px; }
.user-name { display: flex; align-items: center; gap: 6px; font-weight: 600; color: #333; font-size: 14px; }
.user-name.is-member { color: #ea580c; }
.crown-icon { color: #fbbf24; }

.logout-btn { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; padding: 4px; border-radius: 4px; transition: 0.2s; }
.logout-btn:hover { background-color: #f1f5f9; color: #ef4444; }

.login-btn { display: flex; align-items: center; gap: 6px; background-color: var(--primary-color); color: #fff; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: bold; }
</style>
