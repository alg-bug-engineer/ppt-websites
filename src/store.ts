import { reactive, watch } from 'vue';

export interface Template {
  id: number;
  title: string;
  price: number;
  image: string;
  categoryId: number;
  downloadUrl: string;
  viewCount: number;
  downloadCount: number;
  screenshots: string[];
}

export interface User {
  phone: string;
  isLoggedIn: boolean;
  isMember: boolean;
}

const API_BASE = 'http://localhost:3001/api';

// Initialize user from localStorage
const savedUser = localStorage.getItem('user_state');
const initialUser: User = savedUser ? JSON.parse(savedUser) : {
  phone: '',
  isLoggedIn: false,
  isMember: false,
};

export const store = reactive({
  user: initialUser,
  
  templates: [] as Template[],

  async fetchTemplates() {
    try {
      const response = await fetch(`${API_BASE}/templates`);
      if (response.ok) {
        this.templates = await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  },

  login(phone: string, isMember: boolean) {
    this.user.phone = phone;
    this.user.isLoggedIn = true;
    this.user.isMember = isMember;
    this.saveUserState();
  },

  logout() {
    this.user.phone = '';
    this.user.isLoggedIn = false;
    this.user.isMember = false;
    this.saveUserState();
  },
  
  becomeMember() {
    this.user.isMember = true;
    this.saveUserState();
  },

  saveUserState() {
    localStorage.setItem('user_state', JSON.stringify(this.user));
  },

  async addTemplate(template: Omit<Template, 'id' | 'viewCount' | 'downloadCount'>) {
    try {
      const response = await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
      if (response.ok) {
        const newT = await response.json();
        this.templates.push(newT);
      }
    } catch (error) {
      console.error('Add template failed:', error);
    }
  },

  async deleteTemplate(id: number) {
    try {
      const response = await fetch(`${API_BASE}/templates/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        this.templates = this.templates.filter(t => t.id !== id);
      }
    } catch (error) {
      console.error('Delete template failed:', error);
    }
  },

  async incrementView(id: number) {
    try {
      await fetch(`${API_BASE}/templates/${id}/view`, { method: 'POST' });
      const t = this.templates.find(t => t.id === id);
      if (t) t.viewCount++;
    } catch (e) {}
  },

  incrementDownload(id: number) {
    const t = this.templates.find(t => t.id === id);
    if (t) t.downloadCount++;
  },

  async updateTemplate(id: number, updates: Partial<Omit<Template, 'id' | 'viewCount' | 'downloadCount'>>) {
    try {
      const response = await fetch(`${API_BASE}/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const updatedT = await response.json();
        const index = this.templates.findIndex(t => t.id === id);
        if (index !== -1) {
          this.templates[index] = updatedT;
        }
      }
    } catch (error) {
      console.error('Update template failed:', error);
    }
  }
});
