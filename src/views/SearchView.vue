<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { store } from '../store';
import TemplateCard from '../components/TemplateCard.vue';
import PreviewModal from '../components/PreviewModal.vue';
import type { Template } from '../data';

const route = useRoute();
const selectedTemplate = ref<Template | null>(null);

const searchQuery = computed(() => route.query.q as string || '');

const searchResults = computed(() => {
  if (!searchQuery.value) return [];
  return store.templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleOpenModal = (template: Template) => {
  selectedTemplate.value = template;
};
</script>

<template>
  <div class="search-view">
    <div class="search-info">
      <h2 class="search-title">搜索结果: "{{ searchQuery }}"</h2>
      <div class="stats">找到 {{ searchResults.length }} 个相关模板</div>
    </div>

    <div v-if="searchResults.length > 0" class="template-grid">
      <TemplateCard 
        v-for="template in searchResults" 
        :key="template.id" 
        :template="template" 
        @click="handleOpenModal(template)"
      />
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>抱歉，未找到与 "{{ searchQuery }}" 相关的模板</p>
      <p class="suggestion">尝试换个关键词，如“教学”、“创新”或“答辩”</p>
    </div>

    <PreviewModal 
      :template="selectedTemplate" 
      @close="selectedTemplate = null" 
    />
  </div>
</template>

<style scoped>
.search-view {
  padding: 24px 0;
}

.search-info {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.search-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
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
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-state p {
  color: #666;
  font-size: 18px;
  margin-bottom: 10px;
}

.suggestion {
  color: #999 !important;
  font-size: 14px !important;
}
</style>
