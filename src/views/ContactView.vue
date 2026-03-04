<script setup lang="ts">
import { Mail, MessageSquare, ArrowRight } from 'lucide-vue-next';
import { store } from '../store';
</script>

<template>
  <div class="contact-view">
    <div class="contact-header">
      <h1 class="contact-title">{{ store.t('contactTitle') }}</h1>
      <p class="contact-subtitle">{{ store.t('contactSubtitle') }}</p>
    </div>

    <div class="contact-content">
      <div class="contact-qr-section">
        <div class="qr-card">
          <h3>{{ store.t('scanToAddWechat') }}</h3>
          <p class="qr-desc">{{ store.t('qrDesc') }}</p>
          <div class="qr-image-container">
            <img src="/QR.png" alt="WeChat QR" class="qr-image" />
            <span>{{ store.t('officialSupport') }}</span>
          </div>
        </div>
      </div>

      <div class="contact-info-cards">
        <div class="info-card">
          <div class="info-icon email">
            <Mail :size="24" />
          </div>
          <div class="info-details">
            <h4>{{ store.t('businessCooperation') }}</h4>
            <p>646184101@qq.com</p>
            <span>{{ store.t('partnerships') }}</span>
          </div>
        </div>
        
        <div class="info-card custom">
          <div class="info-icon blue">
            <MessageSquare :size="24" />
          </div>
          <div class="info-details">
            <h4>{{ store.t('premiumCustomization') }}</h4>
            <p>{{ store.t('aboutUsDesc3').substring(0, 30) }}...</p>
            <button class="custom-btn" @click="$router.push('/contact')">{{ store.t('learnMore') }} <ArrowRight :size="16" /></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-view { padding: 40px 0; }
.contact-header { text-align: center; margin-bottom: 60px; }
.contact-title { font-size: 36px; color: #333; margin-bottom: 12px; }
.contact-subtitle { font-size: 18px; color: #999; }

.contact-content { display: flex; gap: 60px; max-width: 1000px; margin: 0 auto; align-items: flex-start; }

.contact-qr-section { flex: 1; }
.qr-card { background-color: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); text-align: center; }
.qr-card h3 { font-size: 24px; color: #333; margin-bottom: 8px; }
.qr-desc { color: #999; font-size: 14px; margin-bottom: 30px; }

.qr-image-container { background-color: #f8fafc; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 20px; border: 1px solid #f1f5f9; margin-bottom: 20px; }
.qr-image { width: 240px; height: 240px; object-fit: contain; }
.qr-image-container span { font-weight: bold; color: #1fcdb6; font-size: 18px; }

.wechat-id { font-size: 15px; color: #64748b; font-family: monospace; }

.contact-info-cards { width: 400px; display: flex; flex-direction: column; gap: 24px; }
.info-card { background-color: #fff; padding: 24px; border-radius: 16px; display: flex; gap: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.info-icon { width: 54px; height: 54px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; }
.info-icon.email { background-color: #3b82f6; }
.info-icon.blue { background-color: #6366f1; }

.info-details h4 { font-size: 16px; margin-bottom: 6px; color: #333; }
.info-details p { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 4px; }
.info-details span { font-size: 12px; color: #999; }

.custom-btn { background: none; border: none; color: #6366f1; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 0; margin-top: 10px; }
</style>
