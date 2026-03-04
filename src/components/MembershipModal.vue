<script setup lang="ts">
import { ref } from 'vue';
import { store } from '../store';
import { Crown, Download, ShieldCheck } from 'lucide-vue-next';

const isPaying = ref(false);

const handlePay = async () => {
  if (isPaying.value) return;
  isPaying.value = true;
  
  try {
    await store.createPaymentOrder({
      amount: '9.90',
      title: store.t('lifetimeMembership'),
      itemType: 'member'
    });
  } catch (error) {
    alert(store.t('verificationFailed'));
  } finally {
    isPaying.value = false;
  }
};

const close = () => {
  store.ui.showMembershipModal = false;
};
</script>

<template>
  <div v-if="store.ui.showMembershipModal" class="pay-overlay" @click.self="close">
    <div class="pay-card member-style">
      <div class="pay-header">
        <h3>{{ store.t('lifetimeMembership') }}</h3>
        <button class="close-pay" @click="close">×</button>
      </div>
      <div class="pay-body">
        <div class="member-benefits">
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
            <ShieldCheck :size="20" color="#94a3b8" />
            <div class="benefit-info">
              <div class="benefit-title">{{ store.t('benefitDashboardTitle') }}</div>
              <div class="benefit-desc">{{ store.t('benefitDashboardDesc') }}</div>
            </div>
          </div>
        </div>

        <div class="pay-info-box">
          <div class="pay-price">{{ store.t('amountDue') }}: <span>$9.90</span></div>
          <p class="pay-notice">{{ store.t('lifetimeNotice') }}</p>
        </div>
        
        <button class="confirm-pay-btn" @click="handlePay" :disabled="isPaying">
          {{ isPaying ? store.t('redirectingToPayment') : store.t('payNow') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pay-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.pay-card { background: #fff; width: 100%; max-width: 400px; border-radius: 24px; padding: 32px; text-align: center; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
.pay-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.pay-header h3 { margin: 0; font-size: 20px; color: #1e293b; font-weight: bold; }
.close-pay { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; padding: 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.close-pay:hover { background-color: #f1f5f9; color: #334155; }

.pay-card.member-style { border: 2px solid #fbbf24; background: linear-gradient(to bottom, #fffcf0, #fff); }
.member-benefits { text-align: left; margin-bottom: 24px; background: rgba(251, 191, 36, 0.05); padding: 20px; border-radius: 16px; border: 1px solid rgba(251, 191, 36, 0.1); }
.benefit-item { display: flex; gap: 14px; margin-bottom: 16px; align-items: flex-start; }
.benefit-item:last-child { margin-bottom: 0; }
.benefit-title { font-size: 15px; font-weight: bold; color: #92400e; }
.benefit-desc { font-size: 12px; color: #b45309; opacity: 0.8; }

.pay-info-box { background: #f8fafc; padding: 24px; border-radius: 16px; margin-bottom: 24px; }
.pay-price { font-size: 16px; color: #475569; margin-bottom: 8px; }
.pay-price span { color: #ef4444; font-size: 36px; font-weight: 800; }
.pay-notice { font-size: 13px; color: #64748b; margin: 0; }

.confirm-pay-btn { width: 100%; background: #1fcdb6; color: #fff; border: none; padding: 16px; border-radius: 14px; font-weight: bold; cursor: pointer; font-size: 16px; transition: 0.3s; box-shadow: 0 4px 12px rgba(31, 205, 182, 0.2); }
.confirm-pay-btn:hover:not(:disabled) { background: #1ba89a; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(31, 205, 182, 0.3); }
.confirm-pay-btn:active { transform: translateY(0); }
.confirm-pay-btn:disabled { background-color: #cbd5e1; cursor: not-allowed; box-shadow: none; }
</style>
