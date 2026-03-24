#!/bin/bash

# =================================================================
# PPT Website 生产环境自动部署脚本 (Nginx 静态托管版)
# =================================================================

APP_NAME="ppt-frontend"
BACKEND_NAME="ppt-backend"
OLD_DEV_NAME="ppt-dev"
PROJECT_DIR="/root/workspaces/ppt-websites"
NGINX_WWW_DIR="/var/www/ppt-frontend"

echo "----------------------------------------------------"
echo "[1/5] 正在从 GitHub 拉取最新代码..."
echo "----------------------------------------------------"
cd $PROJECT_DIR
git pull origin main

echo ""
echo "----------------------------------------------------"
echo "[2/5] 正在安装依赖..."
echo "----------------------------------------------------"
npm install

echo ""
echo "----------------------------------------------------"
echo "[3/5] 正在构建前端生产环境包 (Build)..."
echo "----------------------------------------------------"
npm run build

echo ""
echo "----------------------------------------------------"
echo "[4/5] 正在部署前端静态文件到 Nginx 目录..."
echo "----------------------------------------------------"
# 确保目标目录存在
sudo mkdir -p $NGINX_WWW_DIR

# 清空旧的前端文件
sudo rm -rf $NGINX_WWW_DIR/*

# 复制新构建的 dist 目录内容到 Nginx 目录
sudo cp -r $PROJECT_DIR/dist/* $NGINX_WWW_DIR/

# 赋予 Nginx 工作进程（www-data）读取权限
sudo chown -R www-data:www-data $NGINX_WWW_DIR
sudo chmod -R 755 $NGINX_WWW_DIR

echo ""
echo "----------------------------------------------------"
echo "[5/5] 正在重启后端服务..."
echo "----------------------------------------------------"
# 清理旧的或多余的 PM2 进程
pm2 delete $OLD_DEV_NAME 2>/dev/null
pm2 delete $APP_NAME 2>/dev/null
pm2 delete $BACKEND_NAME 2>/dev/null

# 仅启动后端 Node.js 服务 (端口 3002)
PORT=3002 pm2 start server.js --name $BACKEND_NAME

# 保存 PM2 状态，使其开机自启
pm2 save

# 重载 Nginx 配置以防万一
sudo nginx -s reload

echo ""
echo "===================================================="
echo "部署完成！当前服务状态："
echo "===================================================="
pm2 list
echo "----------------------------------------------------"
echo "前端访问地址: https://ppt.ai-knowledgepoints.cn (由 Nginx 直接接管)"
echo "前端文件路径: $NGINX_WWW_DIR"
echo "后端 API 运行端口: 3002"
echo "===================================================="