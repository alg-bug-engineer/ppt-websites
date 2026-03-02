<script setup lang="ts">
import { useRouter } from 'vue-router';
import { 
  GraduationCap, 
  Lightbulb, 
  BookMarked, 
  MoreHorizontal, 
  Crown, 
  FileText, 
  Gift 
} from 'lucide-vue-next';

const router = useRouter();

const categories = [
  { id: 1, name: '教学创新大赛', icon: GraduationCap },
  { id: 2, name: '教学能力大赛', icon: Lightbulb },
  { id: 3, name: '高校青教赛', icon: BookMarked },
  { id: 4, name: '其他教学竞赛', icon: GraduationCap },
  { id: 5, name: '更多分类', icon: MoreHorizontal },
  { id: 6, name: '高端PPT定制', icon: Crown },
  { id: 7, name: '毕业论文答辩', icon: FileText },
  { id: 8, name: '免费专区', icon: Gift },
];

const navigateToCategory = (id: number) => {
  router.push(`/category/${id}`);
};
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <ul class="category-list">
        <li 
          v-for="cat in categories" 
          :key="cat.id" 
          class="category-item"
          @click="navigateToCategory(cat.id)"
        >
          <component :is="cat.icon" :size="20" class="category-icon" />
          <span class="category-name">{{ cat.name }}</span>
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
