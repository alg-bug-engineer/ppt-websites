import type { Template } from './store';
export type { Template };

export interface Category {
  id: number;
  name: string;
}

export const categories: Category[] = [
  { id: 1, name: 'Teaching Innovation' },
  { id: 2, name: 'Teaching Ability' },
  { id: 3, name: 'Young Teachers' },
  { id: 4, name: 'Other Competitions' },
  { id: 6, name: 'Premium Customization' },
  { id: 7, name: 'Thesis Defense' },
  { id: 8, name: 'Free Resources' },
];

export const sampleTemplates: Template[] = [];
