<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { store } from '../store';
import { CheckCircle, ArrowRight, Loader, Download } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

// Try multiple possible query parameter names used by 302.ai
const checkoutId = (route.query.checkout_id || route.query.order_id || route.query.payment_order) as string;

const isLoading = ref(true);
const status = ref<'success' | 'failed' | 'checking'>('checking');
const message = ref(store.t('verifyingPayment'));
const orderTitle = ref('');
const downloadUrl = ref('');
const itemType = ref('');
const itemId = ref('');

const handleDownload = () => {
  if (downloadUrl.value) {
    const fullUrl = downloadUrl.value.startsWith('http') 
      ? downloadUrl.value 
      : `${store.apiBase}${downloadUrl.value.startsWith('/') ? '' : '/'}${downloadUrl.value}`;
    window.open(fullUrl, '_blank');
  }
};

const checkStatus = async () => {
  try {
    const response = await fetch(`${store.apiBase}/pay/status/${checkoutId}`);
    const data = await response.json();
    
    if (response.ok && (data.status === 'paid' || data.payment_status === 1)) {
      status.value = 'success';
      message.value = store.t('paymentThankYou');
      orderTitle.value = data.metadata?.title || store.t('orderId');
      downloadUrl.value = data.metadata?.downloadUrl || '';
      itemType.value = data.itemType || '';
      itemId.value = data.itemId || '';
      
      // Sync local user state
      await store.fetchUserProfile();

      // If membership, redirect to home after 3s
      if (itemType.value === 'member' || orderTitle.value.toLowerCase().includes('member')) {
        setTimeout(() => {
           router.push('/');
        }, 3000);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Verify payment error:', error);
    return false;
  }
};

onMounted(async () => {
  console.log('Payment Success Page mounted. Query Params:', route.query);
  
  if (!checkoutId) {
    console.error('No payment ID found in URL parameters.');
    status.value = 'failed';
    message.value = 'Invalid payment request (Missing Order ID)';
    isLoading.value = false;
    return;
  }

  // Poll for status up to 10 times
  let attempts = 0;
  const maxAttempts = 10;
  
  const poll = async () => {
    const isPaid = await checkStatus();
    if (isPaid) {
      isLoading.value = false;
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(poll, 2000);
    } else {
      status.value = 'failed';
      message.value = 'Payment incomplete or verification timed out. Please refresh to check status.';
      isLoading.value = false;
    }
  };
  
  poll();
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
      <h1>{{ store.t('paymentSuccessful') }}</h1>
      <p class="order-info">{{ orderTitle }}</p>
      
      <div v-if="itemType === 'ppt'" class="download-section">
        <p class="desc">{{ store.t('getDownloadLink') }}:</p>
        <div class="download-box">
          <p class="url-text">{{ downloadUrl || store.t('generatingDownloadLink') }}</p>
          <button v-if="downloadUrl" class="download-btn" @click="handleDownload">
            <Download :size="18" /> {{ store.t('downloadNow') }}
          </button>
        </div>
      </div>
      <div v-else class="member-success">
         <p class="desc">{{ store.t('memberSuccessDesc') }}</p>
      </div>

      <div class="actions">
        <button class="primary-btn" @click="router.push('/')">
          {{ store.t('backToHome') }} <ArrowRight :size="18" />
        </button>
      </div>
    </div>

    <div v-else class="status-card failed">
      <div class="fail-icon">!</div>
      <h1>{{ store.t('verificationFailed') }}</h1>
      <p class="desc">{{ message }}</p>
      <div class="actions">
        <button class="secondary-btn" @click="router.push('/')">{{ store.t('backToHome') }}</button>
        <button class="primary-btn" @click="router.push('/contact')">{{ store.t('contactSupport') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-view { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 40px; }
.status-card { background: #fff; padding: 60px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); text-align: center; max-width: 600px; width: 100%; }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.status-card h1 { font-size: 32px; margin: 24px 0 12px; color: #333; }
.status-card h2 { font-size: 20px; color: #64748b; margin-top: 20px; }
.order-info { font-weight: bold; color: #1fcdb6; font-size: 18px; margin-bottom: 24px; }
.desc { color: #64748b; margin-bottom: 20px; }

.download-section { margin-bottom: 30px; text-align: left; }
.download-box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1; }
.url-text { color: #1e293b; font-size: 14px; word-break: break-all; margin-bottom: 16px; line-height: 1.6; }
.download-btn { background: #1fcdb6; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; margin: 0 auto; }

.fail-icon { width: 80px; height: 80px; border-radius: 50%; background: #fef2f2; color: #ef4444; font-size: 40px; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto; }

.actions { display: flex; gap: 16px; justify-content: center; margin-top: 30px; }
.primary-btn { background: #1fcdb6; color: #fff; border: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.secondary-btn { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 14px 28px; border-radius: 12px; font-weight: bold; cursor: pointer; }
</style>
