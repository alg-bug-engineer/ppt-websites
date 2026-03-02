<script setup lang="ts">
import { ref } from 'vue';
import TemplateCard from '../components/TemplateCard.vue';
import PreviewModal from '../components/PreviewModal.vue';
import { store } from '../store';
import type { Template } from '../data';

const selectedTemplate = ref<Template | null>(null);

const handleOpenModal = (template: Template) => {
  selectedTemplate.value = template;
};
</script>

<template>
  <div class="home-view">
    <div class="banner">
      <div class="banner-content">
        <h2 class="banner-title">专业教学竞赛PPT定制</h2>
        <p class="banner-desc">助力高校老师在各类教学竞赛中脱颖而出，提供一站式演示方案。</p>
        <button class="banner-btn" @click="$router.push('/contact')">立即咨询</button>
      </div>
    </div>

    <div class="section-header">
      <h2 class="section-title">热门模板</h2>
      <div class="sort-options">
        <span class="active">最新发布</span>
        <span>销量最高</span>
        <span>价格低到高</span>
      </div>
    </div>

    <div class="templates-grid">
      <TemplateCard 
        v-for="template in store.templates" 
        :key="template.id" 
        :template="template"
        @click="handleOpenModal(template)"
      />
    </div>


    <div class="load-more">
      <button class="load-more-btn">没有更多了</button>
    </div>

    <PreviewModal 
      :template="selectedTemplate" 
      @close="selectedTemplate = null" 
    />
  </div>
</template>

<style scoped>
.home-view {
  padding: 24px 0;
}

.banner {
  background: linear-gradient(135deg, #1fcdb6 0%, #0f4eff 100%);
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 30px;
  color: #fff;
  height: 240px;
  display: flex;
  align-items: center;
}

.banner-title {
  font-size: 32px;
  margin-bottom: 12px;
}

.banner-desc {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 24px;
}

.banner-btn {
  background-color: #fff;
  color: var(--secondary-color);
  border: none;
  padding: 10px 30px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s;
}

.banner-btn:hover {
  transform: scale(1.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.sort-options {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.sort-options span {
  cursor: pointer;
  transition: color 0.3s;
}

.sort-options span:hover, .sort-options span.active {
  color: var(--primary-color);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 40px;
}

.load-more-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 14px;
  cursor: default;
}
</style>
