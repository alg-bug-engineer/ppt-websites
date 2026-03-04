import type { Template } from './store';
export type { Template };

export interface Category {
  id: number;
  name: string;
  nameKey: string;
}

export const categories: Category[] = [
  { id: 1, name: 'Teaching Innovation', nameKey: 'teachingInnovation' },
  { id: 2, name: 'Academic Report', nameKey: 'academicReport' },
  { id: 3, name: 'Project Application', nameKey: 'projectApplication' },
  { id: 4, name: 'Summary & Promotion', nameKey: 'summaryPromotion' },
  { id: 5, name: 'AI & Big Model', nameKey: 'aiBigModel' },
  { id: 6, name: 'Premium Customization', nameKey: 'premiumCustomization' },
  { id: 7, name: 'Thesis Defense', nameKey: 'thesisDefense' },
  { id: 8, name: 'Free Resources', nameKey: 'freeResources' },
];

export const sampleTemplates: Template[] = [];
