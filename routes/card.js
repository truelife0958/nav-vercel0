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

module.exports = router;