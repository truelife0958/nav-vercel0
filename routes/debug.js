const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// 创建数据库连接
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 诊断端点
router.get('/status', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = {
      database: 'connected',
      tables: {},
      env: {
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    };
    
    // 检查各个表的数据
    const menuCount = await client.query('SELECT COUNT(*) as count FROM menus');
    const menuData = await client.query('SELECT * FROM menus ORDER BY sort_order LIMIT 10');
    result.tables.menus = {
      count: parseInt(menuCount.rows[0].count),
      data: menuData.rows
    };
    
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    result.tables.users = {
      count: parseInt(userCount.rows[0].count)
    };
    
    const friendCount = await client.query('SELECT COUNT(*) as count FROM friends');
    result.tables.friends = {
      count: parseInt(friendCount.rows[0].count)
    };
    
    res.json(result);
    
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  } finally {
    client.release();
  }
});

module.exports = router;