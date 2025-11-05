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

// 初始化数据库端点
router.post('/database', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 检查并插入默认菜单
    let menuCount = await client.query('SELECT COUNT(*) as count FROM menus');
    if (parseInt(menuCount.rows[0].count) === 0) {
      const defaultMenus = [
        ['Home', 1],
        ['Ai Stuff', 2],
        ['Cloud', 3],
        ['Software', 4],
        ['Tools', 5],
        ['Other', 6]
      ];
      
      for (const [name, order] of defaultMenus) {
        await client.query('INSERT INTO menus (name, sort_order) VALUES ($1, $2)', [name, order]);
      }
      
      console.log('✅ 默认菜单插入完成');
    }
    
    // 重新查询菜单数量
    menuCount = await client.query('SELECT COUNT(*) as count FROM menus');
    
    // 检查并插入默认管理员
    let userCount = await client.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      const passwordHash = await bcrypt.hash(config.admin.password, 10);
      await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
        config.admin.username,
        passwordHash
      ]);
      
      console.log('✅ 默认管理员账号创建完成');
    }
    
    // 重新查询用户数量
    userCount = await client.query('SELECT COUNT(*) as count FROM users');
    
    // 检查并插入默认友情链接
    let friendCount = await client.query('SELECT COUNT(*) as count FROM friends');
    if (parseInt(friendCount.rows[0].count) === 0) {
      const defaultFriends = [
        ['Nodeseek图床', 'https://www.nodeimage.com', 'https://www.nodeseek.com/static/image/favicon/favicon-32x32.png'],
        ['Font Awesome', 'https://fontawesome.com', 'https://fontawesome.com/favicon.ico']
      ];
      
      for (const [title, url, logo] of defaultFriends) {
        await client.query('INSERT INTO friends (title, url, logo) VALUES ($1, $2, $3)', [title, url, logo]);
      }
      
      console.log('✅ 默认友情链接插入完成');
    }
    
    // 重新查询友情链接数量
    friendCount = await client.query('SELECT COUNT(*) as count FROM friends');
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: '数据库初始化完成',
      data: {
        menus: parseInt(menuCount.rows[0].count),
        users: parseInt(userCount.rows[0].count),
        friends: parseInt(friendCount.rows[0].count)
      }
    });
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;