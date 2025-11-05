# 🔧 Vercel 环境变量配置指南

## 步骤 1：获取 Neon 数据库连接信息

您已经有了 Neon 数据库连接信息。从 Neon 控制台复制以下环境变量（示例格式）：

```env
POSTGRES_URL=postgresql://neondb_owner:your_password@your-host.neon.tech/neondb?sslmode=require
```

⚠️ **安全提示**：不要将真实的数据库密码提交到 Git 仓库！

## 步骤 2：在 Vercel 中配置环境变量

### 方法 1：通过 Vercel Dashboard（推荐）

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 点击 **Settings** 标签
4. 在左侧菜单选择 **Environment Variables**
5. 添加以下环境变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `POSTGRES_URL` | `postgresql://neondb_owner:your_password@your-host.neon.tech/neondb?sslmode=require` | Production, Preview, Development |

6. 点击 **Save**

### 方法 2：使用 Vercel CLI

```bash
# 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add POSTGRES_URL production
# 粘贴您的 POSTGRES_URL 值

# 也可以为 Preview 和 Development 环境添加
vercel env add POSTGRES_URL preview
vercel env add POSTGRES_URL development
```

## 步骤 3：重新部署

添加环境变量后，需要重新部署才能生效：

### 通过 Dashboard 重新部署
1. 进入 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的 **···** 菜单
4. 选择 **Redeploy**

### 通过 Git 提交触发部署
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

### 通过 CLI 部署
```bash
vercel --prod
```

## 步骤 4：验证部署

等待部署完成（约 1-2 分钟），然后验证：

```bash
# 替换为您的实际 Vercel 域名
SITE_URL="https://your-site.vercel.app"

# 1. 检查数据库连接
curl "$SITE_URL/api/debug/status"

# 2. 如果数据库有旧数据，重置它
curl -X POST "$SITE_URL/api/reset/database"

# 3. 验证菜单数据
curl "$SITE_URL/api/menus"
```

## 步骤 5：初始化数据库（如果需要）

### 情况 A：全新数据库（推荐）
数据库会在首次启动时自动初始化，无需手动操作。

### 情况 B：数据库有旧数据
使用重置端点清空并重新初始化：

```bash
curl -X POST https://your-site.vercel.app/api/reset/database
```

### 情况 C：仅添加缺失数据
如果只想添加缺失的数据而不删除现有数据：

```bash
curl -X POST https://your-site.vercel.app/api/init/database
```

## 常见问题排查

### Q1: 部署后出现数据库连接错误

**检查清单**：
```bash
# 1. 验证环境变量已设置
vercel env ls

# 2. 检查 POSTGRES_URL 格式
# 正确格式：postgresql://user:password@host/database?sslmode=require

# 3. 测试数据库连接（使用 psql）
psql "postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require"
```

### Q2: 看到"✅ 初始化完成"但没有数据

这是因为数据库中已有数据，初始化逻辑跳过了。解决方法：

```bash
# 清空并重新初始化
curl -X POST https://your-site.vercel.app/api/reset/database
```

### Q3: Serverless 函数超时

Neon 免费版可能有冷启动延迟。解决方法：
- 升级 Neon 计划
- 或使用 Vercel Postgres（集成更好）
- 增加函数超时时间（需要 Pro 计划）

### Q4: 多次部署后环境变量丢失

确保环境变量应用到了所有环境：
```bash
vercel env ls

# 如果缺失，重新添加
vercel env add POSTGRES_URL production
vercel env add POSTGRES_URL preview
vercel env add POSTGRES_URL development
```

## 环境变量说明

本项目需要的环境变量：

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `POSTGRES_URL` | ✅ 是 | PostgreSQL 连接字符串（推荐使用 pooled 版本） |
| `DATABASE_URL` | ⚪ 可选 | 备用连接字符串，如果 POSTGRES_URL 未设置则使用此变量 |
| `NODE_ENV` | ⚪ 可选 | Vercel 自动设置为 `production` |

## Neon 连接字符串类型

Neon 提供多种连接字符串：

### 1. POSTGRES_URL (推荐)
```
postgresql://user:password@host-pooler.neon.tech/db?sslmode=require
```
- ✅ 使用 PgBouncer 连接池
- ✅ 适合 Serverless 环境
- ✅ 连接数限制更高

### 2. POSTGRES_URL_NON_POOLING
```
postgresql://user:password@host.neon.tech/db?sslmode=require
```
- ⚠️ 直接连接，无连接池
- ⚠️ Serverless 环境可能耗尽连接数
- 仅在特定场景使用（如需要 LISTEN/NOTIFY）

## 生产环境最佳实践

### 1. 使用 Pooled 连接
始终使用带 `-pooler` 的主机名：
```
POSTGRES_URL=postgresql://...@host-pooler.neon.tech/...
```

### 2. 启用 SSL
连接字符串必须包含 `sslmode=require`

### 3. 环境隔离
为不同环境使用不同的数据库：
- Production: 生产数据库
- Preview: 预览环境数据库（可选）
- Development: 本地或开发数据库

### 4. 定期备份
虽然 Neon 自动备份，但建议：
```bash
# 导出数据库（定期执行）
pg_dump "postgresql://..." > backup.sql
```

## 安全建议

1. ✅ 使用 Vercel 环境变量存储密钥（不要提交到 Git）
2. ✅ 定期轮换数据库密码
3. ✅ 限制 Neon 数据库的 IP 访问（付费功能）
4. ✅ 使用只读用户进行查询（如果可能）
5. ⚠️ 不要在客户端代码中暴露连接字符串

## 下一步

配置完成后，您可以：

1. 访问您的网站查看效果
2. 使用管理后台添加内容
3. 查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 了解问题排查
4. 阅读 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 了解其他部署选项

## 有用的命令

```bash
# 查看所有环境变量
vercel env ls

# 拉取环境变量到本地 .env 文件
vercel env pull

# 删除环境变量
vercel env rm POSTGRES_URL production

# 查看部署日志
vercel logs [deployment-url]

# 重新部署
vercel --prod
```

## 联系支持

遇到问题？
1. 检查 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. 查看 Vercel 部署日志
3. 使用 `/api/debug/status` 诊断
4. 在 GitHub 创建 Issue