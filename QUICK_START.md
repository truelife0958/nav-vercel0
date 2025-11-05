# 🚀 快速开始指南

本项目已完成 Vercel 部署配置，只需 3 步即可上线！

## 📋 前提条件

- ✅ GitHub 账号
- ✅ Vercel 账号（可用 GitHub 登录）
- ✅ Neon PostgreSQL 数据库（免费）

## 🎯 三步部署

### 第 1 步：创建 Neon 数据库

1. 访问 [Neon Console](https://console.neon.tech/)
2. 创建新项目（免费）
3. 复制 `POSTGRES_URL` 连接字符串（选择 Pooled 版本）

### 第 2 步：部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

或手动导入：
1. 访问 [Vercel Dashboard](https://vercel.com/new)
2. 从 GitHub 导入此仓库
3. 点击 **Deploy**（先不配置环境变量）

### 第 3 步：配置环境变量

部署完成后：

1. 进入项目的 **Settings** → **Environment Variables**
2. 添加环境变量：
   ```
   变量名：POSTGRES_URL
   值：postgresql://neondb_owner:password@host-pooler.neon.tech/neondb?sslmode=require
   ```
3. 选择所有环境（Production, Preview, Development）
4. 点击 **Save**
5. 前往 **Deployments**，重新部署最新版本

## ✅ 验证部署

### 自动验证（推荐）

部署完成后，等待 1-2 分钟，直接访问您的网站：
```
https://your-site.vercel.app
```

应该看到 6 个默认菜单：Home、Ai Stuff、Cloud、Software、Tools、Other

### 手动验证

如果没有看到默认菜单，使用诊断脚本：

**Linux/Mac**:
```bash
chmod +x diagnose.sh
./diagnose.sh https://your-site.vercel.app
```

**Windows**:
```cmd
diagnose.bat https://your-site.vercel.app
```

**或使用 curl**:
```bash
# 1. 检查数据库状态
curl https://your-site.vercel.app/api/debug/status

# 2. 重置数据库（如果需要）
curl -X POST https://your-site.vercel.app/api/reset/database

# 3. 验证菜单
curl https://your-site.vercel.app/api/menus
```

## 🔐 默认管理员账号

配置在 [`config.js`](./config.js) 中：

```
用户名：admin
密码：admin123
```

⚠️ **安全提示**：首次登录后请立即修改密码！

## 📝 常用操作

### 重置数据库
```bash
curl -X POST https://your-site.vercel.app/api/reset/database
```

### 查看数据库状态
```bash
curl https://your-site.vercel.app/api/debug/status
```

### 获取所有菜单
```bash
curl https://your-site.vercel.app/api/menus
```

### 查看部署日志
1. Vercel Dashboard → 选择项目
2. Deployments → 点击部署
3. 查看 Runtime Logs

## 🎨 自定义配置

### 修改站点标题和样式
编辑 [`web/src/App.vue`](./web/src/App.vue)

### 修改默认菜单
编辑 [`db-postgres.js`](./db-postgres.js) 第 117-124 行

### 添加环境变量
```bash
vercel env add VARIABLE_NAME production
```

## 🐛 常见问题

### 问题 1：页面空白或 404
**原因**：前端构建失败
**解决**：
```bash
cd web
npm install
npm run build
```

### 问题 2：API 返回 500 错误
**原因**：数据库连接失败
**解决**：
1. 检查 `POSTGRES_URL` 是否正确配置
2. 验证 Neon 数据库是否在线
3. 查看 Vercel 部署日志

### 问题 3：没有默认菜单
**原因**：数据库有旧数据或初始化失败
**解决**：
```bash
curl -X POST https://your-site.vercel.app/api/reset/database
```

### 问题 4：管理后台无法登录
**原因**：数据库未初始化或密码错误
**解决**：
1. 使用默认账号：`admin` / `admin123`
2. 如果仍失败，重置数据库

## 📚 详细文档

需要更多信息？查看：

- [Vercel 环境变量配置](./VERCEL_ENV_SETUP.md) - 详细的环境变量配置指南
- [问题排查指南](./TROUBLESHOOTING.md) - 完整的问题诊断和解决方案
- [部署指南](./DEPLOYMENT_GUIDE.md) - 多平台部署选项
- [Vercel 部署文档](./VERCEL_DEPLOYMENT.md) - Vercel 专用文档
- [Cloudflare 部署文档](./CLOUDFLARE_DEPLOYMENT.md) - Cloudflare Workers 部署

## 🎯 下一步

部署成功后：

1. **登录管理后台**：`https://your-site.vercel.app/admin`
2. **添加导航卡片**：在管理界面添加您的常用网站
3. **自定义菜单**：修改或添加新的菜单分类
4. **修改密码**：在用户管理中修改管理员密码
5. **自定义样式**：编辑前端代码个性化您的站点

## 💡 快速命令参考

```bash
# 本地开发
npm install          # 安装后端依赖
cd web && npm install # 安装前端依赖
npm run dev          # 启动本地服务器

# Vercel CLI
vercel login         # 登录
vercel env ls        # 查看环境变量
vercel env pull      # 拉取环境变量到本地
vercel --prod        # 部署到生产环境
vercel logs          # 查看日志

# Git 部署
git add -A
git commit -m "Update"
git push             # 自动触发 Vercel 部署
```

## 🆘 需要帮助？

1. 查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. 使用诊断端点：`/api/debug/status`
3. 查看 Vercel 部署日志
4. 在 GitHub 创建 Issue

---

**祝您使用愉快！** 🎉