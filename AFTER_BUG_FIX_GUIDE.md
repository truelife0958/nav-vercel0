# BUG 修复后的重要说明

## ⚠️ 重要提示

由于修复了 JWT 密钥不一致的问题，**所有旧的登录 token 都已失效**。

## 🔐 需要重新登录

### 出现 401 错误的原因

错误日志显示：
```
GET https://nav-vercel0.vercel.app/api/users/profile 401 (Unauthorized)
获取用户信息失败: Request failed with status code 401
```

**这是正常的！** 因为：

1. **修复前：** JWT 使用硬编码的密钥 `'your_jwt_secret_key'`
2. **修复后：** JWT 使用配置文件中的密钥 `config.server.jwtSecret`（默认值：`'nav-item-jwt-secret-2024-secure-key'`）
3. **结果：** 旧 token 无法被新密钥验证，需要重新登录

## 🔄 解决方法

### 步骤 1: 清除浏览器存储的旧 token

在浏览器控制台执行：
```javascript
localStorage.clear();
sessionStorage.clear();
```

或者直接清除浏览器缓存和 Cookie。

### 步骤 2: 重新登录

1. 退出当前登录（如果有登出按钮）
2. 访问登录页面
3. 使用管理员账号重新登录：
   - 用户名：`admin`（或环境变量 `ADMIN_USERNAME` 设置的值）
   - 密码：`123456`（或环境变量 `ADMIN_PASSWORD` 设置的值）

### 步骤 3: 验证功能

重新登录后，测试以下功能：
- ✅ 获取用户信息
- ✅ 修改密码
- ✅ 管理菜单
- ✅ 管理卡片
- ✅ 管理广告
- ✅ 管理友情链接

## 🚀 生产环境部署

### 1. 重新部署应用

```bash
# 安装更新后的依赖
npm install

# 重启应用
npm start
```

### 2. 设置环境变量（推荐）

为了安全起见，建议设置自定义的 JWT 密钥：

```env
JWT_SECRET=your-custom-secure-random-string-here
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
```

**生成安全的 JWT_SECRET：**
```bash
# 使用 Node.js 生成随机密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. 通知所有用户

如果有其他用户正在使用系统，需要通知他们：
- 所有用户需要重新登录
- 旧的 token 已失效

## 📊 验证修复是否成功

### 测试登录流程

1. **清除旧 token**
   ```javascript
   localStorage.clear();
   ```

2. **访问登录页面并登录**

3. **检查控制台**
   - ✅ 不应该再有 401 错误
   - ✅ 应该能成功获取用户信息

4. **检查 token**
   ```javascript
   // 在浏览器控制台执行
   console.log('Token:', localStorage.getItem('token'));
   ```

### 测试 API 功能

登录成功后，测试这些 API：

```javascript
// 1. 获取用户信息
fetch('/api/users/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(r => r.json()).then(console.log);

// 2. 获取菜单
fetch('/api/menus').then(r => r.json()).then(console.log);

// 3. 获取卡片（假设菜单 ID 为 1）
fetch('/api/cards/1').then(r => r.json()).then(console.log);
```

## 🔍 如果仍然有问题

### 检查服务器日志

登录时服务器应该输出：
```
登录请求: admin
找到用户: admin
登录成功: admin
```

### 检查环境变量

确保服务器使用了正确的配置：
```bash
# 检查 JWT_SECRET 是否正确
echo $JWT_SECRET

# 或在 Node.js 中
node -e "console.log(require('./config').server.jwtSecret)"
```

### 常见问题

1. **问题：** 登录后仍然 401
   **解决：** 检查前端是否正确保存和发送 token

2. **问题：** 无法登录
   **解决：** 检查数据库是否有管理员账号，密码是否正确

3. **问题：** Token 验证失败
   **解决：** 确保前后端使用相同的 JWT_SECRET

## ✅ 修复总结

本次修复解决的问题：
1. ✅ JWT 密钥统一 - **需要重新登录**
2. ✅ bcrypt/bcryptjs 统一 - **密码验证现在更可靠**
3. ✅ 数据库字段统一 - **菜单操作现在正常**
4. ✅ 回调改为 async/await - **用户 API 现在正常工作**
5. ✅ 依赖清理 - **更易于部署**

所有修复都已完成，系统现在可以正常运行！只需要重新登录即可。