const express = require('express');
const db = require('../db-switch');
const auth = require('./authMiddleware');
const router = express.Router();

// 记录卡片点击（无需认证）
router.post('/click/:cardId', async (req, res) => {
  try {
    const cardId = req.params.cardId;
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || '';
    
    // 创建统计表（如果不存在）
    await db.run(`
      CREATE TABLE IF NOT EXISTS card_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        click_count INTEGER DEFAULT 0,
        last_clicked_at DATETIME,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `);
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS click_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `);
    
    // 更新或插入统计数据
    const existing = await db.get('SELECT * FROM card_stats WHERE card_id = ?', [cardId]);
    
    if (existing) {
      await db.run(
        'UPDATE card_stats SET click_count = click_count + 1, last_clicked_at = CURRENT_TIMESTAMP WHERE card_id = ?',
        [cardId]
      );
    } else {
      await db.run(
        'INSERT INTO card_stats (card_id, click_count, last_clicked_at) VALUES (?, 1, CURRENT_TIMESTAMP)',
        [cardId]
      );
    }
    
    // 记录点击日志
    await db.run(
      'INSERT INTO click_logs (card_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [cardId, ip.substring(0, 45), userAgent.substring(0, 255)]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('记录点击失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取热门网站（按点击量排序）
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30; // 默认30天内
    
    // 确保表存在
    await db.run(`
      CREATE TABLE IF NOT EXISTS card_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        click_count INTEGER DEFAULT 0,
        last_clicked_at DATETIME,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `);
    
    const popularCards = await db.all(`
      SELECT 
        c.id,
        c.title,
        c.url,
        c.logo_url,
        c.description,
        cs.click_count,
        cs.last_clicked_at,
        m.name as menu_name
      FROM cards c
      INNER JOIN card_stats cs ON c.id = cs.card_id
      LEFT JOIN menus m ON c.menu_id = m.id
      WHERE cs.last_clicked_at >= datetime('now', '-${days} days')
      ORDER BY cs.click_count DESC
      LIMIT ?
    `, [limit]);
    
    res.json(popularCards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取统计概览（需要认证）
router.get('/overview', auth, async (req, res) => {
  try {
    // 确保表存在
    await db.run(`
      CREATE TABLE IF NOT EXISTS card_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        click_count INTEGER DEFAULT 0,
        last_clicked_at DATETIME,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `);
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS click_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `);
    
    // 总点击数
    const totalClicks = await db.get('SELECT SUM(click_count) as total FROM card_stats');
    
    // 今日点击数
    const todayClicks = await db.get(`
      SELECT COUNT(*) as count 
      FROM click_logs 
      WHERE DATE(clicked_at) = DATE('now')
    `);
    
    // 本周点击数
    const weekClicks = await db.get(`
      SELECT COUNT(*) as count 
      FROM click_logs 
      WHERE clicked_at >= datetime('now', '-7 days')
    `);
    
    // 本月点击数
    const monthClicks = await db.get(`
      SELECT COUNT(*) as count 
      FROM click_logs 
      WHERE clicked_at >= datetime('now', '-30 days')
    `);
    
    // 访问量最高的10个网站
    const topCards = await db.all(`
      SELECT 
        c.title,
        c.url,
        cs.click_count
      FROM card_stats cs
      INNER JOIN cards c ON cs.card_id = c.id
      ORDER BY cs.click_count DESC
      LIMIT 10
    `);
    
    // 最近7天的每日点击趋势
    const dailyTrend = await db.all(`
      SELECT 
        DATE(clicked_at) as date,
        COUNT(*) as clicks
      FROM click_logs
      WHERE clicked_at >= datetime('now', '-7 days')
      GROUP BY DATE(clicked_at)
      ORDER BY date DESC
    `);
    
    res.json({
      totalClicks: totalClicks?.total || 0,
      todayClicks: todayClicks?.count || 0,
      weekClicks: weekClicks?.count || 0,
      monthClicks: monthClicks?.count || 0,
      topCards: topCards || [],
      dailyTrend: dailyTrend || []
    });
  } catch (err) {
    console.error('获取统计概览失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 获取指定卡片的统计信息
router.get('/card/:cardId', auth, async (req, res) => {
  try {
    const cardId = req.params.cardId;
    
    const stats = await db.get(`
      SELECT 
        cs.*,
        c.title,
        c.url
      FROM card_stats cs
      INNER JOIN cards c ON cs.card_id = c.id
      WHERE cs.card_id = ?
    `, [cardId]);
    
    // 获取最近的点击记录
    const recentClicks = await db.all(`
      SELECT 
        ip_address,
        clicked_at
      FROM click_logs
      WHERE card_id = ?
      ORDER BY clicked_at DESC
      LIMIT 20
    `, [cardId]);
    
    res.json({
      stats: stats || { click_count: 0 },
      recentClicks: recentClicks || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 清除统计数据（需要认证）
router.delete('/clear', auth, async (req, res) => {
  try {
    await db.run('DELETE FROM card_stats');
    await db.run('DELETE FROM click_logs');
    res.json({ success: true, message: '统计数据已清除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;