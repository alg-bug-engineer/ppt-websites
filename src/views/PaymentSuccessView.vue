<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { store } from '../store';
import { CheckCircle, ArrowRight, Loader } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

// Try multiple possible query parameter names used by 302.ai
const checkoutId = (route.query.checkout_id || route.query.order_id || route.query.payment_order) as string;

const isLoading = ref(true);
const status = ref<'success' | 'failed' | 'checking'>('checking');
const message = ref('正在验证支付状态...');
const orderTitle = ref('');

onMounted(async () => {
  console.log('Payment Success Page mounted. Query Params:', route.query);
  
  if (!checkoutId) {
    console.error('No payment ID found in URL parameters.');
    status.value = 'failed';
    message.value = '无效的支付请求 (缺少订单ID)';
    isLoading.value = false;
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/api/pay/status/${checkoutId}`);
    const data = await response.json();
    
    if (response.ok && (data.status === 'succeeded' || data.status === 'paid' || data.payment_status === 1)) {
      status.value = 'success';
      message.value = '支付成功！感谢您的支持。';
      orderTitle.value = data.metadata?.title || data.extra?.title || data.title || '订单支付';
      
      // Update store based on what was bought
      if (orderTitle.value.includes('开通永久会员')) {
        store.becomeMember();
      }
    } else {
      status.value = 'failed';
      message.value = '支付未完成或验证失败';
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    status.value = 'failed';
    message.value = '网络错误，请联系客服确认支付状态';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="success-view">
    <div v-if="isLoading" class="status-card loading">
      <Loader class="animate-spin" :size="64" color="#1fcdb6" />
      <h2>{{ message }}</h2>
    </div>

    <div v-else-if="status === 'success'" class="status-card success">
      <CheckCircle :size="80" color="#1fcdb6" />
      <h1>支付成功</h1>
      <p class="order-info">{{ orderTitle }}</p>
      <p class="desc">您的权益已生效，您可以继续浏览或开始下载了。</p>
      <div class="actions">
        <button class="primary-btn" @click="router.push('/')">
          回到首页 <ArrowRight :size="18" />
        </button>
      </div>
    </div>

    <div v-else class="status-card failed">
      <div class="fail-icon">!</div>
      <h1>支付验证失败</h1>
      <p class="desc">{{ message }}</p>
      <div class="actions">
        <button class="secondary-btn" @click="router.push('/')">回到首页</button>
        <button class="primary-btn" @click="router.push('/contact')">联系客服</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-view { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 40px; }
.status-card { background: #fff; padding: 60px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); text-align: center; max-width: 500px; width: 100%; }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.status-card h1 { font-size: 32px; margin: 24px 0 12px; color: #333; }
.status-card h2 { font-size: 20px; color: #64748b; margin-top: 20px; }
.order-info { font-weight: bold; color: #1fcdb6; font-size: 18px; margin-bottom: 8px; }
.desc { color: #94a3b8; margin-bottom: 40px; }

.fail-icon { width: 80px; height: 80px; border-radius: 50%; background: #fef2f2; color: #ef4444; font-size: 40px; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto; }

.actions { display: flex; gap: 16px; justify-content: center; }
.primary-btn { background: #1fcdb6; color: #fff; border: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.secondary-btn { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 14px 28px; border-radius: 12px; font-weight: bold; cursor: pointer; }
</style>
