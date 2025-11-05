const express = require('express');
const db = require('../db-postgres');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取指定菜单的卡片
router.get('/:menuId', async (req, res) => {
  try {
    const { subMenuId } = req.query;
    let query, params;
    
    if (subMenuId) {
      // 获取指定子菜单的卡片
      query = 'SELECT * FROM cards WHERE sub_menu_id = ? ORDER BY sort_order';
      params = [subMenuId];
    } else {
      // 获取主菜单的卡片（不包含子菜单的卡片）
      query = 'SELECT * FROM cards WHERE menu_id = ? AND sub_menu_id IS NULL ORDER BY sort_order';
      params = [req.params.menuId];
    }
    
    const rows = await db.all(query, params);
    rows.forEach(card => {
      if (!card.custom_logo_path) {
        card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
      } else {
        card.display_logo = '/uploads/' + card.custom_logo_path;
      }
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// 新增、修改、删除卡片需认证
router.post('/', auth, async (req, res) => {
  try {
    const { menu_id, sub_menu_id, title, url, logo_url, custom_logo_path, desc, order } = req.body;
    const result = await db.run('INSERT INTO cards (menu_id, sub_menu_id, title, url, logo_url, custom_logo_path, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [menu_id, sub_menu_id || null, title, url, logo_url, custom_logo_path, desc, order || 0]);
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { menu_id, sub_menu_id, title, url, logo_url, custom_logo_path, desc, order } = req.body;
    const result = await db.run('UPDATE cards SET menu_id=?, sub_menu_id=?, title=?, url=?, logo_url=?, custom_logo_path=?, description=?, sort_order=? WHERE id=?', 
      [menu_id, sub_menu_id || null, title, url, logo_url, custom_logo_path, desc, order || 0, req.params.id]);
    res.json({ changed: result.changes });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.run('DELETE FROM cards WHERE id=?', [req.params.id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// 批量删除卡片
router.post('/batch-delete', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请提供要删除的卡片ID数组' });
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const result = await db.run(`DELETE FROM cards WHERE id IN (${placeholders})`, ids);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 批量移动卡片到另一个菜单或子菜单
router.post('/batch-move', auth, async (req, res) => {
  try {
    const { ids, targetMenuId, targetSubMenuId } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请提供要移动的卡片ID数组' });
    }
    if (!targetMenuId) {
      return res.status(400).json({ error: '请提供目标菜单ID' });
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const result = await db.run(
      `UPDATE cards SET menu_id = ?, sub_menu_id = ? WHERE id IN (${placeholders})`,
      [targetMenuId, targetSubMenuId || null, ...ids]
    );
    res.json({ updated: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 批量导入卡片 - JSON格式
router.post('/batch-import-json', auth, async (req, res) => {
  try {
    const { cards, menuId, subMenuId } = req.body;
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: '请提供有效的卡片数据数组' });
    }
    if (!menuId) {
      return res.status(400).json({ error: '请提供菜单ID' });
    }
    
    let imported = 0;
    for (const card of cards) {
      const { title, url, logo_url, description, order } = card;
      if (title && url) {
        await db.run(
          'INSERT INTO cards (menu_id, sub_menu_id, title, url, logo_url, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [menuId, subMenuId || null, title, url, logo_url || '', description || '', order || 0]
        );
        imported++;
      }
    }
    
    res.json({ imported, total: cards.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 批量导入卡片 - TXT格式（每行：标题|URL|描述）
router.post('/batch-import-txt', auth, async (req, res) => {
  try {
    const { content, menuId, subMenuId } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: '请提供有效的文本内容' });
    }
    if (!menuId) {
      return res.status(400).json({ error: '请提供菜单ID' });
    }
    
    const lines = content.split('\n').filter(line => line.trim());
    let imported = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const parts = line.split('|');
      
      if (parts.length >= 2) {
        const title = parts[0].trim();
        const url = parts[1].trim();
        const description = parts[2] ? parts[2].trim() : '';
        
        if (title && url) {
          await db.run(
            'INSERT INTO cards (menu_id, sub_menu_id, title, url, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [menuId, subMenuId || null, title, url, description, i]
          );
          imported++;
        }
      }
    }
    
    res.json({ imported, total: lines.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 批量导入卡片 - HTML格式（解析<a>标签）
router.post('/batch-import-html', auth, async (req, res) => {
  try {
    const { content, menuId, subMenuId } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: '请提供有效的HTML内容' });
    }
    if (!menuId) {
      return res.status(400).json({ error: '请提供菜单ID' });
    }
    
    // 简单的正则表达式解析<a>标签
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    const matches = [...content.matchAll(linkRegex)];
    let imported = 0;
    
    for (let i = 0; i < matches.length; i++) {
      const url = matches[i][1].trim();
      const title = matches[i][2].trim();
      
      if (title && url) {
        await db.run(
          'INSERT INTO cards (menu_id, sub_menu_id, title, url, sort_order) VALUES (?, ?, ?, ?, ?)',
          [menuId, subMenuId || null, title, url, i]
        );
        imported++;
      }
    }
    
    res.json({ imported, total: matches.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;