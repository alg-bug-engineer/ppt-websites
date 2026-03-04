import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import CategoryView from '../views/CategoryView.vue';
import SearchView from '../views/SearchView.vue';
import ContactView from '../views/ContactView.vue';
import AdminView from '../views/AdminView.vue';
import AdminLoginView from '../views/AdminLoginView.vue';
import PaymentSuccessView from '../views/PaymentSuccessView.vue';

const routes = [
  { 
    path: '/', 
    name: 'home', 
    component: HomeView,
    meta: {
      title: '芝士AI吃鱼 - 专业PPT模板下载与定制平台',
      keywords: '教学竞赛PPT,学术汇报PPT,年终总结模板,晋升述职PPT,课题申报模板,人工智能PPT,大模型演示文稿,定制PPT,PPT模板下载',
      description: '芝士AI吃鱼提供全场景专业PPT模板，涵盖高校教学竞赛、学术课题汇报、年终总结、职场晋升、人工智能大模型演示等。助力教师、学生及职场人士打造高品质演示方案。'
    }
  },
  { 
    path: '/login', 
    name: 'login', 
    component: LoginView,
    meta: {
      title: '用户登录 - 芝士AI吃鱼',
      description: '登录芝士AI吃鱼，开启高品质PPT模板下载之旅。'
    }
  },
  { 
    path: '/category/:id', 
    name: 'category', 
    component: CategoryView,
    meta: {
      title: '分类浏览 - 芝士AI吃鱼专业PPT库',
      description: '按分类查找您需要的PPT模板，涵盖学术、教学、职场汇报等多种专业场景。'
    }
  },
  { 
    path: '/search', 
    name: 'search', 
    component: SearchView,
    meta: {
      title: '搜索PPT模板 - 芝士AI吃鱼',
      description: '在芝士AI吃鱼海量资源库中搜索教学、学术、总结、述职等各类PPT模板。'
    }
  },
  { 
    path: '/contact', 
    name: 'contact', 
    component: ContactView,
    meta: {
      title: '联系我们 - 芝士AI吃鱼PPT定制',
      keywords: 'PPT定制咨询,学术PPT代做,教学竞赛PPT设计,人工智能PPT定制',
      description: '联系芝士AI专业设计团队，提供教学竞赛、学术汇报、高端商务PPT的一对一深度定制服务。'
    }
  },
  { 
    path: '/payment-success', 
    name: 'payment-success', 
    component: PaymentSuccessView,
    meta: {
      title: '支付成功 - 芝士AI吃鱼'
    }
  },
  { 
    path: '/profile', 
    name: 'profile', 
    component: () => import('../views/PersonalCenterView.vue'),
    meta: {
      title: '个人中心 - 芝士AI吃鱼',
      description: '查看已购PPT资源和会员状态。'
    }
  },
  { 
    path: '/admin', 
    name: 'admin', 
    component: AdminView,
    meta: { title: '管理后台 - 芝士AI吃鱼' },
    beforeEnter: (_to: any, _from: any, next: any) => {
      if (localStorage.getItem('isAdminAuthenticated') === 'true') {
        next();
      } else {
        next('/admin/login');
      }
    }
  },
  { path: '/admin/login', name: 'admin-login', component: AdminLoginView, meta: { title: '管理员登录 - 芝士AI吃鱼' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  const meta = to.meta as any;
  if (meta.title) {
    document.title = meta.title;
  }
  
  // Update keywords
  const keywords = meta.keywords || '教学竞赛PPT,教学创新大赛,青教赛PPT,PPT定制,芝士AI';
  let keywordsMeta = document.querySelector('meta[name="keywords"]');
  if (keywordsMeta) {
    keywordsMeta.setAttribute('content', keywords);
  } else {
    keywordsMeta = document.createElement('meta');
    keywordsMeta.setAttribute('name', 'keywords');
    keywordsMeta.setAttribute('content', keywords);
    document.head.appendChild(keywordsMeta);
  }

  // Update description
  const description = meta.description || '芝士AI吃鱼提供专业的高校教学竞赛PPT定制服务，助力老师在各类赛事中脱颖而出。';
  let descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', description);
  } else {
    descriptionMeta = document.createElement('meta');
    descriptionMeta.setAttribute('name', 'description');
    descriptionMeta.setAttribute('content', description);
    document.head.appendChild(descriptionMeta);
  }
});

export default router;
