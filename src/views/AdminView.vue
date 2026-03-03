<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store';
import { LayoutDashboard, FileUp, List, BarChart3, Plus, Trash2, LogOut, Upload, Edit3 } from 'lucide-vue-next';

const router = useRouter();
const activeTab = ref('dashboard');
const showAddForm = ref(false);
const editingId = ref<number | null>(null);

const newTemplate = ref({
  id: 0,
  title: '',
  price: 0,
  image: '',
  categoryId: 1,
  pptFile: '',
  screenshots: [] as string[],
});

const webhookUrl = ref('');

const fetchWebhookUrl = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/webhook-info');
    const data = await response.json();
    webhookUrl.value = data.url;
  } catch (e) {
    console.error('Failed to fetch webhook url', e);
  }
};

const openAddModal = () => {
  editingId.value = null;
  newTemplate.value = { 
    id: Date.now(),
    title: '', 
    price: 0, 
    image: '', 
    categoryId: 1, 
    pptFile: '', 
    screenshots: [] 
  };
  showAddForm.value = true;
};

const openEditModal = (t: any) => {
  editingId.value = t.id;
  newTemplate.value = {
    id: t.id,
    title: t.title,
    price: t.price,
    image: t.image,
    categoryId: t.categoryId,
    pptFile: t.pptFile || '',
    screenshots: [...t.screenshots],
  };
  showAddForm.value = true;
};

const stats = computed(() => {
  const totalViews = store.templates.reduce((acc, t) => acc + t.viewCount, 0);
  const totalDownloads = store.templates.reduce((acc, t) => acc + t.downloadCount, 0);
  return { totalViews, totalDownloads };
});

const uploadFile = async (file: File, productId: number): Promise<{ url: string, filename: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(`http://localhost:3001/api/upload?id=${productId}`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return { url: data.url, filename: data.filename };
  } catch (error) {
    console.error('Upload failed:', error);
    alert('文件上传失败，请检查后端服务是否运行');
    throw error;
  }
};

const handleMainImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const result = await uploadFile(target.files[0], newTemplate.value.id);
    newTemplate.value.image = result.url;
  }
};

const handlePPTUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const result = await uploadFile(target.files[0], newTemplate.value.id);
    newTemplate.value.pptFile = result.filename;
    alert('PPT文件上传成功');
  }
};

const handleScreenshotsUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    for (const file of files) {
      const result = await uploadFile(file, newTemplate.value.id);
      newTemplate.value.screenshots.push(result.url);
    }
  }
};

const removeScreenshot = (index: number) => {
  newTemplate.value.screenshots.splice(index, 1);
};

const handleAddTemplate = () => {
  if (!newTemplate.value.title || !newTemplate.value.pptFile || !newTemplate.value.image) {
    alert('请填写必要信息（标题、上传主图、上传PPT文件）');
    return;
  }

  const templateData = {
    id: newTemplate.value.id,
    title: newTemplate.value.title,
    price: newTemplate.value.price,
    image: newTemplate.value.image,
    categoryId: Number(newTemplate.value.categoryId),
    pptFile: newTemplate.value.pptFile,
    screenshots: newTemplate.value.screenshots,
  };

  if (editingId.value !== null) {
    store.updateTemplate(editingId.value, templateData);
  } else {
    store.addTemplate(templateData);
  }
  
  showAddForm.value = false;
  newTemplate.value = { id: 0, title: '', price: 0, image: '', categoryId: 1, pptFile: '', screenshots: [] };
};

fetchWebhookUrl();

const deleteTemplate = async (id: number) => {
  if (confirm('确定要删除这个商品吗？')) {
    await store.deleteTemplate(id);
  }
};

const handleLogout = () => {
  localStorage.removeItem('isAdminAuthenticated');
  router.push('/admin/login');
};
</script>

<template>
  <div class="admin-container">
    <aside class="admin-sidebar">
      <div class="admin-logo">芝士AI-管理后台</div>
      <nav class="admin-nav">
        <div class="nav-item" :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">
          <LayoutDashboard :size="20" /> <span>概览统计</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">
          <List :size="20" /> <span>商品管理</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="nav-item logout" @click="handleLogout">
          <LogOut :size="20" /> <span>退出登录</span>
        </div>
      </div>
    </aside>

    <main class="admin-content">
      <header class="admin-header">
        <div class="header-title">{{ activeTab === 'dashboard' ? '数据看板' : '商品列表' }}</div>
        <button v-if="activeTab === 'products'" class="add-btn" @click="openAddModal">
          <Plus :size="18" /> 发布新商品
        </button>
      </header>

      <section v-if="activeTab === 'dashboard'" class="dashboard-section">
        <div v-if="webhookUrl" class="webhook-info-box">
          <div class="webhook-label">Webhook 回调地址 (302.AI 配置使用):</div>
          <div class="webhook-url">{{ webhookUrl }}</div>
        </div>
        <div class="stat-cards">
          <div class="stat-card">
            <BarChart3 class="icon view" />
            <div class="stat-info">
              <div class="stat-label">总浏览量</div>
              <div class="stat-value">{{ stats.totalViews }}</div>
            </div>
          </div>
          <div class="stat-card">
            <FileUp class="icon download" />
            <div class="stat-info">
              <div class="stat-label">总下载量</div>
              <div class="stat-value">{{ stats.totalDownloads }}</div>
            </div>
          </div>
          <div class="stat-card">
            <List class="icon product" />
            <div class="stat-info">
              <div class="stat-label">商品总数</div>
              <div class="stat-value">{{ store.templates.length }}</div>
            </div>
          </div>
        </div>

        <div class="popular-products">
          <h3>热门商品排行</h3>
          <table class="admin-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>浏览次数</th>
                <th>下载次数</th>
                <th>转化率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in [...store.templates].sort((a,b) => b.viewCount - a.viewCount).slice(0, 5)" :key="t.id">
                <td>{{ t.title }}</td>
                <td>{{ t.viewCount }}</td>
                <td>{{ t.downloadCount }}</td>
                <td>{{ ((t.downloadCount / (t.viewCount || 1)) * 100).toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="activeTab === 'products'" class="products-section">
        <table class="admin-table">
          <thead>
            <tr>
              <th>主图</th>
              <th>标题</th>
              <th>定价</th>
              <th>分类</th>
              <th>PPT文件</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in store.templates" :key="t.id">
              <td><img :src="store.getAssetUrl(t.image)" class="thumb" /></td>
              <td>{{ t.title }}</td>
              <td>¥{{ t.price }}</td>
              <td>{{ t.categoryId }}</td>
              <td><span class="url-text">{{ t.pptFile }}</span></td>
              <td class="actions-cell">
                <button class="edit-btn" @click="openEditModal(t)"><Edit3 :size="16" /></button>
                <button class="delete-btn" @click="deleteTemplate(t.id)"><Trash2 :size="16" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

    <!-- Add/Edit Product Modal -->
    <div v-if="showAddForm" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header-box">
          <h3>{{ editingId !== null ? '编辑商品' : '发布新商品' }}</h3>
          <button class="close-modal" @click="showAddForm = false">×</button>
        </div>
        <div class="form-grid">
          <div class="form-group full">
            <label>商品标题 *</label>
            <input v-model="newTemplate.title" type="text" placeholder="请输入PPT完整标题" />
          </div>
          
          <div class="form-group full">
            <label>上传主图 * (列表页展示图)</label>
            <div class="upload-box" @click="($refs as any).mainImageInput.click()">
              <input ref="mainImageInput" type="file" accept="image/*" hidden @change="handleMainImageUpload" />
              <div v-if="newTemplate.image" class="preview-wrapper">
                <img :src="store.getAssetUrl(newTemplate.image)" class="upload-preview" />
                <div class="change-overlay">更换图片</div>
              </div>
              <div v-else class="upload-placeholder">
                <Upload :size="32" />
                <span>点击上传主图</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>定价 (元) *</label>
            <input v-model.number="newTemplate.price" type="number" step="0.1" />
          </div>

          <div class="form-group">
            <label>分类</label>
            <select v-model="newTemplate.categoryId">
              <option value="1">教学创新大赛</option>
              <option value="2">教学能力大赛</option>
              <option value="3">高校青教赛</option>
              <option value="6">高端PPT定制</option>
            </select>
          </div>

          <div class="form-group full">
            <label>上传 PPT 文件 *</label>
            <div class="ppt-upload-box" @click="($refs as any).pptFileInput.click()">
              <input ref="pptFileInput" type="file" accept=".ppt,.pptx" hidden @change="handlePPTUpload" />
              <div v-if="newTemplate.pptFile" class="ppt-file-info">
                <FileUp :size="24" />
                <span>{{ newTemplate.pptFile }}</span>
                <span class="change-hint">(点击更换)</span>
              </div>
              <div v-else class="upload-placeholder">
                <Upload :size="32" />
                <span>点击上传 PPT 源文件</span>
              </div>
            </div>
          </div>

          <div class="form-group full">
            <label>上传详情页展示截图</label>
            <div class="screenshots-grid">
              <div v-for="(img, idx) in newTemplate.screenshots" :key="idx" class="screenshot-item">
                <img :src="store.getAssetUrl(img)" />
                <button class="remove-img" @click="removeScreenshot(idx)">×</button>
              </div>
              <div class="add-screenshot-box" @click="($refs as any).screenshotInput.click()">
                <input ref="screenshotInput" type="file" accept="image/*" multiple hidden @change="handleScreenshotsUpload" />
                <Plus :size="24" />
                <span>添加截图</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showAddForm = false">取消</button>
          <button class="confirm-btn" @click="handleAddTemplate">{{ editingId !== null ? '保存修改' : '确认发布' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container { display: flex; height: 100vh; background-color: #f1f5f9; color: #1e293b; }
.admin-sidebar { width: 240px; background-color: #1e293b; color: #f8fafc; padding: 24px 0; display: flex; flex-direction: column; }
.admin-logo { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 40px; color: #1fcdb6; }
.admin-nav { flex: 1; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 14px 24px; cursor: pointer; color: #94a3b8; transition: all 0.2s; }
.nav-item:hover, .nav-item.active { background-color: #334155; color: #fff; }
.nav-item.active { border-right: 4px solid #1fcdb6; }
.sidebar-footer { border-top: 1px solid #334155; padding-top: 10px; }
.logout { color: #f87171 !important; }

.admin-content { flex: 1; overflow-y: auto; padding: 40px; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.header-title { font-size: 24px; font-weight: bold; }
.add-btn { background-color: #1fcdb6; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }

.stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }

.webhook-info-box { background-color: #fff; padding: 16px 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #1fcdb6; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.webhook-label { font-size: 12px; color: #64748b; margin-bottom: 4px; font-weight: 600; }
.webhook-url { font-family: monospace; font-size: 14px; color: #1e293b; word-break: break-all; }

.stat-card { background-color: #fff; padding: 24px; border-radius: 12px; display: flex; align-items: center; gap: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.stat-card .icon { width: 48px; height: 48px; padding: 10px; border-radius: 12px; }
.icon.view { background-color: #f0fdf4; color: #22c55e; }
.icon.download { background-color: #eff6ff; color: #3b82f6; }
.icon.product { background-color: #fdf2f8; color: #ec4899; }
.stat-value { font-size: 28px; font-weight: bold; }

.admin-table { width: 100%; background-color: #fff; border-collapse: collapse; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.admin-table th, .admin-table td { padding: 16px; text-align: left; border-bottom: 1px solid #f1f5f9; }
.admin-table th { background-color: #f8fafc; color: #64748b; font-weight: 600; font-size: 14px; }
.thumb { width: 80px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0; }
.url-text { font-family: monospace; font-size: 12px; color: #64748b; max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.actions-cell { display: flex; gap: 8px; }
.edit-btn { background: none; border: none; color: #3b82f6; cursor: pointer; padding: 8px; border-radius: 6px; }
.edit-btn:hover { background-color: #eff6ff; }
.delete-btn { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px; border-radius: 6px; }
.delete-btn:hover { background-color: #fee2e2; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-card { background-color: #fff; width: 700px; max-height: 90vh; overflow-y: auto; padding: 30px; border-radius: 16px; position: relative; }
.modal-header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.close-modal { background: none; border: none; font-size: 28px; color: #94a3b8; cursor: pointer; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group.full { grid-column: span 2; }
.form-group label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #475569; }
.form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; }
.form-group input:focus { border-color: #1fcdb6; }

/* Upload Styles */
.upload-box { border: 2px dashed #e2e8f0; border-radius: 12px; height: 160px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; overflow: hidden; position: relative; }
.upload-box:hover { border-color: #1fcdb6; background-color: #f0fdfa; }

.ppt-upload-box { border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; margin-bottom: 10px; }
.ppt-upload-box:hover { border-color: #1fcdb6; background-color: #f0fdfa; }
.ppt-file-info { display: flex; align-items: center; gap: 12px; color: #1e293b; font-weight: 600; }
.change-hint { font-size: 12px; color: #64748b; font-weight: normal; }

.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #94a3b8; }
.preview-wrapper { width: 100%; height: 100%; position: relative; }
.upload-preview { width: 100%; height: 100%; object-fit: cover; }
.change-overlay { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.5); color: #fff; font-size: 12px; padding: 4px 0; text-align: center; opacity: 0; transition: 0.3s; }
.preview-wrapper:hover .change-overlay { opacity: 1; }

.screenshots-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 10px; }
.screenshot-item { position: relative; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
.screenshot-item img { width: 100%; height: 100%; object-fit: cover; }
.remove-img { position: absolute; top: 4px; right: 4px; background: rgba(239, 68, 68, 0.8); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.add-screenshot-box { aspect-ratio: 16/9; border: 1px dashed #cbd5e1; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #64748b; cursor: pointer; font-size: 12px; }
.add-screenshot-box:hover { border-color: #1fcdb6; color: #1fcdb6; }

.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
.cancel-btn { background: #fff; border: 1px solid #e2e8f0; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.confirm-btn { background: #1fcdb6; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; }
</style>
