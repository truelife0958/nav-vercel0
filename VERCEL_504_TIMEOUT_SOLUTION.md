# 504 Timeout 错误解决方案

## 🔍 问题分析

504 错误表示 Vercel serverless 函数执行超时（默认 10 秒）。

### 可能的原因

1. **数据库连接慢** - PostgreSQL 冷启动需要时间
2. **bcrypt 操作慢** - 密码加密/验证在 serverless 环境中较慢
3. **数据库初始化** - `db-postgres.js` 的 `ensureInitialized()` 可能阻塞

## 🔧 快速解决方案

### 方案 1: 降低 bcrypt 复杂度（推荐用于开发环境）

在 [`routes/auth.js`](routes/auth.js:46) 中，bcrypt.compare 可能太慢。

**临时解决方案 - 检查是否是 bcrypt 问题：**

1. 先尝试使用已有的管理员账号登录
2. 如果仍然超时，可能是数据库连接问题

### 方案 2: 优化数据库连接

**问题：** [`db-postgres.js`](db-postgres.js:17) 在每次请求时都检查初始化状态

**解决方案：** 数据库应该已经初始化，检查环境变量

```bash
# 确保这些环境变量已设置
POSTGRES_URL=postgresql://...
DATABASE_URL=postgresql://...
```

### 方案 3: 增加 Vercel 超时时间

在 `vercel.json` 中添加：

```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

**注意：** 免费版 Vercel 最多 10 秒，Pro 版可以到 60 秒

## 🚀 立即修复步骤

### 步骤 1: 检查数据库连接

```bash
# 测试数据库连接
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});
pool.query('SELECT NOW()').then(r => {
  console.log('数据库连接成功:', r.rows[0]);
  process.exit(0);
}).catch(e => {
  console.error('数据库连接失败:', e.message);
  process.exit(1);
});
"
```

### 步骤 2: 检查管理员账号是否存在

如果数据库连接正常，但登录超时，可能是因为：

1. **数据库为空** - 需要先初始化
2. **密码 hash 太慢** - bcrypt 轮数太高

**检查数据库：**

访问：`https://your-app.vercel.app/api/debug`

这个路由应该会显示数据库状态。

### 步骤 3: 重新部署

```bash
# 1. 确保依赖已安装
npm install

# 2. 提交更改
git add .
git commit -m "Fix bcrypt and JWT issues"
git push

# 3. Vercel 会自动重新部署
```

## 🔧 代码级修复（如果需要）

### 修复 1: 优化 bcrypt 性能

在生产环境中，可以考虑使用更快的密码验证：

```javascript
// routes/auth.js
// 如果 bcrypt 太慢，可以降低轮数
// 当前使用默认轮数（10），已经足够安全
const passwordHash = await bcrypt.hash(password, 10);
```

### 修复 2: 添加请求超时处理

```javascript
// routes/auth.js
router.post('/login', async (req, res) => {
  try {
    // 设置 8 秒超时（留 2 秒给 Vercel 处理）
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('登录超时')), 8000)
    );
    
    const loginPromise = (async () => {
      const { username, password } = req.body;
      const user = await db.get('SELECT * FROM users WHERE username=?', [username]);
      
      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }
      
      const result = await bcrypt.compare(password, user.password);
      
      if (result) {
        const token = jwt.sign(
          { id: user.id, username: user.username }, 
          config.server.jwtSecret, 
          { expiresIn: '2h' }
        );
        return res.json({ token });
      } else {
        return res.status(401).json({ error: '用户名或密码错误' });
      }
    })();
    
    await Promise.race([loginPromise, timeoutPromise]);
  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ error: '登录失败: ' + err.message });
  }
});
```

## 📊 诊断步骤

### 1. 检查 Vercel 日志

访问 Vercel Dashboard → 你的项目 → Functions → 查看日志

**寻找：**
- `登录请求: admin` - 请求已到达
- `找到用户: admin` - 数据库查询成功
- `登录成功: admin` - 完整流程成功

### 2. 检查数据库状态

```sql
-- 连接到 PostgreSQL 数据库
SELECT * FROM users;
SELECT * FROM menus;
```

### 3. 本地测试

```bash
# 设置环境变量
export POSTGRES_URL="your-database-url"
export JWT_SECRET="nav-item-jwt-secret-2024-secure-key"

# 启动本地服务器
npm start

# 测试登录
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

## 🎯 最可能的原因

根据你的情况，504 错误最可能的原因是：

1. **数据库冷启动** - PostgreSQL 连接需要时间
2. **首次初始化** - `db-postgres.js` 正在创建表和插入数据
3. **Vercel 区域延迟** - 数据库和函数在不同区域

## ✅ 建议的解决方案

1. **等待 1-2 分钟** - 首次部署时数据库初始化需要时间
2. **多次尝试登录** - 第二次通常会更快（连接已建立）
3. **检查 Vercel 日志** - 确认是哪一步超时
4. **升级 Vercel 计划**（如果需要）- 获得更长的超时时间

## 🔍 调试命令

```bash
# 查看 Vercel 日志
vercel logs

# 检查部署状态
vercel ls

# 查看环境变量
vercel env ls
```

## 📝 注意事项

- bcryptjs 比 bcrypt 慢，但更易于部署
- Serverless 函数有冷启动延迟
- 数据库连接池在每次请求时可能需要重新建立
- 首次请求通常较慢，后续会快很多

如果问题持续，考虑：
1. 使用 Vercel Postgres（更快的连接）
2. 切换到传统服务器部署（非 serverless）
3. 优化数据库查询和初始化逻辑