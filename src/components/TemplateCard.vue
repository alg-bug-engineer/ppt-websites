<script setup lang="ts">
import { store } from '../store';
import type { Template } from '../data';

defineProps<{
  template: Template;
}>();
</script>

<template>
  <div class="template-card">
    <div class="template-image">
      <img :src="store.getAssetUrl(template.image)" :alt="template.title" loading="lazy" />
      <div class="overlay">
        <button class="preview-btn">{{ store.t('preview') }}</button>
      </div>
    </div>
    <div class="template-info">
      <h3 class="template-title">{{ template.title }}</h3>
      <div class="template-footer">
        <span class="price">${{ template.price.toFixed(2) }}</span>
        <button class="download-btn">{{ store.t('get') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  margin-bottom: 24px;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.template-image {
  position: relative;
  aspect-ratio: 16 / 9;
  background-color: #eee;
  overflow: hidden;
}

.template-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.template-card:hover .template-image img {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.template-card:hover .overlay {
  opacity: 1;
}

.preview-btn {
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.template-info {
  padding: 16px;
}

.template-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  margin-bottom: 12px;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f5222d;
  font-weight: bold;
  font-size: 18px;
}

.download-btn {
  background: none;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.download-btn:hover {
  background-color: var(--primary-color);
  color: #fff;
}
</style>
