const express = require('express');
const db = require('../db-switch');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

// 获取所有网站设置（公开接口，不需要认证）
router.get('/', async (req, res) => {
  try {
    const settings = await db.all('SELECT key, value, description FROM site_settings', []);
    // 转换为键值对对象
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    res.json({ data: settingsObj });
  } catch (err) {
    console.error('获取设置失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个设置
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await db.get('SELECT key, value, description FROM site_settings WHERE key = ?', [key]);
    if (!setting) {
      return res.status(404).json({ message: '设置项不存在' });
    }
    res.json({ data: setting });
  } catch (err) {
    console.error('获取设置失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新网站设置（需要管理员认证）
router.put('/', authMiddleware, async (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: '无效的设置数据' });
    }

    // 使用事务更新所有设置
    const updates = Object.entries(settings).map(([key, value]) => {
      return db.run(
        'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
        [key, value, value]
      );
    });

    await Promise.all(updates);
    res.json({ message: '设置更新成功' });
  } catch (err) {
    console.error('更新设置失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新单个设置
router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ message: '缺少value参数' });
    }

    // 检查设置是否存在
    const existing = await db.get('SELECT id FROM site_settings WHERE key = ?', [key]);
    
    if (existing) {
      // 更新现有设置
      if (description !== undefined) {
        await db.run('UPDATE site_settings SET value = ?, description = ? WHERE key = ?', [value, description, key]);
      } else {
        await db.run('UPDATE site_settings SET value = ? WHERE key = ?', [value, key]);
      }
    } else {
      // 创建新设置
      await db.run('INSERT INTO site_settings (key, value, description) VALUES (?, ?, ?)', [key, value, description || '']);
    }
    
    res.json({ message: '设置更新成功' });
  } catch (err) {
    console.error('更新设置失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除设置
router.delete('/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    await db.run('DELETE FROM site_settings WHERE key = ?', [key]);
    res.json({ message: '设置删除成功' });
  } catch (err) {
    console.error('删除设置失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;