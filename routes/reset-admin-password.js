const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db-switch');
const config = require('../config');

const router = express.Router();

// 重置管理员密码的临时路由
// 使用后应该立即删除此文件或禁用此路由
router.post('/reset-admin-password', async (req, res) => {
  try {
    const { secret_key } = req.body;
    
    // 安全检查：需要提供 JWT_SECRET 作为验证
    if (secret_key !== config.server.jwtSecret) {
      return res.status(403).json({ error: '无权限' });
    }
    
    const username = config.admin.username;
    const newPassword = config.admin.password;
    
    // 检查用户是否存在
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!user) {
      // 如果用户不存在，创建新用户
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, passwordHash]);
      return res.json({ 
        message: '管理员账号创建成功',
        username: username,
        password: newPassword
      });
    } else {
      // 如果用户存在，更新密码
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await db.run('UPDATE users SET password = ? WHERE username = ?', [passwordHash, username]);
      return res.json({ 
        message: '密码重置成功',
        username: username,
        password: newPassword
      });
    }
  } catch (err) {
    console.error('重置密码失败:', err);
    res.status(500).json({ error: '重置失败: ' + err.message });
  }
});

module.exports = router;