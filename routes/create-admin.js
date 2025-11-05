const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const config = require('../config');
const router = express.Router();

// 创建数据库连接
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 创建管理员账号（无需认证，仅用于初始化）
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    // 检查是否已有管理员
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    
    if (parseInt(userCount.rows[0].count) > 0) {
      return res.json({
        success: false,
        message: '管理员账号已存在',
        count: parseInt(userCount.rows[0].count)
      });
    }
    
    // 创建默认管理员
    const passwordHash = await bcrypt.hash(config.admin.password, 10);
    await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
      config.admin.username,
      passwordHash
    ]);
    
    res.json({
      success: true,
      message: '管理员账号创建成功',
      username: config.admin.username,
      password: config.admin.password
    });
    
  } catch (error) {
    console.error('创建管理员失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

// 检查管理员账号
router.get('/check', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT id, username, last_login_time FROM users');
    
    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });
    
  } catch (error) {
    console.error('查询用户失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;