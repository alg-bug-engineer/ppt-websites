import { reactive, watch } from 'vue';
import { translations } from './i18n';

export interface Template {
  id: number;
  title: string;
  price: number;
  image: string;
  categoryId: number;
  pptFile: string;
  viewCount: number;
  downloadCount: number;
  screenshots: string[];
}

export interface User {
  phone: string;
  isLoggedIn: boolean;
  isMember: boolean;
  downloads: any[];
}

export type Lang = 'zh' | 'en';

const API_BASE = 'http://localhost:3001/api';
const MEMBER_DISCOUNT = 0.5; // Sync with .env logic via API

// Initialize lang from localStorage
const savedLang = localStorage.getItem('lang') as Lang;
const initialLang: Lang = (savedLang === 'zh' || savedLang === 'en') ? savedLang : 'zh';

// Initialize user from localStorage with defensive checks
const savedUserStr = localStorage.getItem('user_state');
let initialUser: User;

try {
  if (savedUserStr) {
    const parsed = JSON.parse(savedUserStr);
    initialUser = {
      phone: parsed.phone || '',
      isLoggedIn: !!parsed.isLoggedIn,
      isMember: !!parsed.isMember,
      downloads: Array.isArray(parsed.downloads) ? parsed.downloads : []
    };
    console.log('[Store] User loaded from cache:', initialUser.phone, 'Member:', initialUser.isMember);
  } else {
    initialUser = { phone: '', isLoggedIn: false, isMember: false, downloads: [] };
    console.log('[Store] No cached user found, initialized empty state.');
  }
} catch (e) {
  console.error('[Store] Failed to parse cached user:', e);
  initialUser = { phone: '', isLoggedIn: false, isMember: false, downloads: [] };
}

export const store = reactive({
  user: initialUser,
  lang: initialLang,
  
  templates: [] as Template[],

  // Translation helper
  t(key: keyof typeof translations['zh']) {
    return translations[this.lang][key] || key;
  },

  setLang(l: Lang) {
    this.lang = l;
    localStorage.setItem('lang', l);
    console.log('[Store] Language set to:', l);
  },

  // Calculate display price
  getDisplayPrice(originalPrice: number) {
    const price = this.user.isMember ? (originalPrice * MEMBER_DISCOUNT) : originalPrice;
    console.log(`[Store] Price Calc: Original=${originalPrice}, Final=${price.toFixed(2)}, isMember=${this.user.isMember}`);
    return price.toFixed(2);
  },

  // Check if already purchased (Only members enjoy repeat download privilege)
  hasPurchased(templateId: number) {
    if (!this.user.isMember) return false;
    const found = this.user.downloads?.some(d => parseInt(d.itemId) === templateId);
    if (found) console.log(`[Store] Check Purchased: Item ${templateId} is already owned by Member.`);
    return !!found;
  },

  async fetchUserProfile() {
    if (!this.user.phone) return;
    console.log('[Store] Fetching latest profile for:', this.user.phone);
    try {
      const response = await fetch(`${API_BASE}/user/profile?phone=${this.user.phone}`);
      if (response.ok) {
        const profile = await response.json();
        console.log('[Store] Profile synced:', profile);
        this.user.isMember = profile.isMember;
        this.user.downloads = Array.isArray(profile.downloads) ? profile.downloads : [];
        this.saveUserState();
      } else {
        console.warn('[Store] Profile sync failed, status:', response.status);
      }
    } catch (error) {
      console.error('[Store] Profile fetch error:', error);
    }
  },

  async fetchTemplates() {
    console.log('[Store] Loading templates...');
    try {
      const response = await fetch(`${API_BASE}/templates`);
      if (response.ok) {
        this.templates = await response.json();
        console.log('[Store] Templates loaded:', this.templates.length);
      }
    } catch (error) {
      console.error('[Store] Failed to fetch templates:', error);
    }
  },

  login(phone: string, isMember: boolean) {
    console.log('[Store] User Logging In:', phone);
    this.user.phone = phone;
    this.user.isLoggedIn = true;
    this.user.isMember = isMember;
    this.user.downloads = [];
    this.saveUserState();
    this.fetchUserProfile(); // Immediately sync full profile after login
  },

  logout() {
    console.log('[Store] User Logging Out');
    this.user.phone = '';
    this.user.isLoggedIn = false;
    this.user.isMember = false;
    this.user.downloads = [];
    this.saveUserState();
  },
  
  saveUserState() {
    localStorage.setItem('user_state', JSON.stringify(this.user));
  },

  getAssetUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE.replace('/api', '')}${path}`;
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
