import type { Template } from './store';
export type { Template };

export interface Category {
  id: number;
  name: string;
  nameKey: string;
}

export const categories: Category[] = [
  { id: 1, name: 'Teaching Innovation', nameKey: 'teachingInnovation' },
  { id: 2, name: 'Teaching Ability', nameKey: 'teachingAbility' },
  { id: 3, name: 'Young Teachers', nameKey: 'youngTeachers' },
  { id: 4, name: 'Other Competitions', nameKey: 'otherCompetitions' },
  { id: 6, name: 'Premium Customization', nameKey: 'premiumCustomization' },
  { id: 7, name: 'Thesis Defense', nameKey: 'thesisDefense' },
  { id: 8, name: 'Free Resources', nameKey: 'freeResources' },
];

export const sampleTemplates: Template[] = [];
