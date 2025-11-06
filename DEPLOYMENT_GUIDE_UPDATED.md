# Nav-Item 项目部署指南（已优化版本）

## 📋 更新内容概览

本次更新包含以下重大改进：
- ✅ 支持PostgreSQL和SQLite双数据库
- ✅ 增强安全性（Helmet、CORS、Rate Limiting）
- ✅ 修复严重BUG（数据库字段不一致、模块引用错误）
- ✅ 优化移动端布局
- ✅ 延长Token有效期至7天
- ✅ 清理调试代码

---

## 🚀 快速部署到Vercel

### 1. 准备工作

#### 1.1 安装依赖
```bash
# 后端依赖
npm install

# 前端依赖
cd web
npm install
cd ..
```

#### 1.2 构建前端
```bash
cd web
npm run build
cd ..
```

### 2. 配置环境变量

在Vercel项目设置中添加以下环境变量：

#### 数据库配置（PostgreSQL - Neon）
```env
POSTGRES_URL=postgresql://neondb_owner:npg_TDXzdE9ns6Yx@ep-holy-block-a443i8a5-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_TDXzdE9ns6Yx@ep-holy-block-a443i8a5.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### 管理员账号
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

#### JWT密钥（必须修改为随机字符串）
```env
JWT_SECRET=your_random_jwt_secret_key_min_32_chars
```

#### 安全配置
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Vercel配置

确保项目根目录有 `vercel.json` 文件：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    },
    {
      "src": "web/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "app.js"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "app.js"
    },
    {
      "src": "/(.*)",
      "dest": "web/dist/$1"
    }
  ]
}
```

### 4. 部署命令

```bash
# 方式1: 使用Vercel CLI
npm i -g vercel
vercel --prod

# 方式2: 推送到GitHub，Vercel自动部署
git add .
git commit -m "部署到Vercel"
git push origin main
```

---

## 🔧 本地开发

### 1. 配置本地环境

复制 `.env.example` 为 `.env`:
```bash
cp .env.example .env
```

编辑 `.env` 文件，根据需要配置：

```env
# 使用SQLite（本地开发）- 不需要配置POSTGRES_URL
# 或使用PostgreSQL - 配置POSTGRES_URL

ADMIN_USERNAME=admin
ADMIN_PASSWORD=123456
JWT_SECRET=local-dev-secret-key
NODE_ENV=development
```

### 2. 启动开发服务器

```bash
# 后端（端口3000）
npm run dev

# 前端（端口5173，新终端）
cd web
npm run dev
```

访问：
- 前端：http://localhost:5173
- 后端API：http://localhost:3000/api
- 管理后台：http://localhost:5173/admin

---

## 🔒 安全特性说明

### 1. Helmet安全头
自动添加HTTP安全头，防止常见的Web漏洞。

### 2. CORS跨域保护
- 开发环境：允许localhost
- 生产环境：只允许配置的域名
- 配置方式：通过 `ALLOWED_ORIGINS` 环境变量

### 3. Rate Limiting速率限制
- API请求：15分钟内最多100次
- 登录接口：15分钟内最多5次
- 配置方式：通过环境变量调整

### 4. JWT Token
- 有效期：7天
- 自动续期：前端需实现刷新token机制

---

## 📊 数据库说明

### 自动切换机制
项目通过 `db-switch.js` 自动检测并切换数据库：

```javascript
// 如果设置了POSTGRES_URL，使用PostgreSQL
// 否则使用SQLite（本地开发）
```

### PostgreSQL优势
- ✅ 生产环境推荐
- ✅ 支持大量并发
- ✅ 数据持久化
- ✅ Vercel免费额度充足

### SQLite优势  
- ✅ 本地开发方便
- ✅ 零配置
- ✅ 轻量级
- ✅ 便于调试

---

## 🐛 常见问题

### 1. 数据库连接失败
**问题**：`Error: connect ETIMEDOUT`

**解决**：
- 检查 `POSTGRES_URL` 是否正确
- 确认Neon数据库状态
- 检查防火墙设置

### 2. CORS错误
**问题**：`Access to XMLHttpRequest has been blocked by CORS policy`

**解决**：
- 检查 `ALLOWED_ORIGINS` 环境变量
- 确保包含前端域名
- 开发环境设置为 `NODE_ENV=development`

### 3. Rate Limit错误
**问题**：`Too many requests`

**解决**：
- 等待15分钟后重试
- 调整 `RATE_LIMIT_MAX_REQUESTS` 值
- 开发环境可以暂时禁用

### 4. Token过期
**问题**：频繁需要重新登录

**解决**：
- Token现已延长至7天
- 实现前端自动刷新token
- 检查服务器时间是否正确

---

## 📝 环境变量完整清单

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| POSTGRES_URL | ❌ | - | PostgreSQL连接字符串 |
| ADMIN_USERNAME | ✅ | admin | 管理员用户名 |
| ADMIN_PASSWORD | ✅ | 123456 | 管理员密码（生产必改） |
| JWT_SECRET | ✅ | 随机字符串 | JWT签名密钥 |
| NODE_ENV | ❌ | development | 运行环境 |
| PORT | ❌ | 3000 | 服务器端口 |
| ALLOWED_ORIGINS | ❌ | localhost | 允许的CORS域名 |
| RATE_LIMIT_WINDOW_MS | ❌ | 900000 | 速率限制时间窗口(ms) |
| RATE_LIMIT_MAX_REQUESTS | ❌ | 100 | 时间窗口内最大请求数 |

---

## 🔄 数据库迁移

### 从SQLite迁移到PostgreSQL

1. 导出SQLite数据（可选）
2. 配置PostgreSQL环境变量
3. 重启应用，自动创建表结构
4. 手动导入数据（如需要）

### 数据备份

#### PostgreSQL备份
```bash
pg_dump $POSTGRES_URL > backup.sql
```

#### SQLite备份
```bash
cp database/nav.db database/nav.db.backup
```

---

## 📈 性能优化建议

### 1. 启用CDN
- 静态资源使用CDN加速
- 图片使用图床服务

### 2. 数据库优化
- 定期清理日志
- 优化查询索引
- 使用连接池

### 3. 缓存策略
- 静态资源设置长缓存
- API响应使用HTTP缓存
- 考虑使用Redis缓存

---

## 🔍 监控和日志

### 1. Vercel监控
- 访问Vercel Dashboard查看
- 实时日志
- 性能指标
- 错误追踪

### 2. 数据库监控
- Neon Dashboard监控
- 连接数
- 查询性能
- 存储使用

---

## 📞 技术支持

遇到问题？
1. 查看 `BUG_REPORT_AND_FIXES.md`
2. 检查GitHub Issues
3. 查看项目文档

---

## ✅ 部署检查清单

部署前确认：
- [ ] 修改默认管理员密码
- [ ] 配置JWT_SECRET为随机字符串
- [ ] 设置ALLOWED_ORIGINS为实际域名
- [ ] 配置POSTGRES_URL数据库连接
- [ ] 构建前端 `cd web && npm run build`
- [ ] 测试所有功能是否正常
- [ ] 检查日志中是否有错误
- [ ] 验证CORS和Rate Limiting是否生效

---

**最后更新时间**: 2025-01-06
**版本**: v2.0.0 - 优化版本