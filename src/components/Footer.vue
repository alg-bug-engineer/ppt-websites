<script setup lang="ts">
import { Mail, MapPin } from 'lucide-vue-next';
import { store } from '../store';
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-left">
        <div class="logo-white">{{ store.t('siteTitle') }}</div>
        <p class="slogan">{{ store.t('footerSlogan') }}</p>
        
        <div class="contact-info">
          <div class="contact-item">
            <span class="label">{{ store.t('copyright') }}</span>
            <span>{{ store.t('companyName') }}</span>
          </div>
          <div class="contact-item">
            <Mail :size="16" class="icon" />
            <span class="label">{{ store.t('email') }}</span>
            <span>646184101@qq.com</span>
          </div>
          <div class="contact-item">
            <MapPin :size="16" class="icon" />
            <span class="label">{{ store.t('address') }}</span>
            <span>{{ store.t('addressDetail') }}</span>
          </div>
        </div>
      </div>

      <div class="footer-right">
        <h4 class="footer-title">{{ store.t('aboutUs') }}</h4>
        <div class="about-text">
          <p>{{ store.t('aboutUsDesc1') }}</p>
          <p>{{ store.t('aboutUsDesc2') }}</p>
          <p>{{ store.t('aboutUsDesc3') }}</p>
        </div>
      </div>
    </div>
    
    <div class="friend-links">
      <span class="label">{{ store.t('links') }}</span>
      <a href="#">Quick Animation</a>
      <a href="#">Angel in White PPT</a>
      <a href="#">AI Office Web</a>
      <a href="#">Academic Resources</a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #333;
  color: #ccc;
  padding: 60px 40px 30px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 80px;
}

.footer-left {
  flex: 1;
}

.logo-white {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20px;
}

.slogan {
  font-size: 14px;
  margin-bottom: 30px;
  color: #999;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.contact-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.icon {
  margin-right: 8px;
  color: var(--primary-color);
}

.label {
  color: #777;
  min-width: 80px;
}

.beian {
  font-size: 13px;
  color: #666;
}

.beian a:hover {
  color: var(--primary-color);
}

.footer-right {
  width: 400px;
}

.footer-title {
  color: #fff;
  font-size: 18px;
  margin-bottom: 24px;
  border-bottom: 1px solid #444;
  padding-bottom: 12px;
}

.about-text {
  font-size: 14px;
  line-height: 1.8;
  color: #999;
}

.about-text p {
  margin-bottom: 12px;
}

.friend-links {
  max-width: 1400px;
  margin: 40px auto 0;
  border-top: 1px solid #444;
  padding-top: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 13px;
}

.friend-links a {
  color: #777;
  transition: color 0.3s;
}

.friend-links a:hover {
  color: var(--primary-color);
}
</style>
