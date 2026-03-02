<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store';
import { Phone, Lock, ArrowLeft, Loader2 } from 'lucide-vue-next';

const router = useRouter();
const isLogin = ref(true);
const phone = ref('');
const password = ref('');
const loading = ref(false);

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  phone.value = '';
  password.value = '';
};

// Simple phone regex validation (Chinese mobile)
const validatePhone = (p: string) => /^1[3-9]\d{9}$/.test(p);

const handleAuth = async () => {
  if (!validatePhone(phone.value)) {
    alert('请输入正确的11位手机号');
    return;
  }
  if (password.value.length < 6) {
    alert('密码长度不能小于6位');
    return;
  }

  loading.value = true;
  try {
    const endpoint = isLogin.value ? 'login' : 'register';
    const response = await fetch(`http://localhost:3001/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.value, password: password.value }),
    });
    const data = await response.json();

    if (response.ok) {
      if (isLogin.value) {
        store.login(data.phone, data.isMember);
        router.push('/');
      } else {
        alert('注册成功，请使用新账号登录');
        isLogin.value = true;
        password.value = '';
      }
    } else {
      alert(data.error || '操作失败');
    }
  } catch (err) {
    alert('网络连接错误，请检查服务器状态');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="back-home" @click="router.push('/')">
        <ArrowLeft :size="20" />
        <span>返回首页</span>
      </div>
      
      <div class="auth-header">
        <h2 class="logo-text">芝士AI吃鱼-PPT</h2>
        <p class="subtitle">{{ isLogin ? '账号登录' : '新用户注册' }}</p>
      </div>

      <div class="form-container">
        <div class="input-group">
          <Phone :size="18" class="icon" />
          <input 
            v-model="phone" 
            type="tel" 
            placeholder="请输入手机号" 
            maxlength="11"
            :disabled="loading"
          />
        </div>

        <div class="input-group">
          <Lock :size="18" class="icon" />
          <input 
            v-model="password" 
            type="password" 
            :placeholder="isLogin ? '请输入密码' : '请设置密码(不少于6位)'" 
            :disabled="loading"
            @keyup.enter="handleAuth"
          />
        </div>

        <button class="auth-btn" :disabled="loading" @click="handleAuth">
          <Loader2 v-if="loading" class="spinner" :size="20" />
          {{ isLogin ? '立即登录' : '立即注册' }}
        </button>

        <div class="switch-mode">
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <span @click="toggleMode">{{ isLogin ? '立即注册' : '去登录' }}</span>
        </div>
      </div>

      <div class="tips">
        注册即代表您同意《服务协议》与《隐私政策》
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%);
  padding: 20px;
}

.login-card {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 440px;
  padding: 48px 40px;
  position: relative;
}

.back-home {
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-text {
  font-size: 28px;
  font-weight: bold;
  color: var(--primary-color, #1fcdb6);
  margin-bottom: 8px;
}

.subtitle {
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-group .icon {
  position: absolute;
  left: 16px;
  color: #94a3b8;
}

.input-group input {
  width: 100%;
  padding: 14px 14px 14px 48px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  font-size: 15px;
  transition: border-color 0.3s;
}

.input-group input:focus {
  border-color: var(--primary-color, #1fcdb6);
}

.auth-btn {
  background-color: var(--primary-color, #1fcdb6);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.switch-mode {
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.switch-mode span {
  color: var(--primary-color, #1fcdb6);
  font-weight: bold;
  cursor: pointer;
  margin-left: 4px;
}

.tips {
  margin-top: 32px;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}
</style>
