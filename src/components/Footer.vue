<script setup lang="ts">
import { Phone, Mail, MapPin } from 'lucide-vue-next';
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-left">
        <div class="logo-white">芝士AI吃鱼-PPT</div>
        <p class="slogan">高效满足老师比赛、学生创赛、项目申报等每一个场景需求。</p>
        
        <div class="contact-info">
          <div class="contact-item">
            <span class="label">版权所有：</span>
            <span>武汉芝士AI演示设计有限公司</span>
          </div>
          <div class="contact-item">
            <Phone :size="16" class="icon" />
            <span class="label">联系电话：</span>
            <span>131-6461-1783</span>
          </div>
          <div class="contact-item">
            <Mail :size="16" class="icon" />
            <span class="label">联系邮箱：</span>
            <span>contact@cheeseeatfish.ai</span>
          </div>
          <div class="contact-item">
            <MapPin :size="16" class="icon" />
            <span class="label">办公地址：</span>
            <span>武汉市东湖新技术开发区高新大道778号</span>
          </div>
        </div>
        
        <div class="beian">
          <a href="#">鄂ICP备2025134826号-1</a>
        </div>
      </div>

      <div class="footer-right">
        <h4 class="footer-title">关于我们</h4>
        <div class="about-text">
          <p>芝士AI吃鱼-PPT 教育行业定制领航平台</p>
          <p>全教学及设计团队，累计服务高校老师、教授10W+，帮助超2000+老师赛事获奖成功。</p>
          <p>擅长教学比赛、教学创新、世界职业技能大赛、高校大创赛、项目申报、科研绘图、精品公开课等各场景的PPT需求解决，期待与您的每一次合作共创！</p>
        </div>
      </div>
    </div>
    
    <div class="friend-links">
      <span class="label">友情链接：</span>
      <a href="#">快动画</a>
      <a href="#">白衣天使PPT</a>
      <a href="#">AI办公网</a>
      <a href="#">学术资源库</a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #333;
  color: #ccc;
  padding: 60px 40px 30px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 80px;
}

.footer-left {
  flex: 1;
}

.logo-white {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20px;
}

.slogan {
  font-size: 14px;
  margin-bottom: 30px;
  color: #999;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.contact-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.icon {
  margin-right: 8px;
  color: var(--primary-color);
}

.label {
  color: #777;
  min-width: 80px;
}

.beian {
  font-size: 13px;
  color: #666;
}

.beian a:hover {
  color: var(--primary-color);
}

.footer-right {
  width: 400px;
}

.footer-title {
  color: #fff;
  font-size: 18px;
  margin-bottom: 24px;
  border-bottom: 1px solid #444;
  padding-bottom: 12px;
}

.about-text {
  font-size: 14px;
  line-height: 1.8;
  color: #999;
}

.about-text p {
  margin-bottom: 12px;
}

.friend-links {
  max-width: 1400px;
  margin: 40px auto 0;
  border-top: 1px solid #444;
  padding-top: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 13px;
}

.friend-links a {
  color: #777;
  transition: color 0.3s;
}

.friend-links a:hover {
  color: var(--primary-color);
}
</style>
