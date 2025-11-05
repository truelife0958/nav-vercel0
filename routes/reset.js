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

// 重置数据库（危险操作，清空所有数据并重新初始化）
router.post('/database', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🗑️  开始清空数据库...');
    
    // 按依赖顺序删除所有数据
    await client.query('DELETE FROM cards');
    await client.query('DELETE FROM sub_menus');
    await client.query('DELETE FROM menus');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM friends');
    await client.query('DELETE FROM ads');
    
    // 重置序列
    await client.query("SELECT setval('menus_id_seq', 1, false)");
    await client.query("SELECT setval('sub_menus_id_seq', 1, false)");
    await client.query("SELECT setval('cards_id_seq', 1, false)");
    await client.query("SELECT setval('users_id_seq', 1, false)");
    await client.query("SELECT setval('friends_id_seq', 1, false)");
    await client.query("SELECT setval('ads_id_seq', 1, false)");
    
    console.log('✅ 数据清空完成');
    
    // 插入默认菜单
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
    
    // 插入默认管理员
    const passwordHash = await bcrypt.hash(config.admin.password, 10);
    await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
      config.admin.username,
      passwordHash
    ]);
    console.log('✅ 默认管理员账号创建完成');
    
    // 插入默认友情链接
    const defaultFriends = [
      ['Nodeseek图床', 'https://www.nodeimage.com', 'https://www.nodeseek.com/static/image/favicon/favicon-32x32.png'],
      ['Font Awesome', 'https://fontawesome.com', 'https://fontawesome.com/favicon.ico']
    ];
    
    for (const [title, url, logo] of defaultFriends) {
      await client.query('INSERT INTO friends (title, url, logo) VALUES ($1, $2, $3)', [title, url, logo]);
    }
    console.log('✅ 默认友情链接插入完成');
    
    // 查询最终结果
    const menuCount = await client.query('SELECT COUNT(*) as count FROM menus');
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const friendCount = await client.query('SELECT COUNT(*) as count FROM friends');
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: '数据库重置完成',
      data: {
        menus: parseInt(menuCount.rows[0].count),
        users: parseInt(userCount.rows[0].count),
        friends: parseInt(friendCount.rows[0].count)
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 数据库重置失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  } finally {
    client.release();
  }
});

module.exports = router;