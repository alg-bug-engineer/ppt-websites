<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { store } from '../store';
import type { Template } from '../store';
import { X, Download, Crown } from 'lucide-vue-next';

const props = defineProps<{
  template: Template | null;
}>();

const emit = defineEmits(['close']);

const showPayModal = ref(false);
const payType = ref<'single' | 'member'>('single');

const displayPrice = computed(() => {
  if (!props.template) return 0;
  return store.user.isMember ? (props.template.price * 0.1).toFixed(2) : props.template.price.toFixed(2);
});

const handleDownload = () => {
  if (!store.user.isLoggedIn) {
    alert('请先登录后下载');
    return;
  }
  showPayModal.value = true;
};

const isPaying = ref(false);

const handlePay = async () => {
  if (isPaying.value) return;
  isPaying.value = true;
  
  try {
    const amount = payType.value === 'member' ? '9.90' : displayPrice.value;
    const title = payType.value === 'member' ? '开通永久会员' : `下载PPT: ${props.template?.title}`;
    
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
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || '服务器响应异常');
    }

    if (response.ok && data.checkout_url) {
      // Redirect to 302.ai payment page
      window.location.href = data.checkout_url;
    } else {
      alert('创建支付订单失败: ' + (data.error || '未知错误'));
      isPaying.value = false;
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('支付系统连接失败，请稍后再试');
    isPaying.value = false;
  }
};

// Increment view count when modal opens
watch(() => props.template, (newVal) => {
  if (newVal) store.incrementView(newVal.id);
});
</script>

<template>
  <div v-if="template" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <div class="title-with-tag">
          <h3>{{ template.title }}</h3>
          <span v-if="store.user.isMember" class="member-tag">会员专享1折</span>
        </div>
        <button class="close-btn" @click="emit('close')">
          <X :size="24" />
        </button>
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
            <span class="stat-item">浏览: {{ template.viewCount }}</span>
            <span class="stat-item">下载: {{ template.downloadCount }}</span>
            <span class="format-tag">软件: PPT / 比例: 16:9</span>
          </div>

          <div class="purchase-actions">
            <div class="price-info">
              <span class="current-price">¥{{ displayPrice }}</span>
              <span v-if="!store.user.isMember" class="original-price">原价 ¥{{ template.price }}</span>
            </div>

            <div class="action-buttons">
              <div v-if="!store.user.isMember" class="member-card-mini" @click="payType = 'member'; showPayModal = true">
                <Crown :size="16" />
                <div class="card-text">
                  <span class="card-title">9.9元开通永久会员</span>
                  <span class="card-subtitle">全站PPT享1折下载</span>
                </div>
              </div>
              <button class="download-btn" @click="handleDownload">
                <Download :size="18" />
                获取下载链接
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPayModal" class="pay-overlay" @click.self="showPayModal = false">
      <div class="pay-card">
        <div class="pay-header">
          <h3>{{ payType === 'member' ? '开通永久会员' : '支付确认' }}</h3>
          <button class="close-pay" @click="showPayModal = false">×</button>
        </div>
        <div class="pay-body">
          <div class="pay-info-box">
            <div class="pay-price">应付金额: <span>¥{{ payType === 'member' ? '9.90' : displayPrice }}</span></div>
            <p v-if="payType === 'single'" class="pay-notice">支付成功后将立即获得 PPT 文件下载权限</p>
            <p v-else class="pay-notice">开通后立享全站 1折 下载特权</p>
          </div>
          <div class="pay-methods">
            <p>支持 微信支付 / 支付宝 / 信用卡</p>
          </div>
          <button class="confirm-pay-btn" @click="handlePay" :disabled="isPaying">
            {{ isPaying ? '正在跳转支付...' : '立即去支付' }}
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
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 20px;
  width: 90%;
  max-width: 1000px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.title-with-tag { display: flex; align-items: center; gap: 12px; }
.title-with-tag h3 { font-size: 20px; color: #1e293b; margin: 0; }
.member-tag { background: #fff7ed; color: #ea580c; font-size: 12px; padding: 2px 8px; border-radius: 4px; border: 1px solid #ffedd5; }
.close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 50%; display: flex; transition: 0.2s; }
.close-btn:hover { background-color: #f1f5f9; color: #64748b; }

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.main-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background-color: #f8fafc;
}

.preview-images-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.main-preview { width: 100%; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.detail-images { display: flex; flex-direction: column; gap: 20px; }
.detail-images img { width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* Purchase Bar */
.purchase-bar {
  padding: 20px 40px;
  background-color: #fff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.03);
  z-index: 10;
}

.stats-info { display: flex; flex-direction: column; gap: 4px; }
.stat-item { font-size: 13px; color: #64748b; }
.format-tag { font-size: 12px; color: #94a3b8; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; margin-top: 4px; }

.purchase-actions { display: flex; align-items: center; gap: 30px; }

.price-info { display: flex; flex-direction: column; align-items: flex-end; }
.current-price { color: #ef4444; font-size: 28px; font-weight: bold; line-height: 1; }
.original-price { color: #94a3b8; text-decoration: line-through; font-size: 14px; }

.action-buttons { display: flex; align-items: center; gap: 16px; }

.member-card-mini {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: #fbbf24;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
}
.member-card-mini:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.card-text { display: flex; flex-direction: column; }
.card-title { font-size: 13px; font-weight: bold; }
.card-subtitle { font-size: 11px; opacity: 0.8; }

.download-btn {
  background-color: #1fcdb6;
  color: #fff;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  transition: 0.3s;
}
.download-btn:hover { background-color: #1ab39e; }

/* Pay Modal */
.pay-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1100; display: flex; align-items: center; justify-content: center; }
.pay-card { background: #fff; width: 380px; border-radius: 20px; padding: 30px; text-align: center; }
.pay-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.pay-header h3 { margin: 0; font-size: 18px; }
.close-pay { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; }

.pay-info-box { background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 20px; }
.pay-price { font-size: 16px; color: #475569; margin-bottom: 8px; }
.pay-price span { color: #ef4444; font-size: 32px; font-weight: bold; }
.pay-notice { font-size: 13px; color: #64748b; margin: 0; }

.pay-methods { margin: 20px 0; color: #94a3b8; font-size: 12px; }
.confirm-pay-btn { width: 100%; background: #1fcdb6; color: #fff; border: none; padding: 16px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 16px; }
.confirm-pay-btn:disabled { background-color: #cbd5e1; cursor: not-allowed; }
</style>
