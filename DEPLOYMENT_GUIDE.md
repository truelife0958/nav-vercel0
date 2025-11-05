# Vercel 部署指南

本项目已配置好 Vercel + PostgreSQL 部署方案。

## 已完成的配置

1. ✅ [`package.json`](package.json:1) - 已添加 `pg` 依赖
2. ✅ [`db-postgres.js`](db-postgres.js:1) - PostgreSQL 数据库适配器
3. ✅ [`vercel.json`](vercel.json:1) - Vercel 部署配置
4. ✅ 所有路由文件已更新使用 PostgreSQL

## 部署步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 推送到 GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### 3. 在 Vercel 部署
- 访问 https://vercel.com
- 导入 GitHub 仓库
- 点击 Deploy

### 4. 创建数据库
- 进入项目 → Storage → Create Database → Postgres
- 连接数据库到项目

### 5. 配置环境变量
在项目设置中添加：
- `ADMIN_USERNAME` = `admin`
- `ADMIN_PASSWORD` = `your_password`
- `NODE_ENV` = `production`

### 6. 重新部署
推送代码或在 Dashboard 点击 Redeploy

## 完成
访问 Vercel 提供的 URL，测试部署结果。