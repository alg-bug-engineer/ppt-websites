<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { store } from '../store';
import type { Template } from '../store';
import { X, Download, Crown, ShieldCheck, Home } from 'lucide-vue-next';

const props = defineProps<{
  template: Template | null;
}>();

const emit = defineEmits(['close']);

const showPayModal = ref(false);
const payType = ref<'single' | 'member'>('single');

const displayPrice = computed(() => {
  if (!props.template) return 0;
  return store.getDisplayPrice(props.template.price);
});

const isAlreadyPurchased = computed(() => {
  if (!props.template) return false;
  return store.hasPurchased(props.template.id);
});

const handleDownload = () => {
  if (!store.user.isLoggedIn) {
    alert(store.t('loginNow'));
    return;
  }
  
  if (isAlreadyPurchased.value) {
    // Already purchased, trigger download directly
    window.open(`http://localhost:3001/api/templates/${props.template?.id}/download`, '_blank');
    return;
  }
  
  payType.value = 'single';
  showPayModal.value = true;
};

const isPaying = ref(false);

const handlePay = async () => {
  if (isPaying.value) return;
  isPaying.value = true;
  
  try {
    const amount = payType.value === 'member' ? '9.90' : displayPrice.value;
    const title = payType.value === 'member' ? store.t('lifetimeMembership') : `Download PPT: ${props.template?.title}`;
    
    const response = await fetch('http://localhost:3001/api/pay/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        title,
        customerId: store.user.phone || 'guest',
        customerEmail: '',
        itemType: payType.value === 'member' ? 'member' : 'ppt',
        itemId: props.template?.id
      })
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || 'Server response error');
    }

    const data = JSON.parse(text);
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      alert(store.t('verificationFailed') + ': ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Payment Error:', error);
    alert('Payment system connection failed, please try again later');
  } finally {
    isPaying.value = false;
  }
};

// Auto-track view count when modal opens
watch(() => props.template, (newT) => {
  if (newT) {
    fetch(`http://localhost:3001/api/templates/${newT.id}/view`, { method: 'POST' });
  }
});
</script>

<template>
  <div v-if="template" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-container">
      <button class="close-btn" @click="emit('close')">
        <X :size="24" />
      </button>
      
      <div class="modal-header">
        <div class="title-with-tag">
          <h3>{{ template.title }}</h3>
          <span v-if="store.user.isMember" class="member-tag">{{ store.t('memberExclusive') }}</span>
        </div>
      </div>
      
      <div class="modal-body">
        <div class="main-content-scroll">
          <!-- Preview Images -->
          <div class="preview-images-section">
            <img :src="store.getAssetUrl(template.image)" :alt="template.title" class="main-preview" />
            <div class="detail-images">
               <img v-for="(img, i) in template.screenshots" :key="i" :src="store.getAssetUrl(img)" alt="detail" />
            </div>
          </div>
        </div>

        <!-- Sticky Bottom Purchase Bar -->
        <div class="purchase-bar">
          <div class="stats-info">
            <span class="stat-item">{{ store.t('views') }}: {{ template.viewCount }}</span>
            <span class="stat-item">{{ store.t('downloads') }}: {{ template.downloadCount }}</span>
            <span class="format-tag">{{ store.t('software') }}: PPT / {{ store.t('aspect') }}: 16:9</span>
          </div>

          <div class="purchase-actions">
            <div class="price-info">
              <span class="current-price">${{ displayPrice }}</span>
              <span v-if="!store.user.isMember" class="original-price">{{ store.t('originalPrice') }} ${{ template.price }}</span>
            </div>

            <div class="action-buttons">
              <div v-if="!store.user.isMember" class="member-card-mini" @click="payType = 'member'; showPayModal = true">
                <Crown :size="16" />
                <div class="card-text">
                  <span class="card-title">{{ store.t('membershipPrice') }}</span>
                  <span class="card-subtitle">{{ store.t('membershipDesc') }}</span>
                </div>
              </div>
              <button class="download-btn" @click="handleDownload" :class="{ purchased: isAlreadyPurchased }">
                <Download :size="18" />
                {{ isAlreadyPurchased ? store.t('downloadNow') : store.t('getDownloadLink') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal (Now with Member Benefits) -->
    <div v-if="showPayModal" class="pay-overlay" @click.self="showPayModal = false">
      <div class="pay-card" :class="{ 'member-style': payType === 'member' }">
        <div class="pay-header">
          <h3>{{ payType === 'member' ? store.t('lifetimeMembership') : store.t('paymentSuccessful') }}</h3>
          <button class="close-pay" @click="showPayModal = false">×</button>
        </div>
        <div class="pay-body">
          <div v-if="payType === 'member'" class="member-benefits">
            <div class="benefit-item">
              <Crown :size="20" color="#fbbf24" />
              <div class="benefit-info">
                <div class="benefit-title">{{ store.t('benefitDiscountTitle') }}</div>
                <div class="benefit-desc">{{ store.t('benefitDiscountDesc') }}</div>
              </div>
            </div>
            <div class="benefit-item">
              <Download :size="20" color="#1fcdb6" />
              <div class="benefit-info">
                <div class="benefit-title">{{ store.t('benefitUnlimitedTitle') }}</div>
                <div class="benefit-desc">{{ store.t('benefitUnlimitedDesc') }}</div>
              </div>
            </div>
            <div class="benefit-item">
              <X :size="20" color="#94a3b8" />
              <div class="benefit-info">
                <div class="benefit-title">{{ store.t('benefitDashboardTitle') }}</div>
                <div class="benefit-desc">{{ store.t('benefitDashboardDesc') }}</div>
              </div>
            </div>
          </div>

          <div class="pay-info-box">
            <div class="pay-price">{{ store.t('amountDue') }}: <span>${{ payType === 'member' ? '9.90' : displayPrice }}</span></div>
            <p v-if="payType === 'single'" class="pay-notice">{{ store.t('paymentNotice') }}</p>
            <p v-else class="pay-notice">{{ store.t('lifetimeNotice') }}</p>
          </div>
          
          <button class="confirm-pay-btn" @click="handlePay" :disabled="isPaying">
            {{ isPaying ? store.t('redirectingToPayment') : store.t('payNow') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background-color: #fff;
  width: 100%;
  max-width: 1000px;
  height: 90vh;
  border-radius: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.modal-header {
  padding: 24px 40px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.title-with-tag { display: flex; align-items: center; gap: 12px; }
.title-with-tag h3 { font-size: 20px; color: #1e293b; margin: 0; }
.member-tag { font-size: 12px; background: #fff7ed; color: #ea580c; padding: 2px 8px; border-radius: 4px; border: 1px solid #ffedd5; }

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 40px;
  background-color: #f8fafc;
}

.preview-images-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-preview {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.detail-images {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-images img {
  width: 100%;
  border-radius: 8px;
}

.purchase-bar {
  padding: 24px 40px;
  background: white;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.stats-info { display: flex; align-items: center; gap: 20px; color: #64748b; font-size: 14px; }
.format-tag { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }

.purchase-actions { display: flex; align-items: center; gap: 32px; }
.price-info { display: flex; flex-direction: column; align-items: flex-end; }
.current-price { font-size: 28px; font-weight: bold; color: #ef4444; }
.original-price { font-size: 14px; color: #94a3b8; text-decoration: line-through; }

.action-buttons { display: flex; align-items: center; gap: 16px; }

.member-card-mini { background: #1e293b; color: #fff; padding: 8px 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s; }
.member-card-mini:hover { background: #334155; transform: translateY(-2px); }
.member-card-mini .card-text { display: flex; flex-direction: column; }
.card-title { font-size: 13px; font-weight: bold; color: #fbbf24; }
.card-subtitle { font-size: 11px; opacity: 0.7; }

.download-btn { background: #1fcdb6; color: #fff; border: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
.download-btn:hover { background: #1ba89a; transform: translateY(-2px); }

.download-btn.purchased { background-color: #3b82f6; }
.download-btn.purchased:hover { background-color: #2563eb; }

/* Pay Modal Styles */
.pay-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1100; display: flex; align-items: center; justify-content: center; }
.pay-card { background: #fff; width: 380px; border-radius: 20px; padding: 30px; text-align: center; }
.pay-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.pay-header h3 { margin: 0; font-size: 18px; }
.close-pay { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; }

/* Member Style Pay Card */
.pay-card.member-style { border: 2px solid #fbbf24; }
.member-benefits { text-align: left; margin-bottom: 20px; background: #fffbeb; padding: 15px; border-radius: 12px; }
.benefit-item { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
.benefit-item:last-child { margin-bottom: 0; }
.benefit-title { font-size: 14px; font-weight: bold; color: #92400e; }
.benefit-desc { font-size: 12px; color: #b45309; }

.pay-info-box { background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 20px; }
.pay-price { font-size: 16px; color: #475569; margin-bottom: 8px; }
.pay-price span { color: #ef4444; font-size: 32px; font-weight: bold; }
.pay-notice { font-size: 13px; color: #64748b; margin: 0; }

.confirm-pay-btn { width: 100%; background: #1fcdb6; color: #fff; border: none; padding: 16px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 16px; }
.confirm-pay-btn:disabled { background-color: #cbd5e1; cursor: not-allowed; }
</style>
