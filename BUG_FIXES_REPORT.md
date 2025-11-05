# BUG 修复报告

## 修复日期
2025-11-05

## 修复的 BUG 列表

### 1. ✅ JWT 密钥不一致问题 (严重)

**问题描述:**
JWT 密钥在多个文件中定义不一致，导致 token 生成和验证使用不同的密钥。

**影响:**
- 用户登录后的 token 验证会失败
- 所有需要认证的 API 都无法正常工作

**修复文件:**
- `routes/authMiddleware.js` - 改为使用 `config.server.jwtSecret`
- `routes/auth.js` - 改为使用 `config.server.jwtSecret`

**修复内容:**
统一使用 `config.js` 中的 JWT 密钥配置，支持环境变量 `JWT_SECRET`。

---

### 2. ✅ bcrypt 和 bcryptjs 混用问题 (严重)

**问题描述:**
项目中同时使用了 `bcrypt` 和 `bcryptjs` 两个不同的库。

**影响:**
- 可能导致密码验证不一致
- 增加不必要的依赖
- `bcrypt` 需要编译，部署可能出现问题

**修复文件:**
- `db-postgres.js` - 改为使用 `bcryptjs`
- `routes/user.js` - 改为使用 `bcryptjs`
- `package.json` - 移除 `bcrypt` 依赖

**修复内容:**
统一使用 `bcryptjs`，因为它是纯 JavaScript 实现，更易于部署。

---

### 3. ✅ 数据库字段名不一致问题 (严重)

**问题描述:**
菜单表的排序字段在不同地方使用不同的名称：
- SQLite 使用 `"order"` (需要双引号转义)
- PostgreSQL 使用 `sort_order`
- 同一个路由文件中 INSERT 和 UPDATE 使用不同的字段名

**影响:**
- 跨数据库迁移会出错
- INSERT 和 UPDATE 操作字段不匹配
- 菜单排序功能可能失败

**修复文件:**
- `routes/menu.js` - 统一使用 `sort_order`

**修复内容:**
将所有菜单相关的排序字段统一为 `sort_order`。

---

### 4. ✅ 数据库回调函数与 async/await 混用问题 (严重)

**问题描述:**
`routes/user.js` 使用回调风格的数据库调用，但 `db-postgres.js` 返回的是 Promise。

**影响:**
- 回调函数永远不会被执行
- 所有用户相关 API 请求会超时或挂起
- 获取用户信息、修改密码等功能完全失效

**修复文件:**
- `routes/user.js` - 所有路由改为 async/await

**修复的路由:**
- `GET /api/users/profile` - 获取当前用户信息
- `GET /api/users/me` - 获取当前用户详细信息
- `PUT /api/users/password` - 修改密码
- `GET /api/users/` - 获取所有用户

**修复内容:**
将所有回调风格改为 async/await，并使用 bcrypt 的异步方法。

---

### 5. ✅ 依赖清理 (建议)

**问题描述:**
`package.json` 中包含未使用或重复的依赖。

**修复文件:**
- `package.json`

**修复内容:**
- 移除 `bcrypt` 依赖（已统一使用 `bcryptjs`）

---

## 其他发现的问题（未修复，建议后续处理）

### 6. ⚠️ SQLite 相关代码冗余

**问题描述:**
- `db.js` 文件使用 SQLite，但项目已完全切换到 PostgreSQL
- 所有路由都引用 `db-postgres.js`
- `package.json` 中没有 `sqlite3` 依赖

**建议:**
- 如果确定不再使用 SQLite，可以删除 `db.js` 文件
- 或者保留作为备用方案，但需要添加 `sqlite3` 依赖

### 7. ⚠️ description 字段名不一致

**问题描述:**
- `db.js` 中 cards 表使用 `desc` 字段
- `db-postgres.js` 中使用 `description` 字段

**建议:**
统一使用 `description`（更规范）。

---

## 测试建议

修复完成后，建议测试以下功能：

1. **用户认证:**
   - ✅ 用户登录
   - ✅ Token 验证
   - ✅ 需要认证的 API 访问

2. **用户管理:**
   - ✅ 获取用户信息
   - ✅ 修改密码
   - ✅ 获取用户列表

3. **菜单管理:**
   - ✅ 创建菜单（验证 sort_order 字段）
   - ✅ 更新菜单
   - ✅ 菜单排序

4. **卡片管理:**
   - ✅ 创建卡片
   - ✅ 更新卡片
   - ✅ 卡片显示

---

## 环境变量配置

确保以下环境变量已正确配置：

```env
# 数据库配置
POSTGRES_URL=postgresql://...
DATABASE_URL=postgresql://...

# JWT 密钥（重要！）
JWT_SECRET=your-secure-jwt-secret-key

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# 服务器配置
PORT=3000
NODE_ENV=production
```

---

## 部署注意事项

1. **更新依赖:**
   ```bash
   npm install
   ```

2. **环境变量:**
   - 确保所有环境变量已设置
   - 特别是 `JWT_SECRET` 必须设置为安全的随机字符串

3. **数据库:**
   - PostgreSQL 数据库会自动初始化表结构
   - 默认管理员账号会在首次运行时创建

4. **测试:**
   - 部署后先测试登录功能
   - 验证所有需要认证的 API 是否正常工作

---

## 总结

本次修复解决了 5 个严重 BUG，主要涉及：
- ✅ JWT 认证机制
- ✅ 密码加密库统一
- ✅ 数据库字段名一致性
- ✅ 异步代码规范化
- ✅ 依赖清理

所有修复都已完成并经过代码审查，建议立即部署并进行完整的功能测试。