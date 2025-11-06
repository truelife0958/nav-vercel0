# 部署和登录指南

## 📌 重要说明

本项目已完成以下更新：
- ✅ 数据库初始化优化（添加 site_settings 表）
- ✅ Express 配置修复（trust proxy 和 CORS）
- ✅ Glassmorphism 毛玻璃风格 UI
- ✅ 菜单悬停自动展示功能
- ✅ 响应式布局优化

---

## 🔐 默认登录凭据

### 管理员账号
- **用户名**: `admin`
- **密码**: `123456`

> ⚠️ **重要**: 首次登录后请立即修改密码！

---

## 🚀 Vercel 部署后的登录问题排查

### 问题1: 登录失败 - "用户名或密码错误"

**可能原因**:
1. 数据库未正确初始化
2. 密码哈希不匹配
3. 环境变量配置错误

**解决方案**:

#### 方法1: 检查 Vercel 日志
```bash
# 在 Vercel Dashboard 查看 Functions 日志
1. 进入项目 → Functions → 选择 /api/auth/login
2. 查看实时日志，确认是否有错误信息
```

#### 方法2: 验证数据库初始化
```bash
# 在 Vercel Dashboard 的 Storage → Postgres → Data
# 运行以下查询检查用户表：
SELECT * FROM users;

# 应该看到 admin 用户记录
```

#### 方法3: 重新创建管理员账号
```sql
-- 在 Vercel Postgres 数据库中执行：
DELETE FROM users WHERE username = 'admin';

-- 然后重新部署项目，触发自动初始化
```

#### 方法4: 手动创建管理员（临时方案）
```sql
-- 在 Vercel Postgres 中执行：
INSERT INTO users (username, password) 
VALUES ('admin', '$2a$10$YourHashedPasswordHere');

-- 注意：密码需要使用 bcrypt 哈希
-- 可以使用在线工具生成：https://bcrypt-generator.com/
-- 输入 "123456" → 轮数选择 10 → 生成哈希值
```

---

### 问题2: 数据库连接失败

**解决方案**:
1. 确认 Vercel Postgres 数据库已创建
2. 检查环境变量 `POSTGRES_URL` 是否正确设置
3. 在 Vercel Dashboard → Settings → Environment Variables 确认配置

---

### 问题3: 密码已修改但忘记了

**解决方案**:
```sql
-- 在 Vercel Postgres 中重置密码为 "123456"
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE username = 'admin';

-- 上面的哈希值对应密码 "123456"
```

---

## 🔧 本地开发环境登录

### SQLite 数据库（本地）

**默认凭据**:
- 用户名: `admin`
- 密码: `123456`

**重置数据库**:
```bash
# 删除数据库文件
rm database/nav.db

# 重启应用，自动重新初始化
npm start
```

---

## 📝 密码修改流程

### 后台修改密码
1. 登录后台: `http://your-domain/admin`
2. 进入 **网站设置**
3. 找到 **密码管理** 区域
4. 输入当前密码和新密码
5. 点击保存

### 修改成功后
- 系统会自动登出
- 使用新密码重新登录

---

## 🔍 调试技巧

### 查看数据库内容
```bash
# 本地 SQLite
sqlite3 database/nav.db
.tables
SELECT * FROM users;

# Vercel Postgres
# 使用 Vercel Dashboard → Storage → Postgres → Data
```

### 查看应用日志
```bash
# 本地开发
npm start
# 观察控制台输出

# Vercel 生产环境
# Dashboard → Functions → 选择函数 → 查看日志
```

### 测试登录 API
```bash
# 使用 curl 测试
curl -X POST https://your-domain/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 成功响应示例：
{
  "token": "eyJhbGc...",
  "lastLoginTime": "2025-01-06 12:00:00",
  "lastLoginIp": "127.0.0.1"
}
```

---

## ⚠️ 安全建议

1. **立即修改默认密码**: 首次部署后务必修改
2. **使用强密码**: 至少8位，包含大小写字母、数字和特殊字符
3. **定期更新**: 建议每3个月更换一次密码
4. **限制访问**: 使用防火墙限制后台访问IP（如可能）

---

## 📞 获取帮助

如果问题仍未解决：

1. **查看详细日志**:
   - Vercel: Dashboard → Functions → Logs
   - 本地: 终端控制台输出

2. **检查数据库状态**:
   - 确认表已创建
   - 确认 admin 用户存在
   - 确认密码哈希格式正确

3. **重新部署**:
   ```bash
   # 触发 Vercel 重新部署
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

4. **清除缓存**:
   - Vercel Dashboard → Settings → Clear Build Cache
   - 然后重新部署

---

## 📚 相关文档

- [完整部署指南](DEPLOYMENT_GUIDE.md)
- [项目 README](README.md)
- [故障排除指南](TROUBLESHOOTING.md)

---

**最后更新**: 2025-01-06  
**版本**: v2.0