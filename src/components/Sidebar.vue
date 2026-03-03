<script setup lang="ts">
import { useRouter } from 'vue-router';
import { store } from '../store';
import { categories as allCategories } from '../data';
import { 
  GraduationCap, 
  Lightbulb, 
  BookMarked, 
  Crown, 
  FileText, 
  Gift 
} from 'lucide-vue-next';

const router = useRouter();

// Filter categories for sidebar (exclude Premium Customization id:6 as it is in Header)
const sidebarCategories = allCategories.filter(c => c.id !== 6).map(c => {
  const iconMap: Record<number, any> = {
    1: GraduationCap,
    2: Lightbulb,
    3: BookMarked,
    4: GraduationCap,
    7: FileText,
    8: Gift
  };
  return { ...c, icon: iconMap[c.id] || GraduationCap };
});

const navigateToCategory = (id: number) => {
  router.push(`/category/${id}`);
};
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <ul class="category-list">
        <li 
          v-for="cat in sidebarCategories" 
          :key="cat.id" 
          class="category-item"
          @click="navigateToCategory(cat.id)"
        >
          <component :is="cat.icon" :size="20" class="category-icon" />
          <span class="category-name">{{ store.t(cat.nameKey as any) }}</span>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background-color: #fff;
  border-right: 1px solid var(--border-color);
  padding: 20px 0;
  height: calc(100vh - 70px);
  position: sticky;
  top: 70px;
  overflow-y: auto;
}

.category-list {
  display: flex;
  flex-direction: column;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  color: #333;
  font-size: 15px;
  font-weight: 500;
}

.category-item:hover {
  background-color: #f0fdfa;
  color: var(--primary-color);
}

.category-icon {
  color: #666;
}

.category-item:hover .category-icon {
  color: var(--primary-color);
}

.category-name {
  white-space: nowrap;
}
</style>
