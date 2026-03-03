<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { store } from '../store';
import { useRouter } from 'vue-router';
import { User, Download, Key, LogOut, Home, ShieldCheck } from 'lucide-vue-next';

const router = useRouter();
const activeTab = ref('downloads');

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const isSubmitting = ref(false);

const handleChangePassword = async () => {
  if (!oldPassword.value || !newPassword.value) {
    alert(store.t('changePassword'));
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    alert(store.t('newPassword'));
    return;
  }
  
  isSubmitting.value = true;
  try {
    const response = await fetch('http://localhost:3001/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: store.user.phone,
        oldPassword: oldPassword.value,
        newPassword: newPassword.value
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      alert(store.t('saveChanges'));
      handleLogout();
    } else {
      alert(data.error || 'Update failed');
    }
  } catch (e) {
    alert('System error');
  } finally {
    isSubmitting.value = false;
  }
};

const handleLogout = () => {
  store.logout();
  router.push('/login');
};

const triggerDownload = (item: any) => {
  window.open(`http://localhost:3001/api/templates/${item.itemId}/download`, '_blank');
};

onMounted(async () => {
  console.log('[Profile] Page Mounted. User status:', store.user.isLoggedIn, 'Phone:', store.user.phone);
  if (!store.user.isLoggedIn) {
    console.warn('[Profile] Unauthorized access, redirecting to login...');
    router.push('/login');
    return;
  }
  
  console.log('[Profile] Fetching profile data...');
  await store.fetchUserProfile();
  console.log('[Profile] Profile data loaded. Download count:', store.user.downloads?.length || 0);
});
</script>

<template>
  <div class="profile-page-wrapper">
    <!-- Profile Header -->
    <header class="profile-top-bar">
      <div class="top-bar-content">
        <div class="brand" @click="router.push('/')">{{ store.t('personalCenter') }}</div>
        <button class="back-link" @click="router.push('/')">
          <Home :size="18" /> <span>{{ store.t('backToHome') }}</span>
        </button>
      </div>
    </header>

    <div class="profile-main-container">
      <div class="profile-grid">
        <!-- Sidebar -->
        <aside class="sidebar-nav">
          <div class="user-info-box">
            <div class="avatar-circle">
              <User :size="28" />
            </div>
            <div class="user-details">
              <div class="u-phone">{{ store.user.phone }}</div>
              <div class="u-badge" :class="{ 'is-vip': store.user.isMember }">
                {{ store.user.isMember ? store.t('lifetimeMember') : store.t('regularUser') }}
              </div>
            </div>
          </div>

          <nav class="menu-list">
            <div class="menu-item" :class="{ active: activeTab === 'downloads' }" @click="activeTab = 'downloads'">
              <Download :size="18" /> <span>{{ store.t('downloads') }}</span>
            </div>
            <div class="menu-item" :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">
              <Key :size="18" /> <span>{{ store.t('security') }}</span>
            </div>
            <div class="menu-item logout-item" @click="handleLogout">
              <LogOut :size="18" /> <span>{{ store.t('logout') }}</span>
            </div>
          </nav>
        </aside>

        <!-- Main Area -->
        <main class="content-area">
          <!-- Downloads -->
          <div v-if="activeTab === 'downloads'" class="area-card">
            <div class="area-header">
              <h3>{{ store.t('purchasedPPTs') }} ({{ store.user.downloads?.length || 0 }})</h3>
              <p v-if="store.user.isMember">{{ store.t('memberPrivilege') }}</p>
              <p v-else>{{ store.t('nonMemberTip') }}</p>
            </div>
            
            <!-- If not a member and no download records -->
            <div v-if="!store.user.isMember" class="non-member-notice">
              <ShieldCheck :size="48" color="#fbbf24" />
              <h4>{{ store.t('noMemberRecords') }}</h4>
              <p>{{ store.t('nonMemberNotice') }}</p>
              <p class="highlight">{{ store.t('joinMembershipHighlight') }}</p>
              <button class="upgrade-btn" @click="router.push('/')">{{ store.t('upgradeToMember') }}</button>
            </div>

            <!-- If member but no records -->
            <div v-else-if="store.user.downloads.length === 0" class="no-data">
              <Download :size="40" color="#cbd5e1" />
              <p>{{ store.t('noDownloadsYet') }}</p>
              <button @click="router.push('/')">{{ store.t('browseTemplates') }}</button>
            </div>

            <div v-else class="record-list">
              <div v-for="item in store.user.downloads" :key="item.id" class="record-card">
                <div class="record-info">
                  <div class="record-name">{{ item.title }}</div>
                  <div class="record-meta">{{ store.t('orderId') }}: {{ item.id }} | {{ store.t('date') }}: {{ new Date(item.paidAt).toLocaleDateString() }}</div>
                </div>
                <button class="dl-btn" @click="triggerDownload(item)">
                  <Download :size="16" /> {{ store.t('downloads') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Security -->
          <div v-if="activeTab === 'security'" class="area-card">
            <div class="area-header">
              <h3>{{ store.t('changePassword') }}</h3>
              <p>{{ store.t('securityTip') }}</p>
            </div>

            <div class="form-wrapper">
              <div class="field">
                <label>{{ store.t('currentPassword') }}</label>
                <input v-model="oldPassword" type="password" />
              </div>
              <div class="field">
                <label>{{ store.t('newPassword') }}</label>
                <input v-model="newPassword" type="password" :placeholder="store.t('passwordMinChars')" />
              </div>
              <div class="field">
                <label>{{ store.t('confirmNewPassword') }}</label>
                <input v-model="confirmPassword" type="password" />
              </div>
              <button class="submit-form-btn" @click="handleChangePassword" :disabled="isSubmitting">
                {{ isSubmitting ? store.t('updating') : store.t('saveChanges') }}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page-wrapper {
  min-height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  flex-direction: column;
}

.profile-top-bar {
  background: #fff;
  height: 64px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
}

.top-bar-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand { font-weight: bold; color: #1fcdb6; font-size: 18px; cursor: pointer; }
.back-link { display: flex; align-items: center; gap: 8px; border: none; background: #f8fafc; padding: 8px 16px; border-radius: 8px; cursor: pointer; color: #64748b; font-size: 14px; transition: 0.2s; }
.back-link:hover { background: #f1f5f9; color: #1fcdb6; }

.profile-main-container {
  flex: 1;
  padding: 40px 20px;
}

.profile-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

.sidebar-nav {
  background: #fff;
  border-radius: 16px;
  padding: 24px 0;
  height: fit-content;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.user-info-box {
  padding: 0 24px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.avatar-circle { width: 48px; height: 48px; background: #f0fdfa; color: #1fcdb6; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.u-phone { font-weight: bold; color: #1e293b; font-size: 15px; }
.u-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #f1f5f9; color: #64748b; margin-top: 4px; display: inline-block; }
.u-badge.is-vip { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }

.menu-list .menu-item { padding: 12px 24px; display: flex; align-items: center; gap: 12px; cursor: pointer; color: #64748b; font-size: 14px; }
.menu-list .menu-item:hover { background: #f8fafc; color: #1fcdb6; }
.menu-list .menu-item.active { background: #f0fdfa; color: #1fcdb6; border-right: 3px solid #1fcdb6; font-weight: bold; }
.logout-item { color: #ef4444 !important; margin-top: 12px; }

.area-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  min-height: 500px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.area-header { margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }
.area-header h3 { margin: 0 0 4px; color: #1e293b; font-size: 18px; }
.area-header p { color: #94a3b8; font-size: 13px; margin: 0; }

.record-list { display: flex; flex-direction: column; gap: 12px; }
.record-card { border: 1px solid #f1f5f9; padding: 16px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
.record-name { font-weight: 600; color: #334155; margin-bottom: 4px; }
.record-meta { font-size: 12px; color: #94a3b8; }
.dl-btn { background: #f0fdfa; color: #1fcdb6; border: none; padding: 6px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.dl-btn:hover { background: #1fcdb6; color: #fff; }

.non-member-notice { text-align: center; padding: 60px 20px; color: #64748b; }
.non-member-notice h4 { margin: 16px 0 8px; color: #1e293b; font-size: 18px; }
.non-member-notice p { font-size: 14px; margin-bottom: 4px; }
.non-member-notice .highlight { color: #ea580c; font-weight: bold; margin: 12px 0 20px; }
.upgrade-btn { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #fbbf24; border: none; padding: 12px 32px; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.3s; }
.upgrade-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

.no-data { text-align: center; padding: 100px 0; color: #94a3b8; }
.no-data button { margin-top: 16px; background: #1fcdb6; color: #fff; border: none; padding: 8px 24px; border-radius: 8px; cursor: pointer; }

.form-wrapper { max-width: 360px; }
.field { margin-bottom: 16px; }
.field label { display: block; margin-bottom: 6px; font-size: 13px; color: #475569; font-weight: 600; }
.field input { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
.field input:focus { border-color: #1fcdb6; }
.submit-form-btn { width: 100%; background: #1fcdb6; color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 8px; }
.submit-form-btn:disabled { opacity: 0.5; }

@media (max-width: 768px) {
  .profile-grid { grid-template-columns: 1fr; }
}
</style>
