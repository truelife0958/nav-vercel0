const express = require('express');
const db = require('../db-switch');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取所有菜单（包含子菜单）
router.get('/', async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    if (!page && !pageSize) {
      // 获取主菜单
      const menus = await db.all('SELECT * FROM menus ORDER BY sort_order', []);
      
      // 为每个主菜单获取子菜单
      const menusWithSubMenus = await Promise.all(menus.map(async (menu) => {
        try {
          const subMenus = await db.all('SELECT * FROM sub_menus WHERE parent_id = ? ORDER BY sort_order', [menu.id]);
          return { ...menu, subMenus };
        } catch (err) {
          console.error('获取子菜单失败:', err);
          return { ...menu, subMenus: [] };
        }
      }));
      
      res.json(menusWithSubMenus);
    } else {
      const pageNum = parseInt(page) || 1;
      const size = parseInt(pageSize) || 10;
      const offset = (pageNum - 1) * size;
      
      const countRow = await db.get('SELECT COUNT(*) as total FROM menus', []);
      const rows = await db.all('SELECT * FROM menus ORDER BY sort_order LIMIT ? OFFSET ?', [size, offset]);
      
      res.json({
        total: countRow.total,
        page: pageNum,
        pageSize: size,
        data: rows
      });
    }
  } catch (err) {
    console.error('获取菜单失败:', err);
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }
});

// 获取指定菜单的子菜单
router.get('/:id/submenus', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM sub_menus WHERE parent_id = ? ORDER BY sort_order', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// 新增、修改、删除菜单需认证
router.post('/', auth, async (req, res) => {
  try {
    const { name, order } = req.body;
    const result = await db.run('INSERT INTO menus (name, sort_order) VALUES (?, ?)', [name, order || 0]);
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, order } = req.body;
    const result = await db.run('UPDATE menus SET name=?, sort_order=? WHERE id=?', [name, order || 0, req.params.id]);
    res.json({ changed: result.changes });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.run('DELETE FROM menus WHERE id=?', [req.params.id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// 子菜单相关API
router.post('/:id/submenus', auth, async (req, res) => {
  try {
    const { name, order } = req.body;
    const result = await db.run('INSERT INTO sub_menus (parent_id, name, sort_order) VALUES (?, ?, ?)',
      [req.params.id, name, order || 0]);
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

router.put('/submenus/:id', auth, async (req, res) => {
  try {
    const { name, order } = req.body;
    const result = await db.run('UPDATE sub_menus SET name=?, sort_order=? WHERE id=?', [name, order || 0, req.params.id]);
    res.json({ changed: result.changes });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

router.delete('/submenus/:id', auth, async (req, res) => {
  try {
    const result = await db.run('DELETE FROM sub_menus WHERE id=?', [req.params.id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// 批量删除子菜单
router.post('/submenus/batch-delete', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请提供要删除的子菜单ID数组' });
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const result = await db.run(`DELETE FROM sub_menus WHERE id IN (${placeholders})`, ids);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 批量移动子菜单到另一个父菜单
router.post('/submenus/batch-move', auth, async (req, res) => {
  try {
    const { ids, targetParentId } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请提供要移动的子菜单ID数组' });
    }
    if (!targetParentId) {
      return res.status(400).json({ error: '请提供目标父菜单ID' });
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const result = await db.run(
      `UPDATE sub_menus SET parent_id = ? WHERE id IN (${placeholders})`,
      [targetParentId, ...ids]
    );
    res.json({ updated: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;