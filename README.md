# Nav-item - 个人导航站

## 项目简介

一个现代化的导航网站项目，提供简洁美观的导航界面和强大的后台管理系统,快速访问常用网站和工具。

## 🛠️ 技术栈
- **前端**: Vue 3 + Vite
- **后端**: Node.js + Express
- **数据库**: PostgreSQL (Vercel)
- **部署**: Vercel Serverless

## ✨ 主要功能

### 前端功能
- 🏠 **首页导航**：美观的卡片式导航界面
- 🔍 **聚合搜索**：支持 Google、百度、Bing、GitHub、站内搜索
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🎨 **Glassmorphism UI**：毛玻璃风格 + 星空背景
- 🖱️ **悬停展示**：鼠标悬停菜单自动展示内容
- 🔗 **友情链接**：支持友情链接展示
- 📢 **广告位**：支持左右两侧广告位展示

### 后台管理功能
- 👤 **网站设置**：网站信息、密码管理
- 📋 **栏目管理**：主菜单和子菜单的增删改查
- 🃏 **卡片管理**：导航卡片的增删改查、拖拽排序
- 📢 **广告管理**：广告位的增删改查
- 🔗 **友链管理**：友情链接的增删改查
- 📊 **数据统计**：登录时间、IP等统计信息

### 技术特性
- 🔐 **JWT认证**：安全的用户认证机制
- 🗄️ **PostgreSQL**：Vercel Postgres 数据库
- ☁️ **Serverless部署**：Vercel 一键部署
- 📤 **文件上传**：支持图片上传功能
- 🔍 **搜索功能**：支持站内搜索和外部搜索
- 📱 **移动端适配**：完美的移动端体验

## 🏗️ 项目结构

```
nav-item/
├── app.js                 # 后端主入口文件
├── config.js             # 配置文件
├── db-postgres.js        # PostgreSQL数据库适配器
├── db-switch.js          # 数据库切换器
├── package.json          # 后端依赖配置
├── routes/               # 后端路由
│   ├── auth.js          # 认证相关路由
│   ├── menu.js          # 菜单管理路由
│   ├── card.js          # 卡片管理路由
│   ├── ad.js            # 广告管理路由
│   ├── friend.js        # 友链管理路由
│   ├── settings.js      # 网站设置路由
│   └── upload.js        # 文件上传路由
├── uploads/              # 上传文件目录
├── web/                  # 前端项目目录
│    ├── package.json      # 前端依赖配置
│    ├── vite.config.mjs   # Vite配置文件
│    ├── index.html        # HTML入口文件
│    ├── public/           # 静态资源
│    └── src/              # 前端源码
│        ├── main.js       # Vue应用入口
│        ├── router.js     # 路由配置
│        ├── api.js        # API接口封装
│        ├── App.vue       # 根组件
│        ├── components/   # 公共组件
│        │   ├── MenuBar.vue
│        │   └── CardGrid.vue
│        └── views/        # 页面组件
│            ├── Home.vue  # 首页
│            ├── Admin.vue # 后台管理
│            └── admin/    # 后台管理子页面
└── vercel.json           # Vercel配置文件
```

## ⚙️ 环境变量配置

### 必需的环境变量
- `POSTGRES_URL`: PostgreSQL数据库连接字符串（Vercel自动提供）
- `ADMIN_USERNAME`: 管理员用户名（默认: admin）
- `ADMIN_PASSWORD`: 管理员密码（默认: 123456）
- `NODE_ENV`: 运行环境（production）

## 🚀 Vercel 部署指南

### 前置要求
- GitHub 账号
- Vercel 账号

### 部署步骤

#### 1. Fork 或克隆项目
```bash
git clone https://github.com/eooce/nav-Item.git
cd nav-item
```

#### 2. 推送到你的 GitHub 仓库
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/nav-item.git
git push -u origin main
```

#### 3. 在 Vercel 导入项目
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New** → **Project**
3. 从 GitHub 导入你的仓库
4. Vercel 会自动检测配置

#### 4. 创建 PostgreSQL 数据库
1. 在项目页面，进入 **Storage** 标签
2. 点击 **Create Database**
3. 选择 **Postgres**
4. 输入数据库名称（如：nav-db）
5. 选择区域（建议选择离你最近的）
6. 点击 **Create**

#### 5. 配置环境变量
在 **Settings** → **Environment Variables** 添加：

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
NODE_ENV=production
```

> ⚠️ 注意：`POSTGRES_URL` 会在创建数据库后自动添加

#### 6. 重新部署
1. 进入 **Deployments** 标签
2. 点击最新部署的 **...** 菜单
3. 选择 **Redeploy**
4. 等待部署完成

#### 7. 访问网站
部署成功后，访问你的网站：
- 前端：`https://your-project.vercel.app`
- 后台：`https://your-project.vercel.app/admin`

### 默认登录凭据
- **用户名**: `admin`
- **密码**: `123456`（或你设置的 ADMIN_PASSWORD）

> ⚠️ **重要**: 首次登录后请立即在"网站设置"中修改密码！

---

## 🔧 本地开发

### 1. 安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd web && npm install
```

### 2. 配置环境变量
创建 `.env` 文件：
```bash
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=123456
```

### 3. 启动开发服务器
```bash
# 构建前端
cd web && npm run build

# 启动后端（在项目根目录）
cd .. && npm start
```

### 4. 访问应用
- 前端：http://localhost:3000
- 后台：http://localhost:3000/admin

---

## 📖 详细文档

- 📘 [部署和登录完整指南](DEPLOYMENT_AND_LOGIN_GUIDE.md)
- 📗 [故障排除指南](TROUBLESHOOTING.md)
- 📙 [快速开始指南](QUICK_START.md)

---

## 🔍 常见问题

### Q: 登录失败怎么办？
A: 查看 [DEPLOYMENT_AND_LOGIN_GUIDE.md](DEPLOYMENT_AND_LOGIN_GUIDE.md) 中的详细排查步骤。

### Q: 如何修改密码？
A: 登录后台 → 网站设置 → 密码管理区域。

### Q: 如何自定义网站信息？
A: 登录后台 → 网站设置 → 修改网站标题、副标题、页脚等信息。

### Q: 数据库表未创建？
A: Vercel 会在首次访问时自动初始化数据库。如果失败，查看 Functions 日志。

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 👨‍💻 作者

**eooce** - [GitHub](https://github.com/eooce)

---

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

⭐ 如果这个项目对你有帮助，请给它一个星标！

---

## 📞 获取帮助

- 📧 提交 Issue: [GitHub Issues](https://github.com/eooce/nav-Item/issues)
- 📖 查看文档: [DEPLOYMENT_AND_LOGIN_GUIDE.md](DEPLOYMENT_AND_LOGIN_GUIDE.md)
- 🐛 报告 Bug: [Bug Report](https://github.com/eooce/nav-Item/issues/new)

---

**最后更新**: 2025-01-06  
**版本**: v2.0 - Glassmorphism Edition
