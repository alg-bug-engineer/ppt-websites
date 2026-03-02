<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { store } from '../store';
import { categories } from '../data';
import TemplateCard from '../components/TemplateCard.vue';
import PreviewModal from '../components/PreviewModal.vue';
import type { Template } from '../data';

const route = useRoute();
const selectedTemplate = ref<Template | null>(null);

const categoryId = computed(() => Number(route.params.id));
const categoryName = computed(() => {
  return categories.find(c => c.id === categoryId.value)?.name || '未知分类';
});

const filteredTemplates = computed(() => {
  return store.templates.filter(t => t.categoryId === categoryId.value);
});

const handleOpenModal = (template: Template) => {
  selectedTemplate.value = template;
};
</script>

<template>
  <div class="category-view">
    <div class="breadcrumb">
      首页 / 分类 / {{ categoryName }}
    </div>
    
    <div class="section-header">
      <h2 class="section-title">{{ categoryName }}</h2>
      <div class="stats">共 {{ filteredTemplates.length }} 个模板</div>
    </div>

    <div v-if="filteredTemplates.length > 0" class="template-grid">
      <TemplateCard 
        v-for="template in filteredTemplates" 
        :key="template.id" 
        :template="template" 
        @click="handleOpenModal(template)"
      />
    </div>
    
    <div v-else class="empty-state">
      <p>该分类下暂无模板，敬请期待...</p>
    </div>

    <PreviewModal 
      :template="selectedTemplate" 
      @close="selectedTemplate = null" 
    />
  </div>
</template>

<style scoped>
.category-view {
  padding: 24px 0;
}

.breadcrumb {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 12px;
}

.section-title {
  font-size: 24px;
  color: #333;
}

.stats {
  font-size: 14px;
  color: #666;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 100px 0;
  color: #999;
}
</style>
