import type { Template } from './store';
export type { Template };

export interface Category {
  id: number;
  name: string;
}

export const categories: Category[] = [
  { id: 1, name: '教学创新大赛' },
  { id: 2, name: '教学能力大赛' },
  { id: 3, name: '高校青教赛' },
  { id: 4, name: '其他教学竞赛' },
  { id: 5, name: '更多分类' },
  { id: 6, name: '高端PPT定制' },
  { id: 7, name: '毕业论文答辩' },
  { id: 8, name: '免费专区' },
];

export const sampleTemplates: Template[] = [];
