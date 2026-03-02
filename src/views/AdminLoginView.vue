<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Lock, User, ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');

const handleAdminLogin = () => {
  if (username.value === 'wwlsm' && password.value === 'Zl161829@@') {
    localStorage.setItem('isAdminAuthenticated', 'true');
    router.push('/admin');
  } else {
    error.value = '账号或密码错误，请重试';
  }
};
</script>

<template>
  <div class="admin-login-container">
    <div class="login-card">
      <div class="back-home" @click="router.push('/')">
        <ArrowLeft :size="20" />
        <span>主站首页</span>
      </div>
      
      <div class="auth-header">
        <h2 class="logo-text">管理后台登录</h2>
        <p class="subtitle">请输入管理员凭据以访问控制台</p>
      </div>

      <div class="form-container">
        <div class="input-group">
          <User :size="18" class="icon" />
          <input v-model="username" type="text" placeholder="管理员账号" @keyup.enter="handleAdminLogin" />
        </div>

        <div class="input-group">
          <Lock :size="18" class="icon" />
          <input v-model="password" type="password" placeholder="密码" @keyup.enter="handleAdminLogin" />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button class="auth-btn" @click="handleAdminLogin">
          进入管理后台
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-login-container { height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #1e293b; padding: 20px; }
.login-card { background-color: #fff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); width: 100%; max-width: 400px; padding: 40px; position: relative; }
.back-home { position: absolute; top: 20px; left: 20px; display: flex; align-items: center; gap: 6px; font-size: 14px; color: #64748b; cursor: pointer; }
.auth-header { text-align: center; margin-bottom: 30px; margin-top: 20px; }
.logo-text { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 8px; }
.subtitle { color: #94a3b8; font-size: 14px; }
.form-container { display: flex; flex-direction: column; gap: 16px; }
.input-group { position: relative; display: flex; align-items: center; }
.input-group .icon { position: absolute; left: 16px; color: #94a3b8; }
.input-group input { width: 100%; padding: 12px 12px 12px 48px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; font-size: 15px; }
.input-group input:focus { border-color: #1fcdb6; }
.error-msg { color: #ef4444; font-size: 13px; text-align: center; }
.auth-btn { background-color: #1fcdb6; color: #fff; border: none; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; }
</style>
