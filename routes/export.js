const express = require('express');
const db = require('../db-switch');
const auth = require('./authMiddleware');
const router = express.Router();

// 导出所有数据为JSON
router.get('/json', auth, async (req, res) => {
  try {
    // 获取所有菜单
    const menus = await db.all('SELECT * FROM menus ORDER BY sort_order');
    
    // 获取所有子菜单
    const subMenus = await db.all('SELECT * FROM sub_menus ORDER BY sort_order');
    
    // 获取所有卡片
    const cards = await db.all('SELECT * FROM cards ORDER BY menu_id, sub_menu_id, sort_order');
    
    // 获取所有广告
    const ads = await db.all('SELECT * FROM ads ORDER BY sort_order');
    
    // 获取所有友链
    const friends = await db.all('SELECT * FROM friend_links ORDER BY sort_order');
    
    // 获取网站设置
    const settings = await db.all('SELECT * FROM settings');
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        menus,
        subMenus,
        cards,
        ads,
        friends,
        settings
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=nav-export-${Date.now()}.json`);
    res.json(exportData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 导出卡片数据为CSV
router.get('/csv/cards', auth, async (req, res) => {
  try {
    const cards = await db.all(`
      SELECT 
        c.id,
        c.title,
        c.url,
        c.logo_url,
        c.description,
        c.sort_order,
        m.name as menu_name,
        sm.name as sub_menu_name
      FROM cards c
      LEFT JOIN menus m ON c.menu_id = m.id
      LEFT JOIN sub_menus sm ON c.sub_menu_id = sm.id
      ORDER BY c.menu_id, c.sub_menu_id, c.sort_order
    `);
    
    // 生成CSV
    const csvHeader = 'ID,标题,网址,Logo链接,描述,排序,所属菜单,所属子菜单\n';
    const csvRows = cards.map(card => {
      return [
        card.id,
        `"${(card.title || '').replace(/"/g, '""')}"`,
        `"${(card.url || '').replace(/"/g, '""')}"`,
        `"${(card.logo_url || '').replace(/"/g, '""')}"`,
        `"${(card.description || '').replace(/"/g, '""')}"`,
        card.sort_order || 0,
        `"${(card.menu_name || '').replace(/"/g, '""')}"`,
        `"${(card.sub_menu_name || '').replace(/"/g, '""')}"`
      ].join(',');
    }).join('\n');
    
    const csv = '\uFEFF' + csvHeader + csvRows; // BOM for Excel UTF-8 support
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=cards-export-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 导出菜单数据为CSV
router.get('/csv/menus', auth, async (req, res) => {
  try {
    const menus = await db.all('SELECT * FROM menus ORDER BY sort_order');
    
    const csvHeader = 'ID,名称,图标,排序\n';
    const csvRows = menus.map(menu => {
      return [
        menu.id,
        `"${(menu.name || '').replace(/"/g, '""')}"`,
        `"${(menu.icon || '').replace(/"/g, '""')}"`,
        menu.sort_order || 0
      ].join(',');
    }).join('\n');
    
    const csv = '\uFEFF' + csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=menus-export-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 导出友链数据为CSV
router.get('/csv/friends', auth, async (req, res) => {
  try {
    const friends = await db.all('SELECT * FROM friend_links ORDER BY sort_order');
    
    const csvHeader = 'ID,名称,网址,Logo链接,描述,排序\n';
    const csvRows = friends.map(friend => {
      return [
        friend.id,
        `"${(friend.name || '').replace(/"/g, '""')}"`,
        `"${(friend.url || '').replace(/"/g, '""')}"`,
        `"${(friend.logo_url || '').replace(/"/g, '""')}"`,
        `"${(friend.description || '').replace(/"/g, '""')}"`,
        friend.sort_order || 0
      ].join(',');
    }).join('\n');
    
    const csv = '\uFEFF' + csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=friends-export-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;